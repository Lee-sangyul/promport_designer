export type AppMode = 'beginner' | 'intermediate' | 'advanced';

export interface PromptData {
  title: string;
  mode: AppMode;
  purpose: string;
  role: string;
  secondaryRole?: string;
  problem: string;
  goal: string;
  audience: string;
  context: string;
  task: string;
  inputInfo: string[];
  outputFormat: string;
  outputStructure: string;
  tone: string;
  difficulty: string;
  explanationStyle: string[];
  lengthType: string;
  lengthValue: string;
  maxTokens?: string; // 예상 토큰 수 최대
  charCountLimit?: string; // 글자 수 제한
  includeItems: string[];
  excludeItems: string[];
  additionalRules: string[];
  safetyResult: SafetyResult | null;
  privacyResult: PrivacyResult | null;
  qualityScore: number;
  redTeamResults: RedTeamResult[];
  improvementLog: ImprovementLog;
  polishedText?: string;
}

export interface SafetyResult {
  status: 'safe' | 'caution' | 'warning' | 'blocked';
  score: number;
  detections: Array<{
    category: string;
    keyword: string;
    reason: string;
    rule: string;
    alternative: string;
  }>;
}

export interface PrivacyResult {
  detected: boolean;
  detections: Array<{
    type: 'email' | 'phone' | 'ssn' | 'card' | 'account' | 'apikey' | 'password' | 'address' | 'name';
    value: string;
    description: string;
  }>;
}

export interface RedTeamResult {
  attackText: string;
  success: boolean;
  category: string;
  detectedWord: string;
  ruleBlocked: string;
  reason: string;
  alternative: string;
}

export interface ImprovementLog {
  discoveredProblems: string;
  addedRules: string;
  finalChanges: string;
  reflection: string;
  preScore?: number;
  postScore?: number;
}

export interface SavedPrompt {
  id: string;
  title: string;
  createdAt: string;
  purpose: string;
  qualityScore: number;
  safetyStatus: string;
  promptData: PromptData;
}

export interface PurposePreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  keywords: string[];
}

export interface RolePreset {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface LibraryPreset {
  id: string;
  title: string;
  category: string;
  description: string;
  promptData: Partial<PromptData>;
  badPrompt: string;
  goodPrompt: string;
  analysis: {
    purpose: string;
    audience: string;
    length: string;
    format: string;
    includes: string;
    clarity: string;
    safety: string;
  };
}

export interface ConflictWarning {
  id: string;
  type: 'length' | 'audience' | 'output' | 'tone';
  message: string;
  solutionA: string;
  solutionB: string;
  targetField: string;
  valueA: string;
  valueB: string;
}
