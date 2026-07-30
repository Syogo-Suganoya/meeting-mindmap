import type { MindMapEdge, MindMapNode } from "@/lib/types";
import { buildRelationEdge, type Scenario } from "@/lib/samples/types";

// 出典: YouTube「学生討論会」動画(https://www.youtube.com/watch?v=1oQjwjBm5kg)
// ユーザー提供の文字起こしを要約・パラフレーズしたもの。原文の逐語引用ではない。
function build(): { nodes: MindMapNode[]; edges: MindMapEdge[] } {
  const now = Date.now();
  const nodes: MindMapNode[] = [
    // Q0: 感想を求められたのに実質的な回答になっていない例(mismatch)
    {
      id: "q-student-0",
      type: "question",
      position: { x: 40, y: 0 },
      data: {
        kind: "question",
        text: "この討論会について、率直にどう思いますか?",
        rawText: "蘭さん、いかがでしょうか",
        speaker: "司会",
        createdAt: now,
        isManual: false,
      },
    },
    {
      id: "a-student-0",
      type: "answer",
      position: { x: 0, y: 230 },
      data: {
        kind: "answer",
        text: "ミンティアを噛んでいて全然聞いていなかった",
        rawText: "今僕ミンティアをバリバリ噛んでるところで全然何も見てなかった(笑)",
        speaker: "岸谷蘭丸",
        matchScore: 8,
        mismatchReason: "感想を求められているが、話を聞いていなかったことを述べているだけで実質的な回答になっていない",
        createdAt: now,
        isManual: false,
      },
    },
    // Q1: なぜ若者から高市内閣の支持率が高いのか
    {
      id: "q-student-1",
      type: "question",
      position: { x: 380, y: 0 },
      data: {
        kind: "question",
        text: "なぜ若い世代で特に高市内閣の支持率が高いのですか?",
        rawText: "18歳から39歳は76.3%支持していて他の年代より高いが、なぜ若者はこんなにも高市内閣を評価しているのか",
        speaker: "司会",
        createdAt: now,
        isManual: false,
      },
    },
    {
      id: "a-student-1",
      type: "answer",
      position: { x: 380, y: 230 },
      data: {
        kind: "answer",
        text: "地域密着で現実を重視した政策運営をしているから",
        rawText: "自民党は地域政党であり、地域に密着しながら声を吸い上げ、現実を重視して政策を動かしている",
        speaker: "内田両平(自民党)",
        matchScore: 82,
        createdAt: now,
        isManual: false,
      },
    },
    {
      id: "a-student-2",
      type: "answer",
      position: { x: 380, y: 430 },
      data: {
        kind: "answer",
        text: "初の女性総理として期待はあるが、政策の中身を見ると支持できない",
        rawText: "初の女性総理でハキハキ喋る印象は理解できるが、政策や発言の中身を見ると不合理な点が多く支持できない",
        speaker: "明博(中道改革連合)",
        matchScore: 75,
        createdAt: now,
        isManual: false,
      },
    },
    // Q2: 党内で意見が割れたときの扱い
    {
      id: "q-student-2",
      type: "question",
      position: { x: 720, y: 0 },
      data: {
        kind: "question",
        text: "党内で意見が割れたときはどう扱っていますか?",
        rawText: "推している政党の個別政策と自分の意見が違うときはどうしているか",
        speaker: "司会",
        createdAt: now,
        isManual: false,
      },
    },
    {
      id: "a-student-3",
      type: "answer",
      position: { x: 720, y: 230 },
      data: {
        kind: "answer",
        text: "学生部で議論し、実際に公約へ反映された提言実績もある",
        rawText: "憲法改正など意を異にする点もあるが学生部で議論して現実的な意見に消化させ、103万円の壁の問題など公約に組み込まれた実績もある",
        speaker: "有馬蒼井(国民民主党)",
        matchScore: 88,
        createdAt: now,
        isManual: false,
      },
    },
    {
      id: "a-student-4",
      type: "answer",
      position: { x: 720, y: 430 },
      data: {
        kind: "answer",
        text: "個別政策(消費税限定策)には反対だが、根本理念に共感していれば気にならない",
        rawText: "食料品消費税限定という目玉政策には反対だが、個人にフォーカスするという根っこの理念に共感していればそこまで気にならない",
        speaker: "明博(中道改革連合)",
        matchScore: 80,
        createdAt: now,
        isManual: false,
      },
    },
    // Q3: 解散・総選挙の評価
    {
      id: "q-student-3",
      type: "question",
      position: { x: 1060, y: 0 },
      data: {
        kind: "question",
        text: "今回の解散・総選挙の判断をどう評価しますか?",
        rawText: "高市総理の解散・総選挙という判断についてどう見ているか",
        speaker: "司会",
        createdAt: now,
        isManual: false,
      },
    },
    {
      id: "a-student-5",
      type: "answer",
      position: { x: 1060, y: 230 },
      data: {
        kind: "answer",
        text: "国民に信を問うための決断力ある判断",
        rawText: "危機と言われる時代に求められる決断力やスピード感を持った内閣で、国民に信を問うための選択だと思う",
        speaker: "内田両平(自民党)",
        matchScore: 78,
        createdAt: now,
        isManual: false,
      },
    },
    {
      id: "a-student-6",
      type: "answer",
      position: { x: 1060, y: 430 },
      data: {
        kind: "answer",
        text: "他党との年度内政策合意を果たさずに解散した点は評価できない",
        rawText: "改革の姿勢は評価できるが、他党と約束した年度内の政策合意を果たさずに解散を打った点は評価できない",
        speaker: "有馬蒼井(国民民主党)",
        matchScore: 74,
        createdAt: now,
        isManual: false,
      },
    },
    {
      id: "a-student-7",
      type: "answer",
      position: { x: 1060, y: 630 },
      data: {
        kind: "answer",
        text: "総裁選時の公約から掛け離れてしまい、がっかりした",
        rawText: "総裁選の時の公約(減税や外国人問題)からかなり掛け離れてしまい、結局自民党のしがらみ政治だとがっかりした",
        speaker: "津田明り(参政党)",
        matchScore: 76,
        createdAt: now,
        isManual: false,
      },
    },
    // Q4: まだ回答されていない、次に発展していく議題
    {
      id: "q-student-4",
      type: "question",
      position: { x: 1400, y: 0 },
      data: {
        kind: "question",
        text: "社会保険料や税負担についてどう考えますか?",
        rawText: "社会保険料や消費税など、経済的な負担についてどう考えているか",
        speaker: "司会",
        createdAt: now,
        isManual: false,
      },
    },
    // 未分類: 政党を推す理由の自己紹介で、上の議題には直接紐づかない
    {
      id: "a-student-8",
      type: "answer",
      position: { x: 1680, y: 230 },
      data: {
        kind: "answer",
        text: "自身も一人親家庭・生活困窮の当事者という経験から、当事者性を掲げる政党に共感した",
        rawText: "一人親家庭に突然なり生活困窮になった経験や、障害を持った家族の存在があり、社会問題の当事者として共通点を感じた",
        speaker: "篠原一樹(令和新選組)",
        matchScore: null,
        createdAt: now,
        isManual: true,
      },
    },
  ];
  const edges: MindMapEdge[] = [
    { id: "e-student-0", source: "q-student-0", target: "a-student-0" },
    { id: "e-student-1", source: "q-student-1", target: "a-student-1" },
    { id: "e-student-2", source: "q-student-1", target: "a-student-2" },
    { id: "e-student-3", source: "q-student-2", target: "a-student-3" },
    { id: "e-student-4", source: "q-student-2", target: "a-student-4" },
    { id: "e-student-5", source: "q-student-3", target: "a-student-5" },
    { id: "e-student-6", source: "q-student-3", target: "a-student-6" },
    { id: "e-student-7", source: "q-student-3", target: "a-student-7" },
    buildRelationEdge(
      "e-rel-student-1",
      "a-student-5",
      "a-student-6",
      "conflict",
      "解散を決断力ある判断と評価する立場と、政策合意を果たさなかった点を批判する立場が対立している",
    ),
    buildRelationEdge(
      "e-rel-student-2",
      "a-student-6",
      "a-student-7",
      "agree",
      "どちらも解散・総選挙の進め方に否定的な評価をしている",
    ),
  ];
  return { nodes, edges };
}

export const studentDebateScenario: Scenario = {
  id: "student-debate",
  label: "学生討論会(実データ)",
  sourceUrl: "https://www.youtube.com/watch?v=1oQjwjBm5kg",
  sourceNote: "YouTube: 学生討論会",
  build,
};
