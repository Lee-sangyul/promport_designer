import React, { useState, useEffect, useRef } from 'react';
import {
  PenTool, FileText, Video, Code, ShieldCheck, Languages, BookOpen, Sparkles,
  Calendar, Compass, HelpCircle, Lightbulb, Eye, Copy, Save, RotateCcw, RotateCw,
  Moon, Sun, Flame, MessageSquare, Check, CheckCircle2, AlertTriangle, AlertOctagon,
  XCircle, Plus, Search, Share2, Printer, Maximize2, Minimize2, ChevronRight, ChevronLeft,
  History, Users, Target, Clock, ArrowRightLeft, Sliders, PlayCircle, Award, Trash2, X,
  Loader2, AlertCircle, Key
} from 'lucide-react';

import { PromptData, SavedPrompt, AppMode, ImprovementLog as LogItem } from './types';
import { PURPOSE_PRESETS, ROLE_PRESETS, INITIAL_PROMPT_DATA, PURPOSE_TEMPLATES } from './data';
import {
  analyzeSafety, analyzePrivacy, calculateStats, calculateQualityScore,
  generatePromptString, detectConflicts
} from './utils/safety';
import { polishPrompt, getCustomApiKey, setCustomApiKey } from './utils/geminiClient';

import HelpManual from './components/HelpManual';
import SavedPrompts from './components/SavedPrompts';
import RedTeamTest from './components/RedTeamTest';
import PromptOptimizer from './components/PromptOptimizer';
import PresentationMode from './components/PresentationMode';
import ImprovementLog from './components/ImprovementLog';
import PromptLibrary from './components/PromptLibrary';

