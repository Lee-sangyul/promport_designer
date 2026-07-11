import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2, ChevronLeft, ChevronRight, Printer, LayoutGrid, Layers, ShieldCheck, PlayCircle, Eye, Download } from 'lucide-react';
import { PromptData } from '../types';
import { generatePromptString } from '../utils/safety';
import { exportToPPT } from '../utils/pptxExport';

interface PresentationModeProps {
  promptData: PromptData;
  onClose: () => void;
}

export default function PresentationMode({ promptData, onClose }: PresentationModeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'slideshow' | 'summary'>('slideshow');

  const finalPrompt = generatePromptString(promptData);

  const slides = [
    {
      title: '프로젝트 개요 (Overview)',
      content: (
        <div className="space-y-6 text-center py-6">
          <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-full uppercase tracking-widest font-mono">
            Prompt Design Pitch
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
            {promptData.title || '제목 없는 프롬프트 프로젝트'}
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
            AI에게 정밀하고 안전하게 명령하기 위한 구조화된 프롬프트 설계서 및 모의 시뮬레이션 결과입니다.
          </p>
          <div className="flex justify-center items-center gap-6 pt-4 border-t border-slate-100 dark:border-slate-800 max-w-sm mx-auto text-left">
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">품질 완성도</span>
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{promptData.qualityScore}점 / 100점</span>
            </div>
            <div className="w-px h-10 bg-slate-250 dark:bg-slate-850" />
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">안전성 등급</span>
              <span className="text-lg font-bold text-emerald-600">안전성 최상</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '해결 과제와 핵심 목표 (Goal)',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="p-5 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/30 space-y-2">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">해결하고자 하는 문제 상황</span>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
              {promptData.problem || '정의된 문제 상황이 없습니다.'}
            </p>
          </div>
          <div className="p-5 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 space-y-2">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">프롬프트 도달 목표</span>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
              {promptData.goal || '정의된 핵심 목표가 기입되지 않았습니다.'}
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'AI 메인 페르소나 (Persona & Tone)',
      content: (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-4 items-start bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
            <div className="p-3 bg-blue-600 text-white rounded-xl font-bold text-sm text-center min-w-[100px]">
              AI 역할
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">{promptData.role || '지정되지 않음 (기본 페르소나)'}</h3>
              {promptData.secondaryRole && (
                <p className="text-xs text-slate-500 dark:text-slate-400">보조 역할: {promptData.secondaryRole}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">어조 및 말투</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">{promptData.tone || '기본 말투'}</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">이해 난이도</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">{promptData.difficulty || '기본 난이도'}</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">설명 전달 모델</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block line-clamp-1">
                {promptData.explanationStyle && promptData.explanationStyle.length > 0 
                  ? promptData.explanationStyle.join(', ') 
                  : '일반 설명'}
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '핵심 작업과 청중 분석 (Task & Target)',
      content: (
        <div className="space-y-5">
          <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">구체적 지시 (Task)</span>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">
              {promptData.task || '지시 내용이 기입되지 않았습니다.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">독자 및 청중 (Audience)</span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{promptData.audience || '제공안됨'}</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">사용 환경 및 문맥 (Context)</span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{promptData.context || '제공안됨'}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '수행 규약과 제약 조건 (Guardrails)',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">반드시 다룰 요소 (Include)</span>
            <div className="flex flex-wrap gap-1.5">
              {promptData.includeItems && promptData.includeItems.length > 0 ? (
                promptData.includeItems.map((item, idx) => (
                  <span key={idx} className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs px-2.5 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                    ✓ {item}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">설정된 조건 없음</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest block">배제할 요소 (Exclude)</span>
            <div className="flex flex-wrap gap-1.5">
              {promptData.excludeItems && promptData.excludeItems.length > 0 ? (
                promptData.excludeItems.map((item, idx) => (
                  <span key={idx} className="bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 text-xs px-2.5 py-1.5 rounded-xl border border-red-100 dark:border-red-900/30">
                    ✕ {item}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">설정된 차단 조건 없음</span>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      title: '출력 규격 및 분량 (Format & Volume)',
      content: (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-bold text-slate-400 block uppercase mb-1">출력 형식 (Format)</span>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">{promptData.outputFormat || '지정되지 않음 (기본 텍스트)'}</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-bold text-slate-400 block uppercase mb-1">타겟 분량 (Length)</span>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">{promptData.lengthValue || '제어 분량 없음'}</p>
            </div>
          </div>

          {promptData.outputStructure && (
            <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">구조적 목차 설계 (Output Structure)</span>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{promptData.outputStructure}</p>
            </div>
          )}
        </div>
      )
    },
    {
      title: '개인정보 보호 및 사이버 세이프티 (Safety & Compliance)',
      content: (
        <div className="space-y-4">
          <div className="flex gap-4 items-center bg-emerald-50/50 dark:bg-emerald-950/15 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-950 text-xs">
            <ShieldCheck size={24} className="text-emerald-600 dark:text-emerald-400" />
            <div>
              <h4 className="font-bold text-emerald-800 dark:text-emerald-400">실시간 데이터 유출 보안 완료</h4>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">이 프롬프트는 주민번호, 실제 위치, 연락처 등 고유식별정보를 포함하지 않아 즉각적인 클라우드 질의에 완전 무해합니다.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
            <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider block">안전 보안 원칙 요약</span>
            <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
              <li>사용 목적 및 상황 규칙 기반 실시간 해킹·우회 패턴 스캔 정밀 필터링 통과</li>
              <li>공익 교육용 프롬프트 및 비폭력 조건 기반 인권 가치 지향 설계 지침 준수</li>
              <li>중요 금융 정보 소스 주입 시, 사전 확인 및 경고 경보 강제 호출</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: '조합된 완성형 프롬프트 (Compiled Output)',
      content: (
        <div className="space-y-3">
          <div className="relative border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-950 text-slate-200">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">최종 템플릿 코드</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(finalPrompt);
                  alert('프롬프트 복사 성공!');
                }}
                className="text-[10px] text-blue-400 hover:text-blue-300 font-bold"
              >
                복사하기
              </button>
            </div>
            <pre className="p-4 text-left text-[10px] font-mono leading-relaxed overflow-y-auto max-h-[220px] whitespace-pre-wrap select-all">
              {finalPrompt}
            </pre>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process when in slideshow view mode
      if (viewMode !== 'slideshow') return;

      // Check if user is typing in an input/textarea
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
  }, [viewMode, slides.length]);

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

  const triggerPrint = () => {
    window.print();
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
            <h2 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">발표 슬라이드 모드</h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:block">설계 완료된 프롬프트 구성을 보기 쉬운 프리젠테이션으로 전환합니다.</p>
          </div>
        </div>

        {/* View mode buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode('slideshow')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 ${
              viewMode === 'slideshow' 
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers size={13} />
            슬라이드 보기
          </button>
          <button
            onClick={() => setViewMode('summary')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 ${
              viewMode === 'summary' 
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutGrid size={13} />
            전체 대시보드
          </button>
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />
          <button
            onClick={() => exportToPPT(promptData)}
            className="px-3 py-1.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl text-xs font-semibold flex items-center gap-1 hover:bg-slate-900 dark:hover:bg-slate-100 transition-all shadow-sm cursor-pointer"
            title="발표용 PPT 파일로 컴퓨터에 저장합니다."
          >
            <Download size={13} />
            PPTX 다운로드
          </button>
          <button
            onClick={triggerPrint}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
            title="인쇄"
          >
            <Printer size={16} />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
            title={isFullscreen ? '축소' : '전체화면'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            onClick={onClose}
            className="ml-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-3.5 py-1.5 rounded-xl text-xs"
          >
            종료
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 max-h-[calc(100vh-140px)] overflow-y-auto">
        {viewMode === 'slideshow' ? (
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-slate-100 dark:border-slate-800/80 min-h-[400px] flex flex-col justify-between">
            {/* Slide title */}
            <div className="border-b border-slate-100 dark:border-slate-850 pb-4 mb-6">
              <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 font-mono tracking-widest uppercase block mb-1">
                SLIDE {currentSlide + 1} OF {slides.length}
              </span>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                {slides[currentSlide].title}
              </h2>
            </div>

            {/* Slide content */}
            <div className="flex-1 py-4 flex flex-col justify-center">
              {slides[currentSlide].content}
            </div>

            {/* Slide Controls */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-6 mt-6">
              <span className="text-xs text-slate-400 font-mono font-medium">프롬프트 디자이너 발표 모드</span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentSlide === 0}
                  className="p-3 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 rounded-2xl text-slate-700 border border-slate-150 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentSlide === slides.length - 1}
                  className="p-3 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 rounded-2xl text-slate-700 border border-slate-150 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Summary mode grid */
          <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-slate-100 dark:border-slate-800 overflow-y-auto max-h-full print:border-0 print:shadow-none space-y-8">
            <div className="text-center pb-6 border-b border-slate-100 dark:border-slate-800">
              <h1 className="text-2xl md:text-3xl font-black text-slate-950 dark:text-white">{promptData.title || '제목 없는 프롬프트'} 설계 요약본</h1>
              <p className="text-xs text-slate-400 mt-1">완성도 높은 비지니스를 위한 프롬프트 핵심 설정 통합 요약 레포트</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {slides.slice(1, -1).map((s, idx) => (
                <div key={idx} className="p-5 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/40 dark:bg-slate-900/40">
                  <h3 className="font-bold text-slate-950 dark:text-white text-sm mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">{s.title}</h3>
                  {s.content}
                </div>
              ))}
            </div>

            {/* Last item standalone */}
            <div className="p-5 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/40 dark:bg-slate-900/40 text-xs">
              <h3 className="font-bold text-slate-950 dark:text-white text-sm mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">조합된 최종 프롬프트 출력문</h3>
              {slides[slides.length - 1].content}
            </div>
          </div>
        )}
      </div>

      {/* Footer footer */}
      <div className="py-3 bg-white dark:bg-slate-900 border-t border-slate-150 dark:border-slate-800 md:mx-4 rounded-b-3xl text-center text-[10px] text-slate-400 font-medium">
        © Prompt Designer Pitch Presentation. 이 화면은 인쇄 지원 포맷을 갖추고 있습니다.
      </div>
    </div>
  );
}
