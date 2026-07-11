import React, { useState, useEffect } from 'react';
import { Search, Folder, Trash2, Edit2, Copy, PlayCircle, Layers, RefreshCw } from 'lucide-react';
import { SavedPrompt, PromptData } from '../types';
import { PURPOSE_PRESETS } from '../data';

interface SavedPromptsProps {
  onLoadPrompt: (data: PromptData) => void;
  onClose?: () => void;
}

export default function SavedPrompts({ onLoadPrompt, onClose }: SavedPromptsProps) {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState('all');
  const [selectedSafety, setSelectedSafety] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Load saved prompts from localStorage
  const loadSavedPrompts = () => {
    try {
      const stored = localStorage.getItem('prompt_designer_saved_list');
      if (stored) {
        setPrompts(JSON.parse(stored));
      } else {
        setPrompts([]);
      }
    } catch (e) {
      console.error('Error loading saved prompts:', e);
    }
  };

  useEffect(() => {
    loadSavedPrompts();
    // Set up local storage listener in case of parallel updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'prompt_designer_saved_list') {
        loadSavedPrompts();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const savePromptsList = (updatedList: SavedPrompt[]) => {
    localStorage.setItem('prompt_designer_saved_list', JSON.stringify(updatedList));
    setPrompts(updatedList);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('이 프롬프트를 정말로 삭제하시겠습니까?')) {
      const updated = prompts.filter(p => p.id !== id);
      savePromptsList(updated);
    }
  };

  const handleDuplicate = (prompt: SavedPrompt, e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicated: SavedPrompt = {
      ...prompt,
      id: `saved_${Date.now()}`,
      title: `${prompt.title} (사본)`,
      createdAt: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    const updated = [duplicated, ...prompts];
    savePromptsList(updated);
  };

  const handleStartEditing = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(title);
  };

  const handleSaveTitle = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    const updated = prompts.map(p => {
      if (p.id === id) {
        return {
          ...p,
          title: editTitle,
          promptData: {
            ...p.promptData,
            title: editTitle
          }
        };
      }
      return p;
    });
    savePromptsList(updated);
    setEditingId(null);
  };

  const handleCopyPromptText = (promptText: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(promptText);
    alert('프롬프트가 클립보드에 복사되었습니다. 실제 AI 도구에 입력하기 전에 안전성을 한 번 더 검증해 주세요!');
  };

  // Filter prompts
  const filteredPrompts = prompts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.promptData.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.promptData.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPurpose = selectedPurpose === 'all' || p.purpose === selectedPurpose;
    const matchesSafety = selectedSafety === 'all' || 
                          (selectedSafety === 'safe' && (p.safetyStatus === 'safe' || !p.safetyStatus)) ||
                          (selectedSafety === 'caution' && p.safetyStatus === 'caution') ||
                          (selectedSafety === 'warning' && p.safetyStatus === 'warning') ||
                          (selectedSafety === 'blocked' && p.safetyStatus === 'blocked');
    
    return matchesSearch && matchesPurpose && matchesSafety;
  });

  const getSafetyBadgeStyle = (status: string) => {
    switch (status) {
      case 'blocked':
        return 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
      case 'warning':
        return 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30';
      case 'caution':
        return 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
      case 'safe':
      default:
        return 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
    }
  };

  const getSafetyText = (status: string) => {
    switch (status) {
      case 'blocked': return '생성 불가';
      case 'warning': return '수정 권고';
      case 'caution': return '주의 필요';
      case 'safe':
      default: return '안전성 합격';
    }
  };

  const getPurposeName = (id: string) => {
    const found = PURPOSE_PRESETS.find(p => p.id === id);
    return found ? found.name : '기타 자유양식';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-6 shadow-sm" id="saved-prompts-manager">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-sm font-bold tracking-tight uppercase text-slate-950 dark:text-white flex items-center gap-2">
            <RefreshCw size={14} />
            저장된 프롬프트 보관함
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">LocalStorage에 자동/수동 저장된 개인 맞춤 프롬프트 리스트입니다.</p>
        </div>
        {prompts.length > 0 && (
          <button 
            onClick={() => {
              if(confirm('모든 프롬프트를 보관함에서 삭제하시겠습니까? (되돌릴 수 없습니다)')) {
                savePromptsList([]);
              }
            }}
            className="text-xs text-red-600 hover:text-red-700 font-bold px-3 py-1.5 rounded border border-red-200 dark:border-red-950/40 hover:bg-red-50/50 self-start sm:self-center cursor-pointer"
          >
            전체 비우기
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="제목, 작업내용, 역할 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white rounded border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-slate-950 dark:focus:border-white focus:ring-0"
          />
        </div>

        {/* Purpose Filter */}
        <div className="relative">
          <select
            value={selectedPurpose}
            onChange={(e) => setSelectedPurpose(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white rounded border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-slate-950 dark:focus:border-white focus:ring-0 cursor-pointer appearance-none"
          >
            <option value="all">📁 모든 목적 필터</option>
            {PURPOSE_PRESETS.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Safety Filter */}
        <div className="relative">
          <select
            value={selectedSafety}
            onChange={(e) => setSelectedSafety(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white rounded border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-slate-950 dark:focus:border-white focus:ring-0 cursor-pointer appearance-none"
          >
            <option value="all">🛡️ 모든 안전성 상태</option>
            <option value="safe">✅ 안전성 합격</option>
            <option value="caution">⚠️ 주의 필요</option>
            <option value="warning">🍊 수정 권고</option>
            <option value="blocked">🚨 생성 불가</option>
          </select>
        </div>
      </div>

      {/* Prompts list */}
      {filteredPrompts.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded bg-slate-50/50 dark:bg-slate-950/10">
          <Folder size={24} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {prompts.length === 0 ? '저장된 프롬프트가 아직 없습니다.' : '조건에 맞는 프롬프트가 없습니다.'}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">단계별 설계 완료 후 보관함에 저장해 보세요!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredPrompts.map(p => (
            <div
              key={p.id}
              className="group relative p-5 bg-slate-50 hover:bg-white dark:bg-slate-900/40 dark:hover:bg-slate-800/80 rounded border border-slate-200 dark:border-slate-800 hover:border-slate-350 transition-colors duration-150 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[9px] font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded uppercase">
                    {getPurposeName(p.purpose)}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={`text-[9px] font-bold border px-2 py-0.5 rounded ${getSafetyBadgeStyle(p.safetyStatus)}`}>
                      {getSafetyText(p.safetyStatus)}
                    </span>
                    <span className="text-[9px] bg-slate-950 text-white dark:bg-white dark:text-slate-950 px-2 py-0.5 rounded font-mono font-bold">
                      {p.qualityScore}점
                    </span>
                  </div>
                </div>

                {editingId === p.id ? (
                  <form onSubmit={(e) => handleSaveTitle(p.id, e)} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-bold focus:outline-none"
                      autoFocus
                    />
                    <button type="submit" className="text-[10px] bg-slate-950 text-white dark:bg-white dark:text-slate-950 px-2.5 py-1.5 rounded font-bold cursor-pointer">저장</button>
                    <button type="button" onClick={() => setEditingId(null)} className="text-[10px] text-slate-400 px-2 py-1 cursor-pointer">취소</button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2 group/title mb-1.5">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs cursor-pointer line-clamp-1">
                      {p.title}
                    </h3>
                    <button
                      onClick={(e) => handleStartEditing(p.id, p.title, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-950 dark:hover:text-white rounded transition-all shrink-0 cursor-pointer"
                    >
                      <Edit2 size={11} />
                    </button>
                  </div>
                )}

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {p.promptData.task || p.promptData.goal || '세부 작업이 기재되지 않은 프롬프트입니다.'}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800/60 pt-3 mt-2 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                <span>{p.createdAt}</span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => handleCopyPromptText(p.promptData.task, e)}
                    className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded transition-all cursor-pointer"
                    title="프롬프트 복사"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={(e) => handleDuplicate(p, e)}
                    className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded transition-all cursor-pointer"
                    title="복제하기"
                  >
                    <Layers size={12} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(p.id, e)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded transition-all cursor-pointer"
                    title="삭제"
                  >
                    <Trash2 size={12} />
                  </button>
                  <button
                    onClick={() => onLoadPrompt(p.promptData)}
                    className="flex items-center gap-1 bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 px-2.5 py-1 rounded font-bold transition-all cursor-pointer"
                  >
                    <PlayCircle size={11} />
                    수정하기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
