import React, { useState } from 'react';
import { HelpCircle, BookOpen, Lightbulb, ShieldAlert, CheckCircle2, ChevronRight, Compass } from 'lucide-react';

interface TermItem {
  term: string;
  english: string;
  definition: string;
  example: string;
}

export default function HelpManual() {
  const [activeTab, setActiveTab] = useState<'intro' | 'concepts' | 'rules' | 'tips'>('intro');

  const terms: TermItem[] = [
    {
      term: '역할 (Role)',
      english: 'Role',
      definition: 'AI가 어떤 전문가나 페르소나처럼 답변할지 고정해 주는 항목입니다. AI의 지식 배경과 문체를 결정하는 핵심 기반입니다.',
      example: '"당신은 노련한 과학 교사입니다", "당신은 시니어 프론트엔드 엔지니어입니다"'
    },
    {
      term: '맥락 / 배경 (Context)',
      english: 'Context',
      definition: '작업이 이루어지는 구체적인 정황, 대상의 상황, 현재 직면한 문제입니다. AI에게 상황적 이해도를 높여 정교한 개인화를 유도합니다.',
      example: '"중학교 국어 시간 발표를 준비 중이며, 친구들이 인공지능 윤리를 너무 지루해하는 상황입니다."'
    },
    {
      term: '수행 작업 (Task)',
      english: 'Task',
      definition: 'AI가 정확히 수행해야 하는 핵심 행위입니다. 동사 위주로 명확하고 군더더기 없이 기술해야 합니다.',
      example: '"중학생을 위한 인공지능 윤리 3분 스피치 대본을 생성하세요."'
    },
    {
      term: '제약 조건 (Constraints)',
      english: 'Constraints',
      definition: 'AI가 답변을 생성할 때 반드시 지켜야 하는 규칙과 절대 포함하면 안 되는 한계선입니다. 편향과 오류를 강력하게 제어합니다.',
      example: '"어려운 기상학 공식은 제외하고, 실생활 예시 2가지를 표 형식으로 무조건 포함하세요."'
    },
    {
      term: '출력 형식 (Format)',
      english: 'Format',
      definition: '답변 결과물이 가질 시각적 구조나 데이터 구조입니다.',
      example: '"보고서 양식(서론-본론-결론)", "마크다운 표", "실행 가능한 전체 파이썬 코드"'
    },
    {
      term: '말투 및 난이도 (Tone & Level)',
      english: 'Tone & Level',
      definition: '단순한 글자 외에 정서적 온도나 이해 수준을 정의하여, 독자가 읽기에 가장 거부감 없도록 필터링합니다.',
      example: '"친근하고 명확하며 위트 있는 어조", "초등학교 5학년도 단번에 이해할 수 있는 난이도"'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-6 shadow-sm" id="help-manual-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-250 dark:border-slate-700 text-slate-950 dark:text-white">
          <HelpCircle size={18} />
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-tight uppercase text-slate-950 dark:text-white">프롬프트 가이드 & 백과사전</h2>
          <p className="text-xs text-slate-400 mt-0.5">AI에게 최고의 결과를 끌어내는 질문 규칙을 쉽게 배워보세요.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'intro', label: '기본 다지기', icon: Compass },
          { id: 'concepts', label: '6대 요소 백과', icon: BookOpen },
          { id: 'tips', label: '좋은 VS 나쁜 프롬프트', icon: Lightbulb },
          { id: 'rules', label: '안전성 및 개인정보 보호', icon: ShieldAlert }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <tab.icon size={12} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'intro' && (
        <div className="space-y-4 text-slate-600 dark:text-slate-300">
          <div className="p-5 bg-slate-50 dark:bg-slate-950/40 rounded border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-950 dark:text-white mb-2 flex items-center gap-2 text-xs uppercase tracking-wider font-mono">
              💡 프롬프트(Prompt)란 무엇일까요?
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              프롬프트는 <strong>AI에게 어떤 작업을 어떻게 해야 하는지 설명하는 완전한 명령문</strong>입니다. 
              마치 마법사가 마법 주문을 외우거나, 회사에서 부하 직원에게 구체적인 '업무 지시서'를 작성하여 전달하는 것과 같습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded border border-emerald-200/60 bg-emerald-50/20 dark:bg-emerald-950/10 dark:border-emerald-900">
              <h4 className="font-bold text-emerald-800 dark:text-emerald-400 text-xs mb-2 flex items-center gap-2 uppercase tracking-wide">
                <CheckCircle2 size={13} /> 좋은 프롬프트의 5가지 법칙
              </h4>
              <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                <li className="flex gap-2"><ChevronRight size={13} className="shrink-0 text-emerald-600 mt-0.5" /> <strong>목적이 명확함</strong>: AI가 가야 할 지점을 찍어줍니다.</li>
                <li className="flex gap-2"><ChevronRight size={13} className="shrink-0 text-emerald-600 mt-0.5" /> <strong>역할을 지목함</strong>: 전문가 수준의 대답을 보장합니다.</li>
                <li className="flex gap-2"><ChevronRight size={13} className="shrink-0 text-emerald-600 mt-0.5" /> <strong>필요 정보를 제공함</strong>: 상황과 구체적인 데이터를 줍니다.</li>
                <li className="flex gap-2"><ChevronRight size={13} className="shrink-0 text-emerald-600 mt-0.5" /> <strong>형식을 지정함</strong>: 보고서, 표, 대본 등 결과물을 직접 지시합니다.</li>
                <li className="flex gap-2"><ChevronRight size={13} className="shrink-0 text-emerald-600 mt-0.5" /> <strong>제외 및 포함 조건을 넣음</strong>: 정량적인 조건으로 왜곡을 제어합니다.</li>
              </ul>
            </div>

            <div className="p-4 rounded border border-red-200/60 bg-red-50/20 dark:bg-red-950/10 dark:border-red-950">
              <h4 className="font-bold text-red-800 dark:text-red-400 text-xs mb-2 flex items-center gap-2 uppercase tracking-wide">
                <ShieldAlert size={13} /> 나쁜 프롬프트의 특징
              </h4>
              <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                <li className="flex gap-2"><ChevronRight size={13} className="shrink-0 text-red-500 mt-0.5" /> <strong>극도로 짧고 흐릿함</strong>: "보고서 써줘", "파이썬 에러 고쳐줘" 등</li>
                <li className="flex gap-2"><ChevronRight size={13} className="shrink-0 text-red-500 mt-0.5" /> <strong>독자가 누구인지 없음</strong>: 어린이가 읽을 글에 어려운 전문 용어를 씁니다.</li>
                <li className="flex gap-2"><ChevronRight size={13} className="shrink-0 text-red-500 mt-0.5" /> <strong>형식이 주어지지 않음</strong>: 원치 않는 장황한 나열식 글만 생깁니다.</li>
                <li className="flex gap-2"><ChevronRight size={13} className="shrink-0 text-red-500 mt-0.5" /> <strong>위험하거나 부정한 내용</strong>: 해킹 방법, 개인정보 수집 시도 등</li>
                <li className="flex gap-2"><ChevronRight size={13} className="shrink-0 text-red-500 mt-0.5" /> <strong>검증 없이 맹신함</strong>: AI가 가짜 사실을 지어내는 현상(할루시네이션)에 속습니다.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'concepts' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400 mb-2">프롬프트를 정교하게 만드는 6가지 주요 컴포넌트의 상세 설명입니다.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {terms.map((item, idx) => (
              <div key={idx} className="p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-350 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-950 dark:text-white text-xs">{item.term}</h4>
                  <span className="text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 font-mono px-2 py-0.5 rounded uppercase font-bold">{item.english}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-2.5">{item.definition}</p>
                <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">E.G. </span>{item.example}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tips' && (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-950 dark:text-white text-xs mb-2 flex items-center gap-1.5 uppercase tracking-wider font-mono">
            🔍 한 끗 차이로 극적인 변화를 만드는 꿀팁
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wide">Tip 1. 사실과 의견 분리 지시</span>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                AI는 그럴싸해 보이는 가짜 기사나 의견을 실제 사실(Fact)인 것처럼 쉽게 가공합니다. 
                따라서 <strong>"사실과 주관적인 주장을 분리하고, 불확실한 사실에는 [출처 미상] 태그를 달아달라"</strong>고 요청하면 답변의 신뢰도가 수 배 이상 향상됩니다.
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wide">Tip 2. No-Go Zone (부정어 제약) 설치</span>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                단순히 "이것을 꼭 포함해"라고 하는 것보다 <strong>"어려운 한자어는 제외하고, 코드 일부분을 생략하지 마세요"</strong> 등 
                부정어 기반 금지 조항을 확실하게 걸어둘 때 왜곡을 훨씬 더 정밀하게 예방할 수 있습니다.
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wide">Tip 3. 명확한 구조 및 인풋 토큰 마커 사용</span>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                "아래 글을 요약해줘" 대신 요약할 본문을 백틱(```)이나 대괄호 등으로 감싸고 <strong>"[입력 텍스트]: [내용]과 같이 입력된 영역만 요약하라"</strong>고 하면 본문 내용과 프롬프트 명령어가 서로 섞여 오염되는 주입 공격(Injection)을 쉽게 막을 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="p-4 bg-red-50/20 dark:bg-red-950/10 rounded border border-red-200/50 dark:border-red-950 space-y-2">
            <h4 className="font-bold text-red-800 dark:text-red-400 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
              🛡️ 안전한 프롬프트 제작 원칙 (AI 안전 수칙)
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              본 프롬프트 설계 플랫폼은 사용자의 안전을 위해 <strong>해킹, 폭력 선동, 개인정보 탈취, 사기, 부정행위 모의, 탈옥 공격</strong>을 
              규칙 기반 시스템으로 전면 감지하고 차단합니다. AI는 인간을 이롭게 하는 도구이므로, 오용 가능성이 있는 악의적 프롬프트는 
              즉각적으로 안전한 대안적/학습용 표현으로 정화되어야 합니다.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950/30 rounded border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
              🔒 개인정보 보호 가이드라인
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              프롬프트를 설계하거나 인풋 데이터를 넣을 때 **실명, 전화번호, 이메일 주소, 자택/학교 위치, 금융 계좌, API 키** 등 실제 민감한 고유 식별 정보는 절대로 직접 기입하지 마세요.
              본 프롬프트 제작기는 실시간 정규표현식 스캐너를 가동하여, 개인정보가 의심되는 즉시 가상의 정보(예: 홍길동, user@domain.com)로 치환하거나 내용을 안전하게 소거할 것을 안내합니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
