import React from 'react';
import {
  SlidersHorizontal,
  Bot,
  FileSpreadsheet,
  Download,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  Users,
  Activity,
  Award,
  Moon,
  Sun,
  Menu,
  UserPlus,
} from 'lucide-react';
import { FinancialSummary, ScenarioType, AppDisplayMode } from '../types';
import { presetScenariosConfig } from '../mock/initialData';

interface HeaderProps {
  financialSummary: FinancialSummary;
  activeScenario: ScenarioType;
  onSelectScenario: (scenario: ScenarioType) => void;
  displayMode: AppDisplayMode;
  onSelectDisplayMode: (mode: AppDisplayMode) => void;
  onOpenMixer: () => void;
  onOpenAiAssistant: () => void;
  onExportAll: () => void;
  onResetData: () => void;
  onOpenPersonnelImport: () => void;
  floorCount: number;
  capCount: number;
  totalCurrentFTE: number;
  totalRecommendedFTE: number;
}

export const Header: React.FC<HeaderProps> = ({
  financialSummary,
  activeScenario,
  onSelectScenario,
  displayMode,
  onSelectDisplayMode,
  onOpenMixer,
  onOpenAiAssistant,
  onExportAll,
  onResetData,
  onOpenPersonnelImport,
  floorCount,
  capCount,
  totalCurrentFTE,
  totalRecommendedFTE,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-xl">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-2 ring-cyan-400/30">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                MediScale AI
              </span>
              <span className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-300 text-xs px-2 py-0.5 rounded-full font-mono font-medium">
                v3.2 医院沙盘版
              </span>
            </div>
            <p className="text-xs text-slate-400">
              公立医院RBRVS+CCHI一体化绩效改革与定岗定编推演系统
            </p>
          </div>
        </div>

        {/* Global Scenario Selector & Control Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* 3 Modes Switcher (黑夜模式 / 白天模式 / 经典菜单模式) */}
          <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg p-0.5 text-xs shadow-inner">
            <button
              onClick={() => onSelectDisplayMode('dark')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-semibold cursor-pointer ${
                displayMode === 'dark'
                  ? 'bg-slate-900 text-cyan-300 shadow-sm border border-cyan-500/40 ring-1 ring-cyan-400/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
              title="深邃黑夜模式 (深黑底色科技感)"
            >
              <Moon className="w-3.5 h-3.5 text-cyan-400" />
              <span>黑夜模式</span>
            </button>
            <button
              onClick={() => onSelectDisplayMode('light')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-semibold cursor-pointer ${
                displayMode === 'light'
                  ? 'bg-white text-blue-800 shadow-sm border border-blue-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
              title="清爽白天模式 (高清晰白色底色，日光办公)"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>白天模式</span>
            </button>
            <button
              onClick={() => onSelectDisplayMode('classic_menu')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-semibold cursor-pointer ${
                displayMode === 'classic_menu'
                  ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-sm border border-blue-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
              title="经典系统菜单模式 (将第四行标签页独立重构为经典企业级系统菜单导航)"
            >
              <Menu className="w-3.5 h-3.5 text-cyan-300" />
              <span>经典菜单</span>
            </button>
          </div>

          {/* Quick Personnel Import Button */}
          <button
            onClick={onOpenPersonnelImport}
            className="flex items-center space-x-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-emerald-700/80 shadow-sm transition-all active:scale-95 cursor-pointer"
            title="快速导入人员名称-科室-日期-职称-职务-岗位信息"
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
            <span>导入人员信息</span>
          </button>

          {/* Preset Selector */}
          <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-lg p-1">
            <span className="text-xs text-slate-400 px-1.5 font-medium">背景预设:</span>
            <select
              value={activeScenario}
              onChange={(e) => onSelectScenario(e.target.value as ScenarioType)}
              className="bg-slate-900 text-cyan-300 text-xs font-semibold rounded px-2 py-1 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer"
            >
              <option value="conservative">稳健平稳过渡型 (波动±8%以内)</option>
              <option value="high_tech_national_exam">高精尖与国考攻坚型 (四级手术加权)</option>
              <option value="basic_discipline_support">基层兜底与紧缺学科扶持型 (儿科/急症倾斜)</option>
              <option value="drg_cost_control">DRG精细化与成本管控型 (控费降耗)</option>
              <option value="expansion_ramp_up">新院区快速爬坡型 (工作量驱动)</option>
              <option value="custom">自定义多轮推演方案</option>
            </select>
          </div>

          {/* Equalizer Mixer Button */}
          <button
            onClick={onOpenMixer}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md transition-all active:scale-95 cursor-pointer"
            title="调节四大绩效池、角色责任系数与保护线"
          >
            <SlidersHorizontal className="w-4 h-4 text-cyan-200" />
            <span>调音台推杆</span>
          </button>

          {/* AI Reform Copilot */}
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-md transition-all active:scale-95 ring-1 ring-purple-400/40 cursor-pointer"
            title="唤起AI绩效咨询专家诊断与调音建议"
          >
            <Bot className="w-4 h-4 text-purple-200" />
            <span>AI改革智囊</span>
          </button>

          {/* Export & Reset */}
          <button
            onClick={onExportAll}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            title="导出科室全盘测算明细表"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出总表</span>
          </button>

          <button
            onClick={onResetData}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            title="重置到基准测算数据"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置</span>
          </button>
        </div>
      </div>

      {/* Global Real-time Metric Indicators Bar */}
      <div className="bg-slate-950/70 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">
          {/* Effective Income */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">有效收入大盘:</span>
            <span className="font-bold text-white font-mono">
              {(financialSummary.effectiveIncome / 10000).toFixed(2)} 亿元
            </span>
          </div>

          {/* Bonus Pool & Ratio */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">目标绩效大盘:</span>
            <span className="font-bold text-cyan-400 font-mono">
              {(financialSummary.totalBonusPool / 10000).toFixed(2)} 亿元
            </span>
            <span className="text-[10px] text-cyan-300/80 bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-800">
              占比{((financialSummary.totalBonusPool / financialSummary.effectiveIncome) * 100).toFixed(1)}%
            </span>
          </div>

          {/* Point Values Comparison */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">预测统一点值:</span>
            <span className="font-bold text-emerald-400 font-mono">
              ¥{financialSummary.predictedPointValue}
            </span>
            <span className="text-[10px] text-slate-400">
              (基线: ¥{financialSummary.baselinePointValue})
            </span>
          </div>

          {/* Protection triggers */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">保护线触发:</span>
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              保底 {floorCount} 科室 / 封顶 {capCount} 科室
            </span>
          </div>

          {/* FTE Summary */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">定岗定编FTE:</span>
            <span className="font-semibold text-slate-200">
              现 {totalCurrentFTE}人 ➔ 建议 {totalRecommendedFTE}人
            </span>
            <span
              className={`text-[10px] px-1 rounded ${
                totalRecommendedFTE > totalCurrentFTE
                  ? 'bg-blue-900/60 text-blue-300 border border-blue-700'
                  : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
              }`}
            >
              {totalRecommendedFTE - totalCurrentFTE >= 0
                ? `+${totalRecommendedFTE - totalCurrentFTE}`
                : totalRecommendedFTE - totalCurrentFTE}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
