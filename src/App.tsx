import React, { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  Layers,
  Users,
  FileText,
  Activity,
  ShieldAlert,
  FileCheck2,
  Database,
  Bot,
  Sparkles,
  ChevronDown,
  FolderOpen,
  UserCheck,
  Building2,
  Coins,
  Clock,
} from 'lucide-react';

import { Header } from './components/Header';
import { MixerDrawer } from './components/MixerDrawer';
import { AiAssistantModal } from './components/AiAssistantModal';
import { SandboxTab } from './components/tabs/SandboxTab';
import { RbrvsEngineTab } from './components/tabs/RbrvsEngineTab';
import { FteManagementTab } from './components/tabs/FteManagementTab';
import { LedgerTraceabilityTab } from './components/tabs/LedgerTraceabilityTab';
import { OperationsCostTab } from './components/tabs/OperationsCostTab';
import { DiagnosisAndGatekeeperTab } from './components/tabs/DiagnosisAndGatekeeperTab';
import { ConsultingReportTab } from './components/tabs/ConsultingReportTab';
import { DataImportTab } from './components/tabs/DataImportTab';

import {
  initialDepartments,
  initialEmployees,
  initialFinancialSummary,
  initialMixerParams,
  presetScenariosConfig,
  initialOrderExecutionList,
  initialPricingItems,
  initialAttendanceRecords,
} from './mock/initialData';
import { computeSystemState } from './utils/calculator';
import { exportDepartmentsToCSV } from './utils/exporter';
import {
  Department,
  MixerParams,
  ScenarioType,
  Employee,
  FinancialSummary,
  ClinicalOrderExecution,
  PricingFeeItem,
  AttendanceRecord,
  AppDisplayMode,
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'sandbox' | 'rbrvs' | 'fte' | 'ledger' | 'operations' | 'diagnosis' | 'report' | 'import'
  >('sandbox');

  // Three System Display Modes: dark (深邃黑夜), light (清爽白天), classic_menu (经典菜单独立)
  const [displayMode, setDisplayMode] = useState<AppDisplayMode>('dark');

  // Active category for DataImportTab
  const [importCategory, setImportCategory] = useState<
    'clinical_order' | 'pricing' | 'organization' | 'employee' | 'schedule_attendance' | 'finance'
  >('clinical_order');

  const [activeScenario, setActiveScenario] = useState<ScenarioType>('conservative');
  const [mixerParams, setMixerParams] = useState<MixerParams>(presetScenariosConfig.conservative.params);
  const [isMixerOpen, setIsMixerOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isAiTuning, setIsAiTuning] = useState(false);
  const [aiTuneResult, setAiTuneResult] = useState<any>(null);

  // Active hospital datasets (supporting live import and data ingestion)
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>(initialFinancialSummary);
  const [orderExecutions, setOrderExecutions] = useState<ClinicalOrderExecution[]>(initialOrderExecutionList);
  const [pricingItems, setPricingItems] = useState<PricingFeeItem[]>(initialPricingItems);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialAttendanceRecords);

  // Department selected for AI diagnostic
  const [selectedDeptForAi, setSelectedDeptForAi] = useState<Department | null>(null);

  // Live system calculation state linked to mixer parameters and active datasets
  const calculatedState = useMemo(() => {
    return computeSystemState(
      financialSummary,
      departments,
      employees,
      mixerParams
    );
  }, [financialSummary, departments, employees, mixerParams]);

  // Scenario switch handler
  const handleSelectScenario = (scenarioKey: ScenarioType) => {
    setActiveScenario(scenarioKey);
    if (scenarioKey in presetScenariosConfig) {
      setMixerParams(presetScenariosConfig[scenarioKey as keyof typeof presetScenariosConfig].params);
    }
  };

  // AI Auto-tune handler
  const handleAiAutoTune = async (goalPrompt: string) => {
    setIsAiTuning(true);
    try {
      const res = await fetch('/api/ai/tune-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reformGoal: goalPrompt,
          currentParams: mixerParams,
        }),
      });
      const data = await res.json();
      if (data.recommendedParams) {
        setAiTuneResult(data);
        setMixerParams({
          ...mixerParams,
          ...data.recommendedParams,
        });
        setActiveScenario('custom');
      }
    } catch (err) {
      console.error('AI tuning failed:', err);
    } finally {
      setIsAiTuning(false);
    }
  };

  // One-on-one Department AI diagnosis
  const handleSelectDepartmentForAi = (dept: Department) => {
    setSelectedDeptForAi(dept);
    setIsAiAssistantOpen(true);
  };

  // Reset to baseline
  const handleResetData = () => {
    setActiveScenario('conservative');
    setMixerParams(presetScenariosConfig.conservative.params);
    setDepartments(initialDepartments);
    setEmployees(initialEmployees);
    setFinancialSummary(initialFinancialSummary);
    setOrderExecutions(initialOrderExecutionList);
    setPricingItems(initialPricingItems);
    setAttendanceRecords(initialAttendanceRecords);
    setAiTuneResult(null);
  };

  // Quick jump to Personnel Info Import
  const handleOpenPersonnelImport = () => {
    setActiveTab('import');
    setImportCategory('employee');
  };

  // Commit imported data and trigger live re-calculation
  const handleImportData = (imported: {
    departments?: Department[];
    employees?: Employee[];
    financialSummary?: FinancialSummary;
    orderExecutions?: ClinicalOrderExecution[];
    pricingItems?: PricingFeeItem[];
    attendanceRecords?: AttendanceRecord[];
  }) => {
    if (imported.departments) setDepartments(imported.departments);
    if (imported.employees) setEmployees(imported.employees);
    if (imported.financialSummary) setFinancialSummary(imported.financialSummary);
    if (imported.orderExecutions) setOrderExecutions(imported.orderExecutions);
    if (imported.pricingItems) setPricingItems(imported.pricingItems);
    if (imported.attendanceRecords) setAttendanceRecords(imported.attendanceRecords);
  };

  return (
    <div
      className={`${
        displayMode === 'light'
          ? 'theme-light bg-slate-50 text-slate-900'
          : 'bg-slate-950 text-slate-100'
      } min-h-screen flex flex-col font-sans selection:bg-cyan-500 selection:text-white transition-colors duration-200`}
    >
      {/* Global Header */}
      <Header
        financialSummary={calculatedState.financialSummary}
        activeScenario={activeScenario}
        onSelectScenario={handleSelectScenario}
        displayMode={displayMode}
        onSelectDisplayMode={setDisplayMode}
        onOpenMixer={() => setIsMixerOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onExportAll={() => exportDepartmentsToCSV(calculatedState.departments)}
        onResetData={handleResetData}
        onOpenPersonnelImport={handleOpenPersonnelImport}
        floorCount={calculatedState.floorCount}
        capCount={calculatedState.capCount}
        totalCurrentFTE={calculatedState.totalCurrentFTE}
        totalRecommendedFTE={calculatedState.totalRecommendedFTE}
      />

      {/* Mode 3: Classic System Menu Bar (经典系统独立多级菜单模式) */}
      {displayMode === 'classic_menu' ? (
        <div className="bg-slate-900 border-b border-slate-800 sticky top-[84px] z-20 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Top Hierarchical Dropdowns Bar */}
            <div className="flex items-center justify-between border-b border-slate-800/80 py-1 text-xs">
              <div className="flex items-center space-x-1 sm:space-x-2">
                {/* Menu 1: 数据采集与基础配置 */}
                <div className="relative group">
                  <button className="flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white font-medium cursor-pointer transition-colors">
                    <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>📁 数据采集与基础配置 (D)</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform" />
                  </button>
                  <div className="absolute left-0 mt-1 w-64 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-1.5 hidden group-hover:block z-50">
                    <button
                      onClick={() => {
                        setActiveTab('import');
                        setImportCategory('clinical_order');
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center gap-2 text-slate-200 hover:text-cyan-300 cursor-pointer"
                    >
                      <Database className="w-3.5 h-3.5 text-cyan-400" />
                      <div>
                        <div className="font-semibold">18大标准数据模块与接口</div>
                        <div className="text-[10px] text-slate-500">开单研判执行/门禁校验</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('import');
                        setImportCategory('employee');
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center gap-2 text-slate-200 hover:text-emerald-300 border-t border-slate-800/60 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <div>
                        <div className="font-semibold">人员信息与岗位档案导入</div>
                        <div className="text-[10px] text-slate-500">名称-科室-日期-职称-职务-岗位</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('import');
                        setImportCategory('organization');
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center gap-2 text-slate-200 hover:text-blue-300 border-t border-slate-800/60 cursor-pointer"
                    >
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      <div>
                        <div className="font-semibold">组织架构与临床医技科室</div>
                        <div className="text-[10px] text-slate-500">院区划分与核算单元归属</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('import');
                        setImportCategory('pricing');
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center gap-2 text-slate-200 hover:text-amber-300 border-t border-slate-800/60 cursor-pointer"
                    >
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <div>
                        <div className="font-semibold">医疗收费价格与工时目录</div>
                        <div className="text-[10px] text-slate-500">现行价格、工时与耗材成本</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('import');
                        setImportCategory('schedule_attendance');
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center gap-2 text-slate-200 hover:text-purple-300 border-t border-slate-800/60 cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      <div>
                        <div className="font-semibold">排班考勤工时与夜班急诊</div>
                        <div className="text-[10px] text-slate-500">实际出勤、夜班系数与手术工时</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Menu 2: 引擎测算与推演 */}
                <div className="relative group">
                  <button className="flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white font-medium cursor-pointer transition-colors">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                    <span>🎛️ 引擎测算与推演 (E)</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform" />
                  </button>
                  <div className="absolute left-0 mt-1 w-64 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-1.5 hidden group-hover:block z-50">
                    <button
                      onClick={() => setActiveTab('rbrvs')}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center gap-2 text-slate-200 hover:text-indigo-300 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      <div>
                        <div className="font-semibold">RBRVS与国家CCHI点数引擎</div>
                        <div className="text-[10px] text-slate-500">八大类目难度系数与统一点值</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('sandbox')}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center gap-2 text-slate-200 hover:text-cyan-300 border-t border-slate-800/60 cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                      <div>
                        <div className="font-semibold">调音台推杆与全科沙盘推演</div>
                        <div className="text-[10px] text-slate-500">大盘切分、断崖变动率与损益表</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('fte')}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center gap-2 text-slate-200 hover:text-blue-300 border-t border-slate-800/60 cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      <div>
                        <div className="font-semibold">定岗定编FTE需求测算工作台</div>
                        <div className="text-[10px] text-slate-500">工作量法与班次覆盖法编制</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setIsMixerOpen(true)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center gap-2 text-slate-200 hover:text-purple-300 border-t border-slate-800/60 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <div>
                        <div className="font-semibold">唤起无损半透调音台推杆</div>
                        <div className="text-[10px] text-slate-500">底图穿透与毫秒级实时联动</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Menu 3: 绩效分配与穿透 */}
                <div className="relative group">
                  <button className="flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white font-medium cursor-pointer transition-colors">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>📊 绩效分配与穿透 (A)</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform" />
                  </button>
                  <div className="absolute left-0 mt-1 w-64 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-1.5 hidden group-hover:block z-50">
                    <button
                      onClick={() => setActiveTab('ledger')}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center gap-2 text-slate-200 hover:text-emerald-300 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <div>
                        <div className="font-semibold">院-科-人穿透台账 (一次/二次分配)</div>
                        <div className="text-[10px] text-slate-500">个人综合积分法与审计溯源证据链</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('operations')}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center gap-2 text-slate-200 hover:text-amber-300 border-t border-slate-800/60 cursor-pointer"
                    >
                      <Activity className="w-3.5 h-3.5 text-amber-400" />
                      <div>
                        <div className="font-semibold">医院运营分析与全院成本核算</div>
                        <div className="text-[10px] text-slate-500">DRG效率、CMI难度与结余返还</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Menu 4: 质量监管与报告 */}
                <div className="relative group">
                  <button className="flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white font-medium cursor-pointer transition-colors">
                    <FileCheck2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>📋 质量监管与报告 (R)</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform" />
                  </button>
                  <div className="absolute left-0 mt-1 w-64 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-1.5 hidden group-hover:block z-50">
                    <button
                      onClick={() => setActiveTab('diagnosis')}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center gap-2 text-slate-200 hover:text-purple-300 cursor-pointer"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                      <div>
                        <div className="font-semibold">科室绩效诊断卡与门禁闭环</div>
                        <div className="text-[10px] text-slate-500">五阶段硬性门禁与异议申诉</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('report')}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center gap-2 text-slate-200 hover:text-cyan-300 border-t border-slate-800/60 cursor-pointer"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
                      <div>
                        <div className="font-semibold">咨询汇报方案与一键成册</div>
                        <div className="text-[10px] text-slate-500">院长办公会汇报与职代会方案</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setIsAiAssistantOpen(true)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center gap-2 text-slate-200 hover:text-indigo-300 border-t border-slate-800/60 cursor-pointer"
                    >
                      <Bot className="w-3.5 h-3.5 text-indigo-400" />
                      <div>
                        <div className="font-semibold">AI专家智囊改革交互中心</div>
                        <div className="text-[10px] text-slate-500">政策对标、自动调音与测算诊断</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>经典企业系统菜单模式生效中</span>
              </div>
            </div>

            {/* Breadcrumb Ribbon & Shortcut Bar */}
            <div className="flex flex-wrap items-center justify-between py-1.5 text-xs text-slate-400 border-t border-slate-800/40 gap-2">
              <div className="flex items-center gap-1.5 font-medium text-[11px]">
                <span className="text-slate-500">当前菜单路径:</span>
                <span className="text-slate-300 font-semibold">主系统</span>
                <span>&gt;</span>
                <span className="text-cyan-400 font-bold">
                  {activeTab === 'sandbox' && '🎛️ 调音台与沙盘推演'}
                  {activeTab === 'rbrvs' && '⚖️ RBRVS与国家CCHI点数引擎'}
                  {activeTab === 'fte' && '👥 定岗定编FTE工作量法测算'}
                  {activeTab === 'ledger' && '📊 院-科-人穿透台账 (含一次与二次分配)'}
                  {activeTab === 'operations' && '🏥 医院运营分析与全院成本核算'}
                  {activeTab === 'diagnosis' && '📋 科室绩效诊断卡与门禁闭环'}
                  {activeTab === 'report' && '📄 咨询汇报方案与一键成册'}
                  {activeTab === 'import' &&
                    (importCategory === 'employee'
                      ? '👤 人员信息与岗位档案导入'
                      : '📥 数据采集与18大标准模块')}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {[
                  { id: 'sandbox', label: '推演沙盘' },
                  { id: 'rbrvs', label: 'CCHI引擎' },
                  { id: 'fte', label: 'FTE定编' },
                  { id: 'ledger', label: '分配台账' },
                  { id: 'import', label: '数据中枢' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveTab(s.id as any)}
                    className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                      activeTab === s.id
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Tabs Navigation (For Dark & Light Modern Modes) */
        <div className="bg-slate-900/90 border-b border-slate-800 sticky top-[84px] z-20 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none text-xs font-medium">
              {[
                { id: 'sandbox', label: '🎛️ 调音台与沙盘推演', icon: SlidersHorizontal },
                { id: 'rbrvs', label: '⚖️ RBRVS与CCHI点数引擎', icon: Layers },
                { id: 'fte', label: '👥 定岗定编FTE测算', icon: Users },
                { id: 'ledger', label: '📊 院-科-人穿透台账', icon: FileText },
                { id: 'operations', label: '🏥 运营分析与成本核算', icon: Activity },
                { id: 'diagnosis', label: '📋 诊断卡与门禁闭环', icon: ShieldAlert },
                { id: 'report', label: '📄 咨询汇报方案生成', icon: FileCheck2 },
                { id: 'import', label: '📥 数据采集与18模块', icon: Database },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center space-x-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 text-cyan-300 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <tab.icon
                      className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}
                    />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'sandbox' && (
          <SandboxTab
            departments={calculatedState.departments}
            financialSummary={calculatedState.financialSummary}
            params={mixerParams}
            onOpenMixer={() => setIsMixerOpen(true)}
            onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
            onSelectDepartmentForAi={handleSelectDepartmentForAi}
          />
        )}

        {activeTab === 'rbrvs' && (
          <RbrvsEngineTab
            params={mixerParams}
            predictedPointValue={calculatedState.financialSummary.predictedPointValue}
            baselinePointValue={calculatedState.financialSummary.baselinePointValue}
          />
        )}

        {activeTab === 'fte' && (
          <FteManagementTab
            departments={calculatedState.departments}
            params={mixerParams}
            totalCurrentFTE={calculatedState.totalCurrentFTE}
            totalRecommendedFTE={calculatedState.totalRecommendedFTE}
          />
        )}

        {activeTab === 'ledger' && (
          <LedgerTraceabilityTab
            employees={calculatedState.employees}
            departments={calculatedState.departments}
            predictedPointValue={calculatedState.financialSummary.predictedPointValue}
            orderExecutions={orderExecutions}
            financialSummary={calculatedState.financialSummary}
          />
        )}

        {activeTab === 'operations' && (
          <OperationsCostTab
            departments={calculatedState.departments}
            financialSummary={calculatedState.financialSummary}
          />
        )}

        {activeTab === 'diagnosis' && (
          <DiagnosisAndGatekeeperTab
            departments={calculatedState.departments}
            onSelectDepartmentForAi={handleSelectDepartmentForAi}
          />
        )}

        {activeTab === 'report' && (
          <ConsultingReportTab
            departments={calculatedState.departments}
            financialSummary={calculatedState.financialSummary}
            activeScenario={activeScenario}
            params={mixerParams}
            floorCount={calculatedState.floorCount}
            capCount={calculatedState.capCount}
          />
        )}

        {activeTab === 'import' && (
          <DataImportTab
            departments={departments}
            employees={employees}
            financialSummary={financialSummary}
            orderExecutions={orderExecutions}
            pricingItems={pricingItems}
            attendanceRecords={attendanceRecords}
            initialCategory={importCategory}
            onCommitImport={handleImportData}
            onNavigateToSandbox={() => setActiveTab('sandbox')}
          />
        )}
      </main>

      {/* Floating Action Button for AI Consultant */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsAiAssistantOpen(true)}
          className="group flex items-center gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 ring-4 ring-purple-500/20"
          title="召唤AI绩效改革咨询顾问"
        >
          <Bot className="w-5 h-5 text-white animate-bounce" />
          <span className="hidden sm:inline text-xs font-bold tracking-wide">
            AI 改革智囊顾问
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        </button>
      </div>

      {/* Sliding Mixer Console Drawer (Equalizer) */}
      <MixerDrawer
        isOpen={isMixerOpen}
        onClose={() => setIsMixerOpen(false)}
        params={mixerParams}
        onChangeParams={(newP) => {
          setMixerParams(newP);
          setActiveScenario('custom');
        }}
        onApplyPreset={(presetKey) => {
          handleSelectScenario(presetKey as ScenarioType);
        }}
        onAiAutoTune={handleAiAutoTune}
        isAiTuning={isAiTuning}
        aiTuneResult={aiTuneResult}
        onSaveScenario={(name) => {
          setActiveScenario('custom');
          alert(`已成功保存测算方案快照：“${name}”！`);
        }}
        liveFinancialSummary={calculatedState.financialSummary}
        floorCount={calculatedState.floorCount}
        capCount={calculatedState.capCount}
        totalRecommendedFTE={calculatedState.totalRecommendedFTE}
      />

      {/* AI Assistant Chat & Diagnostic Dialog */}
      <AiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => {
          setIsAiAssistantOpen(false);
          setSelectedDeptForAi(null);
        }}
        departments={calculatedState.departments}
        financialSummary={calculatedState.financialSummary}
        params={mixerParams}
      />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            MediScale AI · 公立医院RBRVS+CCHI绩效与定岗定编一体化系统 (B/S架构)
          </span>
          <span>
            契合人社部发〔2021〕63号文 · 落实“两个允许” · 18模块测算工具包全流程贯通
          </span>
        </div>
      </footer>
    </div>
  );
}
