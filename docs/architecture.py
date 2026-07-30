"""meeting-mindmap のアーキテクチャ図を生成するスクリプト。

実行方法:
    /Library/Developer/CommandLineTools/usr/bin/python3 docs/architecture.py

前提: graphviz(dot) と diagrams がインストールされていること。
    brew install graphviz
    /Library/Developer/CommandLineTools/usr/bin/python3 -m pip install diagrams

出力: docs/architecture.png
"""

import os

from diagrams import Cluster, Diagram, Edge
from diagrams.gcp.ml import AIPlatform
from diagrams.generic.storage import Storage
from diagrams.onprem.client import User
from diagrams.programming.framework import React
from diagrams.programming.language import NodeJS, TypeScript

# 日本語ラベルが豆腐にならないよう、macOS標準の日本語フォントを指定する
FONT = "Hiragino Sans"

graph_attr = {
    "fontname": FONT,
    "fontsize": "16",
    "labelloc": "t",
    "bgcolor": "white",
    "pad": "0.6",
    "nodesep": "1.2",  # ノードラベルが長いため広めに取らないと隣と重なる
    "ranksep": "1.0",
    "splines": "spline",
}
node_attr = {"fontname": FONT, "fontsize": "11"}
edge_attr = {"fontname": FONT, "fontsize": "10"}
cluster_attr = {"fontname": FONT, "fontsize": "13", "style": "rounded", "pencolor": "#94a3b8"}

OUT_DIR = os.path.dirname(os.path.abspath(__file__))

with Diagram(
    "meeting-mindmap アーキテクチャ",
    filename=os.path.join(OUT_DIR, "architecture"),
    outformat="png",
    show=False,
    direction="TB",
    graph_attr=graph_attr,
    node_attr=node_attr,
    edge_attr=edge_attr,
):
    user = User("ユーザー\n(Chrome等のブラウザ)")

    with Cluster("Next.js 16 アプリ (App Router / standalone)", graph_attr=cluster_attr):
        with Cluster("クライアント (React 19 / 'use client')", graph_attr=cluster_attr):
            landing = React("app/page.tsx\nランディング")
            board = React("app/board/page.tsx\n画面全体の状態を束ねる")

            with Cluster("UIコンポーネント", graph_attr=cluster_attr):
                upload_panel = React("RecordingUploadPanel\n録画/録音のアップロード")
                canvas = React("MindMapCanvas\n(@xyflow/react)")
                nodes_ui = React("QuestionNode / AnswerNode\nスコア色分け・編集・削除")
                toast = React("MismatchToast\nズレ警告トースト")

            with Cluster("状態・ドメインロジック", graph_attr=cluster_attr):
                store = TypeScript("lib/hooks/useMindMapStore.ts\nノード/エッジCRUD・関係エッジ")
                layout = TypeScript("lib/layout.ts\ndagre自動レイアウト\n(isManualは座標維持)")
                actions_ctx = TypeScript("lib/mindmap-actions-context.tsx\nノード操作をContextで配布")
                samples = TypeScript("lib/samples/\nサンプルシナリオ4種")
                storage = TypeScript("lib/storage.ts\ndebounce 500ms 永続化")

        with Cluster("サーバー (Route Handler / runtime=nodejs)", graph_attr=cluster_attr):
            api = NodeJS("app/api/analyze/route.ts\nmultipart受信・300MB制限\nmaxDuration=300")
            prompts = TypeScript("lib/prompts.ts\nsystemInstruction\n+ responseSchema")
            gemini_client = TypeScript("lib/gemini.ts\nクライアント遅延生成\nApiKeyMissingError")

    with Cluster("Google Gemini API", graph_attr=cluster_attr):
        files_api = AIPlatform("Files API\nupload → ACTIVE待ちpolling\n(2秒×最大90回) → delete")
        gen_api = AIPlatform("generateContent\ngemini-2.5-flash\ntemperature=0.2 / thinkingBudget=0")

    local_storage = Storage('localStorage\n"meeting-mindmap:v1"\nnodes / edges / scenario')

    # --- ユーザー操作 ---
    # 逆流エッジはレイアウトを崩すため、往復は dir="both" の1本にまとめる
    user >> Edge(label="/ を開く") >> landing
    landing >> Edge(label="「使ってみる」", style="dashed") >> board
    user >> Edge(label="/board を開く") >> board
    user >> Edge(label="音声/動画ファイル選択") >> upload_panel
    user >> Edge(label="ドラッグ・編集・警告解除", style="dashed", dir="both") >> canvas

    # --- クライアント内 ---
    upload_panel >> Edge(label="onAnalyze(file)") >> board
    samples >> Edge(label="build() 初期ノード", style="dashed") >> board
    board >> Edge(label="matchScore < 40 で発火") >> toast
    board >> Edge(label="初期state / CRUD呼び出し", dir="both") >> store
    board >> Edge(label="nodes / edges / handlers") >> canvas
    board >> Edge(label="actions を Context 配布", style="dashed") >> actions_ctx
    actions_ctx >> Edge(
        label="updateNodeText / overrideMismatch\n/ deleteNode", style="dashed"
    ) >> nodes_ui
    canvas >> Edge(label="nodeTypes(モジュール定数)") >> nodes_ui
    store >> Edge(label="ノード追加のたびに再配置") >> layout
    board >> Edge(label="nodes/edges 変更を保存") >> storage
    storage >> Edge(label="save / load / clear", dir="both") >> local_storage

    # --- クライアント <-> サーバー ---
    board >> Edge(
        label="POST /api/analyze (multipart)\nrecording + existingQuestions/existingAnswers\n← AnalyzeResponse (JSON)",
        color="#2563eb",
        dir="both",
    ) >> api

    # --- サーバー -> Gemini ---
    api >> Edge(label="getClient()", style="dashed") >> gemini_client
    api >> Edge(label="systemInstruction\n/ responseSchema", style="dashed") >> prompts
    api >> Edge(label="files.upload / get / delete", color="#16a34a", dir="both") >> files_api
    files_api >> Edge(label="createPartFromUri", color="#16a34a", style="dashed") >> gen_api
    api >> Edge(
        label="音声/動画Part + 既存Q&Aコンテキスト\n← JSON構造化出力 (newQuestions /\nnewAnswers / answerRelations)",
        color="#16a34a",
        dir="both",
    ) >> gen_api

print("generated:", os.path.join(OUT_DIR, "architecture.png"))
