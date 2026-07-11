import React, { useState, useEffect } from 'react';
import { History, Plus, Trash2, Calendar, ClipboardCheck, Sparkles } from 'lucide-react';
import { ImprovementLog as LogItem } from '../types';

interface ImprovementLogProps {
  currentScore: number;
  onSaveLogToStorage: (log: LogItem, preScore: number, postScore: number) => void;
}

export default function ImprovementLog({ currentScore, onSaveLogToStorage }: ImprovementLogProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [problem, setProblem] = useState('');
  const [addedRules, setAddedRules] = useState('');
  const [finalChanges, setFinalChanges] = useState('');
  const [reflection, setReflection] = useState('');
  const [preScore, setPreScore] = useState(60);

  const loadLogs = () => {
    try {
      const stored = localStorage.getItem('prompt_designer_improvement_logs');
      if (stored) {
        setLogs(JSON.parse(stored));
      } else {
        setLogs([]);
      }
    } catch (e) {
      console.error('Error loading logs:', e);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim() || !finalChanges.trim()) {
      alert('발견한 문제와 최종 개선 내용은 필수 항목입니다!');
      return;
    }

    const newLogItem: LogItem = {
      discoveredProblems: problem,
      addedRules: addedRules,
      finalChanges: finalChanges,
      reflection: reflection,
      preScore: preScore,
      postScore: currentScore
    };

    const newSavedItem = {
      ...newLogItem,
      id: `log_${Date.now()}`,
      date: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const updated = [newSavedItem, ...logs];
    localStorage.setItem('prompt_designer_improvement_logs', JSON.stringify(updated));
    setLogs(updated);

    // Call callback
    onSaveLogToStorage(newLogItem, preScore, currentScore);

    // Reset fields
    setProblem('');
    setAddedRules('');
    setFinalChanges('');
    setReflection('');
    alert('개선 기록이 성공적으로 보존되었습니다. 학습 타임라인에 누적되었습니다!');
  };

  const handleDeleteLog = (id: string) => {
    if (confirm('이 개선 일지를 삭제하시겠습니까?')) {
      const updated = logs.filter(l => l.id !== id);
      localStorage.setItem('prompt_designer_improvement_logs', JSON.stringify(updated));
      setLogs(updated);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-6 shadow-sm" id="improvement-logs-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-250 dark:border-slate-700 text-slate-950 dark:text-white">
          <History size={18} />
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-tight uppercase text-slate-950 dark:text-white">프롬프트 성장 & 개선 기록 일지</h2>
          <p className="text-xs text-slate-400 mt-0.5">테스트하고 문제점을 다듬어 점수를 올리는 일련의 프롬프트 훈련 기록을 작성해보세요.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Add Log form */}
        <form onSubmit={handleSave} className="lg:col-span-5 space-y-4">
          <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider font-mono mb-2">✏️ 새로운 개선 사항 기록하기</h3>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 mb-1 font-bold font-mono text-[10px] uppercase">수정 전 예상 점수</label>
              <input
                type="number"
                min="0"
                max="100"
                value={preScore}
                onChange={(e) => setPreScore(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-white font-mono font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-bold font-mono text-[10px] uppercase">수정 후 점수 (실시간)</label>
              <div className="w-full px-3 py-2 bg-slate-950 text-white dark:bg-white dark:text-slate-950 rounded font-mono font-bold border border-slate-950 dark:border-white text-center">
                {currentScore}점
              </div>
            </div>
          </div>

          <div className="text-xs">
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">🔍 처음 만든 프롬프트에서 발견한 문제</label>
            <textarea
              placeholder="예: '학교 발표 대본'이라고만 하니 AI가 대학 강의 수준의 복잡하고 진부한 내용만 뱉어내서 중학생 친구들이 지루해할 우려가 있었음."
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs rounded border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-slate-950 dark:focus:border-white focus:ring-0"
            />
          </div>

          <div className="text-xs">
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">🛠️ 보완하기 위해 추가한 조건 및 안전 지침</label>
            <textarea
              placeholder="예: 대상 독자를 '중학교 1학년 학생'으로 한정하고, '실생활 비유'와 '청중에게 던지는 흥미 질문 2개'를 강제함. 어려운 기상 한자는 배제 지침 적용."
              value={addedRules}
              onChange={(e) => setAddedRules(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs rounded border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-slate-950 dark:focus:border-white focus:ring-0"
            />
          </div>

          <div className="text-xs">
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">📝 최종 개선 문구 및 내용</label>
            <textarea
              placeholder="예: 중학교 발표 수행평가용 3분 스피치 대본을 '도입-본론-결론' 형식으로 완성하고, 칭찬 코치 페르소나를 탑재하여 최종 개선함."
              value={finalChanges}
              onChange={(e) => setFinalChanges(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs rounded border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-slate-950 dark:focus:border-white focus:ring-0"
            />
          </div>

          <div className="text-xs">
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">💭 성장 일지 및 배운 점 (느낀 점)</label>
            <textarea
              placeholder="예: AI에게 일을 시킬 때는 그저 '써줘'라고 할 게 아니라, 누구를 위해 어떤 포맷으로, 무엇을 금지할지 정확히 한계를 지어주는 것이 핵심임을 배웠다!"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs rounded border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-slate-950 dark:focus:border-white focus:ring-0"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-950 hover:bg-slate-900 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-white font-bold py-3 px-4 rounded text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus size={12} />
            기록 보관함에 저장하기
          </button>
        </form>

        {/* Right column: Timeline */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between font-mono">
            <span>📜 학습 성장 일지 타임라인</span>
            <span className="text-[10px] text-slate-900 dark:text-white font-mono font-bold">누적 {logs.length}건</span>
          </h3>

          {logs.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded bg-slate-50/40 dark:bg-slate-950/10 text-slate-400">
              <ClipboardCheck className="mx-auto text-slate-300 dark:text-slate-700 mb-1.5" size={24} />
              <p className="text-xs font-semibold">아직 작성된 개선 기록이 없습니다.</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">좌측 훈련지를 작성해 프롬프트 진화 과정을 한눈에 아카이빙해 보세요.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
              {logs.map((log, index) => (
                <div key={log.id} className="relative pl-5 border-l border-slate-300 dark:border-slate-700 pb-2 last:pb-0">
                  {/* Timeline dot */}
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-slate-950 dark:bg-white rounded-full" />
                  
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 text-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500 font-mono">{log.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded text-[9px]">
                          기존: {log.preScore}점
                        </span>
                        <span className="text-slate-300">→</span>
                        <span className="font-mono bg-slate-950 text-white dark:bg-white dark:text-slate-950 px-1.5 py-0.5 rounded text-[9px] font-bold">
                          개선: {log.postScore}점
                        </span>
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-850 rounded cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-850">
                      <div>
                        <span className="font-bold text-slate-400 block text-[9px] font-mono uppercase mb-0.5">발견한 문제</span>
                        <p className="text-slate-700 dark:text-slate-300 font-medium">"{log.discoveredProblems}"</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block text-[9px] font-mono uppercase mb-0.5">최종 개선 조치</span>
                        <p className="text-slate-700 dark:text-slate-300 font-medium">"{log.finalChanges}"</p>
                      </div>
                    </div>

                    {log.addedRules && (
                      <div className="bg-white dark:bg-slate-950/30 p-2.5 rounded border border-slate-200 dark:border-slate-800 text-[11px]">
                        <span className="font-bold text-slate-400 block text-[9px] font-mono uppercase mb-0.5">추가된 제약 조건</span>
                        <p className="text-slate-400">{log.addedRules}</p>
                      </div>
                    )}

                    {log.reflection && (
                      <div className="bg-slate-50 dark:bg-slate-950/10 p-2.5 rounded border border-slate-200/80 dark:border-slate-850 text-[11px]">
                        <span className="font-bold text-slate-900 dark:text-white block text-[9px] font-mono uppercase mb-0.5 flex items-center gap-1">
                          <Sparkles size={11} />
                          훈련 소감 및 통찰
                        </span>
                        <p className="text-slate-400 italic">"{log.reflection}"</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
