import { PromptData, SafetyResult, PrivacyResult, ConflictWarning } from '../types';
import { PURPOSE_PRESETS } from '../data';

// Safety categories and rules
export const SAFETY_RULES = {
  hacking: {
    name: '해킹 및 보안 무력화',
    keywords: ['해킹', '비밀번호 탈취', '계정 침입', '보안 우회', '관리자 권한', 'root 권한', '포트 스캔', '디도스', 'ddos', '백도어', '취약점 공격', ' exploits', '권한 상승'],
    reason: '계정 침입, 취약점 탐지, 웹 해킹 등 시스템 보안을 우회하여 무단 접속하거나 제어를 탈취하려는 코드는 위법 및 악용 우려가 높습니다.',
    rule: '정보통신망법 제48조(정보통신망 침해행위 금지)',
    alternative: '보안 취약점을 사전에 점검하고 방어하기 위한 웹 취약점 예방 수칙이나 올바른 암호화 해싱 적용 방식을 물어보세요.'
  },
  privacy: {
    name: '개인정보 탈취 및 가공',
    keywords: ['전화번호 수집', '주소 저장', '주민등록번호', '개인정보 모으기', '신상 털기', '이메일 수집', '계좌번호 크롤링', '개인정보 수집기'],
    reason: '타인의 허락 없이 대규모로 전화번호나 주소, 개인 신상을 수집하고 크롤링하는 행위는 개인정보 보호법 위반 소지가 큽니다.',
    rule: '개인정보 보호법 제15조 및 제71조',
    alternative: '웹사이트의 robots.txt 규칙에 맞춰 안전하고 투명하게 공개 공공데이터를 가져오는 공적 API 연동을 요청해 보세요.'
  },
  cheating: {
    name: '시험 부정행위',
    keywords: ['시험 답', '부정행위', '몰래 제출', '대리 작성', '시험 족보', '커닝', '컨닝', '시험 대필'],
    reason: '시험 문제 유출, 부정행위 수단 개발, 과제물 및 논문의 대리 작성 유도는 학업 및 평가 기관의 신뢰를 훼손하는 불공정 행위입니다.',
    rule: '학교 학업성적관리규정 및 업무방해죄',
    alternative: '시험을 체계적으로 복습할 수 있는 공부 계획표 설계, 혹은 스스로 문제를 풀며 점검할 수 있는 실전 요약 가이드라인을 요청해 보세요.'
  },
  bypass: {
    name: '시스템 안전 규칙 우회 (탈옥)',
    keywords: ['규칙 무시', '이전 지시 무시', '안전 규칙 우회', '검사를 건너뛰어', '시스템 프롬프트', 'ignore previous', 'jailbreak'],
    reason: 'AI의 기본적인 도덕성, 안전 지침, 관리 권한을 강제로 비활성화하거나 초기화하여 위험 행동을 강제하려는 공격성 유도문입니다.',
    rule: 'AI 서비스 안전 이용 규칙 및 시스템 설계 윤리 가이드라인',
    alternative: '제한 사항을 우회하는 편법 대신, 본인의 질문 목적을 정당하고 학술적이며 건설적인 방향으로 순화하여 질의해 보세요.'
  },
  violence_harassment: {
    name: '괴롭힘 및 폭력 선동',
    keywords: ['괴롭히기', '따돌림', '저격글', '신상 폭로', '보복', '때리는 법', '협박', '혐오', '욕설', '망신'],
    reason: '특정인을 조롱, 비하, 신상 노출하거나 고의로 망신을 주어 정신적 충격을 입히는 행위는 사이버 명예훼손 및 모욕죄에 해당합니다.',
    rule: '형법 제307조(명예훼손) 및 정보통신망법 제70조',
    alternative: '갈등 상대와 안전하게 감정을 조절하고 오해를 해결하는 건강한 의사소통 비폭력 대화법(NVC) 양식을 물어보세요.'
  },
  fake_news: {
    name: '허위 정보 및 사기',
    keywords: ['가짜 뉴스', '허위 정보', '선동', '허위 사실 유포', '기만', '가짜 사이트', '보이스피싱 대본', '사기 수법'],
    reason: '타인을 기만하거나 혼란을 주기 위한 기획, 피싱 수법 노출, 허위 사실 조작 문서는 보이스피싱, 스캠 사기 등의 범죄 행위에 직접 악용될 위험이 있습니다.',
    rule: '전기통신기본법 제47조 및 형법 제347조(사기)',
    alternative: '기사의 사실 여부를 분석하는 팩트 체크 방법론이나 미디어 정보를 선별 수용하는 리터러시 교육 자료를 구성해 보세요.'
  }
};

