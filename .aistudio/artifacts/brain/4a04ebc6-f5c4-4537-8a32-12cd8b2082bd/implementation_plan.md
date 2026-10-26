# Implementation Plan: YouTube Theme & App Shell, Streamlined Settings, Director Dropdown, and Shot Rater Post-Critique AI Chat

Deliver an authentic YouTube application theme and responsive layout shell, streamline the multi-panel UI customizer into three intuitive tabs, upgrade the AI Assistant director selector to a clean dropdown, and add an interactive follow-up AI consultation after shot analysis with budget equipment recommendations.

---

## 1. User Requirements & Clarifications Summary

Based on your prompt and questionnaire answers:
- **YouTube Theme & Layout**: Full 1:1 YouTube app shell with top YouTube header (search bar, mic icon, create button, notifications, user avatar), collapsible desktop sidebar, scrollable content filter chips, video card presentation style, and a dedicated mobile bottom navigation dock.
- **Shot Rater Post-Critique AI Chat**: Interactive conversational AI follow-up after frame rating, focused specifically on practical camera and lighting fixes with budget gear suggestions (in ₹ INR and $ USD).
- **Streamlined Customizer**: Consolidated 3-tab settings modal replacing the previous confusing "Switch UI", "Theme", and "UI Archetype" controls:
  1. **Visual Themes**: One-click visual styles (YouTube, Celluloid, Netflix, Prime, Gotham, Dune, Interstellar, etc.).
  2. **Navigation Layouts**: Shell architectures (YouTube App, Floating Dynamic Island, Desktop Sidebar, Top Bar, Bottom Nav, Command Deck).
  3. **Cinema Tools & Preferences**: Cursors (Slate, Camera, Batarang), audio clicks, and credits.
- **Director Persona Selection**: Upgrade from horizontal scrollbar pills to an elegant dropdown selector with director badges and cinema philosophies.
- **Rollback & Resilience**: 1-click "Reset to Default" safety switch, client-side retry fallbacks, and Vercel-ready zero-secret architecture.
- **Multi-Device Compatibility**: Ultra-responsive layout tested from 280px flip/fold screens to 4K ultra-wide monitors.

---

## 2. Proposed Architecture & Component Plan

### A. YouTube App Layout Shell (`src/components/YouTubeAppLayout.tsx`)
- **Authentic YouTube Header**:
  - Left: YouTube icon badge with red play icon + "StutterTube" / "StutterFrame" bold logo.
  - Center: Pill-shaped search box with magnifying glass, search submit button, and microphone icon.
  - Right: Quick "Create" (+), notifications bell with badge, and Director profile avatar.
- **Filter Chip Bar**:
  - Horizontal scrollable filter pills ("All", "Cinematography", "Shot Rater", "Budget Gear ₹", "Color Grading", "Film Recipes", "Screenwriting", "Lens Guide").
  - Clicking chips smoothly switches active views or filters tools.
- **Collapsible Mini/Expanded Left Sidebar (Desktop)**:
  - Top section: Home, Movie Picker, Shot Rater, Script Lab, Gear Vault, Editor Advisor.
  - Subscriptions / Library: Saved scripts, rated frame history, quick settings.
- **Mobile Bottom Navigation Dock (Phones & Foldables)**:
  - 5-tab bottom dock styled identically to YouTube Mobile: Home, Explore (Movie Picker), Center '+' (Shot Rater), Library (Script Lab), You (Assistant & Preferences).
- **YouTube Video Card Feed Aesthetics**:
  - When in Home view under YouTube theme, tools and featured film clips are styled like authentic video cards with runtime stamps (e.g. `12:45`), 16:9 thumbnail previews, channel badges, and view counts.

