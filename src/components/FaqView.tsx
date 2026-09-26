import React, { useState, useMemo } from 'react';
import {
  Camera,
  Sun,
  Smartphone,
  Mic,
  Scissors,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  Tag,
  CheckCircle2,
  DollarSign,
  Globe,
  Sparkles,
  Info,
  Film,
  Zap,
} from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  keyTakeaway?: string;
  tags: string[];
}

interface FaqSection {
  id: string;
  title: string;
  category: string;
  icon: React.ElementType;
  description: string;
  items: FaqItem[];
}

interface AssetDirectoryItem {
  id: string;
  name: string;
  category: 'Stock Footage' | 'Music & Audio' | 'Visual Effects (VFX)' | 'Templates & All-in-One';
  pricingType: '100% Free' | 'Freemium' | 'Subscription' | 'Pay Per Clip / Pack';
  indiaPricing: string;
  commercialSafety: string;
  bestFor: string;
  url: string;
  highlight: string;
}

const FAQ_SECTIONS: FaqSection[] = [
  {
    id: 'camera',
    title: 'Camera Optics & Sensor Science',
    category: 'Cinematography Fundamentals',
    icon: Camera,
    description: 'Field-tested rules for shutter angles, focal length crop factors, log profiles, and sensor physics.',
    items: [
      {
        id: 'cam-1',
        question: 'What is the 180-Degree Shutter Rule and when should a filmmaker break it?',
        answer:
          'The 180-Degree Shutter Rule states that your shutter speed should always equal 1 / (2 × your frame rate). For instance, shooting at 24 fps requires a 1/48s (or 1/50s) shutter speed, while 60 fps requires 1/120s. This produces motion blur that precisely mimics the persistence of human biological vision. \n\nWhen to break it: \n1. High-Shutter Action (45° or 90° shutter / 1/200s–1/500s at 24fps): Used famously in "Saving Private Ryan" and "Gladiator" to make explosions, flying dirt, and fast blade impacts razor-sharp and jarring with zero motion smear. \n2. Low-Shutter Dreamscapes (360° shutter / 1/24s at 24fps): Introduces heavy, fluid streaking for drug intoxication, supernatural disorientation, or low-light handheld night sequences (e.g. Wong Kar-wai\'s step-printed motion in "Chungking Express").',
        keyTakeaway: 'Standard: Shutter Speed = 1 / (2 × Frame Rate). Fast shutter = crisp, chaotic grit. Slow shutter = hallucinatory, streaked blur.',
        tags: ['Shutter Speed', 'Motion Blur', '180 Degree Rule', 'Frame Rates'],
      },
      {
        id: 'cam-2',
        question: 'How do Sensor Crop Factors affect focal length, depth of field, and light gathering?',
        answer:
          'Sensor crop factors (Full Frame = 1.0x, Super 35 / APS-C = 1.5x, Micro Four Thirds = 2.0x) refer to the physical dimensions of the silicon chip relative to traditional 35mm photographic film (36×24mm). \n\n1. Field of View: Multiplying focal length by the crop factor gives the equivalent field of view. A 50mm lens on an APS-C camera frames like a 75mm lens on Full Frame. \n2. Depth of Field: To match the identical shallow depth of field of Full Frame at f/2.8, an APS-C sensor requires roughly f/1.8, and MFT requires f/1.4. \n3. Light & Exposure: An f/2.8 aperture delivers the exact same exposure intensity (lux per square millimeter) across any sensor size, but larger sensors capture greater total light due to larger pixel surface areas, yielding superior signal-to-noise ratios in low light.',
        keyTakeaway: 'Focal length is fixed physics; crop factor only changes the cropped window of view and depth-of-field equivalence.',
        tags: ['Sensor Size', 'Crop Factor', 'Super 35', 'Full Frame', 'Focal Length'],
      },
      {
        id: 'cam-3',
        question: 'Why should I shoot in Log (S-Log3, C-Log3, Apple Log) instead of standard Rec.709?',
        answer:
          'Standard Rec.709 burns contrast, saturation, and tone curves permanently into the 8-bit or 10-bit file inside the camera processor, discarding shadow details and blowing out window highlights. \n\nLogarithmic recording compresses maximum dynamic range (often 14 to 15+ stops) into a flat, desaturated image that protects both highlight roll-off and deep shadow textures. In post-production, you convert Log back to Rec.709 using a Color Space Transform (CST) or manufacturer 3D LUT in DaVinci Resolve or Premiere, retaining full control over color temperature, lift, gamma, and gain without color banding.',
        keyTakeaway: 'Always expose Log slightly to the right (+1.0 to +1.7 EV) to bury shadow noise, then pull down shadows in post.',
        tags: ['Log Profiles', 'Dynamic Range', 'Rec.709', 'Color Grading'],
      },
      {
        id: 'cam-4',
        question: 'What is False Color and how do IRE values determine exact skin tone exposure?',
        answer:
          'False Color replaces the visual image with a standardized color-coded exposure heat map mapped across 0 to 100 IRE (Institute of Radio Engineers): \n\n• 0–2 IRE (Purple/Black): Crushed blacks with zero shadow data. \n• 38–42 IRE (Green): 18% Neutral Middle Gray test card. \n• 45–55 IRE (Pink/Light Brown): Optimal exposure for South Asian / Olive / Deep skin tones in Rec.709 or Log conversion. \n• 60–70 IRE (Light Pink): Optimal exposure for Fair / Caucasian skin tones. \n• 95–99 IRE (Orange/Yellow): Near highlight clipping warning. \n• 100+ IRE (Pure Red): Blown-out clipped highlights with permanent data loss.',
        keyTakeaway: 'Expose your subject\'s forehead or cheekbone to Pink/Light Brown (45-55 IRE) on false color for perfect skin density every take.',
        tags: ['False Color', 'Exposure', 'IRE Values', 'Skin Tones', 'Monitors'],
      },
      {
        id: 'cam-5',
        question: 'What is Dual Native ISO and how does it clean up low-light night shoots?',
        answer:
          'Traditional camera sensors have a single base ISO (e.g. ISO 800). Raising ISO to 3200 or 12,800 digitally amplifies the analog signal, which aggressively amplifies electronic background noise and degrades dynamic range. \n\nDual Native ISO cameras (e.g. Sony FX3/FX30/A7S III at ISO 800 & 12,800; Blackmagic BMPCC 6K at ISO 400 & 3200) contain two separate hardware gain circuits connected to each photodiode. When you click past the threshold (e.g. ISO 12,800), the camera switches physically to the secondary high-sensitivity circuit. The image at ISO 12,800 is as clean, rich, and wide in dynamic range as base ISO 800.',
        keyTakeaway: 'Never shoot at intermediate high ISOs (like ISO 10,000 on Sony). Jump straight to the secondary base (ISO 12,800) for a cleaner image.',
        tags: ['Dual Native ISO', 'Low Light', 'Sony FX3', 'Noise Reduction', 'Sensor Gain'],
      },
      {
        id: 'cam-6',
        question: 'What is the optical difference between Anamorphic and Spherical cinema lenses?',
        answer:
          'Spherical lenses use circular optical elements that project a 1:1 undistorted circular image onto the sensor. Anamorphic lenses contain cylindrical glass elements that optically squeeze an ultra-wide horizontal field of view (typically 1.33x, 1.5x, or 2.0x) onto a standard 16:9 or 4:3 sensor. \n\nKey Anamorphic characteristics: \n• Oval out-of-focus background bokeh (instead of circular circles). \n• Horizontal chromatic streak flares across bright headlights or street lamps. \n• Organic barrel distortion and subtle edge falloff that draws the viewer\'s eye to the center.',
        keyTakeaway: 'Spherical is clean, sharp, and realistic; Anamorphic is stylized, widescreen, painterly, and widescreen.',
        tags: ['Anamorphic', 'Spherical', 'Bokeh', 'Lens Flare', 'Aspect Ratio'],
      },
      {
        id: 'cam-7',
        question: 'Rolling Shutter vs. Global Shutter: What causes the "Jello" effect?',
        answer:
          'Most modern CMOS digital cameras use a Rolling Shutter, which reads pixels row-by-row from the top of the sensor to the bottom in 8ms to 20ms. When panning rapidly (whip pan) or filming fast objects (helicopter blades, passing trains), vertical lines slant diagonally, and vibration generates a "jello" wobble. \n\nA Global Shutter (found in high-end cinema bodies like RED Komodo, Sony FX9/FX30 variants, Sony A9 III) exposes every single pixel on the entire sensor simultaneously. This eradicates rolling shutter artifacts completely, enabling flash photography without half-frame exposure banding and true mechanical movement capture.',
        keyTakeaway: 'For rolling shutter cameras, keep readout under 15ms or avoid erratic whip pans to eliminate visible jello.',
        tags: ['Rolling Shutter', 'Global Shutter', 'Sensor Readout', 'Artifacts'],
      },
    ],
  },
  {
    id: 'lighting',
    title: 'Lighting Science & Chromatic Ratios',
    category: 'Studio & Location Illumination',
    icon: Sun,
    description: 'Master key-to-fill ratios, Kelvin color temperatures, diffusion materials, and CRI metrics.',
    items: [
      {
        id: 'light-1',
        question: 'How do Key-to-Fill Ratios define the genre and mood of a scene?',
        answer:
          'The Key-to-Fill ratio compares the brightness of the illuminated key side of a face to the shadow fill side. It is calculated in photographic f-stops: \n\n• 2:1 Ratio (1 stop difference): High-key, gentle, and flattering. Used in romantic comedies, commercial adverts, sitcoms, and corporate interviews. \n• 4:1 Ratio (2 stops difference): Standard narrative cinematic realism. Defines cheekbone jawlines with soft shadow transition. Standard for prestige television drama. \n• 8:1 Ratio (3 stops difference): High-contrast, moody drama, crime thrillers, and neo-noir. Deep shadows with minimal eye-fill. \n• 16:1+ Ratio (4+ stops difference): Chiaroscuro and partial silhouette. Highlights only the rim edge of the actor’s profile against deep pitch darkness.',
        keyTakeaway: 'Measure key side with an incident light meter or false color, then adjust fill intensity to match your target ratio.',
        tags: ['Lighting Ratios', 'Key Light', 'Fill Light', 'Contrast', 'Moody'],
      },
      {
        id: 'light-2',
        question: 'What is Negative Fill and why is taking away light more important than adding it?',
        answer:
          'In white or light-colored rooms, ambient light bounces unpredictably off walls, ceilings, and floors into the shadow side of your actor\'s face, destroying dramatic contrast and flattening cheekbones. \n\nNegative Fill is the deliberate practice of placing large black non-reflective fabric (solid black floppies, duvetyn flags, black foamcore, or velvet) immediately beside the actor on their fill side. The black material absorbs stray reflections, creating rich, velvety shadow contrast, slimming jawlines, and deepening emotional drama.',
        keyTakeaway: 'To make an image look more cinematic instantly, don\'t add more lights—set up a black 4x4 floppy on the shadow side.',
        tags: ['Negative Fill', 'Contrast', 'Shadows', 'Black Floppy', 'Cinematic Depth'],
      },
      {
        id: 'light-3',
        question: 'What is Book Lighting and how do Hollywood cinematographers achieve seamless soft light?',
        answer:
          'Book lighting is a two-stage diffusion technique named because the bounce board and diffusion frame fold together like an open book. \n\nHow it works: \n1. Stage 1 (Bounce): Aim a powerful hard fixture (e.g. Aputure 600d or Godox VL300) into a textured matte bounce source (unbleached muslin, beadboard, or foamcore). \n2. Stage 2 (Diffusion): The bounced light then passes through a large second layer of diffusion silk or grid cloth (e.g. 6x6 or 8x8 Silent Frost). \n\nBecause the light has been scattered twice, hot spots are 100% eliminated, shadows wrap around facial features like butter, and the light looks completely natural.',
        keyTakeaway: 'Bounce first, diffuse second. Book lighting creates the most flattering, naturalistic skin wrap possible.',
        tags: ['Book Light', 'Soft Light', 'Diffusion', 'Muslin', 'Hollywood Lighting'],
      },
      {
        id: 'light-4',
        question: 'What is Kelvin Color Temperature and how do I avoid muddy mixed lighting?',
        answer:
          'Kelvin (K) measures the chromatic hue of white light along the blackbody radiation spectrum: \n• 2700K–3200K: Warm Tungsten / Household incandescent bulb / Golden sunset. \n• 4300K: Fluorescent tube / Neutral urban interior. \n• 5600K: Standard daylight overcast sun / Blue sky illumination. \n\nAvoiding Muddy Skin: If filming in a 3200K tungsten room with sunlight leaking through a window (5600K), your camera will be torn between blue shadows and orange skin. Solutions: \n1. Gel your daylight windows with CTO (Color Temperature Orange) to convert 5600K to 3200K. \n2. Swap out warm bulbs for 5600K LED practicals. \n3. Set camera white balance to 4300K to split the difference deliberately for stylized urban night aesthetics.',
        keyTakeaway: 'Match your dominant ambient source or use color-temperature gel sheets (CTO/CTB) to harmonize mismatched fixtures.',
        tags: ['Kelvin', 'Color Temperature', 'White Balance', 'Tungsten', 'Daylight'],
      },
      {
        id: 'light-5',
        question: 'What is the Inverse Square Law in cinematography and why is light distance crucial?',
        answer:
          'The Inverse Square Law states that the intensity of light is inversely proportional to the square of the distance from the source (Intensity = 1 / Distance²). \n\nPractical application: \n• Moving a light from 1 meter to 2 meters away doesn\'t cut illumination in half—it reduces it to 1/4 (a 2-stop loss). \n• If an actor walks toward a light placed 2 feet away, they will rapidly overexpose and blow out because the falloff rate is steep. \n• If you place a powerful light 20 feet away and diffuse it, an actor walking 3 feet forward will barely change exposure, because the falloff curve at distance is virtually flat.',
        keyTakeaway: 'Place lights further away through large diffusion frames to keep exposure consistent as actors move through the frame.',
        tags: ['Inverse Square Law', 'Light Falloff', 'Lighting Physics', 'Staging'],
      },
      {
        id: 'light-6',
        question: 'Why do CRI and TLCI ratings matter when choosing budget LED cinema lights?',
        answer:
          'Cheap domestic LEDs emit uneven, discontinuous spectrum spikes—frequently with heavy green or magenta casts and missing deep red wavelengths (R9). When shone on human skin, skin tones look grey, deceased, or plastic. \n\n• CRI (Color Rendering Index): Measures color fidelity against daylight on a scale of 0–100. Look for CRI 96+. \n• TLCI (Television Lighting Consistency Index): Measures how a digital camera sensor evaluates the light. Look for TLCI 97+ (e.g. Aputure, Amaran, Godox, Nanlite). \n• SSI (Spectral Similarity Index): The strictest cinematic metric designed by the Academy of Motion Picture Arts and Sciences.',
        keyTakeaway: 'Never use cheap hardware store floodlights on actor faces. Invest in lights with verified CRI > 95 and TLCI > 96.',
        tags: ['CRI', 'TLCI', 'Skin Tones', 'LED Quality', 'Color Accuracy'],
      },
    ],
  },
  {
    id: 'phone',
    title: 'Smartphone & Mobile Filmmaking & Editing',
    category: 'Pro Mobile Cinematography & Phone Editing',
    icon: Smartphone,
    description: 'Field secrets for shooting ProRes Apple Log, mobile editing suites, audio sync, and thermal management.',
    items: [
      {
        id: 'phone-1',
        question: 'Why does native smartphone video look "cheap" and how do I make it cinematic?',
        answer:
          'Native smartphone camera apps are engineered for family clips: they apply aggressive digital sharpening, auto-adjust exposure mid-sentence, hyper-saturate colors, and default to 1/2000s shutter speeds in sunlight to prevent overexposure, resulting in staccato jitter. \n\nTo make it cinematic: \n1. Use a Dedicated Cinema App: Use the Blackmagic Camera App (100% Free on iOS and compatible Android) or Filmic Pro. \n2. Lock Shutter to 180°: Set shutter to 1/48s or 1/50s at 24fps. \n3. Turn Off Digital Sharpening: Set sharpening to off or low. \n4. Attach an Optical Variable ND Filter: Essential in daylight to avoid overexposure while maintaining 1/48s shutter.',
        keyTakeaway: 'Disable computational auto-adjustments. Lock exposure, white balance, and shutter speed manually with Blackmagic Camera app.',
        tags: ['Smartphone Filmmaking', 'iPhone Video', 'Blackmagic App', 'Cinematic Look'],
      },
      {
        id: 'phone-2',
        question: 'Mobile Editing Comparison: CapCut vs. DaVinci Resolve iPad vs. LumaFusion vs. VN Editor',
        answer:
          'Choosing the right mobile NLE depends on your hardware and deliverable format: \n\n• DaVinci Resolve (iPad M1/M2/M4): The reigning heavyweight for tablets. Supports 32-bit floating point color grading, node trees, Fairlight audio, Apple Log CSTs, and full desktop project compatibility. Free, with $95 Studio unlock. \n• CapCut (iOS/Android): Phenomenal for fast social content, auto-captions, vertical 9:16 templates, and velocity speed ramping. Limited color grading precision and exports compressed H.264. \n• LumaFusion ($29.99 one-time): Premier mobile NLE for iPhones and iPads. Multi-track magnetic timeline, external drive editing, XML export to Final Cut Pro, and custom frame rates without subscription fees. \n• VN Video Editor (Free/Freemium): Best free cross-platform editor without watermarks. Supports custom .cube LUT imports, keyframing, and multi-track audio.',
        keyTakeaway: 'For pro narrative color and post: DaVinci Resolve iPad. For long-form phone editing: LumaFusion. For instant viral shorts: CapCut.',
        tags: ['Mobile Editing', 'CapCut', 'DaVinci iPad', 'LumaFusion', 'VN Editor'],
      },
      {
        id: 'phone-3',
        question: 'What is Variable Frame Rate (VFR) on phones and why does it break audio sync in editing?',
        answer:
          'Smartphones frequently record video in Variable Frame Rate (VFR) to save battery and storage: if lighting dims or the CPU gets warm, the camera might drop from 24.00 fps to 23.12 fps or 21.8 fps dynamically. \n\nWhen you import a VFR clip into DaVinci Resolve, Premiere Pro, or Final Cut, the timeline expects a Constant Frame Rate (CFR 24.000 or 23.976 fps). Over 2 minutes, audio will drift out of sync by several seconds. \n\nSolution: \n1. Shoot with Blackmagic Camera App which forces strict Constant Frame Rate (CFR). \n2. If you already have VFR footage, run it through the free open-source tool Handbrake or Shutter Encoder and transcode to Constant Framerate ProRes or H.264 before editing.',
        keyTakeaway: 'Always verify Constant Frame Rate (CFR) in your camera app settings or transcode with Handbrake to prevent audio drift.',
        tags: ['VFR vs CFR', 'Audio Desync', 'Handbrake', 'Frame Drops', 'Phone Bugs'],
      },
      {
        id: 'phone-4',
        question: 'How do I master Apple Log on iPhone 15 Pro & 16 Pro?',
        answer:
          'Apple Log offers 12+ stops of authentic dynamic range and bypasses the native tone curve entirely. \n\nBest practices: \n1. Direct SSD Recording: Connect a high-speed external USB-C SSD (e.g., Samsung T7 Shield or SanDisk Extreme) to enable ProRes 422 HQ or ProRes LT in 4K at 24fps or 60fps. \n2. Exposure Metering: Use false color in the Blackmagic Camera App. Expose skin tones between 40% and 55% IRE. \n3. Post-Production CST: In DaVinci Resolve, add a Color Space Transform node with Input Color Space set to "Apple Log" and Input Gamma set to "Apple Log", outputting to "Rec.709". Apply subtle contrast and saturation curves afterward.',
        keyTakeaway: 'Always record Apple Log in ProRes to an external SSD; apply the official Apple Log CST in DaVinci Resolve.',
        tags: ['Apple Log', 'ProRes', 'iPhone 15 Pro', 'SSD Recording', 'Color Grading'],
      },
      {
        id: 'phone-5',
        question: 'How do you prevent smartphone overheating during 4K ProRes shooting in hot weather (India Summers)?',
        answer:
          'Filming 4K 10-bit ProRes Log pushes mobile CPU/GPU processors and write controllers to their thermal limits, triggering sudden screen dimming, frame drops, or thermal shutdown: \n\n1. Turn On Airplane Mode: Disables cellular, Bluetooth search, and Wi-Fi chips that generate 25% of internal motherboard heat. \n2. Reduce Screen Brightness: Set display brightness to 50% manually—the OLED screen is a major heat source. \n3. Record to External SSD: Writing data directly over USB-C to an SSD moves the write-caching heat OUTSIDE the phone chassis. \n4. Use Magnetic Peltier Cooling Fans: Clip an active semiconductor magnetic cooler (Black Shark MagCooler or Flydigi, ₹1,200–₹2,500) to the back of the phone to pull internal temperatures down by 15°C.',
        keyTakeaway: 'Airplane Mode + Screen at 50% + External SSD + Magnetic peltier cooling fan guarantees zero thermal throttling on set.',
        tags: ['Overheating', 'Thermal Throttling', 'India Heat', 'SSD Recording', 'Battery Life'],
      },
      {
        id: 'phone-6',
        question: 'Mobile Lens Attachments & Mist Filters: Are Anamorphic and Black Mist filters worth it?',
        answer:
          '• 1/8 Black Pro-Mist / CineBloom Filter: The single highest-ROI optical accessory for mobile shooters. Tiny smartphone lenses create harsh, clinical, hyper-digital edge contrast. A 1/8 mist filter blooms harsh specular highlights (practical lamps, sun glares) and diffuses skin blemishes without losing core sharpness. \n• Circular Polarizer (CPL): Cuts glare through car windshields, store glass, and reflective wet pavement, deepening sky saturation by 30%. \n• 1.33x / 1.55x Anamorphic Adapters (Freewell, Moment, Beastgrip): Squeezes wide widescreen into your phone sensor for genuine anamorphic lens flares. Requires desqueezing in editing (set pixel aspect ratio to 1.33x or 1.55x).',
        keyTakeaway: 'A 1/8 Black Pro-Mist filter is the #1 tool to strip away the clinical "digital phone video" look.',
        tags: ['Mist Filter', 'CPL Filter', 'Anamorphic Lens', 'Mobile Optics', 'Bloom'],
      },
      {
        id: 'phone-7',
        question: 'Should mobile creators use a Gimbal or a Handheld Cage with handles?',
        answer:
          '• Mobile Gimbals (DJI Osmo Mobile 6, Insta360 Flow): Excellent for sweeping tracking shots, continuous walk-and-talks, and cinematic push-ins. However, gimbals produce a floating, robotic "video game camera" feel that can lack dramatic weight. \n• Handheld Aluminum Cages (SmallRig, Beastgrip, Neewer): Dual wooden or rubber side handles add physical inertia and natural human muscle micro-movements that subconscious cinema audiences associate with professional Steadicam and handheld drama (like "Succession" or "A24" films). \n\nTip: You can also mount mini shotgun mics, wireless receiver cold shoes, and battery banks directly onto a cage.',
        keyTakeaway: 'For narrative indie emotion, use a weighted dual-handle cage. For corporate showcases and long continuous tracking, use a gimbal.',
        tags: ['Gimbal', 'Mobile Cage', 'Stabilization', 'Handheld Rig'],
      },
      {
        id: 'phone-8',
        question: 'Vertical 9:16 vs Horizontal 16:9: How do you compose and shoot for both simultaneously?',
        answer:
          'Shooting exclusively 16:9 then cropping to 9:16 cuts off 67% of your pixels and ruins horizontal compositions. \n\nBest Dual-Delivery Workflow: \n1. Shoot Open Gate (4:3 or 8:7): If your camera or phone supports full-sensor readout, shoot full 4:3. This gives you ample vertical headroom to export both a pristine 16:9 cinema master and a centered 9:16 vertical cut from the same take. \n2. Use Cross-Guide Overlays: In Blackmagic Camera or your external monitor, turn on custom framing lines showing both 16:9 safe zone and vertical 9:16 guides. Keep all critical dialogue, action, and eyes inside the center intersection.',
        keyTakeaway: 'Center your actors inside the 9:16 center box while keeping scenic context in the 16:9 wings for effortless dual-delivery.',
        tags: ['Vertical Video', 'Reels', 'TikTok', 'Aspect Ratios', 'Open Gate'],
      },
    ],
  },
  {
    id: 'audio',
    title: 'Microphones, Acoustics & Sound Design',
    category: 'Audio Engineering & On-Set Sound',
    icon: Mic,
    description: 'Shotguns vs lavaliers, 32-bit float clipping immunity, room reflections, and target loudness.',
    items: [
      {
        id: 'audio-1',
        question: 'Shotgun vs. Lavalier: Which microphone should you choose for dialogue?',
        answer:
          '• Shotgun Microphones (Boomed): Preferred standard for film. A shotgun mounted on a boom pole 18 inches above the actor\'s head pointing at their sternum captures the full resonant acoustic depth of the chest cavity and authentic room presence. However, in small rooms with bare walls, shotgun interference tubes cause severe comb filtering as reflected audio cancels out frequencies. \n• Lavalier Microphones: Essential when the camera frames wide and a boom pole cannot get close, or in noisy outdoor windy environments. Lavs are clipped 6–8 inches below the chin. They sound more intimate and direct but can suffer from clothing rustle and lack room depth.',
        keyTakeaway: 'Use a boom shotgun whenever possible for natural voice acoustics. Use wireless lavs for wide frames and uncontrolled outdoor noise.',
        tags: ['Shotgun Mic', 'Lavalier', 'Boom Pole', 'Dialogue Audio'],
      },
      {
        id: 'audio-2',
        question: 'What is 32-Bit Float Audio and why is it transforming indie film sound?',
        answer:
          'Traditional 24-bit audio recorders convert incoming analog sound into a fixed integer range. If an actor screams or an explosion erupts, the digital waveform hits 0 dBFS and "clips", permanently destroying the audio with harsh square-wave distortion. \n\n32-Bit Float uses dual analog-to-digital converter stages that record an astounding 1500 dB dynamic range. It is mathematically impossible to clip a 32-bit float file at the analog stage. If an actor screams and the waveform looks flatlined and clipped, you simply drag the clip gain down in Premiere or DaVinci Resolve, and every micro-detail of the original clean sound is restored without distortion.',
        keyTakeaway: 'Recorders like Zoom F3, Zoom M3, and Rode Wireless PRO with 32-bit float allow solo creators to shoot without a dedicated sound mixer.',
        tags: ['32-bit Float', 'Audio Clipping', 'Sound Recording', 'Dynamic Range'],
      },
      {
        id: 'audio-3',
        question: 'What are the correct Target Audio Levels for dialog, music, and sound effects?',
        answer:
          'Digital audio meters clip and distort at 0 dBFS. Follow these broadcast standards during production and post: \n• Dialogue: Average between -18 dB to -12 dB, with loudest shout peaks hitting no higher than -6 dB (preserving 6 dB safety headroom). \n• Background Ambience / Room Tone: -30 dB to -24 dB. \n• Music Under Dialogue: -24 dB to -20 dB (so it never masks dialogue intelligibility). \n• Gunshots / Explosions / Impacts: Peaks at -3 dB to -1 dB. \n• Overall YouTube & Streaming Loudness: Master the final mix to -14 LUFS (Integrated) with true peaks capped at -1.0 dBTP to avoid streaming platform compression.',
        keyTakeaway: 'Aim for dialogue between -18 dB and -12 dB on set. Master web videos to -14 LUFS integrated in post.',
        tags: ['Audio Levels', 'Headroom', 'dBFS', 'LUFS', 'Mastering'],
      },
      {
        id: 'audio-4',
        question: 'Why is recording 30 to 60 seconds of "Room Tone" mandatory on every film set?',
        answer:
          'Every physical location has an acoustic background signature: the low hum of distant traffic, air conditioners, wind against glass, or floorboards settling. When you edit dialogue lines, every cut creates a dead acoustic vacuum of silence between syllables. \n\nRoom tone is 30–60 seconds of silence recorded with the exact same boom microphone in the exact same room with the entire cast and crew remaining totally still. In post-production, this clean room tone track is looped continuously beneath the dialogue track to stitch together cuts, mask audio splices, and provide sound for clean AI de-noising fingerprinting.',
        keyTakeaway: 'Never wrap a location without calling: "Quiet on set, recording 30 seconds of room tone." It saves hours in the edit.',
        tags: ['Room Tone', 'Acoustics', 'Audio Editing', 'Dialogue Pacing'],
      },
      {
        id: 'audio-5',
        question: 'How do you eliminate room echo and boxy reverb on a micro-budget?',
        answer:
          'Hard, parallel surfaces (drywall, glass windows, tiled floors) bounce sound waves repeatedly into the microphone capsule. \n\nLow-Budget Acoustic Fixes: \n1. Heavy Moving Blankets: Buy 3–4 heavy furniture moving blankets (₹800 each) and drape them on C-stands just outside the camera frame around the actor. \n2. Floor Rugs: Throw down thick wool rugs or yoga mats beneath the camera and actor. \n3. Break Up Parallel Walls: Pull bookshelves or open closet doors into the room to diffuse acoustic reflections. \n4. Get the Mic Closer: Moving a microphone from 3 feet away to 1 foot away cuts perceived room reverb by 75% due to the acoustic proximity ratio.',
        keyTakeaway: 'Sound absorption is about mass. Heavy moving blankets hung out of frame kill 90% of amateur room echo.',
        tags: ['Acoustic Treatment', 'Room Reverb', 'Soundproofing', 'Moving Blankets'],
      },
    ],
  },
  {
    id: 'editing',
    title: 'Editing, Color Science & Post-Production',
    category: 'Post-Production Engineering',
    icon: Scissors,
    description: 'Proxy file pipelines, DaVinci YRGB node structures, J/L cuts, and master export codecs.',
    items: [
      {
        id: 'edit-1',
        question: 'How does an offline Proxy Workflow eliminate stuttering and lag on budget laptops?',
        answer:
          'High-resolution 4K and 6K video recorded in Long-GOP interframe compression (H.264/H.265) forces your computer processor to decompress 30 frames backwards and forwards simultaneously just to display a single cut. This causes severe stuttering, dropped frames, and fan noise. \n\nA Proxy Workflow solves this: \n1. Generate Proxies: Convert raw camera files into low-resolution ProRes Proxy or DNxHR LB at 1080p. These are intra-frame codecs where every frame is stored as an independent picture. \n2. Smooth Timeline Editing: Edit, ripple cut, and arrange scene beats with 100% smooth instant scrubbing even on an entry-level laptop. \n3. One-Click Relink: When you finish editing, hit "Toggle Proxies" off. DaVinci Resolve or Premiere instantly reconnects all original full-res RAW files for final color grading and rendering.',
        keyTakeaway: 'Never edit raw 4K H.264 files natively. Generate ProRes Proxy or DNxHR LB files for instant, effortless playback.',
        tags: ['Proxy Workflow', 'Hardware Optimization', 'DaVinci Resolve', 'Premiere Pro'],
      },
      {
        id: 'edit-2',
        question: 'What are J-Cuts and L-Cuts and why are straight cuts an amateur giveaway?',
        answer:
          'A straight cut cuts audio and video simultaneously at the exact same split-second. In real life, humans rarely experience sound and sight switching at identical timestamps. \n\n• J-Cut (Audio leads video): The audio of the upcoming scene or dialogue starts 1–2 seconds BEFORE the visual cut happens. This primes the viewer\'s brain and pulls them forward. \n• L-Cut (Audio trails video): The audio of Scene A continues playing for 1–3 seconds AFTER the video has already transitioned to Scene B. \n\nUsing J-cuts and L-cuts creates continuous acoustic flow that masks visual edits and prevents dialogue from feeling robotic.',
        keyTakeaway: 'Use J-cuts to introduce new scenes and dialogue; use L-cuts to show listener reactions while the speaker continues talking.',
        tags: ['J-Cut', 'L-Cut', 'Pacing', 'Editing Grammar', 'Transitions'],
      },
      {
        id: 'edit-3',
        question: 'What is the correct Node Tree Order for Color Grading in DaVinci Resolve?',
        answer:
          'A professional node tree ensures image data is processed in mathematically correct sequence without clipping: \n\n1. Node 1 (Noise Reduction): If needed, apply spatial/temporal noise reduction at the head of the tree. \n2. Node 2 (Primary Balance & Exposure): Adjust Lift, Gamma, Gain to balance shadows and highlights. \n3. Node 3 (White Balance): Remove global color casts and fix Kelvin discrepancies. \n4. Node 4 (Color Space Transform / CST): Converts camera sensor Log (e.g. S-Log3) into standard Rec.709. \n5. Node 5 (Secondary Corrections): Isolate skin tones, hue curves, and secondary elements. \n6. Node 6 (Film Emulation / Look LUT): Print film emulation (like Kodak 2383) to add authentic cinematic color density.',
        keyTakeaway: 'Always balance exposure and white balance BEFORE applying creative look LUTs or color space conversions.',
        tags: ['Color Grading', 'Node Tree', 'DaVinci Resolve', 'CST', 'LUTs'],
      },
      {
        id: 'edit-4',
        question: 'What is the difference between Scene-Referred (ACES / DaVinci YRGB Color Managed) and Display-Referred grading?',
        answer:
          'In traditional display-referred grading (standard Rec.709), all adjustments are constrained within the narrow 0 to 1 range of your computer monitor. Push highlights too hard and they clip into ugly plastic white blocks. \n\nIn Scene-Referred Color Management (such as ACES or DaVinci Color Managed YRGB): \n• The working space is ultra-wide (larger than human eye vision). \n• Highlight roll-off is smoothly calculated mathematically like real analog silver-halide film stock. \n• Mixing an iPhone Apple Log clip, a Sony S-Log3 clip, and an ARRI Alexa LogC clip on the exact same timeline instantly harmonizes them into uniform, consistent color response with zero manual LUT conversion.',
        keyTakeaway: 'Switch DaVinci Resolve Project Settings to "DaVinci YRGB Color Managed" with SDR Rec.709 output for automatic filmic highlight roll-off.',
        tags: ['Color Management', 'ACES', 'DaVinci YRGB', 'Highlight Roll-off'],
      },
    ],
  },
];