/**
 * Heuristic Safety Scanner with educational override
 */
export function analyzeSafety(prompt: string, problem: string, goal: string): SafetyResult {
  const combinedText = `${prompt} ${problem} ${goal}`.toLowerCase();
  const detections: SafetyResult['detections'] = [];
  let score = 100;

  // Check each safety category
  Object.entries(SAFETY_RULES).forEach(([key, rule]) => {
    const matchedKeyword = rule.keywords.find(keyword => combinedText.includes(keyword.toLowerCase()));
    
    if (matchedKeyword) {
      // Check for defensive context bypass
      const isDefensive = ['예방', '대비', '대책', '보안 점검', '보안 수칙', '피싱 예방', '모의 테스트', '방어', '교육적', '윤리', '공정성'].some(
        defense => combinedText.includes(defense)
      );

      if (isDefensive && key !== 'bypass') {
        // Caution state (educational use)
        detections.push({
          category: rule.name,
          keyword: matchedKeyword,
          reason: `학술·교육적 키워드(${matchedKeyword})가 감지되었으나 예방 및 보안 교육의 목적으로 사용되고 있는 것으로 추정됩니다. 오남용 우려가 있으니 가이드라인을 준수하세요.`,
          rule: `${rule.rule} (예방적 활용)`,
          alternative: rule.alternative
        });
        score = Math.min(score, 75);
      } else {
        // Malicious state
        detections.push({
          category: rule.name,
          keyword: matchedKeyword,
          reason: rule.reason,
          rule: rule.rule,
          alternative: rule.alternative
        });
        score = Math.min(score, 30);
      }
    }
  });

  let status: SafetyResult['status'] = 'safe';
  if (score <= 30) status = 'blocked';
  else if (score <= 50) status = 'warning';
  else if (score <= 80) status = 'caution';

  return { status, score, detections };
}

/**
 * Heuristic Personal Data Scanner
 */
