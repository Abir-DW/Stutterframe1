export interface QuotaStatus {
  requestsRemaining: number;
  maxPerMinute: number;
  refreshSeconds: number;
  activeModel: string;
  isCooldown: boolean;
}

export interface WatchOption {
  platform: string;
  url: string;
  type: 'stream' | 'rent' | 'buy' | 'search';
  badge?: string;
}

export interface MovieRecommendation {
  title: string;
  year: string;
  director: string;
  cinematographer?: string;
  description: string;
  mainCast: string[];
  genreTags: string[];
  imdbRating: string;
  runtime?: string;
  whyItFits: string;
  cinematographicStyle?: string;
  posterUrl?: string | null;
  watchLinks?: WatchOption[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export type CritiqueTier = 'friendly' | 'constructive' | 'moderate' | 'brutal';

export interface ShotRatingResult {
  tier?: CritiqueTier;
  emotionalImpression?: string;
  shotClassification: {
    shotType: string;
    apparentFocalLength: string;
    aspectRatio: string;
    visualTone: string;
  };
  scores: {
    overall: number;
    composition: number;
    lighting: number;
    color: number;
    technicalPurity: number;
  };
  compositionFeedback: {
    summary: string;
    strengths: string[];
    critique: string;
  };
  lightingFeedback: {
    summary: string;
    strengths: string[];
    critique: string;
  };
  colorGradeFeedback: {
    summary: string;
    palette: string[];
    critique: string;
  };
  technicalArtifacts: {
    noiseOrGrain: string;
    detectedIssues: string[];
  };
  vfxInspection: {
    hasVfxElements: boolean;
    assessment: string;
  };
  actionableFixes: string[];
}

export interface ScriptCritiqueResult {
  tier?: CritiqueTier;
  executiveSummary: string;
  score: {
    overall: number;
    dialogue: number;
    pacing: number;
    formatting: number;
  };
  keyStrengths: string[];
  criticalWeaknesses: string[];
  formattingNotes: string;
  subtextAndDialogueCritique: string;
  actionableRevisions: Array<{
    originalBeat: string;
    critique: string;
    suggestedRewrite: string;
  }>;
}

export interface ScriptCowriteResult {
  sceneTitle: string;
  loglineRefinement: string;
  storyAndOutline: string;
  screenplayText?: string;
  dramaticAnalysis: string;
  directorNote: string;
  productionConstraintsMet?: {
    budgetAssessment: string;
    crewLogisticsPlan: string;
    castAndLocationFeasibility: string;
  };
}

export interface GearProduct {
  name: string;
  brand: string;
  approxPriceINR: string;
  whyItFits: string;
  keySpecs: string[];
  directLink: string;
  storeName: string;
  isDirectListing?: boolean;
  searchFallbackLink?: string;
  pros?: string[];
  cons?: string[];
}

export interface GearRecommendationResult {
  gearCategory: string;
  budgetINR: number;
  summary: string;
  products: GearProduct[];
}

export interface EditorRecommendation {
  name: string;
  tagline: string;
  pricingModel: 'Free / Open Source' | 'Pay Once' | 'Subscription' | 'Freemium';
  priceDisplay: string;
  learningCurve: 'Beginner / Instant' | 'Intermediate' | 'Advanced / Professional';
  downloadSizeApprox: string;
  supportedPlatforms: string[];
  systemRequirementsSummary: string;
  hardwareFitVerdict: 'Perfect Match' | 'Runs Well' | 'Needs Optimization / Proxies' | 'Minimum Fit';
  whyItFits: string;
  pros: string[];
  cons: string[];
  officialDownloadUrl: string;
  logoUrl?: string | null;
  bestForEditingStyle: string;
}

export interface EditorAdvisorResult {
  deviceSpecsAnalyzed: string;
  editWorkflow: string;
  executiveSummary: string;
  topPick: EditorRecommendation;
  alternatives: EditorRecommendation[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  persona?: DirectorPersonaId;
  grounded?: boolean;
  sources?: GroundingSource[];
  timestamp: string;
}

export type DirectorPersonaId =
  | 'default'
  | 'nolan'
  | 'fincher'
  | 'tarantino'
  | 'spielberg'
  | 'villeneuve'
  | 'scorsese'
  | 'wes-anderson';

export interface DirectorPersona {
  id: DirectorPersonaId;
  name: string;
  shortName: string;
  tagline: string;
  philosophy: string;
  accentColor: string;
  bgGlow: string;
  iconType: 'clapper' | 'hourglass' | 'crosshair' | 'trunk' | 'aperture' | 'monolith' | 'whip' | 'symmetry';
  filmHallmarks: string[];
  sampleStarters: string[];
  initialGreeting: string;
}
