import type { MindMapEdge, MindMapNode } from "@/lib/types";
import { buildRelationEdge, type Scenario } from "@/lib/samples/types";

function build(): { nodes: MindMapNode[]; edges: MindMapEdge[] } {
  const now = Date.now();
  const nodes: MindMapNode[] = [
    // Q1: 総予算(提案→切り返し→合意、という議論の発展)
    {
      id: "q-dummy-1",
      type: "question",
      position: { x: 40, y: 0 },
      data: {
        kind: "question",
        text: "今期の総予算はいくらにしますか?",
        rawText: "えーっと今期の総予算ってどれくらいにしましょうか",
        speaker: "田中",
        createdAt: now,
        isManual: false,
      },
    },
    {
      id: "a-dummy-1",
      type: "answer",
      position: { x: 0, y: 230 },
      data: {
        kind: "answer",
        text: "総額500万円でいきましょう",
        rawText: "そうですね、総額500万円でいけると思います",
        speaker: "佐藤",
        matchScore: 88,
        createdAt: now,
        isManual: false,
      },
    },
    {
      id: "a-dummy-2",
      type: "answer",
      position: { x: 0, y: 430 },
      data: {
        kind: "answer",
        text: "いや、500万だと厳しいので600万円にしませんか?",
        rawText: "いやでも500万だとちょっと厳しい気がするので600万円にしませんか",
        speaker: "鈴木",
        matchScore: 72,
        createdAt: now,
        isManual: false,
      },
    },
    {
      id: "a-dummy-3",
      type: "answer",
      position: { x: 0, y: 630 },
      data: {
        kind: "answer",
        text: "では550万円で妥協しましょう",
        rawText: "じゃあ間を取って550万円で妥協しましょうか",
        speaker: "山田",
        matchScore: 92,
        createdAt: now,
        isManual: false,
      },
    },
    // Q2: 予算の割り振り(Q1で決まった550万円を受けての次の議題)
    {
      id: "q-dummy-2",
      type: "question",
      position: { x: 380, y: 0 },
      data: {
        kind: "question",
        text: "決まった550万円をどう割り振りますか?",
        rawText: "じゃあ決まった550万円をどう割り振るか決めましょう",
        speaker: "佐藤",
        createdAt: now,
        isManual: false,
      },
    },
    {
      id: "a-dummy-4",
      type: "answer",
      position: { x: 380, y: 230 },
      data: {
        kind: "answer",
        text: "開発に350万、マーケティングに200万で分けましょう",
        rawText: "開発に350万、マーケティングに200万くらいで分けましょうか",
        speaker: "鈴木",
        matchScore: 85,
        createdAt: now,
        isManual: false,
      },
    },
    {
      id: "a-dummy-5",
      type: "answer",
      position: { x: 380, y: 430 },
      data: {
        kind: "answer",
        text: "いや、マーケティングはもう少し欲しいので250万にできませんか?",
        rawText: "いやマーケティングはもう少し欲しいので250万にできませんかね",
        speaker: "山田",
        matchScore: 78,
        createdAt: now,
        isManual: false,
      },
    },
    {
      id: "a-dummy-6",
      type: "answer",
      position: { x: 380, y: 630 },
      data: {
        kind: "answer",
        text: "テストは来週から始まります",
        rawText: "あ、テストの方は来週から始まる予定です",
        speaker: "田中",
        matchScore: 15,
        mismatchReason: "質問は予算配分を聞いているが、回答はテストのスケジュールの話にすり替わっている",
        createdAt: now,
        isManual: false,
      },
    },
    // Q3: 公布日(割り振りが決まった後の次の議題)
    {
      id: "q-dummy-3",
      type: "question",
      position: { x: 720, y: 0 },
      data: {
        kind: "question",
        text: "決まった予算の公布日はいつにしますか?",
        rawText: "割り振りが決まったので予算の公布日はいつにしましょうか",
        speaker: "山田",
        createdAt: now,
        isManual: false,
      },
    },
    {
      id: "a-dummy-7",
      type: "answer",
      position: { x: 720, y: 230 },
      data: {
        kind: "answer",
        text: "来月1日に公布しましょう",
        rawText: "来月1日に公布するのでいいと思います",
        speaker: "佐藤",
        matchScore: 90,
        createdAt: now,
        isManual: false,
      },
    },
    {
      id: "a-dummy-8",
      type: "answer",
      position: { x: 720, y: 430 },
      data: {
        kind: "answer",
        text: "いや、準備期間を考えると5日の方がいいのではないですか?",
        rawText: "いや準備期間を考えると5日にした方がいいんじゃないですか",
        speaker: "鈴木",
        matchScore: 80,
        createdAt: now,
        isManual: false,
      },
    },
    // Q4: まだ誰も回答していない、次に発展していく未解決の議題
    {
      id: "q-dummy-4",
      type: "question",
      position: { x: 1060, y: 0 },
      data: {
        kind: "question",
        text: "最終承認は誰が行いますか?",
        rawText: "ちなみに最終承認は誰が行う形にしましょうか",
        speaker: "田中",
        createdAt: now,
        isManual: false,
      },
    },
    // 未分類: どの議題にも紐づかない雑談的な発言
    {
      id: "a-dummy-9",
      type: "answer",
      position: { x: 1340, y: 230 },
      data: {
        kind: "answer",
        text: "来週から新しいメンバーが加わります",
        rawText: "あ、そういえば来週から新しいメンバーが増える予定です",
        speaker: "山田",
        matchScore: null,
        createdAt: now,
        isManual: true,
      },
    },
  ];
  const edges: MindMapEdge[] = [
    { id: "e-dummy-1", source: "q-dummy-1", target: "a-dummy-1" },
    { id: "e-dummy-2", source: "q-dummy-1", target: "a-dummy-2" },
    { id: "e-dummy-3", source: "q-dummy-1", target: "a-dummy-3" },
    { id: "e-dummy-4", source: "q-dummy-2", target: "a-dummy-4" },
    { id: "e-dummy-5", source: "q-dummy-2", target: "a-dummy-5" },
    { id: "e-dummy-6", source: "q-dummy-2", target: "a-dummy-6" },
    { id: "e-dummy-7", source: "q-dummy-3", target: "a-dummy-7" },
    { id: "e-dummy-8", source: "q-dummy-3", target: "a-dummy-8" },
    buildRelationEdge(
      "e-rel-dummy-1",
      "a-dummy-1",
      "a-dummy-2",
      "conflict",
      "500万円案と600万円案で総額の意見が対立している",
    ),
    buildRelationEdge(
      "e-rel-dummy-2",
      "a-dummy-4",
      "a-dummy-5",
      "conflict",
      "マーケティング予算を200万にするか250万にするかで対立している",
    ),
    buildRelationEdge(
      "e-rel-dummy-3",
      "a-dummy-7",
      "a-dummy-8",
      "conflict",
      "公布日を来月1日にするか5日にするかで対立している",
    ),
  ];
  return { nodes, edges };
}

export const budgetMeetingScenario: Scenario = {
  id: "budget-meeting",
  label: "予算会議(架空)",
  build,
};