export function analyzePrivacy(text: string): PrivacyResult {
  const detections: PrivacyResult['detections'] = [];

  // 1. Email Regex
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = text.match(emailRegex);
  if (emails) {
    emails.forEach(email => {
      detections.push({
        type: 'email',
        value: email,
        description: '이메일 주소 형식의 문자열이 발견되었습니다. 무단 유출에 주의하세요.'
      });
    });
  }

  // 2. Phone Regex (010-1234-5678, 01012345678, 02-123-4567 등)
  const phoneRegex = /(01[016789]-?\d{3,4}-?\d{4}|02-?\d{3,4}-?\d{4})/g;
  const phones = text.match(phoneRegex);
  if (phones) {
    phones.forEach(phone => {
      detections.push({
        type: 'phone',
        value: phone,
        description: '전화번호 형식의 문자열이 감지되었습니다. 개인 연락처 유출 위험이 있습니다.'
      });
    });
  }

  // 3. Korean SSN (주민등록번호: 981231-1234567 등)
  const ssnRegex = /\d{6}-[1-4]\d{6}/g;
  const ssns = text.match(ssnRegex);
  if (ssns) {
    ssns.forEach(ssn => {
      detections.push({
        type: 'ssn',
        value: ssn,
        description: '주민등록번호 형태의 식별 번호가 발견되었습니다. 고유식별정보 노출 우려가 있습니다.'
      });
    });
  }

  // 4. Card number (카드번호: 16자리 형태)
  const cardRegex = /\b\d{4}-\d{4}-\d{4}-\d{4}\b|\b\d{16}\b/g;
  const cards = text.match(cardRegex);
  if (cards) {
    cards.forEach(card => {
      detections.push({
        type: 'card',
        value: card,
        description: '신용/체크카드 일련번호 형식의 연속된 숫자가 발견되었습니다.'
      });
    });
  }

  // 5. Account number (은행 계좌번호 형태)
  const accountRegex = /\b\d{3}-\d{2,6}-\d{5,6}\b/g;
  const accounts = text.match(accountRegex);
  if (accounts) {
    accounts.forEach(acc => {
      detections.push({
        type: 'account',
        value: acc,
        description: '금융 계좌번호 형태의 패턴이 감지되었습니다.'
      });
    });
  }

  // 6. API Key (Google, OpenAI 등)
  const apiKeyRegex = /(AIzaSy[A-Za-z0-9_-]{33}|sk-[A-Za-z0-9]{48})/g;
  const apiKeys = text.match(apiKeyRegex);
  if (apiKeys) {
    apiKeys.forEach(key => {
      detections.push({
        type: 'apikey',
        value: key.substring(0, 8) + '...',
        description: '중요한 클라우드 서비스 또는 인공지능 API 비밀 키가 노출되었습니다.'
      });
    });
  }

  // 7. General Password Indicator
  const passwordTrigger = /(비밀번호|비번|암호|password)\s*[:=]\s*([^\s,]+)/gi;
  let match;
  while ((match = passwordTrigger.exec(text)) !== null) {
    const pwdValue = match[2];
    if (pwdValue && pwdValue.length > 2 && !['없음', 'null', 'undefined'].includes(pwdValue)) {
      detections.push({
        type: 'password',
        value: pwdValue,
        description: '계정 비밀번호로 추정되는 키-값 패턴이 감지되었습니다.'
      });
    }
  }

  // 8. General Address Indicator
  const addressRegex = /(([가-힣]+[시도])\s+([가-힣]+[구군시])\s+([가-힣]+[동읍면길])\s+\d+)/g;
  const addresses = text.match(addressRegex);
  if (addresses) {
    addresses.forEach(addr => {
      detections.push({
        type: 'address',
        value: addr,
        description: '지번 및 도로명 주소 형태의 정보가 감지되었습니다.'
      });
    });
  }

  // 9. Fake Korean Name Warning (e.g., "홍길동", "김철수" are fine, but look for custom names if they match explicit user inputs)
  const nameTrigger = /(내 이름은|제 이름은)\s+([가-힣]{2,4})/gi;
  let nameMatch;
  while ((nameMatch = nameTrigger.exec(text)) !== null) {
    const nameVal = nameMatch[2];
    if (nameVal && !['이름', '학생', '선생', '독자', '교사', '코치'].includes(nameVal)) {
      detections.push({
        type: 'name',
        value: nameVal,
        description: `사용자 본인의 실제 한글 이름(${nameVal})이 프롬프트에 포함된 것으로 의심됩니다.`
      });
    }
  }

  return {
    detected: detections.length > 0,
    detections
  };
}

/**
 * Calculate visual and estimated statistics for prompt
 */
export function calculateStats(text: string) {
  const cleanText = text || '';
  const charCount = cleanText.length;
  const wordCount = cleanText.trim().split(/\s+/).filter(Boolean).length;
  const sentenceCount = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  
  // Korean standard tokenization ratio in GPT/Gemini is about 1.5 - 2.0 characters per token
  const estTokens = Math.ceil(charCount * 1.3);
  
  // Normal reading speed is 400 korean characters per minute
  const estReadTime = Math.max(1, Math.ceil(charCount / 400));

  return {
    charCount,
    wordCount,
    sentenceCount,
    estTokens,
    estReadTime
  };
}

