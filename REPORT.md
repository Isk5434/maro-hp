# REPORT.md — Technical Documentation

> このファイルは作業のたびに更新すること（CLAUDE.md / AGENTS.md 参照）。
> 新しいエントリは変更ログに追記する。

---

## Project Overview

susurrus.vercel.app の視覚的完全再現プロジェクト。
音声機能は意図的に除外。
3Dモデルは差し替え可能な構造を採用。

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.x | UIフレームワーク |
| Vite | 5.x | ビルドツール・HMR |
| TypeScript | 5.x | 型安全 |
| Three.js | 0.169.x | 3Dレンダリングエンジン |
| @react-three/fiber | 8.x | ReactのThree.jsレンダラー（R3F） |
| @react-three/drei | 9.x | GLTFローダー・カメラ・ライティングヘルパー |
| GSAP | 3.12.x | アニメーション補助（将来的なスクロール演出用） |

---

## Key Terms Glossary

| 用語 | 説明 |
|---|---|
| **R3F** | @react-three/fiber の略称。ReactコンポーネントとしてThree.jsシーンを記述できる |
| **GLB** | Binary GLTF — 3Dモデルの標準ファイル形式。テクスチャ・アニメーションを一ファイルに含む |
| **useGLTF** | dreiのフック。GLBファイルをロード・キャッシュして返す |
| **feTurbulence** | SVGフィルタープリミティブ。Perlinノイズのような乱流フィールドを生成 |
| **feDisplacementMap** | SVGフィルタープリミティブ。ノイズに従いピクセルをズラして歪みを作る |
| **CSS Modules** | クラス名をハッシュ化してスコープを閉じるCSS手法 |
| **canvas alpha** | R3F Canvasをαチャンネルありでレンダリングするとバックグラウンドの紙が透けて見える |
| **useFrame** | R3FのフックでThree.jsのレンダーループ（rAF）に処理を差し込む |
| **IntersectionObserver** | DOM要素のビューポート内可視性を監視するWeb API。スクロール演出に使用 |

---

## Visual Techniques

### 紙テクスチャ（Paper Texture）
- `#root::before` 疑似要素にインラインSVG（feTurbulence）のData URIを適用
- `mix-blend-mode: multiply` でクリーム背景と自然に合成
- `opacity: 0.055` で控えめな質感
- 外部画像ファイル不要

### エッジマスク（Edge Vignette）
- `#root::after` 疑似要素に `radial-gradient` を適用
- 中央は透明、端に向かって背景色にフェードアウト
- 外部画像ファイル不要（元サイトは edge-mask.webp を使用）

### SVG Wobble フィルター
- `feTurbulence`（type="turbulence", baseFrequency=0.012, scale=4）でテキストをわずかに歪める
- ロゴ・セクション見出しに適用
- DOMに隠しSVGとして配置（`SvgFilters.tsx`）

### SVG Crumple フィルター
- `feTurbulence`（type="fractalNoise", baseFrequency=0.035, scale=2.5）でモーダルカードを歪める
- より強い、紙のような不規則なゆがみ

### Backdrop Blur Modal
- `backdrop-filter: blur(10px)` でモーダル背景をぼかす
- `-webkit-backdrop-filter` でSafari対応

### マウスフォロワー
- `mousemove` → `requestAnimationFrame` → `transform: translate()` 更新
- `will-change: transform` でGPUレイヤー昇格

### CameraRig（視差カメラ）
- `useFrame` でカメラ回転をマウス位置にlerpで追従
- 微細な傾き（xが±0.08rad、yが±0.05rad）で奥行きを演出

---

## 3D Model System

### 差し替え方法（model.config.ts のみ編集）

