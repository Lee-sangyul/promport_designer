import pptxgen from 'pptxgenjs';
import { PromptData } from '../types';
import { generatePromptString } from './safety';

export function exportToPPT(promptData: PromptData) {
  const pptx = new pptxgen();
  const shapes = (pptx as any).shapes;

  // Set presentation properties
  pptx.title = promptData.title || "Prompt Design Presentation";
  pptx.subject = "AI Prompt Design Plan";
  pptx.author = "Prompt Designer";

  // Slide 1: Title Slide
  const slide1 = pptx.addSlide();
  slide1.background = { fill: "F8FAFC" };

  // Accent rectangle on the left
  slide1.addShape(shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: 0.4,
    h: "100%",
    fill: { color: "0F172A" } // Deep charcoal dark accent
  });

  slide1.addText("PROMPT DESIGN BLUEPRINT & PRESENTATION", {
    x: 1.0,
    y: 1.8,
    w: 8.0,
    h: 0.4,
    fontSize: 12,
    bold: true,
    color: "2563EB",
    fontFace: "Calibri"
  });

  slide1.addText(promptData.title || "제목 없는 프롬프트 프로젝트", {
    x: 1.0,
    y: 2.3,
    w: 8.0,
    h: 1.2,
    fontSize: 30,
    bold: true,
    color: "0F172A",
    fontFace: "Calibri"
  });

  slide1.addText(`품질 만족도: ${promptData.qualityScore}점 / 100점  |  안전 수준: 검증 통과`, {
    x: 1.0,
    y: 3.8,
    w: 8.0,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: "475569",
    fontFace: "Calibri"
  });

  slide1.addText("이 발표 자료는 AI의 윤리적 사용, 안전한 가드레일, 정교한 페르소나 및 구체적 수행 규칙 설계를 한 눈에 요약 보고합니다.", {
    x: 1.0,
    y: 4.4,
    w: 8.0,
    h: 0.6,
    fontSize: 11,
    color: "64748B",
    fontFace: "Calibri"
  });

  // Standard slide layout helper
  const addHeader = (slide: any, title: string, subtitle: string) => {
    slide.background = { fill: "FFFFFF" };

    // Header Accent bar
    slide.addShape(shapes.RECTANGLE, {
      x: 0,
      y: 0,
      w: "100%",
      h: 0.12,
      fill: { color: "2563EB" }
    });

    // Subtitle / category
    slide.addText(subtitle, {
      x: 0.8,
      y: 0.5,
      w: 8.0,
      h: 0.3,
      fontSize: 10,
      bold: true,
      color: "2563EB",
      fontFace: "Calibri"
    });

    // Main title
    slide.addText(title, {
      x: 0.8,
      y: 0.8,
      w: 8.0,
      h: 0.5,
      fontSize: 22,
      bold: true,
      color: "0F172A",
      fontFace: "Calibri"
    });

    // Divider line
    slide.addShape(shapes.RECTANGLE, {
      x: 0.8,
      y: 1.4,
      w: 8.4,
      h: 0.01,
      fill: { color: "E2E8F0" }
    });
  };

  // Slide 2: 해결 과제와 핵심 목표
  const slide2 = pptx.addSlide();
  addHeader(slide2, "해결 과제와 핵심 목표", "01. OBJECTIVE & PURPOSE");

  // Left card: Problem
  slide2.addShape(shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.8,
    w: 4.0,
    h: 3.5,
    fill: { color: "F8FAFC" },
    line: { color: "E2E8F0", width: 1 }
  });
  slide2.addText("해결하고자 하는 핵심 과제 (Problem)", {
    x: 1.1,
    y: 2.1,
    w: 3.4,
    h: 0.3,
    fontSize: 13,
    bold: true,
    color: "EF4444",
    fontFace: "Calibri"
  });
  slide2.addText(promptData.problem || "작성된 문제 내용이 없습니다. 목표 달성을 위해 프롬프트가 대면한 실질적 문제를 정리해 두면 효과적입니다.", {
    x: 1.1,
    y: 2.6,
    w: 3.4,
    h: 2.4,
    fontSize: 11,
    color: "334155",
    fontFace: "Calibri",
    valign: "top"
  });

  // Right card: Goal
  slide2.addShape(shapes.ROUNDED_RECTANGLE, {
    x: 5.2,
    y: 1.8,
    w: 4.0,
    h: 3.5,
    fill: { color: "F8FAFC" },
    line: { color: "E2E8F0", width: 1 }
  });
  slide2.addText("성공적인 프롬프트 도달 목표 (Goal)", {
    x: 5.5,
    y: 2.1,
    w: 3.4,
    h: 0.3,
    fontSize: 13,
    bold: true,
    color: "10B981",
    fontFace: "Calibri"
  });
  slide2.addText(promptData.goal || "작성된 목표 성과가 없습니다. AI가 어떤 구체적 산출물을 제공해야 하는지 이곳에 명확하게 지목합니다.", {
    x: 5.5,
    y: 2.6,
    w: 3.4,
    h: 2.4,
    fontSize: 11,
    color: "334155",
    fontFace: "Calibri",
    valign: "top"
  });

  // Slide 3: AI 메인 페르소나
  const slide3 = pptx.addSlide();
  addHeader(slide3, "AI 메인 페르소나", "02. AI PERSONA & PROFILE");

  // Wide Role Card
  slide3.addShape(shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.8,
    w: 8.4,
    h: 1.4,
    fill: { color: "EFF6FF" },
    line: { color: "DBEAFE", width: 1 }
  });
  slide3.addText("지정된 메인 인공지능 정체성 (Main Agent Role)", {
    x: 1.1,
    y: 2.0,
    w: 7.8,
    h: 0.3,
    fontSize: 11,
    bold: true,
    color: "2563EB",
    fontFace: "Calibri"
  });
  slide3.addText(promptData.role || "지정되지 않음 (기본 인공지능)", {
    x: 1.1,
    y: 2.3,
    w: 7.8,
    h: 0.5,
    fontSize: 18,
    bold: true,
    color: "1E293B",
    fontFace: "Calibri"
  });
  if (promptData.secondaryRole) {
    slide3.addText(`보조 역할 및 성격 기조: ${promptData.secondaryRole}`, {
      x: 1.1,
      y: 2.8,
      w: 7.8,
      h: 0.3,
      fontSize: 11,
      italic: true,
      color: "475569",
      fontFace: "Calibri"
    });
  }

  // Details Columns
  const w = 2.6;
  const gap = 0.3;

  // Tone
  slide3.addShape(shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 3.4,
    w: w,
    h: 1.9,
    fill: { color: "F8FAFC" },
    line: { color: "E2E8F0", width: 1 }
  });
  slide3.addText("전달 어조 및 말투", {
    x: 1.0,
    y: 3.6,
    w: w - 0.4,
    h: 0.3,
    fontSize: 11,
    bold: true,
    color: "475569",
    fontFace: "Calibri",
    align: "center"
  });
  slide3.addText(promptData.tone || "기본 말투", {
    x: 1.0,
    y: 4.1,
    w: w - 0.4,
    h: 1.0,
    fontSize: 13,
    bold: true,
    color: "1E293B",
    fontFace: "Calibri",
    align: "center"
  });

  // Difficulty
  slide3.addShape(shapes.ROUNDED_RECTANGLE, {
    x: 0.8 + w + gap,
    y: 3.4,
    w: w,
    h: 1.9,
    fill: { color: "F8FAFC" },
    line: { color: "E2E8F0", width: 1 }
  });
  slide3.addText("이해 및 어휘 난이도", {
    x: 0.8 + w + gap + 0.2,
    y: 3.6,
    w: w - 0.4,
    h: 0.3,
    fontSize: 11,
    bold: true,
    color: "475569",
    fontFace: "Calibri",
    align: "center"
  });
  slide3.addText(promptData.difficulty || "보편적 수준", {
    x: 0.8 + w + gap + 0.2,
    y: 4.1,
    w: w - 0.4,
    h: 1.0,
    fontSize: 13,
    bold: true,
    color: "1E293B",
    fontFace: "Calibri",
    align: "center"
  });

  // Explanation style
  slide3.addShape(shapes.ROUNDED_RECTANGLE, {
    x: 0.8 + (w * 2) + (gap * 2),
    y: 3.4,
    w: w,
    h: 1.9,
    fill: { color: "F8FAFC" },
    line: { color: "E2E8F0", width: 1 }
  });
  slide3.addText("핵심 설명 스타일", {
    x: 0.8 + (w * 2) + (gap * 2) + 0.2,
    y: 3.6,
    w: w - 0.4,
    h: 0.3,
    fontSize: 11,
    bold: true,
    color: "475569",
    fontFace: "Calibri",
    align: "center"
  });
  const expStyle = promptData.explanationStyle && promptData.explanationStyle.length > 0
    ? promptData.explanationStyle.join('\n')
    : "일반 직관적 설명";
  slide3.addText(expStyle, {
    x: 0.8 + (w * 2) + (gap * 2) + 0.2,
    y: 4.1,
    w: w - 0.4,
    h: 1.0,
    fontSize: 11,
    bold: true,
    color: "1E293B",
    fontFace: "Calibri",
    align: "center"
  });

  // Slide 4: 핵심 작업과 청중 분석
  const slide4 = pptx.addSlide();
  addHeader(slide4, "핵심 지시 작업과 청중 분석", "03. CORE TASK & TARGET PROFILE");

  // Core task
  slide4.addShape(shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.8,
    w: 8.4,
    h: 1.5,
    fill: { color: "F1F5F9" },
    line: { color: "E2E8F0", width: 1 }
  });
  slide4.addText("수행할 핵심 작업 지시문 (Task Instruction)", {
    x: 1.1,
    y: 2.0,
    w: 7.8,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: "0F172A",
    fontFace: "Calibri"
  });
  slide4.addText(promptData.task || "지정된 구체적인 인공지능 지시 작업 내용이 기재되지 않았습니다.", {
    x: 1.1,
    y: 2.4,
    w: 7.8,
    h: 0.8,
    fontSize: 11,
    color: "334155",
    fontFace: "Calibri",
    valign: "top"
  });

  // Left: Audience
  slide4.addShape(shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 3.5,
    w: 4.0,
    h: 1.8,
    fill: { color: "FFFFFF" },
    line: { color: "E2E8F0", width: 1 }
  });
  slide4.addText("주 타겟 독자 및 청중 (Audience Analysis)", {
    x: 1.1,
    y: 3.7,
    w: 3.4,
    h: 0.3,
    fontSize: 11,
    bold: true,
    color: "2563EB",
    fontFace: "Calibri"
  });
  slide4.addText(promptData.audience || "제시되지 않음 (보편적 불특정 다수 대중 타겟)", {
    x: 1.1,
    y: 4.1,
    w: 3.4,
    h: 1.0,
    fontSize: 11,
    color: "475569",
    fontFace: "Calibri",
    valign: "top"
  });

  // Right: Context
  slide4.addShape(shapes.ROUNDED_RECTANGLE, {
    x: 5.2,
    y: 3.5,
    w: 4.0,
    h: 1.8,
    fill: { color: "FFFFFF" },
    line: { color: "E2E8F0", width: 1 }
  });
  slide4.addText("수행 상황 및 사용 맥락 (Context)", {
    x: 5.5,
    y: 3.7,
    w: 3.4,
    h: 0.3,
    fontSize: 11,
    bold: true,
    color: "2563EB",
    fontFace: "Calibri"
  });
  slide4.addText(promptData.context || "제시되지 않음 (일반 질문 답변 문맥)", {
    x: 5.5,
    y: 4.1,
    w: 3.4,
    h: 1.0,
    fontSize: 11,
    color: "475569",
    fontFace: "Calibri",
    valign: "top"
  });

  // Slide 5: 수행 규약과 제약 조건
  const slide5 = pptx.addSlide();
  addHeader(slide5, "수행 규약과 가드레일 제약조건", "04. SYSTEM GUARDRAILS");

  // Include List
  slide5.addShape(shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.8,
    w: 4.0,
    h: 3.5,
    fill: { color: "F0FDF4" },
    line: { color: "DCFCE7", width: 1 }
  });
  slide5.addText("반드시 반영해야 할 포함 항목 (Must Include)", {
    x: 1.1,
    y: 2.1,
    w: 3.4,
    h: 0.3,
    fontSize: 13,
    bold: true,
    color: "15803D",
    fontFace: "Calibri"
  });
  const includes = promptData.includeItems && promptData.includeItems.length > 0
    ? promptData.includeItems.map(item => `✓ ${item}`).join('\n')
    : "설정된 항목이 없습니다.";
  slide5.addText(includes, {
    x: 1.1,
    y: 2.6,
    w: 3.4,
    h: 2.5,
    fontSize: 11,
    color: "166534",
    fontFace: "Calibri",
    valign: "top"
  });

  // Exclude List
  slide5.addShape(shapes.ROUNDED_RECTANGLE, {
    x: 5.2,
    y: 1.8,
    w: 4.0,
    h: 3.5,
    fill: { color: "FEF2F2" },
    line: { color: "FEE2E2", width: 1 }
  });
  slide5.addText("안전을 위해 절대 삼갈 제외 항목 (Exclude)", {
    x: 5.5,
    y: 2.1,
    w: 3.4,
    h: 0.3,
    fontSize: 13,
    bold: true,
    color: "B91C1C",
    fontFace: "Calibri"
  });
  const excludes = promptData.excludeItems && promptData.excludeItems.length > 0
    ? promptData.excludeItems.map(item => `✕ ${item}`).join('\n')
    : "설정된 금지 항목이 없습니다.";
  slide5.addText(excludes, {
    x: 5.5,
    y: 2.6,
    w: 3.4,
    h: 2.5,
    fontSize: 11,
    color: "991B1B",
    fontFace: "Calibri",
    valign: "top"
  });

  // Slide 6: 출력 형식 및 부가 규칙
  const slide6 = pptx.addSlide();
  addHeader(slide6, "출력 형식 및 세부 규격 설정", "05. OUTPUT SPECS & FORMAT");

  // Output format
  slide6.addShape(shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.8,
    w: 4.0,
    h: 3.5,
    fill: { color: "FFFFFF" },
    line: { color: "E2E8F0", width: 1 }
  });
  slide6.addText("목표하는 출력 유형과 형식 (Output Format)", {
    x: 1.1,
    y: 2.1,
    w: 3.4,
    h: 0.3,
    fontSize: 13,
    bold: true,
    color: "2563EB",
    fontFace: "Calibri"
  });
  slide6.addText(promptData.outputFormat || "일반 텍스트 형식", {
    x: 1.1,
    y: 2.5,
    w: 3.4,
    h: 1.0,
    fontSize: 12,
    bold: true,
    color: "1E293B",
    fontFace: "Calibri",
    valign: "top"
  });
  slide6.addText("구조적 아웃라인 지침", {
    x: 1.1,
    y: 3.6,
    w: 3.4,
    h: 0.3,
    fontSize: 11,
    bold: true,
    color: "475569",
    fontFace: "Calibri"
  });
  slide6.addText(promptData.outputStructure || "자율적으로 유동적인 포맷을 갖추어 전개합니다.", {
    x: 1.1,
    y: 4.0,
    w: 3.4,
    h: 1.1,
    fontSize: 11,
    color: "64748B",
    fontFace: "Calibri",
    valign: "top"
  });

  // Length and rules
  slide6.addShape(shapes.ROUNDED_RECTANGLE, {
    x: 5.2,
    y: 1.8,
    w: 4.0,
    h: 3.5,
    fill: { color: "F8FAFC" },
    line: { color: "E2E8F0", width: 1 }
  });
  slide6.addText("지정 답변 분량 (Length)", {
    x: 5.5,
    y: 2.1,
    w: 3.4,
    h: 0.3,
    fontSize: 13,
    bold: true,
    color: "2563EB",
    fontFace: "Calibri"
  });
  const length = promptData.lengthValue
    ? `${promptData.lengthValue} (유형: ${promptData.lengthType === 'words' ? '단어/글자 제한' : promptData.lengthType === 'time' ? '시간 기준 제한' : '기타 기준'})`
    : "상한 한도를 지정하지 않았습니다.";
  slide6.addText(length, {
    x: 5.5,
    y: 2.5,
    w: 3.4,
    h: 0.8,
    fontSize: 11,
    color: "1E293B",
    fontFace: "Calibri",
    valign: "top"
  });
  slide6.addText("추가 수행 수칙 (Rules)", {
    x: 5.5,
    y: 3.4,
    w: 3.4,
    h: 0.3,
    fontSize: 11,
    bold: true,
    color: "475569",
    fontFace: "Calibri"
  });
  const addRules = promptData.additionalRules && promptData.additionalRules.length > 0
    ? promptData.additionalRules.map(r => `• ${r}`).join('\n')
    : "추가 커스텀 수칙이 등록되어 있지 않습니다.";
  slide6.addText(addRules, {
    x: 5.5,
    y: 3.8,
    w: 3.4,
    h: 1.3,
    fontSize: 10,
    color: "64748B",
    fontFace: "Calibri",
    valign: "top"
  });

  // Slide 7: 개인정보 보호 및 사이버 세이프티
  const slide7 = pptx.addSlide();
  addHeader(slide7, "개인정보 보호 및 사이버 세이프티", "06. PRIVACY & SAFETY ASSURANCE");

  slide7.addShape(shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.8,
    w: 8.4,
    h: 1.5,
    fill: { color: "F0FDF4" },
    line: { color: "BBF7D0", width: 1 }
  });
  slide7.addText("🛡️ 프롬프트 실시간 진단 엔진 탐지 내역", {
    x: 1.1,
    y: 2.0,
    w: 7.8,
    h: 0.3,
    fontSize: 13,
    bold: true,
    color: "15803D",
    fontFace: "Calibri"
  });
  const safInfo = "민감 개인정보 실시간 필터링(SSN, 이메일, 패스워드, API 키, 상세주소)이 상시 동작하고 있으며 위협적인 악성 명령 주입 및 탈옥 시나리오에 대해 강건한 보호 기제를 통과했습니다.";
  slide7.addText(safInfo, {
    x: 1.1,
    y: 2.4,
    w: 7.8,
    h: 0.7,
    fontSize: 11,
    color: "166534",
    fontFace: "Calibri",
    valign: "top"
  });

  slide7.addShape(shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 3.5,
    w: 8.4,
    h: 1.8,
    fill: { color: "F8FAFC" },
    line: { color: "E2E8F0", width: 1 }
  });
  slide7.addText("안심 구동을 위한 책임 한계 및 지침 서약", {
    x: 1.1,
    y: 3.7,
    w: 7.8,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: "0F172A",
    fontFace: "Calibri"
  });
  slide7.addText(
    "1. 데이터 보안: 본 프롬프트의 기동 과정에서 사용자 혹은 타인의 금융, 통신, 보안과 연계된 실제 비밀키나 개인식별 코드는 정렬 지침에 의해 완전히 배제됩니다.\n" +
    "2. 할루시네이션 가드: 인공지능이 생성한 수치 및 가설 사실들에 대하여 인간 관리자의 교차 실증 검역을 최종 의무화하여 허위 정보 확산을 완전 방지합니다.\n" +
    "3. 정렬 상태 보증: 편향을 유발하는 어조, 혐오적인 키워드 믹스, 악성 탈옥 우회 공격 기법들을 완벽하게 차단할 수 있도록 검증된 설계 구조를 보증합니다.",
    {
      x: 1.1,
      y: 4.1,
      w: 7.8,
      h: 1.1,
      fontSize: 10,
      color: "334155",
      fontFace: "Calibri",
      valign: "top"
    }
  );

  // Slide 8: 조합된 최종 완성형 프롬프트
  const slide8 = pptx.addSlide();
  addHeader(slide8, "조합된 최종 완성형 프롬프트 본문", "07. COMPLETE PROMPT TEXT");

  slide8.addShape(shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.8,
    w: 8.4,
    h: 3.5,
    fill: { color: "F8FAFC" },
    line: { color: "E2E8F0", width: 1 }
  });

  const completePrompt = generatePromptString(promptData);
  slide8.addText(completePrompt || "조합된 완성형 프롬프트가 존재하지 않습니다.", {
    x: 1.1,
    y: 2.1,
    w: 7.8,
    h: 3.0,
    fontSize: 9,
    fontFace: "Courier New",
    color: "1E293B",
    valign: "top"
  });

  // Write PPTX download
  const sanitizedTitle = (promptData.title || "prompt_presentation").replace(/[^a-zA-Z0-9가-힣_-]/g, "_");
  const fileName = `${sanitizedTitle}_presentation.pptx`;
  pptx.writeFile({ fileName });
}