/**
 * Search for conflicting constraints
 */
export function detectConflicts(data: PromptData): ConflictWarning[] {
  const warnings: ConflictWarning[] = [];

  // 1. Conflict: Very short length vs Highly detailed tone
  const isShort = ['매우 짧게', '짧게', '300자 이내'].includes(data.lengthValue) || data.lengthType === ' 매우 짧게';
  const isDetailed = ['자세히 설명', '자세하게', '매우 자세하게'].some(x => data.explanationStyle.includes(x) || data.lengthValue.includes('자세'));
  if (isShort && isDetailed) {
    warnings.push({
      id: 'conflict_short_detailed',
      type: 'length',
      message: '설명 조건은 "자세히"인데 원하는 분량은 "짧게"로 설정되어 있어 AI가 혼란을 겪을 수 있습니다.',
      solutionA: '분량을 "자세하게" 또는 "보통"으로 넓혀 구체적인 설명을 유도합니다.',
      solutionB: '설명 방식을 "핵심만 설명"으로 수정하여 짧은 길이에 맞춤화합니다.',
      targetField: 'lengthValue',
      valueA: '보통',
      valueB: '핵심만 설명' // Will represent explanationStyle modifier helper
    });
  }

  // 2. Conflict: Advanced/Expert level vs Kids/Elementary level
  const isExpert = data.difficulty === '전문가 수준' || data.difficulty === '대학생 수준';
  const isChild = data.difficulty === '어린이 수준' || data.difficulty === '초등학생 수준' || data.explanationStyle.includes('쉬운 예시 포함') || data.explanationStyle.includes('비유 사용');
  if (isExpert && (data.difficulty === '어린이 수준' || data.difficulty === '초등학생 수준')) {
    warnings.push({
      id: 'conflict_difficulty',
      type: 'audience',
      message: '난이도가 "전문가 수준"인 반면, 청중 또는 타겟 설정은 "어린이나 초등학생"으로 상충됩니다.',
      solutionA: '난이도를 "일반인 수준"이나 "초등학생 수준"으로 한 단계 완화합니다.',
      solutionB: '대상 청중을 "전문가" 혹은 "일반인" 수준으로 전환합니다.',
      targetField: 'difficulty',
      valueA: '초등학생 수준',
      valueB: '일반인 수준'
    });
  }

  // 3. Conflict: Code only output vs Detailed explanation tone
  const isCodeOutput = ['Python', 'JavaScript', 'HTML', 'CSS', '전체 코드', 'JSON'].includes(data.outputFormat);
  const wantsOnlyCode = data.additionalRules.some(r => r.includes('코드만') || r.includes('설명 없이'));
  const isDetailedExplain = data.explanationStyle.includes('자세히 설명') || data.explanationStyle.includes('어려운 용어 설명');
  if (isCodeOutput && wantsOnlyCode && isDetailedExplain) {
    warnings.push({
      id: 'conflict_code_explain',
      type: 'output',
      message: '추가 조건에 "코드만 출력"하도록 설정했으나, 설명 방식에 "자세히 설명"이 동시에 들어가 있습니다.',
      solutionA: '추가 조건에서 "코드만 출력"을 제거하고 상세 설명을 함께 유도합니다.',
      solutionB: '설명 방식을 "핵심만 설명"으로 바꾸어 설명 볼륨을 최소화합니다.',
      targetField: 'explanationStyle',
      valueA: '수정 완료',
      valueB: '핵심만 설명'
    });
  }

  // 4. Conflict: Table format vs Pure regular text format
  const isTable = data.outputFormat === '표' || data.outputFormat === '비교표' || data.includeItems.includes('표 1개');
  const isParagraphsOnly = data.outputFormat === '일반 문장' || data.excludeItems.includes('표 형식');
  if (isTable && isParagraphsOnly) {
    warnings.push({
      id: 'conflict_table_paragraph',
      type: 'output',
      message: '원하는 출력 형식은 "표" 형태이지만, 제외/제한 사항에 "표 형식 제외" 또는 "일반 문장만 사용"이 적용되었습니다.',
      solutionA: '출력 형식을 "표"로 고정하고, 제외 사항에서 표 규제를 뺍니다.',
      solutionB: '출력 형식을 일반 "목록" 이나 "단계별 설명"으로 변경합니다.',
      targetField: 'outputFormat',
      valueA: '표',
      valueB: '단계별 설명'
    });
  }

  return warnings;
}

