import type { MindMapEdge, MindMapNode } from "@/lib/types";
import type { Scenario } from "@/lib/samples/types";

// 出典: 愛知県議会 令和7年6月定例会 会議録(公式議事録)
// https://www.pref.aichi.dbsr.jp/324693?Template=document&Id=2693#all
// 実際の質疑応答を要約・パラフレーズしたもの。原文の逐語引用ではない。
function build(): { nodes: MindMapNode[]; edges: MindMapEdge[] } {
  const now = Date.now();
  const nodes: MindMapNode[] = [
    {
      id: "q-aichi-1",
      type: "question",
      position: { x: 40, y: 0 },
      data: {
        kind: "question",
        text: "今年度の県税収入の見通しはどうですか?",
        rawText: "米国の通商政策等による不透明感がある中、本年度の県税収入見通しについて伺います",
        speaker: "政木りか議員",
        createdAt: now,
        isManual: false,
      },
    },
    {
      id: "a-aichi-1",
      type: "answer",
      position: { x: 0, y: 230 },
      data: {
        kind: "answer",
        text: "法人二税は減収見込み、個人県民税は増収見込みだが、現時点で全体を見通すのは難しい",
        rawText: "法人二税について減収を見込む一方、個人県民税は増収見込み。現時点で県税収入を見通すことは困難",
        speaker: "大村知事",
        matchScore: 85,
        createdAt: now,
        isManual: false,
      },
    },
    {
      id: "q-aichi-2",
      type: "question",
      position: { x: 380, y: 0 },
      data: {
        kind: "question",
        text: "南海トラフ地震の被害予測調査の進捗はどうですか?",
        rawText: "県独自の被害予測調査の進捗状況と、その成果の活用について伺います",
        speaker: "政木りか議員",
        createdAt: now,
        isManual: false,
      },
    },
    {
      id: "a-aichi-2",
      type: "answer",
      position: { x: 380, y: 230 },
      data: {
        kind: "answer",
        text: "市町村ごとの被害予測も検討中で、来年度6月頃に防災会議へ報告予定",
        rawText: "市町村ごとの被害予測も検討しており、来年度6月頃に防災会議に報告する予定",
        speaker: "大村知事",
        matchScore: 88,
        createdAt: now,
        isManual: false,
      },
    },
    // Q3: まだ答弁されていない、次に発展していく議題
    {
      id: "q-aichi-3",
      type: "question",
      position: { x: 720, y: 0 },
      data: {
        kind: "question",
        text: "被害予測を踏まえた市町村への支援策はどう考えていますか?",
        rawText: "被害予測調査の結果を踏まえて、市町村への財政的・技術的支援はどう考えているか伺います",
        speaker: "政木りか議員",
        createdAt: now,
        isManual: false,
      },
    },
  ];
  const edges: MindMapEdge[] = [
    { id: "e-aichi-1", source: "q-aichi-1", target: "a-aichi-1" },
    { id: "e-aichi-2", source: "q-aichi-2", target: "a-aichi-2" },
  ];
  return { nodes, edges };
}

export const aichiAssemblyScenario: Scenario = {
  id: "aichi-assembly",
  label: "愛知県議会 質疑(実データ)",
  sourceUrl: "https://www.pref.aichi.dbsr.jp/324693?Template=document&Id=2693#all",
  sourceNote: "愛知県議会 令和7年6月定例会 会議録",
  build,
};