### B. Consolidated 3-Tab Settings Modal (`src/components/SettingsModal.tsx`)
- Replace the confusing multi-button panels with 3 clear, distinct tabs:
  1. **Tab 1: Visual Themes & Film Styles**:
     - Visual grid of themes featuring YouTube Dark (#0f0f0f + #ff0000), YouTube Light, Celluloid Classic, Netflix, Amazon Prime, The Batman, Dune, Interstellar, and Wes Anderson.
     - High-contrast visual thumbnail preview cards with 1-click activation.
  2. **Tab 2: Navigation Layouts**:
     - YouTube App Shell, Floating Dynamic Island, Film Strip Left Sidebar, Celluloid Top Bar, Mobile Bottom Nav, and ⌘K Command Deck.
     - Live indicator showing active layout.
  3. **Tab 3: Cinema Tools & Audio**:
     - Custom PC Cursors (Clapperboard slate, Camera with flash, Revolver, Batarang).
     - SFX & Audio feedback toggles, and Director credits.
- Include a prominent **"Reset All to Default"** rollback button in the modal footer.

### C. Director Persona Dropdown Selector (`src/components/AssistantDrawer.tsx`)
- Replace the horizontal overflow scrollbar with a custom dropdown button:
  - Button displays current Director Avatar/Icon, Name, and direct style badge (e.g. *Christopher Nolan - Non-linear IMAX Realism*).
  - Clicking opens a sleek popup menu showing all directors (Nolan, Fincher, Tarantino, Spielberg, Anderson, Villeneuve, and StutterFrame Standard Bot).
  - Highlights active director with their signature accent color.
  - Seamlessly handles keyboard navigation and mobile touch taps.

### D. Post-Critique Shot Rater AI Chat (`src/components/ShotRater.tsx`)
- Rendered immediately below the analysis results after an image is graded:
  - **Director Follow-Up Consultation Box**:
    - Pre-seeded with contextual metadata from the analyzed frame (lighting score, composition score, detected issues, focal length).
    - Quick-tap suggestion chips:
      - *"How can I fix this lighting under ₹5,000 / $60?"*
      - *"What budget lens will give me this exact depth of field?"*
      - *"How do I bounce or flag the spill on this key light?"*
      - *"Recommend affordable gear available in India / Global for this setup."*
    - Interactive chat input with live response generation using `/api/assistant/stream`.
    - Responds with concrete DIY hacks (5-in-1 reflectors, practical lamps, china balls) and budget gear (e.g. Godox, Aputure Amaran, TTArtisan, Yongnuo) with realistic estimated costs.
    - Preserves rated frame and analysis report without loss during chat.

### E. SettingsContext Updates (`src/context/SettingsContext.tsx`)
- Add `'youtube'` to `UILayoutType`, `ColorTheme`, and `UIStyleType`.
- Provide smooth layout switching and synchronized active tabs.

---

## 3. Step-by-Step Execution Sequence

1. **Update `src/context/SettingsContext.tsx`**:
   - Register `'youtube'` across layout, style, and color theme types.
   - Streamline settings modal tab state to `'themes' | 'layouts' | 'preferences'`.

2. **Create `src/components/YouTubeAppLayout.tsx`**:
   - Build authentic YouTube header, filter chip bar, desktop sidebar, and mobile dock.
   - Wire responsive breakpoints (320px foldables to 1920px+ monitors).

3. **Streamline `src/components/SettingsModal.tsx`**:
   - Refactor into the 3 clean tabs: Visual Themes, Layout Style, and Audio & Preferences.
   - Remove redundant terminology and eliminate confusing multi-level menus.

4. **Upgrade `src/components/AssistantDrawer.tsx`**:
   - Replace the horizontal pill rail with the dropdown director selector.

5. **Enhance `src/components/ShotRater.tsx`**:
   - Integrate the post-critique conversational AI follow-up module with budget gear recommendations.

6. **Integrate into `src/App.tsx`**:
   - Mount `YouTubeAppLayout` when the YouTube layout is active.

7. **Verification & Testing**:
   - Run `lint_applet` and `compile_applet`.
   - Verify layout responsiveness on small screens (fold/flip phones), tablets, and desktops.

---

## 4. Rollback & Deployment Readiness

- **Rollback Safety**: State is managed in `SettingsContext` with persistent local storage. Clicking "Reset All Settings" immediately restores the original classic Celluloid layout.
- **Vercel Push Ready**: All API calls proxy securely via `/api/*`. No API keys or secrets are stored in client bundles. Standard `npm run build` generates clean output.

---

**Next Action**: Click **Proceed** to authorize this plan and begin implementation.
