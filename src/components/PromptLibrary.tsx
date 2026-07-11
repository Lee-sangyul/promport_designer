import React, { useState } from 'react';
import { BookOpen, Star, Play } from 'lucide-react';
import { LibraryPreset, PromptData } from '../types';
import { LIBRARY_PRESETS } from '../data';

interface PromptLibraryProps {
  onLoadPreset: (data: Partial<PromptData>) => void;
}

export default function PromptLibrary({ onLoadPreset }: PromptLibraryProps) {
  const [activeCategory, setActiveCategory] = useState<string>('전체');
  const [selectedPreset, setSelectedPreset] = useState<LibraryPreset | null>(LIBRARY_PRESETS[0]);

  const categories = ['전체', '학교', '글쓰기', '발표', '코딩', '디자인', '공부'];

  const filteredPresets = activeCategory === '전체'
    ? LIBRARY_PRESETS
    : LIBRARY_PRESETS.filter(p => p.category === activeCategory);

  const handleSelectPreset = (preset: LibraryPreset) => {
    setSelectedPreset(preset);
  };

  const handleImport = () => {
    if (!selectedPreset) return;
    if (confirm(`'${selectedPreset.title}' 프롬프트를 현재 에디터로 불러오시겠습니까? 기존 작성 내용은 교체됩니다.`)) {
      onLoadPreset(selectedPreset.promptData);
      alert('프롬프트 라이브러리 프리셋이 에디터에 안전하게 로드되었습니다. 이제 단계별로 수정해 보세요!');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-6 shadow-sm" id="prompt-library-card">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-sm font-bold tracking-tight uppercase text-slate-950 dark:text-white flex items-center gap-2">
            <BookOpen className="text-slate-950 dark:text-white" size={16} />
            프롬프트 예시 라이브러리 & 모범 예안
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">나쁜 프롬프트가 무엇인지, 좋은 프롬프트로 다듬어지는 과정과 차이점을 비교해 보세요.</p>
        </div>
        {selectedPreset && (
          <button
            onClick={handleImport}
            className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-900 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-white text-xs font-bold px-4 py-2.5 rounded transition-all cursor-pointer shadow-sm"
          >
            <Play size={11} />
            이 모범 예시 불러오기
          </button>
        )}
      </div>

      {/* Categories Grid */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-none border-b border-slate-100 dark:border-slate-850">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              const found = LIBRARY_PRESETS.find(p => cat === '전체' || p.category === cat);
              if (found) setSelectedPreset(found);
            }}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeCategory === cat
                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Presets menu list */}
        <div className="lg:col-span-4 space-y-2 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
          {filteredPresets.map(preset => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`w-full text-left p-4 rounded border transition-all flex flex-col gap-1.5 cursor-pointer ${
                selectedPreset?.id === preset.id
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-950 dark:border-white shadow-sm'
                  : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-bold font-mono">
                  {preset.category}
                </span>
                <span className="text-[10px] text-slate-950 dark:text-white font-mono font-bold uppercase">GOOD PRESET</span>
              </div>
              <h3 className="font-bold text-slate-950 dark:text-slate-100 text-xs line-clamp-1">{preset.title}</h3>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{preset.description}</p>
            </button>
          ))}
        </div>

        {/* Right column: Comparison view */}
        <div className="lg:col-span-8 space-y-6">
          {selectedPreset ? (
            <div className="space-y-6">
              {/* Bad vs Good Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bad Card */}
                <div className="p-4 bg-red-50/30 dark:bg-red-950/10 border border-red-200/50 dark:border-red-950 rounded space-y-2">
                  <span className="text-[9px] font-mono tracking-wider font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded uppercase">나쁜 예시 (Bad)</span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">"{selectedPreset.badPrompt}"</p>
                  <div className="text-[10px] text-red-500 leading-normal pt-1.5 border-t border-red-100 dark:border-red-950 font-mono">
                    ❌ 역할 부재 / 구체성 결여 / 타겟 무시 / 결과물 구조 가이드라인 없음
                  </div>
                </div>

                {/* Good Card */}
                <div className="p-4 bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-200/50 dark:border-emerald-950 rounded space-y-2">
                  <span className="text-[9px] font-mono tracking-wider font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded uppercase">좋은 예시 (Good)</span>
                  <div className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-2.5 rounded font-mono text-slate-700 dark:text-slate-300 max-h-24 overflow-y-auto">
                    {selectedPreset.goodPrompt}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 leading-normal pt-1.5 border-t border-emerald-100 dark:border-emerald-950 font-mono">
                    ✅ 역할 지정 / 완벽한 조건 맥락 / 구조적 통제 / 개인정보 안전장치 내장
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown Analysis Grid */}
              <div className="bg-slate-50 dark:bg-slate-950/40 rounded p-4 border border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-slate-950 dark:text-white text-[11px] font-mono tracking-wide uppercase mb-3">📋 핵심 속성 비교 분석서 (Comparative Report)</h4>
                <div className="space-y-2.5 text-xs">
                  {[
                    { key: '목적 및 맥락', val: selectedPreset.analysis.purpose },
                    { key: '청중(Audience)', val: selectedPreset.analysis.audience },
                    { key: '길이 분량', val: selectedPreset.analysis.length },
                    { key: '출력 형식', val: selectedPreset.analysis.format },
                    { key: '조건 및 예방', val: selectedPreset.analysis.includes },
                    { key: '전달 명확성', val: selectedPreset.analysis.clarity },
                    { key: '보안 안정성', val: selectedPreset.analysis.safety }
                  ].map((attr, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                      <span className="font-bold text-slate-500 shrink-0 w-28 text-[11px]">{attr.key}</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{attr.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded">
              <Star className="mx-auto text-slate-300 dark:text-slate-700 mb-2" size={24} />
              <p className="text-sm font-medium text-slate-400">카테고리를 선택하여 모범 프롬프트를 비교해 보세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