/**
 * Calculates Prompt Quality Score based on components
 */
export function calculateQualityScore(data: PromptData): number {
  let score = 0;

  // 1. Purpose (15 pts)
  if (data.purpose) score += 15;

  // 2. Role (10 pts)
  if (data.role && data.role.trim().length > 0) score += 10;

  // 3. Core Task (15 pts)
  const taskLen = (data.task || '').trim().length;
  if (taskLen >= 20) score += 15;
  else if (taskLen >= 5) score += 8;

  // 4. Audience/Target (10 pts)
  if (data.audience && data.audience.trim().length > 0) score += 10;

  // 5. Problem/Background Context (10 pts)
  const problemLen = (data.problem || '').trim().length;
  const contextLen = (data.context || '').trim().length;
  if (problemLen + contextLen >= 25) score += 10;
  else if (problemLen + contextLen >= 5) score += 5;

  // 6. Output Format (10 pts)
  if (data.outputFormat && data.outputFormat !== '자유 형식' && data.outputFormat.trim().length > 0) score += 10;

  // 7. Include Conditions (10 pts)
  const inclCount = data.includeItems.length;
  if (inclCount >= 3) score += 10;
  else if (inclCount > 0) score += inclCount * 3;

  // 8. Exclude Conditions (5 pts)
  const exclCount = data.excludeItems.length;
  if (exclCount >= 2) score += 5;
  else if (exclCount > 0) score += 3;

  // 9. Length Specification (5 pts)
  if (data.lengthValue && data.lengthValue.trim().length > 0) score += 5;

  // 10. Safety / Guardrails compliance (10 pts)
  // Check if prompt has no blockings
  const saf = analyzeSafety(data.task, data.problem, data.goal);
  if (saf.status === 'safe') score += 10;
  else if (saf.status === 'caution') score += 7;
  else if (saf.status === 'warning') score += 3;

  return Math.min(100, score);
}

/**
 * Generates the full formatted prompt from raw elements
 */
