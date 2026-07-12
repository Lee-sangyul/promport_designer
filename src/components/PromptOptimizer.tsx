import React, { useState } from 'react';
import { Sparkles, Play, HelpCircle, Check, AlertTriangle, ShieldCheck, List, Layout, Terminal, Cpu, AlertCircle, Loader2 } from 'lucide-react';
import { PromptData, ConflictWarning } from '../types';
import { detectConflicts, calculateQualityScore, analyzeSafety, generatePromptString } from '../utils/safety';
import { generateContent } from '../utils/geminiClient';

interface PromptOptimizerProps {
  promptData: PromptData;
  onUpdateField: (field: keyof PromptData, value: any) => void;
  onAddIncludeItem: (item: string) => void;
}

export default function PromptOptimizer({ promptData, onUpdateField, onAddIncludeItem }: PromptOptimizerProps) {
  const conflicts = detectConflicts(promptData);
  const score = calculateQualityScore(promptData);
  const safety = analyzeSafety(promptData.task, promptData.problem, promptData.goal);

  // Real AI Playground States
  const [activeMode, setActiveMode] = useState<'simulation' | 'real'>('simulation');
  const [testInput, setTestInput] = useState('');
  const [realResult, setRealResult] = useState('');
  const [isLoadingReal, setIsLoadingReal] = useState(false);
  const [realError, setRealError] = useState('');

  const handleRunRealAI = async () => {
    setIsLoadingReal(true);
    setRealError('');
    setRealResult('');
    
    try {
      const fullPrompt = generatePromptString(promptData);
      const text = await generateContent(fullPrompt, testInput);
      setRealResult(text || '답변이 비어 있습니다.');
    } catch (err: any) {
      console.error(err);
      setRealError(err.message || '네트워크 에러가 발생했습니다.');
    } finally {
      setIsLoadingReal(false);
    }
  };

  // Heuristic vague expression scanner
  const scanVagueWords = () => {
    const text = `${promptData.task} ${promptData.goal} ${promptData.problem}`.toLowerCase();
    const suggestions: Array<{ original: string; reason: string; replacement: string; field: keyof PromptData }> = [];

    if (text.includes('멋지게') || text.includes('대충') || text.includes('잘 ') || text.includes('알아서')) {
      if (text.includes('멋지게')) {
        suggestions.push({
          original: '멋지게',
          reason: '"멋지게"라는 표현은 주관적이고 불분명하여 AI가 결과를 어색하게 낼 수 있습니다.',
          replacement: '깔끔한 디자인, 정돈된 배치, 가시성이 높은 도표 형식을 포함하여',
          field: 'goal'
        });
      }
      if (text.includes('대충') || text.includes('알아서')) {
        suggestions.push({
          original: '대충/알아서',
          reason: '작업의 범위와 기준을 흐리게 하여 원하는 결과를 정밀하게 뽑아내기 어렵습니다.',
          replacement: '핵심 요점 3개 위주로 요약하며 불필요한 사설을 최소화하여',
          field: 'task'
        });
      }
      if (text.includes('잘 ')) {
        suggestions.push({
          original: '잘',
          reason: '"잘"이라는 부사는 지시의 해상도를 낮추고 오류를 유발합니다.',
          replacement: '오류가 전혀 없는 견고한 구조와 상세한 한글 주석을 포함하여',
          field: 'task'
        });
      }
    }

    return suggestions;
  };

  const vagueSuggestions = scanVagueWords();

  const handleResolveConflict = (warning: ConflictWarning, chooseA: boolean) => {
    const field = warning.targetField as keyof PromptData;
    const value = chooseA ? warning.valueA : warning.valueB;
    
    if (field === 'explanationStyle') {
      // Modify lists
      if (chooseA) {
        onUpdateField('additionalRules', promptData.additionalRules.filter(r => !r.includes('코드만')));
      } else {
        onUpdateField('explanationStyle', ['핵심만 설명']);
      }
    } else {
      onUpdateField(field, value);
    }
    alert('모순 조건이 성공적으로 정화되어 프롬프트에 자동 반영되었습니다!');
  };

  const handleApplyVagueFix = (field: keyof PromptData, replacement: string) => {
    const currentValue = promptData[field] as string;
    // Replace vague word in promptData field
    const vagueWords = ['멋지게', '대충', '잘 ', '알아서'];
    let updatedValue = currentValue;
    vagueWords.forEach(w => {
      updatedValue = updatedValue.replace(new RegExp(w, 'g'), '');
    });
    // Append or inject replacement
    updatedValue = `${replacement} ${updatedValue}`.trim();
    onUpdateField(field, updatedValue);
    alert('모호한 부사 표현이 구체적인 지시 문장으로 세련되게 치환되었습니다!');
  };

  // Simulated expected output structure helper
  const getExpectedStructure = () => {
    const fmt = promptData.outputFormat || '자유 형식';
    const struct = promptData.outputStructure;
    
    if (struct) return struct.split('->').map(s => s.trim());

    if (fmt === '발표 대본') {
      return ['도입 (청중 흥미 유발 질문)', '본론 (핵심 메시지 및 실제 일상 사례)', '결론 (전달 요약 및 실천 다짐)'];
    } else if (fmt === '보고서') {
      return ['1. 연구 배경 및 필요성', '2. 현상 분석 및 실태', '3. 구체적 극복 해결책', '4. 추진 기대효과 및 최종 결론'];
    } else if (fmt === '표' || fmt === '비교표') {
      return ['헤더 행 (비교 기준, 대상 A, 대상 B)', '항목별 장단점 및 특징 비교 격자', '하단 핵심 요약 및 한 줄 권고'];
    } else if (['전체 코드', 'Python', 'JavaScript'].includes(fmt)) {
      return ['상단 전역 설정 및 라이브러리 임포트', '핵심 로직 클래스 및 주석이 달린 함수군', '코드 실행 데모(main) 및 에러 방지 핸들링'];
    } else {
      return ['개념 정의 및 상황 소개', '요구 사항에 부합하는 중심 글 본문', '최종 마무리 코멘트'];
    }
  };

  const expectedStruct = getExpectedStructure();

  return (
    <div className="space-y-6" id="prompt-optimizer-section">
      {/* 1. Dual-Mode Tester (Simulation & Real AI) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        
        {/* Switcher Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400">
              <Terminal size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">🤖 AI 프롬프트 실행 및 검증기</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">설계된 프롬프트를 시뮬레이션하거나 실제 AI 모델(Gemini)에 직접 구동해 성능을 시험합니다.</p>
            </div>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 self-start sm:self-center">
            <button
              onClick={() => setActiveMode('simulation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'simulation'
                  ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              모의 실행 (Simulation)
            </button>
            <button
              onClick={() => setActiveMode('real')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'real'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Cpu size={12} />
              실제 AI 구동 (Gemini)
            </button>
          </div>
        </div>

        {activeMode === 'simulation' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Diagnostic Stats */}
            <div className="space-y-3.5">
              <span className="block font-bold text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider">가상 응답 진단서</span>
              <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 text-xs space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">지정된 페르소나</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{promptData.role || '미등록 (기본 모델)'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">구조적 통제력</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {promptData.outputStructure || promptData.outputFormat ? '매우 강력 (안정적)' : '없음 (답변 오탈자 가능성)'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">예상 할루시네이션율</span>
                  <span className={`font-bold ${score > 80 ? 'text-emerald-600' : 'text-amber-500'}`}>
                    {score > 80 ? '매우 낮음 (~2%)' : '보통 (~15%)'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">안전성 검진 등급</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${
                    safety.status === 'safe' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                  }`}>
                    {safety.status === 'safe' ? 'A급 (완벽 보호)' : 'B급 (수정 추천)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Expected Layout Structure */}
            <div>
              <span className="block font-bold text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider mb-2">📦 AI 예상 응답 템플릿 레이아웃</span>
              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/30 text-xs space-y-3">
                <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-mono font-bold px-2 py-0.5 rounded">
                  AI 응답 구조 예상도 ({promptData.outputFormat || '자유'})
                </span>
                <div className="space-y-2 border-l-2 border-blue-200 dark:border-blue-900 pl-3">
                  {expectedStruct.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <span className="text-blue-500 font-bold shrink-0">{idx + 1}.</span>
                      <span className="leading-tight">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Test Input Form */}
              <div className="md:col-span-5 space-y-3">
                <div className="space-y-1">
                  <span className="block font-bold text-slate-700 dark:text-slate-300 text-xs">📝 가상 사용자 입력 값 (Test Input)</span>
                  <p className="text-[10px] text-slate-400">작성한 프롬프트(지시 사항)가 처리할 실제 질문이나 텍스트 데이터를 입력합니다.</p>
                </div>
                <textarea
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="예: (프롬프트가 번역기인 경우) '이 문장을 영어로 우아하게 번역해줘.'&#10;(요약기인 경우 요약할 장문의 뉴스 기사나 텍스트)"
                  rows={4}
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-150 dark:border-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 resize-none font-sans"
                />
                <button
                  onClick={handleRunRealAI}
                  disabled={isLoadingReal}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                    isLoadingReal 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isLoadingReal ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      AI가 실시간 생각하는 중...
                    </>
                  ) : (
                    <>
                      <Play size={13} fill="currentColor" />
                      Gemini API로 프롬프트 구동하기
                    </>
                  )}
                </button>
              </div>

              {/* API Response Display */}
              <div className="md:col-span-7 flex flex-col space-y-2">
                <span className="block font-bold text-slate-700 dark:text-slate-300 text-xs">🖥️ 실시간 AI 생성 결과 (Gemini Response)</span>
                <div className="flex-1 min-h-[180px] p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-200 font-mono overflow-y-auto leading-relaxed relative flex flex-col justify-between">
                  {isLoadingReal ? (
                    <div className="flex flex-col items-center justify-center h-full py-8 space-y-2 text-slate-400">
                      <Loader2 className="animate-spin text-blue-500" size={28} />
                      <p className="text-[11px] font-bold">서버에서 실시간 추론하는 중입니다...</p>
                    </div>
                  ) : realError ? (
                    <div className="flex items-start gap-2.5 p-3.5 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-bold text-[11px]">API 연동 에러 발생</span>
                        <p className="text-[10px] leading-normal">{realError}</p>
                      </div>
                    </div>
                  ) : realResult ? (
                    <div className="whitespace-pre-wrap selection:bg-blue-500 selection:text-white">{realResult}</div>
                  ) : (
                    <div className="text-slate-500 text-center py-10 my-auto">
                      "Gemini API로 프롬프트 구동하기" 버튼을 클릭하면 완성된 프롬프트와 가상 입력 값이 서버의 Gemini 모델을 거쳐 실시간 연동 처리됩니다.
                    </div>
                  )}

                  {realResult && !isLoadingReal && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(realResult);
                        alert('결과가 클립보드에 복사되었습니다!');
                      }}
                      className="absolute top-2 right-2 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-white rounded-lg transition-all"
                    >
                      결과 복사
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Rule Conflict Resolver */}
      {conflicts.length > 0 && (
        <div className="bg-amber-50/60 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-950/40 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-amber-500" size={24} />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-amber-400 text-sm">⚠️ 프롬프트 조건 모순 감지됨 ({conflicts.length}건)</h3>
              <p className="text-xs text-slate-500">서로 상충하는 조건을 기입하여 AI가 잘못된 포맷을 제공할 우려가 있습니다.</p>
            </div>
          </div>

          <div className="space-y-4">
            {conflicts.map(con => (
              <div key={con.id} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                <p className="font-bold text-slate-800 dark:text-white mb-3">{con.message}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => handleResolveConflict(con, true)}
                    className="w-full text-left p-2.5 bg-slate-50 hover:bg-blue-50/40 dark:bg-slate-800 border border-slate-150 dark:border-slate-700 rounded-xl transition-all"
                  >
                    <span className="block font-bold text-blue-600 dark:text-blue-400 text-[10px] uppercase mb-1">A안으로 일원화</span>
                    <span className="text-slate-600 dark:text-slate-300 line-clamp-2">{con.solutionA}</span>
                  </button>
                  <button
                    onClick={() => handleResolveConflict(con, false)}
                    className="w-full text-left p-2.5 bg-slate-50 hover:bg-indigo-50/40 dark:bg-slate-800 border border-slate-150 dark:border-slate-700 rounded-xl transition-all"
                  >
                    <span className="block font-bold text-indigo-600 dark:text-indigo-400 text-[10px] uppercase mb-1">B안으로 정화</span>
                    <span className="text-slate-600 dark:text-slate-300 line-clamp-2">{con.solutionB}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Vague expression scanner */}
      {vagueSuggestions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-blue-600" size={20} />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">💡 문장 모호성(Vagueness) 세련되게 치환하기</h3>
          </div>

          <div className="space-y-3">
            {vagueSuggestions.map((sug, idx) => (
              <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-red-50 text-red-500 font-mono font-bold px-1.5 py-0.5 rounded text-[10px]">모호한 표현: "{sug.original}"</span>
                    <span className="text-slate-400">→</span>
                    <span className="bg-emerald-50 text-emerald-600 font-mono font-bold px-1.5 py-0.5 rounded text-[10px]">개선안: "{sug.replacement}"</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{sug.reason}</p>
                </div>

                <button
                  onClick={() => handleApplyVagueFix(sug.field, sug.replacement)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3.5 py-2 rounded-xl text-[11px] shrink-0 transition-all"
                >
                  개선 제안 적용
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
