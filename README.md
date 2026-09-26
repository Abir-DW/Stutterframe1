# StutterFrame — Cinematic Toolkit for Filmmakers & Movie Lovers

> Built & Directed by **Abir D.W**

StutterFrame is an end-to-end computational cinematography and screenwriting suite powered by Google Gemini multimodal intelligence, live Google Search grounding, and cinema optics theory.

---

## 🎬 Core Features

1. **The Movie Picker (Search-Grounded)**:
   - Researches real, existing, cataloged films across genre, decade, language, and emotional mood with verified streaming platforms, IMDb ratings, and authentic poster art.
2. **The Shot Rater (Vision & Director Gut Reaction)**:
   - Multimodal frame analyzer across 4 critique tiers (*Friendly, Constructive, Moderate, Brutal*).
   - Features the **"How The AI Feels"** plain-language conversational gut reaction box, detailed technical breakdown of lighting ratios (key-to-fill), aspect ratios, camera sensor noise, and color temperature fixes.
3. **The Script Lab (Screenplay Doctor & Scene Beats)**:
   - Screenplay analysis and story generation within strict Rupee budgets (₹) and crew logistics.
4. **The Gear Suggestor (Indian Market Grounding)**:
   - Live Amazon.in & Flipkart index querying for verified filmmaking equipment and pricing in INR.
5. **The Editing Help Lab**:
   - Hardware detection and benchmark matching with recommended editing software (DaVinci Resolve, Premiere Pro, Final Cut Pro, CapCut, etc.).
6. **The FAQ & Asset Vault (Pre-Typed & Grounded Directory)**:
   - Abundant field-tested answers across Camera Optics, Lighting Science, Smartphone & Mobile Filmmaking/Editing, Microphones & 32-bit Float Audio, and Post-Production Workflows.
   - Comprehensive Curated Production Asset Directory with 16 verified platforms for stock footage, royalty-free audio, and visual effects with real India pricing (₹).
7. **Cinematic Customization & Studio Preferences**:
   - **PC Cursors**: System Default (Native OS Pointer or Colored Cinema Precision Arrow), Cinema Camera (with gentle, customizable soft aperture flash), and Movie Slate (with tactile stick snap on page-change buttons).
   - **Cinematic Color Grading Themes**: Celluloid 35mm, Neon Cyberpunk, Emerald 16mm, Monochrome Noir, Wes Anderson Pastel Symphony, Blade Runner 2049, Technicolor 3-Strip, Midnight Blue, and a fully customizable Director Palette Studio with instant reset to default.
   - **Phone Browser Optimized**: Complete touch optimization with native touch physics on mobile/tablets, safe area inset handling, responsive cards, and zero cursor interference.

---

## 🚀 Deployment to Vercel

This repository is pre-configured for GitHub-to-Vercel deployment out-of-the-box (`vercel.json` and `/api/index.ts` serverless handler included).

### 1. Push to GitHub
```bash
git add .
git commit -m "Initial StutterFrame commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/stutterframe.git
git push -u origin main
```

### 2. Import into Vercel
1. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
2. Select your `stutterframe` GitHub repository.
3. **Framework Preset**: Vite (automatically detected).
4. **Build Command**: `vite build`
5. **Output Directory**: `dist`

### 3. Configure Environment Variables
In your Vercel Project Settings > **Environment Variables**, add:
- `GEMINI_API_KEY`: Your Google Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).

Deploy! The frontend SPA and backend API serverless functions will build and deploy immediately.

---

## 💻 Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. Run lint and type check:
   ```bash
   npm run lint
   ```

5. Build for production:
   ```bash
   npm run build
   ```