export function generatePromptString(data: PromptData): string {
  const parts: string[] = [];

  // Metadata Header (Mode & Purpose)
  const metaParts: string[] = [];
  if (data.mode) {
    const modeLabel = data.mode === 'beginner' ? '초급자용 기본(Simple)' : data.mode === 'intermediate' ? '중급자용 최적화(Standard)' : '전문가용 정밀구성(Advanced)';
    metaParts.push(`- 프롬프트 모드: ${modeLabel}`);
  }
  if (data.purpose) {
    const purposeObj = PURPOSE_PRESETS.find(p => p.id === data.purpose);
    const purposeName = purposeObj ? purposeObj.name : data.purpose;
    metaParts.push(`- 설계 타겟 목적: ${purposeName}`);
  }
  if (metaParts.length > 0) {
    parts.push(`## [프롬프트 설계 가이드라인]\n${metaParts.join('\n')}`);
  }

  // AI Role
  if (data.role) {
    let roleStr = `당신은 ${data.role}입니다.`;
    if (data.secondaryRole) {
      roleStr = `당신은 메인으로 ${data.role} 역할을 수행하며, 동시에 서브로 ${data.secondaryRole} 역할도 감안하여 대답하세요.`;
    }
    parts.push(roleStr);
  }

  // Goal
  if (data.goal) {
    parts.push(`목표:\n${data.goal}`);
  }

  // Context/Problem
  if (data.problem || data.context) {
    const bgParts: string[] = [];
    if (data.context) bgParts.push(`상황 및 문맥: ${data.context}`);
    if (data.problem) bgParts.push(`현재 겪고 있는 문제: ${data.problem}`);
    parts.push(`배경:\n${bgParts.join('\n')}`);
  }

  // Task
  if (data.task) {
    parts.push(`수행할 작업:\n${data.task}`);
  }

  // Audience
  if (data.audience) {
    parts.push(`대상:\n${data.audience}`);
  }

  // Input Info
  if (data.inputInfo && data.inputInfo.length > 0) {
    parts.push(`입력 정보 및 참고 자료:\n- ${data.inputInfo.join('\n- ')}`);
  }

  // Include Conditions
  if (data.includeItems && data.includeItems.length > 0) {
    parts.push(`반드시 포함할 내용:\n- ${data.includeItems.join('\n- ')}`);
  }

  // Exclude Conditions
  if (data.excludeItems && data.excludeItems.length > 0) {
    parts.push(`포함하지 말아야 할 내용:\n- ${data.excludeItems.join('\n- ')}`);
  }

  // Output format and Structure
  if (data.outputFormat || data.outputStructure) {
    const fmtParts: string[] = [];
    if (data.outputFormat) fmtParts.push(`지정된 포맷: ${data.outputFormat}`);
    if (data.outputStructure) fmtParts.push(`권장 구조 및 목차: ${data.outputStructure}`);
    parts.push(`출력 형식:\n${fmtParts.join('\n')}`);
  }

  // Tone & Style
  const styleParts: string[] = [];
  if (data.tone) styleParts.push(`어조 및 말투: ${data.tone}`);
  if (data.difficulty) styleParts.push(`난이도 조절: ${data.difficulty}`);
  if (data.explanationStyle && data.explanationStyle.length > 0) {
    styleParts.push(`설명 연출 방식: ${data.explanationStyle.join(', ')}`);
  }
  if (styleParts.length > 0) {
    parts.push(`말투와 난이도:\n${styleParts.join('\n')}`);
  }

  // Length
  const lenParts: string[] = [];
  if (data.lengthValue) lenParts.push(`희망 분량: ${data.lengthValue}`);
  if (data.charCountLimit) lenParts.push(`상한 글자 수 제한: ${data.charCountLimit}`);
  if (data.maxTokens) lenParts.push(`최대 허용 토큰 범위: 약 ${data.maxTokens} 토큰 이내`);
  if (lenParts.length > 0) {
    parts.push(`분량 및 자원 제한:\n${lenParts.join('\n')}`);
  }

  // Additional rules
  if (data.additionalRules && data.additionalRules.length > 0) {
    parts.push(`추가 규칙:\n- ${data.additionalRules.join('\n- ')}`);
  }

  // Static standard safety guidelines (Mandated in user request)
  parts.push(`안전 규칙:
1. 실제 개인정보(이름, 비밀번호, API 키, 상세연락처 등)를 요청하거나 포함하여 출력하지 마세요.
2. 불법적이거나 다른 사람에게 신체적·정신적 피해를 줄 수 있는 위험 정보 및 비윤리적 방법론은 절대로 제공하지 마세요.
3. 확실하지 않거나 교차 검증되지 않은 사실은 반드시 추측이나 가정이라고 명확히 표시하세요.
4. 중요하고 실생활에 밀접한 결과(예: 의학적 조언, 법률 자문, 보안 커맨드)는 사용자가 직접 검토하고 교차 확인하라는 주의 사항을 덧붙이세요.`);

  return parts.join('\n\n');
}