const ASSET_DIRECTORY: AssetDirectoryItem[] = [
  {
    id: 'asset-1',
    name: 'YouTube Audio Library',
    category: 'Music & Audio',
    pricingType: '100% Free',
    indiaPricing: '₹0 / Completely Free (Built into YouTube Studio)',
    commercialSafety: 'Cleared for full YouTube monetization; select CC tracks require creator credit attribution.',
    bestFor: 'Background music and essential sound effects for YouTube creators with zero budget.',
    url: 'https://studio.youtube.com',
    highlight: 'Zero copyright strikes • Pre-cleared by Google Content ID',
  },
  {
    id: 'asset-2',
    name: 'Epidemic Sound',
    category: 'Music & Audio',
    pricingType: 'Subscription',
    indiaPricing: 'Personal Plan: ~₹850 – ₹1,150 / month (or ~₹7,200/yr); Commercial Plan: ~₹2,400 / month',
    commercialSafety: 'Full Content ID clearance across YouTube, Instagram, Facebook, Twitch, and Podcasts.',
    bestFor: 'World-class cinematic orchestral scores, indie pop, electronic tracks, and 90,000+ high-definition SFX.',
    url: 'https://www.epidemicsound.com',
    highlight: 'Includes full multi-track STEM downloads (mute drums, isolate vocals or melody)',
  },
  {
    id: 'asset-3',
    name: 'ActionVFX',
    category: 'Visual Effects (VFX)',
    pricingType: 'Pay Per Clip / Pack',
    indiaPricing: 'Individual Elements from ~₹2,500 ($30); Complete Packs from ~₹12,000; Monthly Sub from ~₹1,650/mo',
    commercialSafety: 'Universal worldwide commercial clearance for feature films, commercials, and YouTube.',
    bestFor: 'Hollywood-standard real practical fire, real explosions, gun muzzle flashes, smoke, sparks, and blood splatters.',
    url: 'https://www.actionvfx.com',
    highlight: 'Shot on RED/ARRI at up to 1000fps with pre-keyed Alpha channels in 10-bit & 12-bit ProRes',
  },
  {
    id: 'asset-4',
    name: 'ProductionCrate (FootageCrate & SoundsCrate)',
    category: 'Visual Effects (VFX)',
    pricingType: 'Freemium',
    indiaPricing: 'Free Tier: ₹0 (5 daily downloads); Pro Annual: ~₹4,999 – ₹6,500 / year (approx. ₹500/month)',
    commercialSafety: 'Royalty-free commercial licensing on all Pro assets.',
    bestFor: 'Anime magic effects, superhero energy blasts, sci-fi HUDs, portal transitions, 3D models, and cinematic impacts.',
    url: 'https://productioncrate.com',
    highlight: 'The #1 creative resource for indie visual effects and sci-fi creators',
  },
  {
    id: 'asset-5',
    name: 'Artlist.io',
    category: 'Templates & All-in-One',
    pricingType: 'Subscription',
    indiaPricing: 'Music + SFX: ~₹8,500 – ₹10,990 / year (~₹800/mo); Max Plan (Music + Footage + Templates): ~₹24,000 / year',
    commercialSafety: 'Unlimited worldwide commercial license covering client work, streaming, and broadcast television.',
    bestFor: 'Indie filmmakers looking for raw log stock footage, curated indie music, and premiere pro templates.',
    url: 'https://artlist.io',
    highlight: 'Lifetime perpetual license: any asset used in a video created during subscription remains licensed forever',
  },
  {
    id: 'asset-6',
    name: 'Pexels Video & Pixabay',
    category: 'Stock Footage',
    pricingType: '100% Free',
    indiaPricing: '₹0 / Completely Free',
    commercialSafety: 'Creative Commons Zero (CC0) / Pexels License. Free for commercial and non-commercial projects.',
    bestFor: 'High-quality 4K drone landscapes, urban b-roll, slow-motion nature, and lifestyle clips.',
    url: 'https://www.pexels.com/videos',
    highlight: 'No attribution required • High resolution 4K downloads with zero subscription',
  },
  {
    id: 'asset-7',
    name: 'Freesound.org',
    category: 'Music & Audio',
    pricingType: '100% Free',
    indiaPricing: '₹0 / Completely Free (Community Non-Profit)',
    commercialSafety: 'Varies by sound file (CC0 public domain, CC-BY attribution, or non-commercial). Filter by CC0 for total safety.',
    bestFor: 'Organic field recordings: footsteps on gravel, distant rain, vintage car engines, door creaks, and room tone.',
    url: 'https://freesound.org',
    highlight: 'Largest open-source audio repository in the world with over 500,000 user-uploaded field recordings',
  },
  {
    id: 'asset-8',
    name: 'Mixkit (by Envato)',
    category: 'Templates & All-in-One',
    pricingType: '100% Free',
    indiaPricing: '₹0 / Completely Free',
    commercialSafety: 'Mixkit Free License covers YouTube, social media, and commercial projects without mandatory attribution.',
    bestFor: 'Free video stock clips, premiere pro title templates, transition sound effects, and instrumental tracks.',
    url: 'https://mixkit.co',
    highlight: 'Curated by the Envato team • High quality free video assets with zero signup required',
  },
  {
    id: 'asset-9',
    name: 'Musicbed',
    category: 'Music & Audio',
    pricingType: 'Subscription',
    indiaPricing: 'Creator Subscription: ~₹1,800 – ₹2,400 / month (or ~₹18,000/yr); Single Song License from ~₹4,500',
    commercialSafety: 'Strict Content ID synchronization and clearing via sync-ID keys.',
    bestFor: 'Prestige indie narrative cinema, high-budget festival films, and emotional character dramas.',
    url: 'https://www.musicbed.com',
    highlight: 'Roster of legitimate touring indie artists and film composers (not sterile stock music)',
  },
  {
    id: 'asset-10',
    name: 'Lens Distortions (LD)',
    category: 'Visual Effects (VFX)',
    pricingType: 'Subscription',
    indiaPricing: 'All-Access Annual: ~₹8,200 – ₹9,900 / year (or individual packs from ~₹3,500 one-time)',
    commercialSafety: 'Royalty-free commercial use for web, film, and commercial broadcast.',
    bestFor: 'Authentic physical glass lens flares, anamorphic light leaks, real rain, real snow, dust particles, and cinematic audio.',
    url: 'https://lensdistortions.com',
    highlight: 'Captured in-camera with vintage lenses and high-speed motion rigs (not computer-rendered CGI)',
  },
  {
    id: 'asset-11',
    name: 'Envato Elements',
    category: 'Templates & All-in-One',
    pricingType: 'Subscription',
    indiaPricing: 'Individual Unlimited Plan: ~₹1,350 / month (billed annually at ~₹16,200/year); Student discounts available',
    commercialSafety: 'Single-use commercial license generated per download.',
    bestFor: 'Video editors needing endless motion graphics templates (MOGRTs), cinematic title sequences, lower thirds, and video overlays.',
    url: 'https://elements.envato.com',
    highlight: 'Unlimited downloads across video, audio, graphic templates, fonts, and photos',
  },
  {
    id: 'asset-12',
    name: 'Audiio.com',
    category: 'Music & Audio',
    pricingType: 'Subscription',
    indiaPricing: 'Annual Subscription: ~₹4,999 – ₹6,999 / year; Lifetime Access Deal periodically available around ~₹16,500',
    commercialSafety: 'Cleared for YouTube, commercial client projects, and OTT streaming.',
    bestFor: 'Wedding filmmakers, travel storytellers, and indie narrative directors looking for cinematic instrumentation.',
    url: 'https://audiio.com',
    highlight: 'Offers unique Lifetime Music access deals that eliminate recurring subscription fatigue',
  },
  {
    id: 'asset-13',
    name: 'Storyblocks',
    category: 'Stock Footage',
    pricingType: 'Subscription',
    indiaPricing: 'Unlimited Video Plan: ~₹2,200 – ₹2,600 / month (billed annually at ~₹26,000/year)',
    commercialSafety: 'Unrestricted royalty-free commercial usage for TV, digital advertising, and web.',
    bestFor: 'High-volume documentary editors, agencies, and news teams that require dozens of stock clips per week.',
    url: 'https://www.storyblocks.com',
    highlight: 'True unlimited video downloads without individual checkout penalties',
  },
  {
    id: 'asset-14',
    name: 'Pond5',
    category: 'Stock Footage',
    pricingType: 'Pay Per Clip / Pack',
    indiaPricing: 'Pay-per-clip from ~₹1,800 ($20) to ₹15,000+; Annual Subscription ~₹24,000/yr',
    commercialSafety: 'Comprehensive commercial indemnity licenses up to $1,000,000.',
    bestFor: 'Historical archive news footage, rare vintage 35mm film transfers, 8K RED aerials, and hyper-niche props.',
    url: 'https://www.pond5.com',
    highlight: 'The largest historical media and archival film repository online with over 30 million clips',
  },
  {
    id: 'asset-15',
    name: 'Triune Digital (Film Riot)',
    category: 'Visual Effects (VFX)',
    pricingType: 'Pay Per Clip / Pack',
    indiaPricing: 'Individual Sound & VFX Packs: ~₹1,800 – ₹4,200 ($20 – $50 one-time payment)',
    commercialSafety: '100% royalty-free commercial license for films, games, and web.',
    bestFor: 'Gunshot sound libraries, monster audio assets, bullet hole decals, cinematic LUTs, and impact hits.',
    url: 'https://www.triunedigital.com',
    highlight: 'Crafted directly by Ryan Connolly and the YouTube filmmaking team Film Riot',
  },
  {
    id: 'asset-16',
    name: 'BBC Sound Effects Archive',
    category: 'Music & Audio',
    pricingType: '100% Free',
    indiaPricing: '₹0 / Completely Free for Personal, Educational, and Research Purposes',
    commercialSafety: 'Free under the RemArc licence for personal/educational projects; commercial sync license available through Pro Sound Effects.',
    bestFor: 'Historic London atmosphere, vintage steam trains, authentic warfare sounds from WWII, and wildlife recordings.',
    url: 'https://sound-effects.bbcrewind.co.uk',
    highlight: 'Over 33,000 historic recordings captured across the globe over 80 years of BBC broadcasting history',
  },
];

