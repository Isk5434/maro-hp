# AGENTS.md — Instructions for AI Agents (Codex, etc.)

## Critical Rule

**REPORT.md を必ず更新すること。これは非交渉の必須ルール。**
作業完了前に変更ログを追記すること。

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.x | UI framework |
| Vite | 5.x | Build tool + dev server |
| TypeScript | 5.x | Type safety |
| Three.js | 0.169.x | 3D rendering engine |
| @react-three/fiber | 8.x | React renderer for Three.js |
| @react-three/drei | 9.x | GLTF loading, camera, helpers |
| GSAP | 3.12.x | Animation (currently minimal use) |

---

## Architecture Constraints

- **Do NOT** add audio libraries or audio-related code
- **Do NOT** introduce state management libraries (Redux, Zustand, Jotai, etc.)
- **Do NOT** break the model-swappable pattern in `src/config/model.config.ts`
- **Do NOT** move SVG filter definitions out of the DOM (they must stay in `SvgFilters.tsx`)
- **Do NOT** use `App.css` or `index.css` — styles live in `src/styles/`

---

## File Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Components | PascalCase.tsx | `Header.tsx` |
| Hooks | camelCase.ts (use prefix) | `useMouseTracker.ts` |
| Styles | PascalCase.module.css | `Header.module.css` |
| Config | camelCase.config.ts | `model.config.ts` |

---

## How to Swap the 3D Model

The entire 3D model configuration lives in ONE file:

```typescript
// src/config/model.config.ts
export const MODEL_CONFIG = {
  path: '/models/house.glb',   // ← change this filename
  position: [0, -1.2, 0],
  scale: [1, 1, 1],
  rotation: [0, 0, 0],
  autoRotate: true,
  autoRotateSpeed: 0.004,
  usePrimitives: true,         // ← set false to load the GLB
}
```

Steps:
1. Place new `.glb` in `/public/models/`
2. Update `path` in `model.config.ts`
3. Set `usePrimitives: false`
4. Adjust `position`/`scale`/`rotation`

---

## Key CSS Variables (globals.css)

```
--color-bg      : #FFFDF0  (cream)
--color-text    : #5C4534  (warm brown)
--color-text-light : #8B7355
--font-script   : 'Alex Brush', cursive
--font-serif    : 'Crimson Text', serif
```

Dark mode: add `dark-bg` class to `<body>`.

---

## SVG Filters

Defined once in `src/components/SvgFilters.tsx` as a zero-size hidden SVG.
Referenced via CSS `filter: url(#wobble-filter)` or `filter: url(#crumple-filter)`.
Must live in the DOM — cannot be external SVG file due to browser cross-origin restrictions.

---

## Completion Checklist

Before declaring any task done:
- [ ] `npm run build` exits with code 0
- [ ] No audio code present (`grep -r "audio\|AudioContext\|howler" src/` returns nothing)
- [ ] REPORT.md change log updated
- [ ] No new state management libraries introduced
- [ ] CSS changes use CSS Modules (not inline styles or global class names)