```typescript
// src/config/model.config.ts
export const MODEL_CONFIG = {
  path: '/models/house.glb',   // 1. ファイル名をここで変える
  position: [0, -1.2, 0],      // 2. 位置調整
  scale: [1, 1, 1],            // 3. スケール調整
  rotation: [0, 0, 0],         // 4. 回転調整
  autoRotate: true,
  autoRotateSpeed: 0.004,
  usePrimitives: true,         // 5. false にするとGLBを読む
}
```

### 初期仮置きモデル（primitives）
- drei の `BoxGeometry` + `ConeGeometry` でシンプルな家の形を表現
- GLBファイル不要で即動作
- `MODEL_CONFIG.usePrimitives = true` で有効

### GLBモデルのおすすめ入手先
- [kenney.nl](https://kenney.nl/assets) — CC0の建物・環境モデル多数
- Sketchfab — "low poly house" + CC0フィルター
- Three.js Examples — 公式サンプルGLBモデル

### パフォーマンス考慮
- `useGLTF.preload(path)` をモジュール最上位で呼ぶ → コンポーネントマウント前にロード開始
- `frameloop="demand"` は現在不使用（primitives は軽量なので常時レンダリング可）

---

## Color Palette

| 変数 | 値 | 用途 |
|---|---|---|
| `--color-bg` | `#FFFDF0` | ページ背景（クリーム色） |
| `--color-text` | `#5C4534` | メインテキスト（ウォームブラウン） |
| `--color-text-light` | `#8B7355` | サブテキスト |
| `--color-overlay` | `rgba(255,253,240,0.88)` | モーダル背景 |

ダークモード: `<body class="dark-bg">` で CSS 変数が上書きされる。

---

## Pending / Open Items

- [ ] 実際のGLBモデルの調達と差し替え
- [ ] `src/config/content.ts` の実際のテキスト・リンク入力
- [ ] スクロールアニメーションのGSAP化（現状はIntersectionObserver）
- [ ] スマートフォン対応の詳細テスト

---

## Change Log

| 日付 | 変更内容 | 担当 |
|---|---|---|
| 2026-04-19 | 初回実装。Vite+R3F+drei+GSAPで全コンポーネント作成。primitives仮置きモデル使用。 | Claude Code |
| 2026-04-19 | スクロール3D登場実装（旧実装、廃止）。 | Claude Code |
| 2026-04-19 | anri.vc風ヒーローセクション追加。HeroCanvas(R3F)+FloatingObjects(config駆動)+HeroSection(テキスト/CTA)。浮かぶ3Dオブジェクトはfloating-objects.config.tsのみ編集で差し替え可。 | Claude Code |
| 2026-04-19 | blob morphアニメーション実装。SVG clipPath (objectBoundingBox) をスクロール進捗でモーフィング。FULL→BLOBの2パス補間（lerp）、easeInOut適用。テキストオーバーレイはDOM直接操作（opacity/transform）でReact再レンダーなし。 | Claude Code |
| 2026-04-19 | hero subtitle と sections body を「名古屋市博物館サポーターMARO」に変更。 | Claude Code |
| 2026-04-19 | すりガラス選択画面実装。blobWrapper を 300svh→500svh に拡張し第2スクロールフェーズ追加。selectionT (0→1) で3Dキャンバスが下スライド・glassSurface (backdrop-filter: blur(28px)) が下から上昇。6枚カードグリッド（3列×2行）がstagger fade-in。カード項目はMAROオフィシャルサイトに準拠（MAROとは・活動内容・お問い合わせ・SNS3種）。ダークモード対応済み。 | Claude Code |
| 2026-04-19 | 3d-model/ フォルダのGLBモデル3体（bunny, maro-inu-banzai, maro-inu-hand）をheroセクション外周に配置。FloatingObjectConfigにglb shapeとglbPath追加。FloatingObjects.tsxにFloatingGlb（useGLTF+scene.clone()）追加。public/models/ へコピー済み。 | Claude Code |
| 2026-04-19 | GLB管理・デバッグ作業。useGLTF.setDecoderPath() が最上位で実行された結果 Canvas 初期化失敗。問題切り分けのため SectionManager を一時削除し HeroSection のみで動作確認。最終的に SectionManager 構造を再確認し、mouseNx/mouseNy プロップの削除でシンプル化。HeroCanvas・SceneCanvas・SectionManager から不要な Props を削除。現在プリミティブ構成で安定動作。 | Claude Code |
| 2026-05-07 | フェーズ2のスマホ/島の登場演出を時間経過ベースからスクロール進捗ベースへ変更。SectionManagerで第2セクションのスクロール量をsceneProgressとして算出し、PhoneEmergeScene側のスマホ着地・島出現・浮遊位置を進捗から決定するよう調整。 | Codex |
| 2026-05-07 | フェーズ3（ガラス面/カード）の開始タイミングを後ろ倒し。スマホ/島のスクロール同期演出が完了してから約0.4画面分の間隔を置き、0.7画面分でフェーズ3が立ち上がるよう調整。 | Codex |
| 2026-05-07 | フェーズ1→2の見え方を調整。スマホ登場アニメーションが画面外/半表示中に進まないよう、PhoneEmergeSceneの進捗開始を第2セクションがフル表示される位置へ変更。フェーズ3開始も2.0画面分まで後ろ倒しして、スマホ登場・着地・カード表示の間隔を明確化。 | Codex |
| 2026-05-07 | フェーズ2のスクロール同期速度を約33%低速化。PhoneEmergeSceneの進捗区間を1.5画面分から2.0画面分へ延長し、フェーズ3開始も2.5画面分へ後ろ倒しして間隔を維持。 | Codex |
| 2026-05-07 | フェーズ2のスクロール同期区間を約66%延長へ再調整。PhoneEmergeSceneの進捗区間を2.5画面分、フェーズ3開始を3.0画面分に変更。 | Codex |
| 2026-05-07 | フェーズ2をさらに4倍低速化。PhoneEmergeSceneの進捗区間を10.0画面分へ延長し、フェーズ3開始を10.6画面分に設定。SectionManagerの固定スクロール区間を1300svh/1200svhへ拡張し、フェーズ3が表示されない問題を修正。 | Codex |
| 2026-05-07 | フェーズ2低速化によりスマホ初期姿勢が見えにくい時間も伸びていた問題を修正。PhoneEmergeSceneのスマホ初期角度を真横寄りから正面寄りへ変更し、初期スケール/奥行きも画面内で視認できる値に調整。 | Codex |
| 2026-05-07 | 速いスライド時にフェーズ2の3D表示が一瞬消える問題を修正。スクロール同期化後は不要になったSceneCanvasのkeyリマウント処理をSectionManagerから削除し、Canvas/GLBの再初期化を防止。 | Codex |
| 2026-05-07 | スマホ登場の初期演出を調整。PhoneEmergeSceneの初期スケール/奥行き/角度を変更し、青いスクリーン面が画面近くを覆う状態から開始。登場時のz軸回転量を半回転追加して360度回転に変更。 | Codex |
| 2026-05-07 | スマホ登場演出を追加調整。初期スケールを11.5へ拡大し、z軸回転量をさらに半回転追加して450度回転に変更。 | Codex |
| 2026-05-07 | スマホ登場の追加回転が最終姿勢へ影響しないよう修正。PhoneEmergeSceneの着地後z軸角度を元の5π/2-0.6に固定し、追加回転は登場区間のみへ限定。 | Codex |
| 2026-05-07 | スマホ着地前の最終局面にz軸1回転を追加。最終的な見た目の向きは維持したまま、settle区間の補間先へ2πを加算して回転量のみ増加。 | Codex |
| 2026-05-07 | フェーズ2モデルの参考サイト風プリミティブ構成（手/Z/リボン/睡眠球）を取り下げ。PhoneEmergeSceneを直前のスマホ＋島構成へ復元し、既存のスクロール同期・速度調整・回転調整は維持。 | Codex |
