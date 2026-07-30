import type { MindMapEdge, MindMapNode } from "@/lib/types";
import { buildRelationEdge, type Scenario } from "@/lib/samples/types";

// 出典: YouTube「ひろゆき×DaiGo討論」動画(https://www.youtube.com/watch?v=NFRefkP4BW8)
// テーマ「税金でどこまで弱者を救うべきか」。ユーザー提供の文字起こしを要約・パラフレーズしたもの。原文の逐語引用ではない。
function build(): { nodes: MindMapNode[]; edges: MindMapEdge[] } {
  const now = Date.now();
  const nodes: MindMapNode[] = [
    // 未分類: テーマ本編の前振りの雑談で、政策議題には紐づかない
    {
      id: "a-hd-0",
      type: "answer",
      position: { x: 40, y: 230 },
      data: {
        kind: "answer",
        text: "前回はひろゆきさんと芸人によるモノマネ激論だった",
        rawText: "前回はひろゆきさんと芸人の西尾一男さんによる「うんこ味のカレーかカレー味のうんこか」というモノマネ激論だった",
        speaker: "進行",
        matchScore: null,
        createdAt: now,
        isManual: true,
      },
    },
    // Q1: 再分配の対象ライン
    {
      id: "q-hd-1",
      type: "question",
      position: { x: 380, y: 0 },
      data: {
        kind: "question",
        text: "年収1200万は金持ちではない。ではどこからを再分配の対象にすべき?",
        rawText: "年収1200万って金持ちではないですよね。じゃあどれくらいからだったら税金を取って子供とかに使った方がいいと思う?",
        speaker: "ひろゆき",
        createdAt: now,
        isManual: false,
      },
    },
    {
      id: "a-hd-1",
      type: "answer",
      position: { x: 380, y: 230 },
      data: {
        kind: "answer",
        text: "富の再分配自体は必要。問題は税負担の多寡ではなく分配の仕方が人為的でおかしい点",
        rawText: "富の再分配自体は必要だと思う。問題は税金を多く払ってるかどうかではなく、分配の仕方があまりにも人為的でおかしい点",
        speaker: "DaiGo",
        matchScore: 84,
        createdAt: now,
        isManual: false,
      },
    },
    // Q2: 理想的な分配方法
    {
      id: "q-hd-2",
      type: "question",
      position: { x: 720, y: 0 },
      data: {
        kind: "question",
        text: "今の分配より良い理想的な分配方法はある?",
        rawText: "理想的な分配ってどういうやつか考えたことある?今のが悪いっていうのはもっといいアイデアがあるから言ってるんじゃない?",
        speaker: "ひろゆき",
        createdAt: now,
        isManual: false,
      },
    },
    {
      id: "a-hd-2",
      type: "answer",
      position: { x: 720, y: 230 },
      data: {
        kind: "answer",
        text: "政治家が人為的に決める再分配制度自体が人間の能力の限界では",
        rawText: "人間の認知機能や自制心のレベルから考えると、根拠もなく人為的に分配を決める今の制度は人間の能力の限界なのでは",
        speaker: "DaiGo",
        matchScore: 80,
        createdAt: now,
        isManual: false,
      },
    },
    {
      id: "a-hd-3",
      type: "answer",
      position: { x: 720, y: 430 },
      data: {
        kind: "answer",
        text: "ベーシックインカムのように自動的に配る方が効率的では",
        rawText: "誰も使わない箱物にお金が回るくらいなら、ベーシックインカムのように月7万円を自動的に全員に配る方が効率がいいのでは",
        speaker: "DaiGo",
        matchScore: 83,
        createdAt: now,
        isManual: false,
      },
    },
    // Q3: 還元の範囲
    {
      id: "q-hd-3",
      type: "question",
      position: { x: 1060, y: 0 },
      data: {
        kind: "question",
        text: "弱者への還元はどこまでの額・範囲まで行うべき?",
        rawText: "大卒まで補償するのか、就職できるスキルをつけるまでか、働かなくても一生暮らせる額まで出すべきか",
        speaker: "ひろゆき",
        createdAt: now,
        isManual: false,
      },
    },
    {
      id: "a-hd-4",
      type: "answer",
      position: { x: 1060, y: 230 },
      data: {
        kind: "answer",
        text: "親の収入と子の将来の相関は身長の遺伝並みに強い。環境のハンデを補える教育投資は必要だが、利権的な使い方は違う",
        rawText: "親の収入と子供の将来の相関係数は0.5くらいで身長の遺伝と同じくらい強い。環境のハンデを補えるレベルまで教育に使うのはいいが、土建屋や利権のような使い方は違う",
        speaker: "DaiGo",
        matchScore: 87,
        createdAt: now,
        isManual: false,
      },
    },
    // Q4: 配分の選別
    {
      id: "q-hd-4",
      type: "question",
      position: { x: 1400, y: 0 },
      data: {
        kind: "question",
        text: "優秀な子に教育投資を集中し、そうでない子は最低限の支援だけにする配分もアリ?",
        rawText: "優秀な子供に教育投資をして稼げるやつにして、ダメなやつは諦めて食い物だけあげるっていう配分に変えるのはアリ?",
        speaker: "ひろゆき",
        createdAt: now,
        isManual: false,
      },
    },
    {
      id: "a-hd-5",
      type: "answer",
      position: { x: 1400, y: 230 },
      data: {
        kind: "answer",
        text: "原理上不可能。学校の成績と社会での成果の相関は薄く、教育でチャンスを奪われない状態を作ることが大事",
        rawText: "学校の成績が良い人が社会に出て同じ成果を出すかというと相関は非常に少ない。教育を原因にチャンスを掴めない状態をなくすのが大事",
        speaker: "DaiGo",
        matchScore: 85,
        createdAt: now,
        isManual: false,
      },
    },
    // Q5: 雇用慣行への意見
    {
      id: "q-hd-5",
      type: "question",
      position: { x: 1740, y: 0 },
      data: {
        kind: "question",
        text: "無能でも解雇せず雇い続ける日本の雇用慣行についてどう考える?",
        rawText: "無能だけど一生懸命努力している人をクビにせず会社の生産性を下げてでも雇い続ける日本のシステムについてどう思う?",
        speaker: "ひろゆき",
        createdAt: now,
        isManual: false,
      },
    },
    {
      id: "a-hd-6",
      type: "answer",
      position: { x: 1740, y: 230 },
      data: {
        kind: "answer",
        text: "社会福祉は国が、企業の稼ぎは優秀な人材だけでやるべき。魚を与えるのではなく釣り方を教えるべき",
        rawText: "無能ならクビを切った方がいい。社会福祉は国がやるべきで企業の金稼ぎは優秀な人たちだけでやるべき。魚をあげるんじゃなくて釣り方を教えるべき",
        speaker: "DaiGo",
        matchScore: 82,
        createdAt: now,
        isManual: false,
      },
    },
    // Q6: まだ回答されていない、次に発展していく議題
    {
      id: "q-hd-6",
      type: "question",
      position: { x: 2080, y: 0 },
      data: {
        kind: "question",
        text: "他の先進国と比べて日本の再分配設計は妥当と言える?",
        rawText: "海外の再分配制度と比較したとき、日本の今の設計は妥当だと言えるのか",
        speaker: "進行",
        createdAt: now,
        isManual: false,
      },
    },
  ];
  const edges: MindMapEdge[] = [
    { id: "e-hd-1", source: "q-hd-1", target: "a-hd-1" },
    { id: "e-hd-2", source: "q-hd-2", target: "a-hd-2" },
    { id: "e-hd-3", source: "q-hd-2", target: "a-hd-3" },
    { id: "e-hd-4", source: "q-hd-3", target: "a-hd-4" },
    { id: "e-hd-5", source: "q-hd-4", target: "a-hd-5" },
    { id: "e-hd-6", source: "q-hd-5", target: "a-hd-6" },
    buildRelationEdge(
      "e-rel-hd-1",
      "a-hd-2",
      "a-hd-3",
      "agree",
      "どちらも人為的な再分配の限界を指摘し、自動的な仕組みの方が優れるという同じ立場を補強し合っている",
    ),
  ];
  return { nodes, edges };
}

export const hiroyukiDaigoDebateScenario: Scenario = {
  id: "hiroyuki-daigo-debate",
  label: "ひろゆき×DaiGo討論(実データ)",
  sourceUrl: "https://www.youtube.com/watch?v=NFRefkP4BW8",
  sourceNote: "YouTube: ひろゆき×DaiGo討論",
  build,
};