export const FaqView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  // CRITICAL REQUIREMENT: Every FAQ should be COLLAPSED by default until stated otherwise!
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [assetFilter, setAssetFilter] = useState<string>('all');

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allIds: Record<string, boolean> = {};
    FAQ_SECTIONS.forEach((section) => {
      section.items.forEach((item) => {
        allIds[item.id] = true;
      });
    });
    setOpenItems(allIds);
  };

  const collapseAll = () => {
    setOpenItems({});
  };

  // Filtered FAQ items based on search and section category
  const filteredSections = useMemo(() => {
    return FAQ_SECTIONS.map((section) => {
      const matchesCategory = selectedCategory === 'all' || selectedCategory === section.id;
      if (!matchesCategory) return null;

      const filteredItems = section.items.filter((item) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
        );
      });

      if (filteredItems.length === 0) return null;

      return {
        ...section,
        items: filteredItems,
      };
    }).filter(Boolean) as FaqSection[];
  }, [searchQuery, selectedCategory]);

  // Filtered Asset Directory
  const filteredAssets = useMemo(() => {
    return ASSET_DIRECTORY.filter((asset) => {
      if (assetFilter === 'all') return true;
      if (assetFilter === 'free') return asset.pricingType === '100% Free' || asset.pricingType === 'Freemium';
      return asset.category === assetFilter;
    });
  }, [assetFilter]);

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-12">
      {/* Top Hero Banner */}
      <section className="text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-widest shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>PRODUCTION KNOWLEDGE BASE &bull; ASSET DIRECTORY</span>
        </div>

        <h1 className="font-courier text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
          CINEMATIC FAQ &amp; ASSET VAULT
        </h1>

        <p className="font-sans text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Comprehensive, field-tested answers across camera optics, lighting ratios, mobile iPhone &amp; Android filmmaking, audio engineering, and editing workflows — paired with an expanded directory of 16 verified stock footage, audio, and VFX platforms with real India pricing (₹).
        </p>
      </section>

      {/* Instant Search Bar & Section Filters */}
      <section className="space-y-4 max-w-4xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search queries (e.g. 180 shutter, CapCut, Apple Log, Kelvin, overheating, 32-bit float, proxies)..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 focus:border-amber-400 text-sm font-mono text-white outline-none shadow-lg placeholder:text-zinc-600 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Section Quick Jump Filter Pills */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-tight transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-black font-bold shadow-xs'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              All Sections
            </button>

            {FAQ_SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setSelectedCategory(sec.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono tracking-tight transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                  selectedCategory === sec.id
                    ? 'bg-amber-500 text-black font-bold shadow-xs'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <sec.icon className="w-3 h-3" />
                <span>{sec.title.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Expand / Collapse All Controls */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={expandAll}
              className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Sections Accordion List (ALL COLLAPSED BY DEFAULT) */}
      <section className="space-y-8 max-w-4xl mx-auto">
        {filteredSections.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
            <Info className="w-8 h-8 text-amber-400 mx-auto" />
            <h3 className="font-courier text-lg font-bold text-white">No Matching Questions Found</h3>
            <p className="text-xs text-zinc-400 font-mono">
              Try searching for terms like "CapCut", "iPhone", "overheating", "lighting", "audio", or "proxies".
            </p>
          </div>
        ) : (
          filteredSections.map((section) => (
            <div
              key={section.id}
              className="rounded-2xl bg-zinc-950/70 border border-zinc-800/80 overflow-hidden shadow-lg"
            >
              {/* Section Header */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-900 via-[#101015] to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <section.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">
                      {section.category}
                    </span>
                    <h2 className="font-courier text-base sm:text-lg font-bold text-white leading-tight">
                      {section.title}
                    </h2>
                  </div>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400">
                  {section.items.length} Answers
                </span>
              </div>

              {/* Questions List */}
              <div className="divide-y divide-zinc-800/60">
                {section.items.map((item) => {
                  const isOpen = !!openItems[item.id];
                  return (
                    <div key={item.id} className="transition-colors hover:bg-zinc-900/30">
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4 cursor-pointer focus:outline-none min-h-[48px] touch-manipulation"
                      >
                        <span className="font-courier text-sm sm:text-base font-bold text-zinc-200 hover:text-amber-300 transition-colors leading-snug">
                          {item.question}
                        </span>
                        <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 flex-shrink-0 mt-0.5">
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-amber-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-5 sm:px-5 space-y-3.5 animate-fadeIn">
                          <div className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed whitespace-pre-line pl-2 border-l-2 border-amber-500/40">
                            {item.answer}
                          </div>

                          {item.keyTakeaway && (
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs font-mono text-amber-200">
                              <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-amber-400 uppercase tracking-wide">Key Rule: </strong>
                                {item.keyTakeaway}
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 text-[10px] font-mono text-zinc-400 border border-zinc-800"
                              >
                                <Tag className="w-2.5 h-2.5 text-zinc-500" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </section>

      {/* =========================================================================
          PRODUCTION ASSET DIRECTORY (STOCK FOOTAGE, AUDIO & VFX WITH INDIA PRICING)
          ========================================================================= */}
      <section className="pt-8 border-t border-zinc-800/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono uppercase tracking-widest mb-1.5">
              <Globe className="w-3 h-3 text-amber-400" />
              <span>16 VERIFIED PLATFORMS &bull; INDIA PRICING (INR ₹)</span>
            </div>
            <h2 className="font-courier text-xl sm:text-3xl font-bold text-white">
              CURATED PRODUCTION ASSET VAULT
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono mt-1 max-w-3xl">
              Hand-picked, industry-standard archives for stock video, pre-cleared music, cinematic SFX, and Hollywood-grade VFX overlays with real-world Indian Rupee pricing.
            </p>
          </div>

          {/* Directory Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setAssetFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                assetFilter === 'all'
                  ? 'bg-amber-500 text-black font-bold shadow-xs'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              All Assets (16)
            </button>
            <button
              onClick={() => setAssetFilter('free')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                assetFilter === 'free'
                  ? 'bg-amber-500 text-black font-bold shadow-xs'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Free / Freemium
            </button>
            <button
              onClick={() => setAssetFilter('Stock Footage')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                assetFilter === 'Stock Footage'
                  ? 'bg-amber-500 text-black font-bold shadow-xs'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Stock Footage
            </button>
            <button
              onClick={() => setAssetFilter('Music & Audio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                assetFilter === 'Music & Audio'
                  ? 'bg-amber-500 text-black font-bold shadow-xs'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Music &amp; SFX
            </button>
            <button
              onClick={() => setAssetFilter('Visual Effects (VFX)')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                assetFilter === 'Visual Effects (VFX)'
                  ? 'bg-amber-500 text-black font-bold shadow-xs'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              VFX &amp; Overlays
            </button>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between shadow-xl relative overflow-hidden group"
            >
              <div className="space-y-3.5">
                {/* Header: Name & Pricing Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
                      {asset.category}
                    </span>
                    <h3 className="font-courier text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                      {asset.name}
                    </h3>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold flex-shrink-0 ${
                      asset.pricingType === '100% Free'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : asset.pricingType === 'Freemium'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}
                  >
                    {asset.pricingType}
                  </span>
                </div>

                {/* India Pricing Box */}
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono font-bold">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Cost in India (INR ₹):</span>
                  </div>
                  <p className="text-xs font-mono text-zinc-200">
                    {asset.indiaPricing}
                  </p>
                </div>

                {/* Best For Description */}
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  <strong className="text-zinc-300">Best For: </strong>
                  {asset.bestFor}
                </p>

                {/* Commercial Safety Details */}
                <div className="text-[11px] font-mono text-zinc-500 border-t border-zinc-900 pt-2 space-y-1">
                  <span className="text-zinc-400 block font-semibold">Licensing &amp; Safety:</span>
                  <p className="text-zinc-400">{asset.commercialSafety}</p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500 line-clamp-1">
                  {asset.highlight}
                </span>

                <a
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-amber-500 hover:text-black text-zinc-300 border border-zinc-700 hover:border-amber-500 text-xs font-mono transition-all cursor-pointer flex-shrink-0"
                >
                  <span>Visit</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