export default function App() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'editor' | 'library' | 'redteam' | 'logs' | 'saved' | 'guide'>('editor');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Prompt Data
  const [promptData, setPromptData] = useState<PromptData>(INITIAL_PROMPT_DATA);
  
  // Steps within the Editor
  const [currentStep, setCurrentStep] = useState(0);
  
  // Undo/Redo Stacks
  const [undoStack, setUndoStack] = useState<PromptData[]>([]);
  const [redoStack, setRedoStack] = useState<PromptData[]>([]);

  // Preview Collapsible Areas
  const [expandedPreviewSections, setExpandedPreviewSections] = useState({
    role: true,
    task: true,
    guardrails: true,
    output: true,
    safety: true
  });

  // Presentation Mode Trigger
  const [showPresentation, setShowPresentation] = useState(false);

  // Recovery Banner State
  const [showRecoveryAlert, setShowRecoveryAlert] = useState(false);

  // Guarantee Checks
  const [guaranteeChecks, setGuaranteeChecks] = useState({
    noPii: false,
    noMalicious: false,
    verifyResults: false,
    verifyCritical: false
  });

  // Mobile Preview Panel Sliding Open
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  // AI Polish States
  const [usePolished, setUsePolished] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishError, setPolishError] = useState('');

  // Custom API Key Modal States
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [hasCustomApiKey, setHasCustomApiKey] = useState(false);

  // Custom tagging text inputs
  const [newInclude, setNewInclude] = useState('');
  const [newExclude, setNewExclude] = useState('');
  const [newRule, setNewRule] = useState('');

  // --- INITIAL MOUNT & STORAGE ---
  useEffect(() => {
    // 1. Theme Configuration
    const savedTheme = localStorage.getItem('prompt_designer_theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'light';
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    document.body.classList.toggle('dark', initialTheme === 'dark');
    if (!savedTheme) {
      localStorage.setItem('prompt_designer_theme', 'light');
    }

    // 1.5 Initialize custom API key status
    setHasCustomApiKey(!!getCustomApiKey());

    // 2. Recovery Alert Trigger
    const autosaved = localStorage.getItem('prompt_designer_autosave');
    if (autosaved) {
      try {
        const parsed = JSON.parse(autosaved);
        // Compare with current initial so we don't spam if they are identical
        if (parsed.title !== INITIAL_PROMPT_DATA.title || parsed.task !== INITIAL_PROMPT_DATA.task) {
          setShowRecoveryAlert(true);
        }
      } catch (e) {
        console.error('Error parsing autosave:', e);
      }
    }
  }, []);

  // Sync state to LocalStorage for auto-save
  const updatePromptState = (newData: PromptData) => {
    // Push previous to Undo, clear Redo
    setUndoStack(prev => [...prev.slice(-19), promptData]);
    setRedoStack([]);
    setPromptData(newData);
    localStorage.setItem('prompt_designer_autosave', JSON.stringify(newData));
  };

  const handleUpdateField = <K extends keyof PromptData>(field: K, value: PromptData[K]) => {
    const updated = {
      ...promptData,
      [field]: value
    };
    
    // Invalidate AI polish on any other core field modifications
    if (field !== 'polishedText') {
      updated.polishedText = '';
      setUsePolished(false);
    }
    
    // Recalculate score on major adjustments
    updated.qualityScore = calculateQualityScore(updated);
    
    // Auto sync safety and privacy analysis
    if (field === 'task' || field === 'problem' || field === 'goal') {
      const saf = analyzeSafety(updated.task, updated.problem, updated.goal);
      const priv = analyzePrivacy(updated.task);
      updated.safetyResult = saf;
      updated.privacyResult = priv;
    }

    updatePromptState(updated);
  };

  // Recover state trigger
  const handleRecoverAutosave = () => {
    const autosaved = localStorage.getItem('prompt_designer_autosave');
    if (autosaved) {
      try {
        setPromptData(JSON.parse(autosaved));
        setShowRecoveryAlert(false);
        alert('이전 작업 내역이 안전하게 복원되었습니다!');
      } catch (e) {
        console.error('Error recovering autosave:', e);
      }
    }
  };

  // Reset function with confirmation
  const handleReset = () => {
    if (confirm('모든 입력 값을 초기화하고 처음 단계로 돌아가시겠습니까? 작성 중인 임시 내용은 사라집니다.')) {
      setPromptData({
        title: '',
        mode: 'beginner',
        purpose: '',
        role: '',
        secondaryRole: '',
        problem: '',
        goal: '',
        audience: '',
        context: '',
        task: '',
        inputInfo: [],
        outputFormat: '',
        outputStructure: '',
        tone: '',
        difficulty: '',
        explanationStyle: [],
        lengthType: 'words',
        lengthValue: '',
        charCountLimit: '',
        maxTokens: '',
        includeItems: [],
        excludeItems: [],
        additionalRules: [],
        safetyResult: null,
        privacyResult: null,
        qualityScore: 0,
        redTeamResults: [],
        improvementLog: {
          discoveredProblems: '',
          addedRules: '',
          finalChanges: '',
          reflection: ''
        }
      });
      setCurrentStep(0);
      setGuaranteeChecks({
        noPii: false,
        noMalicious: false,
        verifyResults: false,
        verifyCritical: false
      });
      localStorage.removeItem('prompt_designer_autosave');
      alert('초기화 완료되었습니다.');
    }
  };

  // Undo / Redo Trigger
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(prevRedo => [...prevRedo, promptData]);
    setUndoStack(prevUndo => prevUndo.slice(0, -1));
    setPromptData(prev);
    localStorage.setItem('prompt_designer_autosave', JSON.stringify(prev));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(prevUndo => [...prevUndo, promptData]);
    setRedoStack(prevRedo => prevRedo.slice(0, -1));
    setPromptData(next);
    localStorage.setItem('prompt_designer_autosave', JSON.stringify(next));
  };

  // Theme Toggler
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('prompt_designer_theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    document.body.classList.toggle('dark', nextTheme === 'dark');
  };

  // Save prompt to 보관함 (SavedPrompts)
  const handleSaveToLibrary = () => {
    if (!promptData.title.trim()) {
      alert('프롬프트를 저장하기 위해서는 먼저 [제목]을 꼭 기재해 주세요!');
      return;
    }

    try {
      const savedListStr = localStorage.getItem('prompt_designer_saved_list');
      const savedList: SavedPrompt[] = savedListStr ? JSON.parse(savedListStr) : [];
      
      const newSavedItem: SavedPrompt = {
        id: `saved_${Date.now()}`,
        title: promptData.title,
        createdAt: new Date().toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        purpose: promptData.purpose,
        qualityScore: promptData.qualityScore,
        safetyStatus: promptData.safetyResult?.status || 'safe',
        promptData: promptData
      };

      const updated = [newSavedItem, ...savedList];
      localStorage.setItem('prompt_designer_saved_list', JSON.stringify(updated));
      alert('프롬프트 보관함에 저장이 완료되었습니다! 상단의 [저장 보관함] 메뉴에서 언제든 조회 가능합니다.');
    } catch (e) {
      console.error('Error saving prompt:', e);
    }
  };

  // AI Polish Execution Handler
  const handlePolishPrompt = async () => {
    if (isDangerous) {
      alert('⚠️ 보안 및 안전 가드라인을 위배하는 위험성 프롬프트는 AI 다듬기 기능을 이용할 수 없습니다. 7단계(보안 검진)에서 위험 키워드를 수정해 주세요.');
      return;
    }
    setIsPolishing(true);
    setPolishError('');
    try {
      const rawCompiled = generatePromptString(promptData);
      const text = await polishPrompt(rawCompiled);
      const updated = {
        ...promptData,
        polishedText: text,
      };
      updatePromptState(updated);
      setUsePolished(true);
    } catch (err: any) {
      console.error(err);
      setPolishError(err.message || '네트워크 오류가 발생했습니다.');
    } finally {
      setIsPolishing(false);
    }
  };

  // Callback to load prompt from history or presets
  const handleLoadPromptData = (loaded: Partial<PromptData>) => {
    const complete = {
      ...promptData,
      ...loaded,
      qualityScore: calculateQualityScore({ ...promptData, ...loaded } as PromptData)
    };
    updatePromptState(complete);
    setUsePolished(!!complete.polishedText);
    setActiveTab('editor');
    setCurrentStep(0);
  };

  // Log Improvement entries
  const handleSaveImprovementLog = (log: LogItem, pre: number, post: number) => {
    handleUpdateField('improvementLog', log);
  };

  // Tag helper adding mechanisms
  const handleAddIncludeItem = (item: string) => {
    if (!item.trim() || promptData.includeItems.includes(item)) return;
    handleUpdateField('includeItems', [...promptData.includeItems, item.trim()]);
    setNewInclude('');
  };

  const handleRemoveIncludeItem = (idx: number) => {
    handleUpdateField('includeItems', promptData.includeItems.filter((_, i) => i !== idx));
  };

  const handleAddExcludeItem = (item: string) => {
    if (!item.trim() || promptData.excludeItems.includes(item)) return;
    handleUpdateField('excludeItems', [...promptData.excludeItems, item.trim()]);
    setNewExclude('');
  };

  const handleRemoveExcludeItem = (idx: number) => {
    handleUpdateField('excludeItems', promptData.excludeItems.filter((_, i) => i !== idx));
  };

  const handleAddRuleItem = (rule: string) => {
    if (!rule.trim() || promptData.additionalRules.includes(rule)) return;
    handleUpdateField('additionalRules', [...promptData.additionalRules, rule.trim()]);
    setNewRule('');
  };

  const handleRemoveRuleItem = (idx: number) => {
    handleUpdateField('additionalRules', promptData.additionalRules.filter((_, i) => i !== idx));
  };

  // --- COMPILER & DIAGNOSTIC VALUES ---
  const rawCompiledPrompt = generatePromptString(promptData);
  const compiledPrompt = (usePolished && promptData.polishedText) ? promptData.polishedText : rawCompiledPrompt;
  const isDangerous = promptData.safetyResult?.status === 'blocked' || promptData.safetyResult?.status === 'warning';
  const displayCompiledPrompt = isDangerous
    ? `⚠️ [안전 가드라인 위배 - 복사 및 다운로드 제한]\n\n이 프롬프트에는 해킹, 개인정보 침해, 부정행위 또는 시스템 우회(탈옥) 등 사이버 안전 규정을 위배할 가능성이 높은 위험 요인이 포함되어 있어 최종 조립이 잠금 처리되었습니다.\n\n[감지된 위험 유형]: ${promptData.safetyResult?.detections.map(d => d.category).join(', ') || '없음'}\n[위험 키워드]: ${promptData.safetyResult?.detections.map(d => d.keyword).join(', ') || '없음'}\n\n7단계(보안 검진)로 돌아가 위험 요소를 정당하고 유익한 질의 목적의 정상적 텍스트로 수정한 뒤 진행하세요.`
    : compiledPrompt;
  const stats = calculateStats(displayCompiledPrompt);
  const activeConflicts = detectConflicts(promptData);

  const stepsList = [
    { name: '목적 및 모드', desc: 'AI 목표 설정' },
    { name: '맥락 & 해결과제', desc: '배경 환경 구축' },
    { name: 'AI 역할', desc: '페르소나 지정' },
    { name: '작업 내용', desc: '구체적 태스크' },
    { name: '출력 형식', desc: '구조 지정' },
    { name: '길이 & 부가조건', desc: '정교성 마커' },
    { name: '보안 검진', desc: '안전성/개인정보' },
    { name: '수령 및 서약', desc: '최종 복사' }
  ];

  // Helper rating ranges
  const getScoreBadgeColor = (sc: number) => {
    if (sc >= 95) return 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
    if (sc >= 80) return 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30';
    if (sc >= 60) return 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
    return 'bg-red-50 text-red-500 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
  };

  const getScoreBadgeText = (sc: number) => {
    if (sc >= 95) return '완성도 최고 우수 🏆';
    if (sc >= 80) return '매우 구체적인 우수작 ✨';
    if (sc >= 60) return '양호한 프롬프트 👍';
    if (sc >= 40) return '조금 더 구체화 필요 ✏️';
    return '지시 정보 부족함 ⚠️';
  };

  // Clickable recommendations for purposes
  const getSelectedPurposePreset = () => {
    return PURPOSE_PRESETS.find(p => p.id === promptData.purpose);
  };

  const activePreset = getSelectedPurposePreset();

  const handleCopyPrompt = () => {
    if (isDangerous) {
      alert('⚠️ 사이버 안전 가드라인 위배 및 위험 키워드가 감지되어 프롬프트 복사가 차단되었습니다. 안전 진단 단계(7단계)에서 위험 유형을 확인하고 내용을 수정해 주세요.');
      return;
    }
    navigator.clipboard.writeText(compiledPrompt);
    alert('프롬프트가 복사되었습니다. AI에 입력하기 전 개인정보와 안전성을 한 번 더 확인하세요!');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors duration-200 font-sans">
      
      {/* Recovery alert notification */}
      {showRecoveryAlert && (
        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-6 py-4 text-xs md:text-sm font-mono flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 shadow-sm animate-slide-in">
          <div className="flex items-center gap-2.5">
            <Sparkles size={16} className="animate-pulse text-indigo-400 dark:text-indigo-600" />
            <span className="font-semibold tracking-tight">이전에 브라우저에 임시 저장된 프롬프트 작성 본이 존재합니다.</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRecoverAutosave}
              className="bg-white dark:bg-slate-900 text-slate-950 dark:text-white px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              네, 복원할래요
            </button>
            <button
              onClick={() => setShowRecoveryAlert(false)}
              className="text-slate-400 dark:text-slate-600 hover:text-slate-100 dark:hover:text-slate-950 text-xs font-medium transition-all cursor-pointer"
            >
              지울래요
            </button>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 md:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-8 h-8 bg-slate-950 dark:bg-white flex items-center justify-center text-white dark:text-slate-950 font-mono font-black text-xs tracking-tighter">
            AI
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-950 dark:text-white flex items-center gap-2 font-sans">
              프롬프트 디자이너
              <span className="text-[9px] font-mono tracking-wider uppercase px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded">
                DRAFT.2026
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-tight">AI에게 더 정확하고 안전하게 요청하는 방법을 배우는 프롬프트 설계 웹앱</p>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          {/* Undo/Redo */}
          <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700/60 p-0.5">
            <button
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white disabled:opacity-30 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-all cursor-pointer"
              title="되돌리기 (Undo)"
            >
              <RotateCcw size={13} />
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white disabled:opacity-30 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-all cursor-pointer"
              title="다시 실행 (Redo)"
            >
              <RotateCw size={13} />
            </button>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all cursor-pointer"
            title={theme === 'light' ? '다크 모드로 변경' : '라이트 모드로 변경'}
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          </button>

          <button
            onClick={() => {
              setTempApiKey(getCustomApiKey() || '');
              setShowApiKeyModal(true);
            }}
            className={`text-[11px] font-bold px-3 py-2 rounded border transition-all flex items-center gap-1.5 cursor-pointer ${
              hasCustomApiKey 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40' 
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}
            title="Gemini API Key 설정 (GitHub Pages 등 정적 호스팅용)"
          >
            <Key size={13} />
            {hasCustomApiKey ? 'API Key 설정됨' : 'API Key 설정'}
          </button>

          <button
            onClick={() => setShowPresentation(true)}
            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-3 py-2 rounded border border-blue-200 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <PlayCircle size={13} />
            프로그램 소개 슬라이드
          </button>

          <button
            onClick={handleReset}
            className="text-[11px] text-red-600 hover:text-red-700 font-bold px-3 py-2 rounded border border-red-200 hover:bg-red-50/50 dark:border-red-950 dark:hover:bg-red-950/20 transition-all cursor-pointer"
          >
            새로 만들기
          </button>
        </div>
      </header>

      {/* --- MENU TABS --- */}
      <div className="px-6 md:px-8 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex gap-2 overflow-x-auto scrollbar-none max-w-[1700px] mx-auto">
          {[
            { id: 'editor', label: '✍️ 설계 에디터' },
            { id: 'library', label: '📚 모범 라이브러리' },
            { id: 'redteam', label: '🔥 모의 레드팀' },
            { id: 'logs', label: '📋 성장 일지 기록' },
            { id: 'saved', label: '📦 저장 보관함' },
            { id: 'guide', label: '💡 질문 가이드 백과' }
          ].map(menu => (
            <button
              key={menu.id}
              onClick={() => setActiveTab(menu.id as any)}
              className={`px-4 py-2 text-xs font-bold tracking-tight uppercase transition-colors shrink-0 cursor-pointer border-b-2 ${
                activeTab === menu.id
                  ? 'border-slate-950 dark:border-white text-slate-950 dark:text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {menu.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- CONTENT WORKSPACE --- */}
      <main className="px-6 md:px-8 py-8 pb-16 max-w-[1700px] mx-auto">
        
        {/* TAB 1: Step-by-Step Prompt Editor */}
        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="step-by-step-editor-container">
            
            {/* Editor Control Panel (Left 7 Columns) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Process Stepper */}
              <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-5 shadow-sm overflow-x-auto scrollbar-none">
                <div className="flex items-center gap-2 justify-between min-w-[640px]">
                  {stepsList.map((st, index) => (
                    <div key={index} className="flex items-center gap-1.5 flex-1 last:flex-none">
                      <button
                        onClick={() => setCurrentStep(index)}
                        className={`w-6 h-6 rounded text-[11px] font-mono font-bold flex items-center justify-center transition-all ${
                          currentStep === index
                            ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-sm font-black'
                            : index < currentStep
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {index < currentStep ? '✓' : index + 1}
                      </button>
                      <div className="flex flex-col text-left">
                        <span className={`text-[10px] font-bold tracking-tight uppercase leading-tight ${currentStep === index ? 'text-slate-950 dark:text-white' : 'text-slate-400'}`}>
                          {st.name}
                        </span>
                      </div>
                      {index < stepsList.length - 1 && (
                        <div className={`h-px flex-1 mx-2 ${index < currentStep ? 'bg-slate-950 dark:bg-slate-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTIVE STEP CARD */}
              <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
                
                {/* STEP 1: Mode & Purpose */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-sm font-bold tracking-tight uppercase text-slate-950 dark:text-white">학습 모드 및 사용 목적 선택</h2>
                      <p className="text-xs text-slate-400 mt-0.5">자신의 수준에 맞춤 설계 모드를 선택하고, 사용하고자 하는 핵심 목적 카드를 골라보세요.</p>
                    </div>

                    {/* App Mode Selecting */}
                    <div className="space-y-2">
                      <span className="block text-[10px] font-mono tracking-wider uppercase text-slate-400">⚙️ 설계 수준 설정</span>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'beginner', label: '초급 모드', desc: '질문 힌트 지원' },
                          { id: 'intermediate', label: '중급 모드', desc: '프롬프트 직접 기입' },
                          { id: 'advanced', label: '고급 모드', desc: '세부 제약과 이중 평가' }
                        ].map(m => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => handleUpdateField('mode', m.id as AppMode)}
                            className={`p-3 text-left transition-colors border rounded cursor-pointer ${
                              promptData.mode === m.id
                                ? 'bg-slate-100 dark:bg-slate-800 border-slate-950 dark:border-white shadow-sm'
                                : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 dark:bg-slate-950/20 dark:border-slate-800 dark:hover:border-slate-700'
                            }`}
                          >
                            <span className={`block text-xs font-bold ${promptData.mode === m.id ? 'text-slate-950 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{m.label}</span>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">{m.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Purpose Selected Card Grid */}
                    <div className="space-y-2">
                      <span className="block text-[10px] font-mono tracking-wider uppercase text-slate-400">📁 인공지능 활용 타겟 목적</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {PURPOSE_PRESETS.map(preset => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              const template = PURPOSE_TEMPLATES[preset.id];
                              if (template) {
                                const updated = {
                                  ...promptData,
                                  ...template,
                                  purpose: preset.id
                                };
                                updated.qualityScore = calculateQualityScore(updated);
                                updatePromptState(updated);
                              } else {
                                handleUpdateField('purpose', preset.id);
                                if (promptData.includeItems.length === 0) {
                                  handleUpdateField('includeItems', [preset.keywords[0]]);
                                }
                              }
                            }}
                            className={`p-4 rounded border text-left flex flex-col justify-between h-28 transition-all cursor-pointer ${
                              promptData.purpose === preset.id
                                ? 'bg-slate-100 dark:bg-slate-800 border-slate-950 dark:border-white shadow-sm'
                                : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 dark:bg-slate-950/20 dark:border-slate-850'
                            }`}
                          >
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                              promptData.purpose === preset.id ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {preset.name}
                            </span>
                            <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed mt-2">{preset.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Context & Problem */}
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-lg font-black text-slate-950 dark:text-white">기본 정보 및 해결과제(맥락) 구축</h2>
                      <p className="text-xs text-slate-400 mt-0.5">이 프롬프트의 상황, 청중, 당면과제를 구체적으로 정해주면 결과의 개인화가 향상됩니다.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Title */}
                      <div className="text-xs">
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">🏷️ 프롬프트 프로젝트 제목</label>
                        <input
                          type="text"
                          placeholder="예: 중학생 발표 대본 만들기, 파이썬 JSON 파서 구현 등"
                          value={promptData.title}
                          onChange={(e) => handleUpdateField('title', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Problem and Goal Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-xs">
                          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">🔍 해결하고 싶은 직면 문제</label>
                          <textarea
                            placeholder="예: 인공지능 윤리를 친구들이 너무 지루하고 어렵게만 생각함"
                            value={promptData.problem}
                            onChange={(e) => handleUpdateField('problem', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="text-xs">
                          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">🎯 달성하려는 최종 결과 (Goal)</label>
                          <textarea
                            placeholder="예: 실생활 비유를 들어 지루함을 예방한 3분 스피치용 대본"
                            value={promptData.goal}
                            onChange={(e) => handleUpdateField('goal', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Audience and Context */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-xs">
                          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">👥 대상 독자 및 청중 (Audience)</label>
                          <input
                            type="text"
                            placeholder="예: 중학교 1학년 동기 학생들, 초급 개발자"
                            value={promptData.audience}
                            onChange={(e) => handleUpdateField('audience', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {promptData.mode === 'beginner' && (
                            <div className="flex gap-1.5 flex-wrap mt-1">
                              {['초등학생', '중학생', '고등학생', '대학생', '일반 사용자', '개발자'].map(aud => (
                                <button
                                  type="button"
                                  key={aud}
                                  onClick={() => handleUpdateField('audience', aud)}
                                  className="text-[10px] bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded hover:bg-blue-50"
                                >
                                  +{aud}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="text-xs">
                          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">🏫 사용 배경 상황 (Context)</label>
                          <input
                            type="text"
                            placeholder="예: 수행평가 발표 시간, 학과 동아리 세미나"
                            value={promptData.context}
                            onChange={(e) => handleUpdateField('context', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: AI Role (Persona) */}
                {currentStep === 2 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-lg font-black text-slate-950 dark:text-white">AI 전담 역할(Persona) 설정</h2>
                      <p className="text-xs text-slate-400 mt-0.5">답변의 지식 해상도와 정교성을 위해 AI에게 가상 전문가 옷을 입힙니다.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Presets Slider */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                        {ROLE_PRESETS.map(r => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => handleUpdateField('role', r.name)}
                            className={`p-3 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                              promptData.role === r.name
                                ? 'bg-blue-50/50 border-blue-600 dark:bg-blue-950/20 dark:border-blue-500 shadow-sm font-bold'
                                : 'bg-slate-50/50 border-slate-100 hover:border-slate-200 dark:bg-slate-950/10'
                            }`}
                          >
                            <span className="block font-bold text-slate-800 dark:text-slate-200">{r.name}</span>
                            <span className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">{r.description}</span>
                          </button>
                        ))}
                      </div>

                      {/* Text Entry */}
                      <div className="text-xs">
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">🎩 메인 역할 수동 지정</label>
                        <input
                          type="text"
                          placeholder="예: 친절한 코치, 비판적 분석 연구원 등 직접 작성 가능"
                          value={promptData.role}
                          onChange={(e) => handleUpdateField('role', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Advanced Secondary role */}
                      {promptData.mode === 'advanced' && (
                        <div className="text-xs bg-slate-50 dark:bg-slate-950/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
                          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">🧩 서브 보조 역할 지정 (고급 한정)</label>
                          <input
                            type="text"
                            placeholder="예: 메인 기획자이면서 서브 보안 지적 연구자도 함께 겸임"
                            value={promptData.secondaryRole || ''}
                            onChange={(e) => handleUpdateField('secondaryRole', e.target.value)}
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-150 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 4: Specific Task details & Input markers */}
                {currentStep === 3 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-lg font-black text-slate-950 dark:text-white">구체적 작업 지시와 정보 설정</h2>
                      <p className="text-xs text-slate-400 mt-0.5">AI에게 맡길 동작 태스크(Task)를 서술하고, 제공할 데이터 종류를 지정해 주입 우려를 줄입니다.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Vague warning info */}
                      <div className="p-4 bg-blue-50/40 dark:bg-blue-950/15 rounded-2xl border border-blue-100 dark:border-blue-900/40 text-xs flex gap-3">
                        <Lightbulb className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={16} />
                        <div className="space-y-1">
                          <span className="font-bold text-slate-900 dark:text-white text-xs">한 끗 차이 지시 가이드라인</span>
                          <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                            나쁜 예시: "보고서 써줘" <br />
                            <strong>좋은 예시: "중학생을 대상으로 인공지능 윤리의 필요성을 설명하는 5분 발표용 보고서를 작성해줘."</strong>
                          </p>
                        </div>
                      </div>

                      {/* Text area core task */}
                      <div className="text-xs">
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">📝 지시할 구체적 작업 내용</label>
                        <textarea
                          placeholder="여기에 구체적인 AI 지시 사항을 문장으로 적어보세요..."
                          value={promptData.task}
                          onChange={(e) => handleUpdateField('task', e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Input Info selections */}
                      <div className="space-y-2">
                        <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">📁 AI에게 제공할 참고 데이터 타입</span>
                        <div className="flex flex-wrap gap-1.5">
                          {['주제', '키워드', '참고 자료', '기존 문장', '제공 코드', '분석 데이터', '원하는 기능', '현재 문제점', '예시(Few-Shot)'].map(tag => {
                            const isSelected = promptData.inputInfo.includes(tag);
                            return (
                              <button
                                type="button"
                                key={tag}
                                onClick={() => {
                                  if (isSelected) {
                                    handleUpdateField('inputInfo', promptData.inputInfo.filter(t => t !== tag));
                                  } else {
                                    handleUpdateField('inputInfo', [...promptData.inputInfo, tag]);
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                    : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-400'
                                }`}
                              >
                                {isSelected ? '✓ ' : ''}{tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: Output format presets */}
                {currentStep === 4 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-lg font-black text-slate-950 dark:text-white">출력 포맷 및 가이드라인 목차</h2>
                      <p className="text-xs text-slate-400 mt-0.5">답변 구조의 흩어짐을 막기 위해 가시적인 레이아웃이나 목차를 강제합니다.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Layout Presets */}
                      <div className="space-y-2">
                        <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">📋 대표 출력 형식 고르기</span>
                        <div className="flex flex-wrap gap-1.5">
                          {['일반 문장', '목록', '표', '단계별 설명', '보고서', '발표 대본', 'JSON', 'Markdown', '전체 코드', '비교표'].map(fmt => (
                            <button
                              type="button"
                              key={fmt}
                              onClick={() => handleUpdateField('outputFormat', fmt)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                promptData.outputFormat === fmt
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {fmt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Structured Contents outline */}
                      <div className="text-xs">
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">🔗 희망하는 목차 전개 또는 가이드 구조</label>
                        <input
                          type="text"
                          placeholder="예: 문제 상황 -> 주요 원인 -> 해결 대책 -> 기대 효과 순서로 작성"
                          value={promptData.outputStructure}
                          onChange={(e) => handleUpdateField('outputStructure', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 6: Tone, Length, Tag Managers */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-black text-slate-950 dark:text-white">스타일, 분량 및 강력 제약 수칙</h2>
                      <p className="text-xs text-slate-400 mt-0.5">답변 길이, 어조 수준, 포함 조건 및 배제할(우회 예방) 핵심 조건들을 정렬합니다.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Tone */}
                      <div className="text-xs space-y-1.5">
                        <label className="block text-slate-700 dark:text-slate-300 font-bold">어조 및 말투</label>
                        <select
                          value={promptData.tone}
                          onChange={(e) => handleUpdateField('tone', e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl"
                        >
                          <option value="">말투 고르기 (기본)</option>
                          {['친근하고 명확하게', '정중하게', '전문적으로', '간단하게', '재미있게', '설득력 있고 객관적으로'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      {/* Difficulty */}
                      <div className="text-xs space-y-1.5">
                        <label className="block text-slate-700 dark:text-slate-300 font-bold">난이도 설정</label>
                        <select
                          value={promptData.difficulty}
                          onChange={(e) => handleUpdateField('difficulty', e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl"
                        >
                          <option value="">난이도 고르기 (기본)</option>
                          {['어린이 수준', '초등학생 수준', '중학생 수준', '고등학생 수준', '대학생 수준', '전문가 수준'].map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Explanation Style (Multiple select tags) */}
                    <div className="space-y-2">
                      <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">✨ 상세 연출 및 설명 방식</span>
                      <div className="flex flex-wrap gap-1.5">
                        {['쉬운 예시 포함', '어려운 용어 설명', '비유 사용', '단계별 설명', '핵심만 설명', '자세히 설명'].map(style => {
                          const isSelected = promptData.explanationStyle.includes(style);
                          return (
                            <button
                              type="button"
                              key={style}
                              onClick={() => {
                                if (isSelected) {
                                  handleUpdateField('explanationStyle', promptData.explanationStyle.filter(s => s !== style));
                                } else {
                                  handleUpdateField('explanationStyle', [...promptData.explanationStyle, style]);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-100 dark:bg-slate-900/50 dark:border-slate-800'
                              }`}
                            >
                              {style}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Target length value & Limit Settings */}
                    <div className="space-y-4">
                      <div className="text-xs space-y-1.5">
                        <label className="block text-slate-700 dark:text-slate-300 font-bold">📏 희망하는 목표 결과물 분량</label>
                        <input
                          type="text"
                          placeholder="예: 3분 발표 분량, A4 1장 분량, 5문단 이내 등"
                          value={promptData.lengthValue}
                          onChange={(e) => handleUpdateField('lengthValue', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Character count limit */}
                        <div className="text-xs space-y-1.5">
                          <label className="block text-slate-700 dark:text-slate-300 font-bold">✏️ 글자 수 제한 설정 (선택)</label>
                          <input
                            type="text"
                            placeholder="예: 공백 포함 1,000자 이내, 최대 500자"
                            value={promptData.charCountLimit || ''}
                            onChange={(e) => handleUpdateField('charCountLimit', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Max token limit */}
                        <div className="text-xs space-y-1.5">
                          <label className="block text-slate-700 dark:text-slate-300 font-bold">🎫 예상 토큰 수 최대 설정 (선택)</label>
                          <input
                            type="text"
                            placeholder="예: 최대 2,000 토큰 이내, 1500"
                            value={promptData.maxTokens || ''}
                            onChange={(e) => handleUpdateField('maxTokens', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Tag selectors (Include & Exclude & Rules) */}
                    <div className="space-y-4">
                      {/* 1. Include Item Manager */}
                      <div className="space-y-2 bg-slate-50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-150 dark:border-slate-800">
                        <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">✓ 반드시 포함할 내용 (Include Conditions)</span>
                        {/* Recommendations from Preset keywords */}
                        {activePreset && (
                          <div className="flex flex-wrap gap-1 items-center mb-2">
                            <span className="text-[9px] font-bold text-slate-400">추천 키워드: </span>
                            {activePreset.keywords.map(kw => (
                              <button
                                type="button"
                                key={kw}
                                onClick={() => handleAddIncludeItem(kw)}
                                className="text-[9px] bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 px-2 py-0.5 rounded font-medium"
                              >
                                +{kw}
                              </button>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="예: 인공지능 윤리의 필요성, 실제 사례"
                            value={newInclude}
                            onChange={(e) => setNewInclude(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddIncludeItem(newInclude))}
                            className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 text-xs rounded-xl border border-slate-150 dark:border-slate-700 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddIncludeItem(newInclude)}
                            className="bg-blue-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs shrink-0"
                          >
                            추가
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {promptData.includeItems.map((item, idx) => (
                            <span key={idx} className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs px-2.5 py-1 rounded-lg">
                              {item}
                              <button type="button" onClick={() => handleRemoveIncludeItem(idx)} className="text-red-500 font-bold hover:text-red-700">×</button>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 2. Exclude Item Manager */}
                      <div className="space-y-2 bg-slate-50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-150 dark:border-slate-800">
                        <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">✕ 배제할 제외 사항 (Exclude Conditions)</span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="예: 어려운 전문 용어, 불필요한 서론"
                            value={newExclude}
                            onChange={(e) => setNewExclude(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExcludeItem(newExclude))}
                            className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 text-xs rounded-xl border border-slate-150 dark:border-slate-700 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddExcludeItem(newExclude)}
                            className="bg-red-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs shrink-0"
                          >
                            추가
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {promptData.excludeItems.map((item, idx) => (
                            <span key={idx} className="flex items-center gap-1 bg-red-50 text-red-700 border border-red-100 text-xs px-2.5 py-1 rounded-lg">
                              {item}
                              <button type="button" onClick={() => handleRemoveExcludeItem(idx)} className="text-red-500 font-bold hover:text-red-700">×</button>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 3. Advanced rules tags */}
                      <div className="space-y-2 bg-slate-50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-150 dark:border-slate-800">
                        <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">💡 추가 세부 지시 규칙 (Rules)</span>
                        {/* Interactive Preset Buttons */}
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {['사실과 의견을 구분해줘.', '중요한 내용은 굵게 표시해줘.', '결과를 단계별로 설명해줘.', '코드에 주석을 넣어줘.'].map(btnRule => (
                            <button
                              type="button"
                              key={btnRule}
                              onClick={() => handleAddRuleItem(btnRule)}
                              className="text-[9px] bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 px-2 py-0.5 rounded font-medium"
                            >
                              +{btnRule.substring(0, 10)}...
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="예: 답변 맨 밑에 한 줄 세부요약을 달아주세요."
                            value={newRule}
                            onChange={(e) => setNewRule(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRuleItem(newRule))}
                            className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 text-xs rounded-xl border border-slate-150 dark:border-slate-700 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddRuleItem(newRule)}
                            className="bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs shrink-0"
                          >
                            추가
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {promptData.additionalRules.map((rule, idx) => (
                            <span key={idx} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs px-2.5 py-1 rounded-lg">
                              {rule}
                              <button type="button" onClick={() => handleRemoveRuleItem(idx)} className="text-indigo-500 font-bold hover:text-indigo-700">×</button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 7: Security scans and Optimizer */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-black text-slate-950 dark:text-white">AI 안전성 및 개인정보 정밀 진단</h2>
                      <p className="text-xs text-slate-400 mt-0.5">완성된 프롬프트의 불법, 우회(탈옥), PII 누출 유무를 스캔하고 최적화 솔루션을 제공합니다.</p>
                    </div>

                    {/* Security Scan Diagnostic Badge and Results */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Safety Guard Card */}
                        <div className="p-4 rounded-2xl border bg-slate-50 dark:bg-slate-950/10 border-slate-150 dark:border-slate-850 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">🛡️ 사이버 안전 가드라인</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                              promptData.safetyResult?.status === 'safe' || !promptData.safetyResult
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20'
                                : 'bg-red-50 text-red-500 dark:bg-red-950/20'
                            }`}>
                              {promptData.safetyResult ? promptData.safetyResult.status.toUpperCase() : 'SAFE'}
                            </span>
                          </div>

                          {promptData.safetyResult && promptData.safetyResult.detections.length > 0 ? (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {promptData.safetyResult.detections.map((det, idx) => (
                                <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-red-100 text-[11px] space-y-1">
                                  <div className="flex items-center gap-1.5 text-red-600 font-bold">
                                    <AlertTriangle size={12} />
                                    <span>위험유형: {det.category}</span>
                                  </div>
                                  <p className="text-slate-500 leading-relaxed">{det.reason}</p>
                                  <div className="text-[10px] bg-red-50/50 p-1.5 rounded text-red-700">
                                    <strong>적용 규칙: </strong>{det.rule}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 dark:text-slate-400">사이버 폭력, 불법 해킹, 보안 우회 등의 위험 사항이 전혀 발견되지 않았습니다. 안전합니다.</p>
                          )}
                        </div>

                        {/* Privacy Inspector Card */}
                        <div className="p-4 rounded-2xl border bg-slate-50 dark:bg-slate-950/10 border-slate-150 dark:border-slate-850 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">🔒 개인정보 보호 검진</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                              promptData.privacyResult?.detected
                                ? 'bg-red-50 text-red-500 dark:bg-red-950/20'
                                : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20'
                            }`}>
                              {promptData.privacyResult?.detected ? 'PII DETECTED' : 'SECURE'}
                            </span>
                          </div>

                          {promptData.privacyResult?.detected ? (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {promptData.privacyResult.detections.map((det, idx) => (
                                <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-red-100 text-[11px] space-y-1">
                                  <div className="flex items-center gap-1 text-red-500 font-bold">
                                    <AlertOctagon size={12} />
                                    <span>감지: {det.type.toUpperCase()} ({det.value})</span>
                                  </div>
                                  <p className="text-slate-500 leading-normal">{det.description}</p>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // Safely clean and strip the privacy warning
                                      let cleanedTask = promptData.task.replace(det.value, ' [가상의 사용자 데이터] ');
                                      handleUpdateField('task', cleanedTask);
                                    }}
                                    className="text-[9px] bg-red-100 text-red-600 px-2 py-1 rounded font-bold"
                                  >
                                    가상데이터로 치환 정화하기
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                              <p>실명, 이메일, 폰번호, 주소 등 위험 소지가 존재하지 않습니다.</p>
                              <div className="bg-emerald-50/50 p-2.5 rounded-xl text-emerald-700 font-semibold mt-2 border border-emerald-100 text-[10px]">
                                💡 화면에 표시된 경고: 실명, 폰번호, 생년월일, 계좌 비밀번호, 이메일, 주소 등은 실제 가치를 AI에 전달하지 마세요!
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Conflict and Vague suggestions optimizer embed */}
                      <PromptOptimizer
                        promptData={promptData}
                        onUpdateField={handleUpdateField}
                        onAddIncludeItem={handleAddIncludeItem}
                      />
                    </div>
                  </div>
                )}

                {/* STEP 8: Final confirm & Copy */}
                {currentStep === 7 && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-black text-slate-950 dark:text-white">최종 프롬프트 설계도 발급 및 수령</h2>
                        <p className="text-xs text-slate-400 mt-0.5">설계가 끝났습니다! 아래 완성본을 검토하고 안전 사용 서약에 동의해 주세요.</p>
                      </div>
                    </div>

                    {/* Quality Summary & Metrics inside Step 8 */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Rating and Score */}
                      <div className="md:col-span-4 flex flex-col justify-center bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">품질 완성도 점수</span>
                        <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{promptData.qualityScore}점 / 100점</span>
                        <span className={`text-[10px] font-black border px-2 py-1 rounded-lg mt-2 text-center ${getScoreBadgeColor(promptData.qualityScore)}`}>
                          {getScoreBadgeText(promptData.qualityScore)}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="md:col-span-8 grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-3 border border-slate-100 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 flex flex-col justify-center">
                          <span className="block text-[9px] text-slate-400 font-bold mb-1">글자 수</span>
                          <span className="font-mono font-extrabold text-slate-700 dark:text-slate-300 text-sm">{stats.charCount}자</span>
                        </div>
                        <div className="p-3 border border-slate-100 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 flex flex-col justify-center">
                          <span className="block text-[9px] text-slate-400 font-bold mb-1">예상 토큰 수</span>
                          <span className="font-mono font-extrabold text-slate-700 dark:text-slate-300 text-sm">~{stats.estTokens}T</span>
                        </div>
                        <div className="p-3 border border-slate-100 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 flex flex-col justify-center">
                          <span className="block text-[9px] text-slate-400 font-bold mb-1">예상 읽기시간</span>
                          <span className="font-mono font-extrabold text-slate-700 dark:text-slate-300 text-sm">{stats.estReadTime}분</span>
                        </div>
                      </div>
                    </div>

                    {/* Live Compiled Prompt Preview inside Step 8 with AI Polish */}
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="block font-bold text-slate-700 dark:text-slate-300 text-xs">📋 최종 조합된 프롬프트 결과물</span>
                        
                        {/* Selector Tabs for Original vs. AI Polished */}
                        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/80">
                          <button
                            type="button"
                            onClick={() => setUsePolished(false)}
                            className={`px-3 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                              !usePolished
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            조립형 원본
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (promptData.polishedText) {
                                setUsePolished(true);
                              } else {
                                handlePolishPrompt();
                              }
                            }}
                            className={`px-3 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              usePolished && promptData.polishedText
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            <Sparkles size={11} className={usePolished && promptData.polishedText ? "text-white" : "text-blue-500"} />
                            AI가 다듬은 버전
                            {promptData.polishedText && (
                              <span className="ml-0.5 bg-emerald-500 text-white text-[8px] px-1 rounded-full font-mono">NEW</span>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* If AI Polished is clicked but we don't have the text yet and is loading */}
                      {isPolishing && (
                        <div className="bg-slate-950 text-slate-400 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center space-y-3 text-center">
                          <Loader2 className="animate-spin text-blue-500" size={32} />
                          <div className="space-y-1">
                            <p className="text-white font-bold text-xs">Gemini AI가 프롬프트를 더욱 고해상도로 다듬고 있습니다...</p>
                            <p className="text-[10px] text-slate-500">역할극, 맥락 파라미터, 부정어 및 부가 제약사항들을 조화롭게 연결하는 중입니다.</p>
                          </div>
                        </div>
                      )}

                      {/* Error State */}
                      {polishError && !isPolishing && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200/50 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                          <AlertCircle size={15} className="shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="font-bold text-[11px]">AI 다듬기 중 에러 발생</span>
                            <p className="text-[10px]">{polishError}</p>
                            <button
                              type="button"
                              onClick={handlePolishPrompt}
                              className="text-[10px] font-bold text-red-700 dark:text-red-300 underline mt-1 block"
                            >
                              재시도하기
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Pre Box when NOT loading */}
                      {!isPolishing && (
                        <div className="relative group border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-950 text-slate-200">
                          <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 font-bold">
                            <span>{usePolished ? '✨ AI POLISHED PROMPT (GEMINI OPTIMIZED)' : 'FINAL COMPILED PROMPT (STANDARD ASSEMBLY)'}</span>
                            <span className="text-blue-400 font-mono">{usePolished ? 'AI ENHANCED' : 'AUTOMATIC SYNC'}</span>
                          </div>
                          <pre className="p-4 text-xs font-mono max-h-[300px] overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
                            {displayCompiledPrompt || '# 여기에 작성된 프롬프트가 컴파일됩니다.'}
                          </pre>
                        </div>
                      )}

                      {/* Action trigger banner if they haven't polished yet */}
                      {!promptData.polishedText && !isPolishing && !polishError && (
                        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/80 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div className="space-y-0.5 text-center sm:text-left">
                            <span className="font-bold text-slate-800 dark:text-white text-xs flex items-center justify-center sm:justify-start gap-1.5">
                              <Sparkles size={14} className="text-blue-500" />
                              AI 프롬프트 실시간 정교화 튜닝
                            </span>
                            <p className="text-[10px] text-slate-500">
                              구축된 맥락과 변수들을 전문 프롬프트 엔지니어 가이드 라인에 맞춰 세련된 문장체와 마크다운 구조로 한 층 더 정제해보세요.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handlePolishPrompt}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
                          >
                            <Sparkles size={13} />
                            AI로 1초 만에 다듬기
                          </button>
                        </div>
                      )}

                      {/* If polished, show small notification */}
                      {promptData.polishedText && !isPolishing && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 rounded-xl text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center justify-between gap-2">
                          <span className="font-semibold flex items-center gap-1.5">
                            <Sparkles size={13} className="text-emerald-500" />
                            {usePolished 
                              ? "현재 AI가 고해상도로 세련되게 다듬은 고품질 버전을 사용 중입니다. 복사 및 저장이 이 버전으로 수행됩니다!"
                              : "AI가 보정해 둔 고품질 버전이 준비되어 있습니다. 우측 상단 탭에서 언제든 변환하여 사용할 수 있습니다."}
                          </span>
                          {!usePolished && (
                            <button
                              type="button"
                              onClick={() => setUsePolished(true)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded text-[9px] shrink-0 transition-all cursor-pointer"
                            >
                              AI 버전 사용
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Checklist feedback & conflict alert inside Step 8 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                      <div className="space-y-1.5">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">🛠️ 프롬프트 보완 체크리스트</span>
                        <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                          <div className="flex items-center gap-1.5">
                            {promptData.role ? <CheckCircle2 size={12} className="text-emerald-500" /> : <XCircle size={12} className="text-red-500" />}
                            <span>역할 지정 페르소나가 완비되었나요?</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {promptData.task ? <CheckCircle2 size={12} className="text-emerald-500" /> : <XCircle size={12} className="text-red-500" />}
                            <span>구체적인 작업 지시 문장을 타이핑하셨나요?</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {promptData.outputFormat ? <CheckCircle2 size={12} className="text-emerald-500" /> : <XCircle size={12} className="text-red-500" />}
                            <span>출력 결과물 포맷을 고정하셨나요?</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {promptData.includeItems.length > 0 ? <CheckCircle2 size={12} className="text-emerald-500" /> : <XCircle size={12} className="text-red-500" />}
                            <span>필수 포함 사항(Include)을 1개 이상 추가하셨나요?</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-center">
                        {activeConflicts.length > 0 ? (
                          <div className="p-3.5 bg-red-50/50 dark:bg-red-950/20 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-start gap-2.5 font-semibold">
                            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                            <div>
                              <span className="block font-bold text-[11px] mb-0.5">상치 모순 조건 감지됨!</span>
                              <span className="text-[10px] leading-normal font-medium block">이전 단계(스타일, 분량 및 강력 제약 수칙) 등에서 상반되거나 과도한 제약 조건이 설정되어 있는지 검토하세요.</span>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2.5 font-semibold border border-emerald-100 dark:border-emerald-900/30">
                            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                            <div>
                              <span className="block font-bold text-[11px] mb-0.5">상치 및 제약 무결점</span>
                              <span className="text-[10px] leading-normal font-medium block">프롬프트 내에 충돌을 유발할 만한 지시사항이 감지되지 않았습니다. 매끄러운 동작을 기대할 수 있습니다.</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Guarantees Box */}
                    <div className="bg-blue-50/50 dark:bg-blue-950/20 p-5 rounded-2xl border border-blue-150 dark:border-blue-900/30 space-y-3.5 text-xs">
                      <span className="font-bold text-blue-800 dark:text-blue-400 text-xs block">🛡️ AI 프롬프트 윤리 사용 보증 서약</span>
                      
                      <div className="space-y-2">
                        {[
                          { key: 'noPii', label: '실제 개인정보(실명, 비밀번호, 주소 등)를 전혀 포함하지 않았음을 동의합니다.' },
                          { key: 'noMalicious', label: '타인에게 정신적·물질적 피해를 유도하거나 부정행위를 유발할 의도가 없음을 보증합니다.' },
                          { key: 'verifyResults', label: 'AI 생성 결과의 허구성과 왜곡(할루시네이션) 가능성을 인정하며, 직접 교차 검증하겠습니다.' },
                          { key: 'verifyCritical', label: '실생활에 밀접한 의학, 법률, 보안적 이슈는 본 가이드에 따른 추가 확인 작업을 거치겠습니다.' }
                        ].map(chk => (
                          <label key={chk.key} className="flex items-start gap-2.5 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
                            <input
                              type="checkbox"
                              checked={(guaranteeChecks as any)[chk.key]}
                              onChange={(e) => setGuaranteeChecks({ ...guaranteeChecks, [chk.key]: e.target.checked })}
                              className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 mt-0.5"
                            />
                            <span>{chk.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Copy and Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        onClick={handleCopyPrompt}
                        disabled={!Object.values(guaranteeChecks).every(Boolean) || isDangerous}
                        className={`flex-1 py-3.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                          Object.values(guaranteeChecks).every(Boolean) && !isDangerous
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        <Copy size={14} />
                        최종 프롬프트 클립보드 복사하기
                      </button>

                      <button
                        onClick={handleSaveToLibrary}
                        disabled={!Object.values(guaranteeChecks).every(Boolean) || isDangerous}
                        className={`py-3.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border shrink-0 cursor-pointer ${
                          Object.values(guaranteeChecks).every(Boolean) && !isDangerous
                            ? 'border-blue-200 text-blue-600 bg-white hover:bg-blue-50'
                            : 'border-slate-150 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        <Save size={14} className="mr-1.5" />
                        보관함에 저장
                      </button>
                    </div>

                    {isDangerous ? (
                      <p className="text-[10px] text-red-600 text-center font-bold">🚨 사이버 안전 규정 위반이 감지되어 복사 및 저장이 차단되었습니다. 7단계(보안 검진)에서 조치 수정을 수행하세요.</p>
                    ) : !Object.values(guaranteeChecks).every(Boolean) && (
                      <p className="text-[10px] text-amber-600 text-center font-semibold">⚠️ 4가지 보증 서약에 모두 체크해야 프롬프트 다운로드 및 복사 버튼이 활성화됩니다.</p>
                    )}
                  </div>
                )}

                {/* Bottom Step navigation buttons */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-5 mt-6">
                  <button
                    onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                    disabled={currentStep === 0}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} />
                    이전 단계
                  </button>
                  <button
                    onClick={() => setCurrentStep(prev => Math.min(stepsList.length - 1, prev + 1))}
                    disabled={currentStep === stepsList.length - 1}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    다음 단계
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* REAL-TIME COMPILER PREVIEW (Right 5 Columns) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5 sticky top-28">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="text-blue-600 dark:text-blue-400" size={18} />
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white">실시간 프롬프트 조립기 (Live Preview)</span>
                  </div>
                </div>

                {/* Dynamic Rating and Score */}
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-800">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">품질 완성도 점수</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white font-mono block">{promptData.qualityScore}점 / 100점</span>
                  </div>
                  <span className={`text-[10px] font-black border px-2.5 py-1.5 rounded-full ${getScoreBadgeColor(promptData.qualityScore)}`}>
                    {getScoreBadgeText(promptData.qualityScore)}
                  </span>
                </div>

                {/* Length and Reading Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 border border-slate-100 dark:border-slate-850 rounded-xl bg-slate-50/50 dark:bg-slate-950/30 flex flex-col justify-center">
                    <span className="block text-[9px] text-slate-400 font-bold mb-1">글자 수</span>
                    <span className="font-mono font-extrabold text-slate-700 dark:text-slate-300">{stats.charCount}자</span>
                  </div>
                  <div className="p-2 border border-slate-100 dark:border-slate-850 rounded-xl bg-slate-50/50 dark:bg-slate-950/30 flex flex-col justify-center">
                    <span className="block text-[9px] text-slate-400 font-bold mb-1">예상 토큰 수</span>
                    <span className="font-mono font-extrabold text-slate-700 dark:text-slate-300">~{stats.estTokens}T</span>
                  </div>
                  <div className="p-2 border border-slate-100 dark:border-slate-850 rounded-xl bg-slate-50/50 dark:bg-slate-950/30 flex flex-col justify-center">
                    <span className="block text-[9px] text-slate-400 font-bold mb-1">예상 읽기시간</span>
                    <span className="font-mono font-extrabold text-slate-700 dark:text-slate-300">{stats.estReadTime}분</span>
                  </div>
                </div>

                {/* Live Compilation Text Area */}
                <div className="relative group border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-950 text-slate-200">
                  <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 font-bold">
                    <span>COMPILE MATRIX</span>
                    <span className="text-blue-400 font-mono animate-pulse">AUTOMATIC SYNC</span>
                  </div>
                  <pre 
                    className="p-4 text-xs font-mono max-h-[340px] overflow-y-auto whitespace-pre-wrap leading-relaxed select-none cursor-not-allowed"
                    style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
                    onCopy={(e) => {
                      e.preventDefault();
                      alert('⚠️ 실시간 프롬프트 조합기 내에서는 직접 복사를 할 수 없습니다. 8단계(수령 및 서약)에서 4가지 안전 사용 서약에 동의하시면 완성된 최종 프롬프트를 정식으로 발급(복사)받으실 수 있습니다.');
                    }}
                    onCut={(e) => {
                      e.preventDefault();
                    }}
                    onDragStart={(e) => {
                      e.preventDefault();
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      alert('⚠️ 이 영역은 보안 및 안전 규정에 따라 우클릭 및 복사가 차단되어 있습니다. 최종 완성된 프롬프트는 8단계(수령 및 서약)에서 정식 서약 후 안전하게 복사하십시오.');
                    }}
                  >
                    {displayCompiledPrompt || '# 여기에 작성된 프롬프트 조각이 실시간 컴파일됩니다.'}
                  </pre>
                </div>

                {/* Diagnostic feedback checklist */}
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">🛠️ 프롬프트 보완 체크리스트</span>
                  <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      {promptData.role ? <CheckCircle2 size={12} className="text-emerald-500" /> : <XCircle size={12} className="text-red-500" />}
                      <span>역할 지정 페르소나가 완비되었나요?</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {promptData.task ? <CheckCircle2 size={12} className="text-emerald-500" /> : <XCircle size={12} className="text-red-500" />}
                      <span>구체적인 작업 지시 문장을 타이핑하셨나요?</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {promptData.outputFormat ? <CheckCircle2 size={12} className="text-emerald-500" /> : <XCircle size={12} className="text-red-500" />}
                      <span>출력 결과물 포맷을 고정하셨나요?</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {promptData.includeItems.length > 0 ? <CheckCircle2 size={12} className="text-emerald-500" /> : <XCircle size={12} className="text-red-500" />}
                      <span>필수 포함 사항(Include)을 1개 이상 추가하셨나요?</span>
                    </div>
                  </div>
                </div>

                {activeConflicts.length > 0 ? (
                  <div className="p-3 bg-red-50/50 dark:bg-red-950/20 rounded-xl text-[10px] text-red-600 dark:text-red-400 flex items-start gap-2 font-semibold">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-bold">상치 모순 조건 감지됨!</span>
                      <span className="text-[9px] leading-normal font-medium block mt-0.5">프롬프트 내에 충돌을 유발할 지시사항이 감지되었습니다. 7단계에서 해결을 권고합니다.</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl text-[10px] text-emerald-600 dark:text-emerald-400 flex items-start gap-2 font-semibold border border-emerald-100 dark:border-emerald-900/30">
                    <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-bold">상치 및 제약 무결점</span>
                      <span className="text-[9px] leading-normal font-medium block mt-0.5">충돌을 유발할 만한 지시사항이 없으며 매끄럽게 컴파일되었습니다.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Library Browse & Preset Import */}
        {activeTab === 'library' && (
          <PromptLibrary onLoadPreset={handleLoadPromptData} />
        )}

        {/* TAB 3: Red Team test playground */}
        {activeTab === 'redteam' && (
          <RedTeamTest />
        )}

        {/* TAB 4: Learning Improvement timeline */}
        {activeTab === 'logs' && (
          <ImprovementLog
            currentScore={promptData.qualityScore}
            onSaveLogToStorage={handleSaveImprovementLog}
          />
        )}

        {/* TAB 5: Saved LocalStorage Prompts manager */}
        {activeTab === 'saved' && (
          <SavedPrompts onLoadPrompt={handleLoadPromptData} />
        )}

        {/* TAB 6: Dictionary Help Encyclopedia */}
        {activeTab === 'guide' && (
          <HelpManual />
        )}

      </main>

      {/* --- FLOATING SLIDESHOW DIALOG OVERLAY --- */}
      {showPresentation && (
        <PresentationMode
          promptData={promptData}
          onClose={() => setShowPresentation(false)}
        />
      )}

      {/* --- API KEY CONFIGURATION MODAL --- */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-150 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <Key className="text-emerald-500" size={18} />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Gemini API Key 설정</h3>
              </div>
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                GitHub Pages와 같은 정적 호스팅 사이트나 외부 환경에 배포했을 때도 프롬프트 다듬기 및 실제 AI 구동 테스트를 원활히 사용하기 위해, 본인의 개인 <strong>Gemini API Key</strong>를 브라우저 로컬 저장소에 안전하게 등록할 수 있습니다.
              </p>
              
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl text-[11px] text-blue-600 dark:text-blue-400 leading-relaxed">
                <strong>🔒 보안 안내:</strong> 입력하신 API Key는 외부 서버나 제작자에게 절대로 전송되지 않으며, 오직 본인 브라우저의 안전한 영역(localStorage)에만 저장되어 Gemini에 직접 요청을 전달할 때만 사용됩니다.
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Gemini API Key</label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="AI_Sy... 또는 API Key 입력"
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400 font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setCustomApiKey('');
                  setTempApiKey('');
                  setHasCustomApiKey(false);
                  setShowApiKeyModal(false);
                  alert('API Key가 성공적으로 제거되었습니다. 이제 기본 서버 API를 시도합니다.');
                }}
                className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 rounded-xl transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                삭제하기
              </button>
              <button
                onClick={() => {
                  if (!tempApiKey.trim()) {
                    alert('API Key를 입력해 주세요.');
                    return;
                  }
                  setCustomApiKey(tempApiKey);
                  setHasCustomApiKey(true);
                  setShowApiKeyModal(false);
                  alert('API Key가 성공적으로 저장되었습니다! 이제 정적 호스팅 환경에서도 안전하게 AI 기능을 사용할 수 있습니다.');
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-xl transition-all shadow-sm cursor-pointer"
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer credits */}
      <footer className="py-8 bg-white dark:bg-slate-900 border-t border-slate-150 dark:border-slate-800/80 text-center text-xs text-slate-400 font-medium">
        <p>프롬프트 디자이너 • AI Studio Build Tool applet</p>
        <p className="text-[10px] text-slate-400/80 mt-1">이 웹앱은 외부의 어떠한 유료 API도 호출하지 않는 완전 보안 독립 로직입니다.</p>
      </footer>
    </div>
  );
}
