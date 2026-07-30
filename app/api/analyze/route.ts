import { FileState, Type, createPartFromUri, createUserContent } from "@google/genai";
import { getClient, errorResponse, MODEL } from "@/lib/gemini";
import { ANALYZE_SYSTEM_PROMPT } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_FILE_SIZE_BYTES = 300 * 1024 * 1024; // 300MB
const FILE_POLL_INTERVAL_MS = 2000;
const FILE_POLL_MAX_ATTEMPTS = 90; // 最大180秒待つ

export type ExistingQuestion = { id: string; text: string };
export type ExistingAnswer = { id: string; text: string; questionId: string };

export type AnalyzeResponse = {
  newQuestions: { tempId: string; text: string; rawText: string; speaker?: string }[];
  newAnswers: {
    tempId: string;
    text: string;
    rawText: string;
    speaker?: string;
    linkedExistingQuestionId?: string | null;
    linkedNewQuestionTempId?: string | null;
    matchScore: number | null;
    mismatchReason?: string;
  }[];
  answerRelations: {
    answerARef: string;
    answerBRef: string;
    kind: "agree" | "conflict";
    reason: string;
  }[];
};

const analyzeSchema = {
  type: Type.OBJECT,
  properties: {
    newQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          tempId: { type: Type.STRING, description: "このレスポンス内で回答から参照するための仮ID" },
          text: { type: Type.STRING, description: "発言を簡潔・明確に要約した表示用テキスト" },
          rawText: { type: Type.STRING, description: "元の発言そのまま(文字起こし範囲の抜粋)" },
          speaker: { type: Type.STRING, description: "発言者名。不明なら省略", nullable: true },
        },
        required: ["tempId", "text", "rawText"],
      },
    },
    newAnswers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          tempId: { type: Type.STRING, description: "このレスポンス内でanswerRelationsから参照するための仮ID" },
          text: { type: Type.STRING, description: "発言を簡潔・明確に要約した表示用テキスト" },
          rawText: { type: Type.STRING, description: "元の発言そのまま(文字起こし範囲の抜粋)" },
          speaker: { type: Type.STRING, description: "発言者名。不明なら省略", nullable: true },
          linkedExistingQuestionId: {
            type: Type.STRING,
            description: "既存質問への紐付け先id。無ければnull",
            nullable: true,
          },
          linkedNewQuestionTempId: {
            type: Type.STRING,
            description: "今回抽出した新規質問のtempIdへの紐付け。無ければnull",
            nullable: true,
          },
          matchScore: {
            type: Type.INTEGER,
            description: "0-100。紐づく質問に対してこの回答がどれだけ的確に答えているか。紐づく質問が無ければnull",
            nullable: true,
          },
          mismatchReason: {
            type: Type.STRING,
            description: "matchScoreが40未満の場合のみ、何が噛み合っていないかを一文で",
            nullable: true,
          },
        },
        required: ["tempId", "text", "rawText", "matchScore"],
      },
    },
    answerRelations: {
      type: Type.ARRAY,
      description: "同じ質問への回答同士の一致/対立の関係。今回のnewAnswersを少なくとも一方に含むペアのみ",
      items: {
        type: Type.OBJECT,
        properties: {
          answerARef: { type: Type.STRING, description: "既存回答のid、またはnewAnswersのtempId" },
          answerBRef: { type: Type.STRING, description: "既存回答のid、またはnewAnswersのtempId" },
          kind: { type: Type.STRING, description: '"agree"(一致)または"conflict"(対立)' },
          reason: { type: Type.STRING, description: "一致/対立の理由を一文で" },
        },
        required: ["answerARef", "answerBRef", "kind", "reason"],
      },
    },
  },
  required: ["newQuestions", "newAnswers", "answerRelations"],
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildContextText(existingQuestions: ExistingQuestion[], existingAnswers: ExistingAnswer[]): string {
  const existingQuestionsText =
    existingQuestions.length > 0
      ? existingQuestions.map((q) => `- id=${q.id}: ${q.text}`).join("\n")
      : "(まだ質問はありません)";

  const existingAnswersText =
    existingAnswers.length > 0
      ? existingAnswers.map((a) => `- id=${a.id} (質問id=${a.questionId}): ${a.text}`).join("\n")
      : "(まだ回答はありません)";

  return (
    `# 既存の質問一覧\n${existingQuestionsText}\n\n` +
    `# 既存の回答一覧\n${existingAnswersText}\n\n` +
    `# 入力\nこれは会議全体の録音/録画データです。全体を対象に文字起こしした上で、質問・回答・マッチ度・回答同士の一致/対立を抽出してください。`
  );
}

export async function POST(req: Request) {
  let uploadedFileName: string | null = null;
  let client: ReturnType<typeof getClient> | null = null;

  try {
    client = getClient();
    const formData = await req.formData();
    const file = formData.get("recording");
    const existingQuestions = JSON.parse(
      (formData.get("existingQuestions") as string | null) ?? "[]",
    ) as ExistingQuestion[];
    const existingAnswers = JSON.parse(
      (formData.get("existingAnswers") as string | null) ?? "[]",
    ) as ExistingAnswer[];

    if (!(file instanceof Blob) || file.size === 0) {
      return Response.json({ error: "音声/動画ファイルを選択してください" }, { status: 400 });
    }
    const mimeType = file.type;
    if (!mimeType.startsWith("audio/") && !mimeType.startsWith("video/")) {
      return Response.json({ error: "音声または動画ファイルのみアップロードできます" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return Response.json(
        { error: `ファイルサイズが上限(${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB)を超えています` },
        { status: 400 },
      );
    }

    const displayName = file instanceof File ? file.name : "recording";
    const uploaded = await client.files.upload({ file, config: { mimeType, displayName } });
    uploadedFileName = uploaded.name ?? null;

    let info = uploaded;
    let attempts = 0;
    while (info.state === FileState.PROCESSING) {
      if (attempts >= FILE_POLL_MAX_ATTEMPTS) {
        throw new Error("ファイルの処理がタイムアウトしました。ファイルサイズを小さくして再度お試しください。");
      }
      await sleep(FILE_POLL_INTERVAL_MS);
      info = await client.files.get({ name: uploadedFileName as string });
      attempts += 1;
    }
    if (info.state === FileState.FAILED) {
      throw new Error("Gemini側でのファイル処理に失敗しました");
    }
    if (!info.uri) {
      throw new Error("アップロードしたファイルのURIを取得できませんでした");
    }

    const contextText = buildContextText(existingQuestions, existingAnswers);
    const response = await client.models.generateContent({
      model: MODEL,
      contents: createUserContent([createPartFromUri(info.uri, info.mimeType ?? mimeType), contextText]),
      config: {
        systemInstruction: ANALYZE_SYSTEM_PROMPT,
        maxOutputTokens: 8192,
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: analyzeSchema,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Geminiの応答が空でした");

    const result = JSON.parse(text) as AnalyzeResponse;
    return Response.json(result);
  } catch (e) {
    return errorResponse(e);
  } finally {
    if (client && uploadedFileName) {
      try {
        await client.files.delete({ name: uploadedFileName });
      } catch {
        // 削除失敗はGemini側にファイルが残るだけなので無視してよい
      }
    }
  }
}
