import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Zap,
  Sliders,
  Sparkles,
  Search,
  Filter,
  ArrowUpDown,
  Building,
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronRight,
  Eye,
  Bot,
} from 'lucide-react';
import { Department, FinancialSummary, MixerParams } from '../../types';

interface SandboxTabProps {
  departments: Department[];
  financialSummary: FinancialSummary;
  params: MixerParams;
  onOpenMixer: () => void;
  onOpenAiAssistant: () => void;
  onSelectDepartmentForAi: (dept: Department) => void;
}

export const SandboxTab: React.FC<SandboxTabProps> = ({
  departments,
  financialSummary,
  params,
  onOpenMixer,
  onOpenAiAssistant,
  onSelectDepartmentForAi,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortField, setSortField] = useState<keyof Department>('changeRate');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [inspectDept, setInspectDept] = useState<Department | null>(null);

  // Group departments into change ranges
  const cliffWarningList = departments.filter((d) => d.changeRate < -15);
  const moderateDeclineList = departments.filter((d) => d.changeRate >= -15 && d.changeRate < 0);
  const steadyGrowthList = departments.filter((d) => d.changeRate >= 0 && d.changeRate <= 15);
  const rapidGrowthList = departments.filter((d) => d.changeRate > 15);

  // Filter and sort
  const filteredDepartments = departments
    .filter((d) => {
      const matchSearch =
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.director.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'ALL' || d.category === selectedCategory;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }
      return sortAsc
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

  const handleSort = (field: keyof Department) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Sliders className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              公立医院薪酬绩效“沙盘推演”全景视图
            </h2>
            <span className="text-xs font-mono bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
              16个核算单元联动
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            实时反推统一点值（当前为{' '}
            <strong className="text-cyan-300 font-mono">¥{financialSummary.predictedPointValue}</strong>{' '}
            元/点），全自动实施保底保护下限（{params.protectFloor}%）与封顶上限（{params.protectCap}%），
            实现全院多轮测算平稳过渡。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMixer}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Sliders className="w-4 h-4" />
            <span>调整推音台推杆</span>
          </button>
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center space-x-1.5 bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Bot className="w-4 h-4" />
            <span>AI推演分析</span>
          </button>
        </div>
      </div>

      {/* 4 Quadrants / Change Distribution Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Quadrant 1: Severe Decline / Floor protection */}
        <div className="bg-slate-900 border border-red-900/40 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              断崖预警区 (&lt; -15%)
            </span>
            <span className="text-sm font-bold font-mono text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-800">
              {cliffWarningList.length} 科室
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mb-2">
            受药耗剔除或业务结构影响较大，已通过保底保护线进行差额兜底补齐。
          </p>
          <div className="flex flex-wrap gap-1 text-[11px]">
            {cliffWarningList.length > 0 ? (
              cliffWarningList.map((d) => (
                <span
                  key={d.id}
                  className="bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded"
                >
                  {d.name} ({d.changeRate}%)
                </span>
              ))
            ) : (
              <span className="text-slate-500 text-[10px]">当前调音台参数下暂无断崖科室</span>
            )}
          </div>
        </div>

        {/* Quadrant 2: Moderate Adjustment */}
        <div className="bg-slate-900 border border-amber-900/40 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-amber-500" />
              适度回调区 (-15% ~ 0%)
            </span>
            <span className="text-sm font-bold font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
              {moderateDeclineList.length} 科室
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mb-2">
            高耗材或检验试剂挤压效应正常回归，科室绩效处于安全耐受波动区间内。
          </p>
          <div className="flex flex-wrap gap-1 text-[11px]">
            {moderateDeclineList.map((d) => (
              <span
                key={d.id}
                className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded"
              >
                {d.name} ({d.changeRate}%)
              </span>
            ))}
          </div>
        </div>

        {/* Quadrant 3: Steady Growth */}
        <div className="bg-slate-900 border border-emerald-900/40 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              平稳增长区 (0% ~ +15%)
            </span>
            <span className="text-sm font-bold font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              {steadyGrowthList.length} 科室
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mb-2">
            符合“多劳多得、优劳优得”改革核心导向，技术难度与工作量获正向回馈。
          </p>
          <div className="flex flex-wrap gap-1 text-[11px]">
            {steadyGrowthList.map((d) => (
              <span
                key={d.id}
                className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded"
              >
                {d.name} (+{d.changeRate}%)
              </span>
            ))}
          </div>
        </div>

        {/* Quadrant 4: Rapid Growth / Cap Protection */}
        <div className="bg-slate-900 border border-blue-900/40 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-blue-400" />
              高速增长/封顶区 (&gt; +15%)
            </span>
            <span className="text-sm font-bold font-mono text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
              {rapidGrowthList.length} 科室
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mb-2">
            儿科/急症/重症等紧缺学科受战略倾斜扶持，部分达到上限触发平滑削峰。
          </p>
          <div className="flex flex-wrap gap-1 text-[11px]">
            {rapidGrowthList.map((d) => (
              <span
                key={d.id}
                className="bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded flex items-center gap-1"
              >
                {d.name} (+{d.changeRate}%)
                {d.isCapTriggered && <span title="已触发封顶削峰">⚡</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Department Simulation Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Table Search & Filter Toolbar */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">全院科室推演损益明细表</span>
            <span className="text-xs text-slate-400">
              (共 {filteredDepartments.length} 个科室)
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索科室、编码或主任..."
                className="bg-slate-900 text-xs text-slate-200 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-400 placeholder:text-slate-500 w-44 sm:w-56"
              />
            </div>

            {/* Category Filter with high contrast styling */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs shadow-inner">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-900 text-slate-100 text-xs font-medium focus:outline-none cursor-pointer pr-1 border-none"
              >
                <option value="ALL" className="bg-slate-950 text-slate-100 py-1 font-semibold">
                  全部核算类别
                </option>
                <option value="临床外科" className="bg-slate-950 text-slate-100 py-1">
                  临床外科
                </option>
                <option value="临床内科" className="bg-slate-950 text-slate-100 py-1">
                  临床内科
                </option>
                <option value="重症与急诊" className="bg-slate-950 text-slate-100 py-1">
                  重症与急诊
                </option>
                <option value="医技平台" className="bg-slate-950 text-slate-100 py-1">
                  医技平台
                </option>
                <option value="行政后勤" className="bg-slate-950 text-slate-100 py-1">
                  行政后勤
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Scrollable Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">科室名称 / 编码</th>
                <th
                  onClick={() => handleSort('category')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>类别</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('currentFTE')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>现FTE / 建议FTE</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('totalWeightedRVU')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>加权RVU点数</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('historicalBonus')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>历史实发(万)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('predictedBonus')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>新测算(万)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('protectedBonus')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>保护后实得(万)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('changeRate')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>变动幅度</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">平稳保护防线</th>
                <th className="py-3 px-3 text-center">CMI / 手术占比</th>
                <th className="py-3 px-4 text-center">管理操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredDepartments.map((dept) => {
                const isPositive = dept.changeRate >= 0;
                return (
                  <tr
                    key={dept.id}
                    className="hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* Dept Name */}
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                          {dept.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {dept.code} · 主任: {dept.director.split(' ')[0]}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-700">
                        {dept.category}
                      </span>
                    </td>

                    {/* FTE */}
                    <td className="py-3 px-3 text-right font-mono text-[11px]">
                      <span className="text-slate-300">{dept.currentFTE}人</span>
                      <span className="text-slate-500 mx-1">➔</span>
                      <span
                        className={`font-bold ${
                          dept.recommendedFTE > dept.currentFTE
                            ? 'text-blue-400'
                            : 'text-slate-300'
                        }`}
                      >
                        {dept.recommendedFTE}人
                      </span>
                    </td>

                    {/* RVU */}
                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-200">
                      {dept.totalWeightedRVU.toLocaleString()}
                    </td>

                    {/* Historical */}
                    <td className="py-3 px-3 text-right font-mono text-slate-400">
                      {dept.historicalBonus}
                    </td>

                    {/* Predicted */}
                    <td className="py-3 px-3 text-right font-mono font-medium text-cyan-300">
                      {dept.predictedBonus}
                    </td>

                    {/* Protected Final */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-white">
                      {dept.protectedBonus}
                    </td>

                    {/* Change Rate */}
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-flex items-center gap-0.5 font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          isPositive
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {dept.changeRate}%
                      </span>
                    </td>

                    {/* Protective Trigger Badge */}
                    <td className="py-3 px-3 text-center">
                      {dept.isFloorTriggered ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-semibold animate-pulse">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          已触发保底({params.protectFloor}%)
                        </span>
                      ) : dept.isCapTriggered ? (
                        <span className="inline-flex items-center gap-1 bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                          <Zap className="w-3 h-3 text-blue-400" />
                          已触发封顶({params.protectCap}%)
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">正常平稳区间</span>
                      )}
                    </td>

                    {/* CMI & 3/4 Surgery */}
                    <td className="py-3 px-3 text-center font-mono text-[11px]">
                      <span className="text-cyan-300">CMI: {dept.cmi}</span>
                      {dept.level34SurgeryRate > 0 && (
                        <span className="text-slate-400 ml-1.5">
                          / 手术: {dept.level34SurgeryRate}%
                        </span>
                      )}
                    </td>

                    {/* Operations Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setInspectDept(dept)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-1 rounded transition-colors text-[11px] flex items-center gap-1 px-2 border border-slate-700"
                          title="查看该科室深度沙盘透视"
                        >
                          <Eye className="w-3 h-3" />
                          <span>透视</span>
                        </button>
                        <button
                          onClick={() => onSelectDepartmentForAi(dept)}
                          className="bg-purple-900/60 hover:bg-purple-800 text-purple-200 p-1 rounded transition-colors text-[11px] flex items-center gap-1 px-2 border border-purple-700"
                          title="使用AI对该科室进行一对一问诊与沟通卡生成"
                        >
                          <Bot className="w-3 h-3" />
                          <span>AI问诊</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Drilldown / Deep Inspection Modal */}
      {inspectDept && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{inspectDept.name}</span>
                  <span className="text-xs bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                    {inspectDept.category}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  主任: {inspectDept.director} | 护士长: {inspectDept.headNurse} | 核定床位:{' '}
                  {inspectDept.bedCount}张
                </p>
              </div>
              <button
                onClick={() => setInspectDept(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">历史实发绩效</span>
                <p className="text-sm font-bold font-mono text-white mt-0.5">
                  {inspectDept.historicalBonus} 万元
                </p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">新方案预测绩效</span>
                <p className="text-sm font-bold font-mono text-cyan-400 mt-0.5">
                  {inspectDept.predictedBonus} 万元
                </p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">保底封顶保护后</span>
                <p className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                  {inspectDept.protectedBonus} 万元
                </p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">绩效变动幅度</span>
                <p
                  className={`text-sm font-bold font-mono mt-0.5 ${
                    inspectDept.changeRate >= 0 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {inspectDept.changeRate >= 0 ? '+' : ''}
                  {inspectDept.changeRate}%
                </p>
              </div>
            </div>

            {/* FTE Decomposition Box */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3.5 space-y-2 text-xs">
              <h4 className="font-bold text-cyan-300 flex items-center justify-between">
                <span>定岗定编（FTE）深度测算剖析</span>
                <span className="text-[10px] text-slate-400">
                  工作量法 + 班次覆盖法 + 12%平滑上限
                </span>
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono text-xs">
                <div className="bg-slate-900 p-2 rounded">
                  <div className="text-slate-400 text-[10px]">现有有效FTE</div>
                  <div className="font-bold text-white text-sm">{inspectDept.currentFTE}人</div>
                </div>
                <div className="bg-slate-900 p-2 rounded">
                  <div className="text-slate-400 text-[10px]">工作量测算FTE</div>
                  <div className="font-bold text-blue-400 text-sm">{inspectDept.workloadFTE}人</div>
                </div>
                <div className="bg-slate-900 p-2 rounded">
                  <div className="text-slate-400 text-[10px]">建议规划FTE</div>
                  <div className="font-bold text-emerald-400 text-sm">
                    {inspectDept.recommendedFTE}人
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                编制结论：{inspectDept.recommendedFTE > inspectDept.currentFTE
                  ? `存在人员结构性缺口 ${inspectDept.recommendedFTE - inspectDept.currentFTE}人，建议在下期纳编招聘予以补强。`
                  : `当前人员编制基本匹配，应进一步提升人均RVU产出效率。`}
              </p>
            </div>

            {/* Strategic Rationale & Advice */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-purple-300">
                管理解释与第二轮沟通建议：
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                该科室战略倾斜系数设定为{' '}
                <strong className="text-cyan-300">{inspectDept.strategicFactor}</strong>
                ，CMI值为 {inspectDept.cmi}。在向科主任反馈时，应重点解读
                {inspectDept.changeRate >= 0
                  ? '方案对高难度手术、疑难危重救治与工作量优劳优得的正向激励'
                  : '药耗剔除对虚高收入的挤压，引导科室向提升三四级手术、微创诊疗及缩短平均住院日转型'}
                。
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  const target = inspectDept;
                  setInspectDept(null);
                  onSelectDepartmentForAi(target);
                }}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-4 py-2 rounded-lg font-medium flex items-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>生成该科室AI专属诊断报告</span>
              </button>
              <button
                onClick={() => setInspectDept(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2 rounded-lg"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
