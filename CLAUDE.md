# CLAUDE.md — Instructions for Claude Code

## Project Purpose
`maro_hp` は susurrus.vercel.app の視覚的再現。
React 18 + Vite 5 + TypeScript + Three.js (@react-three/fiber) 構成。
音声機能は一切含まない。

## 必須ルール: REPORT.md を常に更新すること

**作業のたびに必ず `REPORT.md` の「変更ログ」セクションを更新すること。**
更新内容:
- 追加・変更した依存関係（バージョンと理由）
- 新しい実装技術・パターン
- コンポーネント構造の変更
- 元の計画からの逸脱や新たな知見

これはオプションではなく必須の作業手順。

## コマンド

```bash
npm run dev      # 開発サーバー起動 (http://localhost:5173)
npm run build    # プロダクションビルド
npm run preview  # ビルド結果プレビュー
```

## 主要ファイル

| ファイル | 役割 |
|---|---|
| `src/config/model.config.ts` | 3Dモデル差し替えの唯一の設定ファイル |
| `src/config/content.ts` | テキスト・リンクの一元管理 |
| `src/styles/globals.css` | CSS変数・フォント・紙テクスチャ・エッジマスク |
| `src/components/SvgFilters.tsx` | wobble / crumple SVGフィルター定義 |
| `REPORT.md` | 技術レポート（必ず更新） |

## 3Dモデルの差し替え方法

1. `/public/models/` に新しい `.glb` ファイルを置く
2. `src/config/model.config.ts` の `path` を変更
3. `usePrimitives: false` に変更
4. `position` / `scale` / `rotation` を調整

## コーディング規約

- スタイルはすべて CSS Modules (`*.module.css`) — globals.css / filters.css を除く
- SVGフィルターはDOMの隠しSVG（`SvgFilters.tsx`）で定義、CSS で `filter: url(#id)` 参照
- 状態管理ライブラリ（Redux, Zustand 等）は追加しない
- 音声関連コードは絶対に追加しない
- 新しい依存関係を追加した場合は必ず `REPORT.md` に記録

## 検証チェックリスト（実装後に必ず確認）

- [ ] フォント（Alex Brush, Crimson Text）が読み込まれている
- [ ] クリーム色背景 (#FFFDF0) が表示される
- [ ] 紙テクスチャオーバーレイが見える
- [ ] エッジマスクのグラデーションが見える
- [ ] ロゴに wobble フィルターがかかっている
- [ ] About モーダルが crumple フィルターで表示される
- [ ] マウスフォロワーがカーソルを追う
- [ ] 3D モデルが表示・回転する
- [ ] 背景トグルでダーク/ライト切り替わる
- [ ] ローディング画面が進捗後フェードアウトする
- [ ] 音声関連コードが一切ない
- [ ] `npm run build` が成功する
