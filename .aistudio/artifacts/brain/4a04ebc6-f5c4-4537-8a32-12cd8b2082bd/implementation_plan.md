# Implementation Plan: Lighting Studio & LUT Color Lab (8th Cinema Tool)

Build and integrate the 8th cinema instrument: **Lighting & LUT Lab** (`lighting-lut-lab`), bringing the StutterFrame suite to an even **8 tools**. This perfectly balances all 4×2 desktop grids and 2-column mobile layouts across the Classic Cinema, YouTube, Netflix, and Amazon Prime shells, with a 1-click rollback safeguard and full GitHub-to-Vercel optimization.

---

## 1. Architecture & Sub-Tab Structure

The new component `src/components/LightingLutLab.tsx` will feature an elegant top segmented switcher toggle:
- **Tab 1: 💡 Virtual Lighting Studio**
  - Interactive 2D Soundstage Overhead Rig with Key, Fill, Rim, and Background practicals.
  - Interactive Viewfinder Face Preview reacting in real time to light angles, softness, and distance.
  - **Numerical Precision Sliders**:
    - **Intensity**: Lux & Foot-Candles (0 to 5,000 lx).
    - **Distance**: Accurate falloff based on inverse-square law ($I \propto 1/d^2$) in meters & feet.
    - **Color Temperature (Kelvin)**: 2000K (Candle) → 3200K (Tungsten) → 5600K (Daylight) → 8000K (Deep Sky).
    - **Diffusion & Beam Angle**: Hard fresnel spotlight vs. double-diffused softbox octa.
  - **Contrast Ratio Meter**: Live mathematical Key-to-Fill ratio (**1:1**, **2:1**, **4:1 Dramatic**, **8:1 Film Noir**, **16:1 Low-Key**).
  - **1-Click Classic Rigs**: Rembrandt, Split, Butterfly (Paramount), Loop, High-Key Commercial, and Fincher Mood.
  - **Export Gaffer Setup Sheet**: Generates a downloadable camera/lighting cheat card for the production crew.

- **Tab 2: 🎨 LUT Color Lab & Frame Extractor**
  - **Real-Time 3D LUT Presets**: Kodak Vision3 2383 Print, Teal & Orange Blockbuster, 1970s Technicolor 3-Strip, Bleach Bypass, Fuji Eterna, Fincher Emerald Noir.
  - **Downloadable Real `.cube` LUT File Generator**: Generates genuine 3D LUT files ($17\times 17\times 17$ or $33\times 33\times 33$) that filmmakers can drag directly into DaVinci Resolve, Premiere Pro, and Final Cut Pro.
  - **Frame Hex Palette Extractor**:
    - Upload user frame stills or pick benchmark film reference frames.
    - Canvas-based k-means / color quantization extracting 6 dominant hex swatches with luminance %, RGB, and color harmony.
    - 1-click "Copy Palette", "Copy CSS Variables", or "Export Swatch Sheet".
  - **Grade Fine-Tuning**: Lift/Shadows, Gamma/Midtones, Gain/Highlights, Saturation, and Film Grain strength.

---

## 2. Integration Across the Entire Suite (8 Even Tools)

Integrating `lighting-lut-lab` balances the navigation and layout across all views:
1. **`App.tsx`**: Route handling for `lighting-lut-lab` with smooth transitions.
2. **`Header.tsx`**: Add `SunMedium` or `Sliders` icon under "Craft", updating desktop and mobile sub-bars.
3. **`HomeView.tsx`**: 8-tool grid (2 rows of 4 on desktop, 4 rows of 2 on tablet/mobile).
4. **`PrimeHome.tsx`**: 8th Amazon Prime swimlane card ("LIGHTING & LUTS LAB • Included with Prime").
5. **`NetflixHome.tsx`**: 8th Netflix horizontal rail instrument with match percentage and tags.
6. **`YouTubeAppLayout.tsx`**: 8th YouTube category filter chip and sidebar entry.
7. **`SidebarNav.tsx` & `BottomNavBar.tsx`**: Add the 8th tool to the vertical dock and mobile navigation sheets.
8. **`CommandCenterModal.tsx`**: Search index entries for quick keyboard navigation (⌘K).

---

## 3. Rollback Safeguard & Vercel Optimization

- **Zero-Friction Rollback**: All logic self-contained in `src/components/LightingLutLab.tsx`. A single boolean flag `ENABLE_LIGHTING_LUT_LAB` or routing switch can disable or revert it instantly if desired.
- **Client Performance & Bundle Hygiene**:
  - Pure SVG and HTML5 Canvas calculations (no heavy external 3D WebGL engine dependencies needed).
  - Fast client-side `.cube` file binary blob generation without any server latency.
  - Lightweight, tree-shaken Lucide icons.
- **Vercel & Production Verification**:
  - Full TypeScript validation (`tsc --noEmit`).
  - Production build bundle test (`npm run build`).
