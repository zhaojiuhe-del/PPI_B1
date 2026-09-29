import React, { useState } from 'react';
import {
  X,
  Sliders,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  BookmarkPlus,
  Flame,
  Shield,
  Layers,
  HelpCircle,
  Eye,
  Maximize2,
  Minimize2,
  Activity,
} from 'lucide-react';
import { MixerParams, FinancialSummary } from '../types';
import { initialMixerParams } from '../mock/initialData';

interface MixerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  params: MixerParams;
  onChangeParams: (newParams: MixerParams) => void;
  onApplyPreset: (presetKey: string) => void;
  onAiAutoTune: (goalPrompt: string) => Promise<void>;
  isAiTuning: boolean;
  aiTuneResult: any;
  onSaveScenario: (name: string) => void;
  liveFinancialSummary?: FinancialSummary;
  floorCount?: number;
  capCount?: number;
  totalRecommendedFTE?: number;
}

export const MixerDrawer: React.FC<MixerDrawerProps> = ({
  isOpen,
  onClose,
  params,
  onChangeParams,
  onApplyPreset,
  onAiAutoTune,
  isAiTuning,
  aiTuneResult,
  onSaveScenario,
  liveFinancialSummary,
  floorCount = 0,
  capCount = 0,
  totalRecommendedFTE = 837,
}) => {
  const [goalPrompt, setGoalPrompt] = useState('');
  const [newScenarioName, setNewScenarioName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  // Transparency / See-through modes: 'high' (70%), 'medium' (88%), 'solid' (98%)
  const [transparency, setTransparency] = useState<'high' | 'medium' | 'solid'>('medium');
  const [isCompact, setIsCompact] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSliderChange = (key: keyof MixerParams, value: number) => {
    onChangeParams({
      ...params,
      [key]: value,
    });
  };

  const poolSum =
    params.workloadPoolRatio +
    params.guaranteePoolRatio +
    params.qualityPoolRatio +
    params.specialDisciplinePoolRatio;

  const handleNormalizePools = () => {
    const factor = 100 / poolSum;
    onChangeParams({
      ...params,
      workloadPoolRatio: Number((params.workloadPoolRatio * factor).toFixed(1)),
      guaranteePoolRatio: Number((params.guaranteePoolRatio * factor).toFixed(1)),
      qualityPoolRatio: Number((params.qualityPoolRatio * factor).toFixed(1)),
      specialDisciplinePoolRatio: Number(
        (params.specialDisciplinePoolRatio * factor).toFixed(1)
      ),
    });
  };

  const handleAiTuneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalPrompt.trim()) return;
    await onAiAutoTune(goalPrompt);
  };

  // Determine drawer background opacity classes (NO backdrop-blur, crystal clear background)
  const drawerBgClass =
    transparency === 'high'
      ? 'bg-slate-950/75 border-cyan-500/40 shadow-2xl backdrop-none'
      : transparency === 'medium'
      ? 'bg-slate-900/90 border-slate-700/80 shadow-2xl backdrop-none'
      : 'bg-slate-900 border-slate-700 shadow-2xl';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/20 flex justify-end animate-fadeIn select-none">
      {/* Light semi-transparent click-through/close mask, NO blur to keep bottom data 100% sharp and visible */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
        title="点击遮罩空白处收起调音台（底图无模糊，实时数据保持同步）"
      />

      {/* Drawer Container */}
      <div
        className={`relative z-10 w-full ${
          isCompact ? 'max-w-xl' : 'max-w-2xl'
        } ${drawerBgClass} border-l flex flex-col h-full text-slate-100 transition-all duration-200`}
      >
        {/* Top Header */}
        <div className="p-3.5 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight text-white">
                  绩效改革“调音台” (Equalizer)
                </h2>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  实时推杆联动中
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                微调全院大盘提成、四大池结构、角色系数与防断崖保护线
              </p>
            </div>
          </div>

          {/* Quick Header Actions: Transparency & Compact Toggles */}
          <div className="flex items-center space-x-1.5 shrink-0">
            {/* Transparency Selector */}
            <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700 text-[10px]">
              <button
                type="button"
                onClick={() => setTransparency('high')}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  transparency === 'high'
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="高透视模式：70%半透明，轻松看透底图表格"
              >
                高透
              </button>
              <button
                type="button"
                onClick={() => setTransparency('medium')}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  transparency === 'medium'
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="标准半透模式：88%半透明，底图清晰可见"
              >
                半透
              </button>
              <button
                type="button"
                onClick={() => setTransparency('solid')}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  transparency === 'solid'
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="实体模式：98%纯色背景"
              >
                实底
              </button>
            </div>

            {/* Width Toggle */}
            <button
              onClick={() => setIsCompact(!isCompact)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60"
              title={isCompact ? '展开调音台' : '紧凑调音台（露出更多底图）'}
            >
              {isCompact ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="收起调音台"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Synchronized HUD Monitor */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px]">预测统一点值:</span>
              <span className="font-mono font-bold text-cyan-300 text-sm">
                ¥{liveFinancialSummary ? liveFinancialSummary.predictedPointValue.toFixed(2) : '12.42'}
              </span>
            </div>
            <div className="h-3 w-px bg-slate-700" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px]">目标大盘:</span>
              <span className="font-mono font-bold text-emerald-300">
                ¥{liveFinancialSummary ? ((liveFinancialSummary.totalBonusPool) / 10000).toFixed(2) : '2.17'}亿
              </span>
            </div>
            <div className="h-3 w-px bg-slate-700" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px]">保底/封顶:</span>
              <span className="font-mono text-amber-300 font-semibold text-[11px]">
                {floorCount}科保底 / {capCount}科封顶
              </span>
            </div>
            <div className="h-3 w-px bg-slate-700" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px]">建议总FTE:</span>
              <span className="font-mono text-purple-300 font-semibold text-[11px]">
                {totalRecommendedFTE}人
              </span>
            </div>
          </div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 shrink-0 font-medium ml-2">
            <Activity className="w-3 h-3 animate-pulse" />
            底图无模糊·实时联动
          </span>
        </div>

        {/* Scrollable Sliders & Equalizer Console */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* AI Reform Goal Auto-Tuner */}
          <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-800/40 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                AI 调音台智能推演助手
              </span>
              <span className="text-[10px] text-purple-300/70">
                输入自然语言目标 ➔ 自动反推调音台推杆组合
              </span>
            </div>
            <form onSubmit={handleAiTuneSubmit} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={goalPrompt}
                  onChange={(e) => setGoalPrompt(e.target.value)}
                  placeholder="例如：稳健平稳过渡，重点扶持儿科急诊重症，提升三四级手术积极性，防范科室断崖"
                  className="flex-1 bg-slate-950 text-xs text-slate-200 border border-purple-700/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-400 placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  disabled={isAiTuning}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1 shrink-0"
                >
                  {isAiTuning ? '推演中...' : '智能优化'}
                </button>
              </div>
              {aiTuneResult && (
                <div className="bg-purple-900/30 border border-purple-700/40 rounded-lg p-2.5 text-xs text-purple-200 mt-2">
                  <p className="font-semibold text-purple-300 mb-1">
                    AI推演结论与优化逻辑：
                  </p>
                  <p className="text-[11px] text-purple-200/90 leading-relaxed mb-2">
                    {aiTuneResult.rationale}
                  </p>
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {aiTuneResult.expectedImpact?.map((impact: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-purple-950/80 px-2 py-0.5 rounded border border-purple-700/50 text-purple-300"
                      >
                        ✓ {impact}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>快速套用背景预设 (Presets)</span>
              <span className="text-[10px] text-slate-500">一键切换典型改革场景</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { key: 'conservative', label: '稳健平稳过渡型', icon: Shield },
                { key: 'high_tech_national_exam', label: '高精尖与国考攻坚型', icon: Flame },
                { key: 'basic_discipline_support', label: '基层兜底与紧缺扶持', icon: Layers },
                { key: 'drg_cost_control', label: 'DRG精细控费型', icon: Sliders },
                { key: 'expansion_ramp_up', label: '新院区快速爬坡型', icon: Sparkles },
              ].map((p) => (
                <button
                  key={p.key}
                  onClick={() => onApplyPreset(p.key)}
                  className="bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 hover:border-cyan-500/50 text-left p-2 rounded-lg text-xs transition-all flex items-center gap-2 group"
                >
                  <p.icon className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="text-slate-200 truncate">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 1: 绩效大盘与资金池结构 */}
          <div className="bg-slate-800/50 border border-slate-700/70 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <h3 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wide">
                <span>01. 绩效大盘比例与四大绩效池切分</span>
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    Math.abs(poolSum - 100) < 0.2
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}
                >
                  合计: {poolSum.toFixed(1)}%
                </span>
                {Math.abs(poolSum - 100) >= 0.2 && (
                  <button
                    onClick={handleNormalizePools}
                    className="text-[10px] bg-amber-800/60 hover:bg-amber-700 text-amber-200 px-2 py-0.5 rounded transition-colors"
                  >
                    自动归一(100%)
                  </button>
                )}
              </div>
            </div>

            {/* Slider 1: Total Pool Ratio */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">绩效大盘占有效收入比例:</span>
                <span className="text-cyan-400 font-mono font-bold">{params.totalPoolRatio}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="40"
                step="0.5"
                value={params.totalPoolRatio}
                onChange={(e) => handleSliderChange('totalPoolRatio', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>审慎紧缩(20%)</span>
                <span>公立医院常规(25%~32%)</span>
                <span>高额激励(40%)</span>
              </div>
            </div>

            {/* Sub-pools Slider Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Workload Pool */}
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">RBRVS工作量池:</span>
                  <span className="text-blue-400 font-mono font-bold">{params.workloadPoolRatio}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="80"
                  step="0.5"
                  value={params.workloadPoolRatio}
                  onChange={(e) => handleSliderChange('workloadPoolRatio', parseFloat(e.target.value))}
                  className="w-full accent-blue-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
                <span className="text-[10px] text-slate-500">体现“多劳多得、优劳优得”核心业务</span>
              </div>

              {/* Guarantee Pool */}
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">固定保障池(岗位/班次):</span>
                  <span className="text-emerald-400 font-mono font-bold">{params.guaranteePoolRatio}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="0.5"
                  value={params.guaranteePoolRatio}
                  onChange={(e) => handleSliderChange('guaranteePoolRatio', parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
                <span className="text-[10px] text-slate-500">保障夜班、值班、下乡与基础运行底线</span>
              </div>

              {/* Quality & DRG Pool */}
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">质量与DRG/国考效率池:</span>
                  <span className="text-purple-400 font-mono font-bold">{params.qualityPoolRatio}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="0.5"
                  value={params.qualityPoolRatio}
                  onChange={(e) => handleSliderChange('qualityPoolRatio', parseFloat(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
                <span className="text-[10px] text-slate-500">引导CMI、时间消耗指数、入组率与质控</span>
              </div>

              {/* Special Discipline Pool */}
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">专项学科发展倾斜池:</span>
                  <span className="text-amber-400 font-mono font-bold">{params.specialDisciplinePoolRatio}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="0.5"
                  value={params.specialDisciplinePoolRatio}
                  onChange={(e) => handleSliderChange('specialDisciplinePoolRatio', parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
                <span className="text-[10px] text-slate-500">专项倾斜重点学科、儿科/急症与孵化技术</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: 医疗角色系数与去重约束 */}
          <div className="bg-slate-800/50 border border-slate-700/70 rounded-xl p-4 space-y-3">
            <div className="border-b border-slate-700 pb-2 flex justify-between items-center">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wide">
                02. 医疗角色系数与责任分工 (去重约束)
              </h3>
              <span className="text-[10px] text-slate-400">严禁岗位与角色双重叠加加权</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Surgeon Weight */}
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/60">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-300">主刀责任:</span>
                  <span className="font-mono text-cyan-400 font-bold">{params.surgeonWeight.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.2"
                  step="0.05"
                  value={params.surgeonWeight}
                  onChange={(e) => handleSliderChange('surgeonWeight', parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700"
                />
                <span className="text-[9px] text-slate-500">基准责任系数(1.0)</span>
              </div>

              {/* First Assistant */}
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/60">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-300">第一助手:</span>
                  <span className="font-mono text-blue-400 font-bold">{params.firstAssistantWeight.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="0.6"
                  step="0.05"
                  value={params.firstAssistantWeight}
                  onChange={(e) => handleSliderChange('firstAssistantWeight', parseFloat(e.target.value))}
                  className="w-full accent-blue-400 cursor-pointer h-1.5 bg-slate-700"
                />
                <span className="text-[9px] text-slate-500">推荐 0.3~0.5</span>
              </div>

              {/* Second Assistant */}
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/60">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-300">第二助手:</span>
                  <span className="font-mono text-emerald-400 font-bold">{params.secondAssistantWeight.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.3"
                  step="0.05"
                  value={params.secondAssistantWeight}
                  onChange={(e) => handleSliderChange('secondAssistantWeight', parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-700"
                />
                <span className="text-[9px] text-slate-500">推荐 0.1~0.2</span>
              </div>

              {/* Nurse Role */}
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/60">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-300">洗手/巡回护士:</span>
                  <span className="font-mono text-purple-400 font-bold">{params.nurseRoleWeight.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.35"
                  step="0.05"
                  value={params.nurseRoleWeight}
                  onChange={(e) => handleSliderChange('nurseRoleWeight', parseFloat(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer h-1.5 bg-slate-700"
                />
                <span className="text-[9px] text-slate-500">专科配合责任</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: 学科战略倾斜与DRG激励 */}
          <div className="bg-slate-800/50 border border-slate-700/70 rounded-xl p-4 space-y-3">
            <div className="border-b border-slate-700 pb-2">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                03. 学科战略倾斜、技术难度与成本节约导向
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Critical Care Strategic Factor */}
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">急诊/重症/儿科战略倾斜系数:</span>
                  <span className="text-amber-400 font-mono font-bold">
                    {params.criticalDisciplineStrategicFactor.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="1.4"
                  step="0.05"
                  value={params.criticalDisciplineStrategicFactor}
                  onChange={(e) =>
                    handleSliderChange('criticalDisciplineStrategicFactor', parseFloat(e.target.value))
                  }
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-700"
                />
                <span className="text-[10px] text-slate-500">政策倾斜扶持，补偿低收费高风险无收费劳动</span>
              </div>

              {/* Surgery Difficulty Factor */}
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">三四级高难度手术/微创加权:</span>
                  <span className="text-cyan-400 font-mono font-bold">
                    {params.surgeryDifficultyFactor.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="1.35"
                  step="0.02"
                  value={params.surgeryDifficultyFactor}
                  onChange={(e) => handleSliderChange('surgeryDifficultyFactor', parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700"
                />
                <span className="text-[10px] text-slate-500">与“国考”三四级手术及微创手术占比直接挂钩</span>
              </div>

              {/* DRG Efficiency */}
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">CMI与DRG效率指数激励力度:</span>
                  <span className="text-purple-400 font-mono font-bold">
                    {params.drgEfficiencyWeight.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.3"
                  step="0.05"
                  value={params.drgEfficiencyWeight}
                  onChange={(e) => handleSliderChange('drgEfficiencyWeight', parseFloat(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer h-1.5 bg-slate-700"
                />
                <span className="text-[10px] text-slate-500">收治疑难危重患者、缩短平均住院日直接获益</span>
              </div>

              {/* Cost Saving Share */}
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">可控运营成本节约奖励比例:</span>
                  <span className="text-emerald-400 font-mono font-bold">{params.costSavingShareRate}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={params.costSavingShareRate}
                  onChange={(e) => handleSliderChange('costSavingShareRate', parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-700"
                />
                <span className="text-[10px] text-slate-500">剔除药耗后，节约直接科室可控成本的提成比例</span>
              </div>
            </div>
          </div>

          {/* SECTION 4: 平稳过渡与防断崖保护线 */}
          <div className="bg-slate-800/50 border border-slate-700/70 rounded-xl p-4 space-y-3">
            <div className="border-b border-slate-700 pb-2 flex justify-between items-center">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>04. 平稳过渡防断崖与定岗定编控制线</span>
              </h3>
              <span className="text-[10px] text-slate-400">防止科室绩效出现断崖式暴跌或暴涨</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Protect Floor */}
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">保底保护线下限:</span>
                  <span className="text-emerald-400 font-mono font-bold">{params.protectFloor}%</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="95"
                  step="1"
                  value={params.protectFloor}
                  onChange={(e) => handleSliderChange('protectFloor', parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-700"
                />
                <span className="text-[10px] text-slate-500">低于此比例触发保底补差(推荐88%~90%)</span>
              </div>

              {/* Protect Cap */}
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">封顶保护线上限:</span>
                  <span className="text-amber-400 font-mono font-bold">{params.protectCap}%</span>
                </div>
                <input
                  type="range"
                  min="115"
                  max="140"
                  step="1"
                  value={params.protectCap}
                  onChange={(e) => handleSliderChange('protectCap', parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-700"
                />
                <span className="text-[10px] text-slate-500">高于此比例平滑削峰(推荐120%~125%)</span>
              </div>

              {/* FTE Max Adjust */}
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">单期FTE编制调整上限:</span>
                  <span className="text-blue-400 font-mono font-bold">±{params.fteMaxAdjustRatio}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="1"
                  value={params.fteMaxAdjustRatio}
                  onChange={(e) => handleSliderChange('fteMaxAdjustRatio', parseFloat(e.target.value))}
                  className="w-full accent-blue-400 cursor-pointer h-1.5 bg-slate-700"
                />
                <span className="text-[10px] text-slate-500">限制单个规划期内人员编制调整幅度</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => onChangeParams(initialMixerParams)}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>恢复默认参数</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>保存为测算方案快照</span>
            </button>
            <button
              onClick={onClose}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs px-4 py-1.5 rounded-lg transition-colors shadow"
            >
              完成并查看沙盘
            </button>
          </div>
        </div>

        {/* Save Scenario Modal Dialog */}
        {showSaveModal && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <BookmarkPlus className="w-4 h-4 text-cyan-400" />
                保存当前调音台参数为方案
              </h4>
              <p className="text-xs text-slate-400">
                保存后可在沙盘推演的多轮测算中快速比对与汇报。
              </p>
              <input
                type="text"
                placeholder="例如：方案V4-三级甲等复审达标测试版"
                value={newScenarioName}
                onChange={(e) => setNewScenarioName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-slate-800"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    if (newScenarioName.trim()) {
                      onSaveScenario(newScenarioName.trim());
                      setNewScenarioName('');
                      setShowSaveModal(false);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-medium"
                >
                  确定保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
