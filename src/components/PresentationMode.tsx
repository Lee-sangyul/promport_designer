import React, { useState, useEffect } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid, 
  Layers, 
  ShieldCheck, 
  PlayCircle, 
  Eye, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  ShieldAlert, 
  Database, 
  Clock 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PromptData } from '../types';

interface PresentationModeProps {
  promptData: PromptData;
  onClose: () => void;
}

export default function PresentationMode({ onClose }: PresentationModeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const slides = [
    {
      title: '프롬프트 디자이너 소개',
      subtitle: 'Introduction to Prompt Designer',
      content: (
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-blue-500/10 dark:bg-blue-400/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-inner">
            <LayoutGrid size={40} className="animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
              누구나 전문가처럼 AI를 다루는 방법
            </h2>
            <p className="text-blue-600 dark:text-blue-400 text-xs font-bold font-mono tracking-wider">
              LEGO-STYLE AUTOMATED PROMPT WORKSTATION
            </p>
          </div>
          
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            복잡하고 막연한 프롬프트 작성 과정을 레고 블록처럼 직관적으로 결합하여, 최고 품질의 출력물을 유도할 수 있도록 돕는 차세대 실시간 프롬프트 저작 및 안전성 가드라인 엔지니어링 플랫폼입니다.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-6 max-w-2xl mx-auto text-center">
            <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">프롬프트 조립</span>
              <span className="text-sm font-black text-blue-600 dark:text-blue-400">8단계 가이드</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">인프라 보안</span>
              <span className="text-sm font-black text-red-600 dark:text-red-400">실시간 스캔</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">엔진 성능</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">Gemini AI</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '직관적인 단계별 블록 설계',
      subtitle: 'Systematic Step-by-Step Prompt Composition',
      content: (
        <div className="space-y-6">
          <p className="text-center text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
            주먹구구식 작성이 아닙니다. 프롬프트 구성의 필수 5대 레이어를 단계별로 채워 나가면 완벽하게 최적화된 마크다운 문서형 프롬프트가 정식 발급됩니다.
          </p>

          {/* Timeline Visual */}
          <div className="relative flex flex-col md:flex-row justify-between items-center gap-4 max-w-3xl mx-auto py-4">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-150 dark:bg-slate-800 -translate-y-1/2 hidden md:block" />
            
            {[
              { step: '01', title: '목적 & 배경', desc: '해결할 과제 정의' },
              { step: '02', title: '역할 페르소나', desc: 'AI의 전문 정체성' },
              { step: '03', title: '세부 지시', desc: '수행할 구체 태스크' },
              { step: '04', title: '금칙 및 안전', desc: '예외/보안 가드라인' }
            ].map((s, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center bg-white dark:bg-slate-900 px-3 py-2 text-center max-w-[160px]">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-mono font-black text-xs border-2 border-blue-500 mb-2 shadow-sm">
                  {s.step}
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white mb-0.5">{s.title}</h4>
                <p className="text-[10px] text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/30 space-y-1">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1"><Layers size={11} />실시간 자동 조립</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                각 영역에 입력값을 기입하는 순간, 컴파일 메트릭스 모듈이 문맥 연동을 통해 아름다운 완성형 마크다운 구조로 실시간 조립합니다.
              </p>
            </div>
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 space-y-1">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1"><PlayCircle size={11} />완벽한 맥락 제어</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                출력의 어조, 형식, 제약사항이 구조화되어 전달되므로 AI가 지시를 우회하거나 길을 잃지 않고 정확한 답변만을 수행하게 보증합니다.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '초거대 AI 기반 고해상도 튜닝',
      subtitle: 'Gemini AI High-Definition Polish & Enhance',
      content: (
        <div className="space-y-5">
          <p className="text-center text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
            작성자의 의도가 담긴 기초 프롬프트를 <strong>세계 최고 수준의 전문가형 지시어 문법</strong>으로 1초 만에 격상시킵니다.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Before */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-2 relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-slate-200 dark:bg-slate-800 text-slate-500 text-[9px] font-bold px-1.5 py-0.5 rounded">
                AS-IS (사용자 기초 조립)
              </div>
              <span className="text-[10px] font-mono text-slate-400 block">PROMPT BLOCK</span>
              <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-850 leading-relaxed">
                "의사 말투로 친절하게 다이어트 식단을 구성해 줘. 한 달 치 정도로 칼로리도 낮아야 해."
              </div>
            </div>

            {/* After */}
            <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-950/40 space-y-2 relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                <Sparkles size={8} /> TO-BE (AI 튜닝 버전)
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 block font-bold flex items-center gap-1">
                <Sparkles size={10} /> GEMINI AI POLISHED
              </span>
              <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/20 leading-relaxed font-semibold">
                <strong>[역할 지정]</strong> 당신은 보건 복지부 인증 임상영양사 겸 가정의학과 전문의입니다.<br />
                <strong>[요구 사항]</strong> 30일 간의 저탄수화물 고단백 저열량(하루 1500kcal 제한) 균형 식단을 설계하되, 각 주차별 영양소 비율을 표 형식으로 수치화하십시오.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60 justify-center">
            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">체계적 구획화, 특수 트리거 추가, AI 응답 일관성 <strong>320% 증가</strong></span>
          </div>
        </div>
      )
    },
    {
      title: '철저한 보안 검진 & 제미나이 AI 종합 심사 (의무)',
      subtitle: 'Gemini AI Comprehensive Safety Audit & Guardrails',
      content: (
        <div className="space-y-4">
          <p className="text-center text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto">
            안전하고 신뢰할 수 있는 최적의 프롬프트를 보장합니다. 실시간 위협 스캐너와 함께, 최종 발급 직전 <strong>구글 제미나이 AI가 프롬프트의 품질과 보안 위해 요소를 스캔하는 종합 보안 심사가 의무 적용</strong>되었습니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center mb-1">
                <Lock size={14} />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-white">개인정보 & 민감데이터 필터</h4>
              <p className="text-[10px] text-slate-400 leading-normal">이메일, 연락처, 개인정보 유도 양식 등을 사전에 자동 스캔하여 차단 및 대체 제안</p>
            </div>

            <div className="p-4 bg-blue-500/5 dark:bg-blue-500/10 rounded-2xl border border-blue-200 dark:border-blue-900/30 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mb-1 animate-pulse">
                <ShieldCheck size={14} />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1">
                제미나이 AI 보안 심사
                <span className="bg-blue-600 text-white text-[8px] font-extrabold px-1 py-0.2 rounded">필수</span>
              </h4>
              <p className="text-[10px] text-slate-400 leading-normal">제미나이 인공지능 감사관이 탈옥(Jailbreak), 악성 우회 지시, 유해성을 면밀히 분석해 안전 등급 발급</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center mb-1">
                <ShieldAlert size={14} />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-white">다음 단계 잠금 장치 (Lock)</h4>
              <p className="text-[10px] text-slate-400 leading-normal">안전 등급 '통과'를 받지 못하거나 중간에 프롬프트를 무단 수정한 경우 다음 단계 이동이 엄격히 통제됨</p>
            </div>
          </div>

          <div className="p-4 bg-blue-500/5 dark:bg-blue-500/10 rounded-2xl border border-blue-100/30 dark:border-blue-950/40 flex items-start gap-3">
            <ShieldCheck size={18} className="text-blue-500 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-slate-900 dark:text-slate-200">🛡️ 구글 제미나이 심사 실패 및 우회 안내</h5>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                지시어에 인젝션 위험 등이 탐지되어 차단된 경우, 수정 후 다시 제미나이 AI 심사를 받으십시오. 
                Gemini 서버 일시 과부하(503/429) 등으로 API 통신이 지연될 경우, 시스템에 장착된 <strong>'내장형 로컬 실시간 진단 엔진'으로 즉시 우회 대체 승인</strong>을 획득할 수 있도록 이중 안전망이 갖춰져 있습니다.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '마켓플레이스 라이브러리 & 클라우드 보관함',
      subtitle: 'Premium Templates & Personalized Vault',
      content: (
        <div className="space-y-5">
          <p className="text-center text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
            엄선된 최상급 프롬프트 템플릿 목록과 함께 내가 정성껏 보강해 완성한 보장받은 프롬프트들을 반영구적으로 보존할 수 있습니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 border border-slate-150 dark:border-slate-800 rounded-2xl flex gap-4 bg-white dark:bg-slate-900 shadow-sm">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl shrink-0 h-11 w-11 flex items-center justify-center">
                <Database size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">엄선된 전문 템플릿 라이브러리</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  마케팅, 교육, 코드 작성, 심리 상담 등 각 분야의 일류 엔지니어들이 설계해둔 모범 프리셋을 즉시 클릭 한 번으로 내 보드에 이식합니다.
                </p>
              </div>
            </div>

            <div className="p-5 border border-slate-150 dark:border-slate-800 rounded-2xl flex gap-4 bg-white dark:bg-slate-900 shadow-sm">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0 h-11 w-11 flex items-center justify-center">
                <Clock size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">나만의 안전 보관 보관함 (Vault)</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  치열하게 설계하고 안전 보증 서약을 모두 체크하여 검증된 프롬프트를 비공개 클라우드 공간에 안전하게 등록하여 재사용하세요.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button 
              onClick={onClose}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-2xl text-xs shadow-md shadow-blue-500/10 cursor-pointer transition-all"
            >
              지금 직접 설계하러 가기 <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.getAttribute('contenteditable') === 'true')) {
        return;
      }

      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        setCurrentSlide(prev => (prev < slides.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentSlide(prev => (prev < slides.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlide(prev => (prev > 0 ? prev - 1 : prev));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [slides.length]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`fixed inset-0 z-50 bg-slate-100 dark:bg-slate-950 flex flex-col justify-between ${isFullscreen ? 'p-0' : 'p-4 md:p-8'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-150 dark:border-slate-800 rounded-t-3xl md:mx-4 mt-2 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-blue-600 dark:text-blue-400">
            <Eye size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">프로그램 가이드 슬라이드</h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:block">프롬프트 디자이너가 어떤 도구인지 핵심 기능을 설명합니다.</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            title={isFullscreen ? '축소' : '전체화면'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            onClick={onClose}
            className="ml-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-3.5 py-1.5 rounded-xl text-xs cursor-pointer"
          >
            종료
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 max-h-[calc(100vh-140px)] overflow-y-auto">
        <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-slate-100 dark:border-slate-800/80 min-h-[440px] flex flex-col justify-between">
          
          {/* Slide View Transition using motion */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex-1 flex flex-col justify-between"
            >
              {/* Slide title */}
              <div className="border-b border-slate-100 dark:border-slate-850 pb-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 font-mono tracking-widest uppercase block mb-1">
                    SLIDE {currentSlide + 1} OF {slides.length}
                  </span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono font-bold px-2 py-0.5 rounded-full">
                    {Math.round(((currentSlide + 1) / slides.length) * 100)}% 완료
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                  {slides[currentSlide].title}
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-mono tracking-wide mt-0.5">
                  {slides[currentSlide].subtitle}
                </p>
              </div>

              {/* Slide content */}
              <div className="flex-1 py-4 flex flex-col justify-center">
                {slides[currentSlide].content}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slide Controls & Slide Dots */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-6 mt-6 gap-4">
            {/* Slide dots indicator */}
            <div className="flex gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    currentSlide === idx 
                      ? 'bg-blue-600 dark:bg-blue-400 w-6' 
                      : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                  aria-label={`슬라이드 ${idx + 1}로 이동`}
                />
              ))}
            </div>

            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handlePrev}
                disabled={currentSlide === 0}
                className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 disabled:opacity-40 rounded-2xl text-slate-700 dark:text-slate-300 border border-slate-150 dark:border-slate-750 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                disabled={currentSlide === slides.length - 1}
                className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 disabled:opacity-40 rounded-2xl text-slate-700 dark:text-slate-300 border border-slate-150 dark:border-slate-750 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-3 bg-white dark:bg-slate-900 border-t border-slate-150 dark:border-slate-800 md:mx-4 rounded-b-3xl text-center text-[10px] text-slate-400 font-medium">
        © Prompt Designer. 스페이스바 또는 방향키를 사용하여 다음 슬라이드로 이동할 수 있습니다.
      </div>
    </div>
  );
}
