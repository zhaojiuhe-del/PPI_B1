import React, { useState } from 'react';
import {
  Users,
  Clock,
  Briefcase,
  AlertCircle,
  TrendingUp,
  Shield,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  UserPlus,
  HelpCircle,
} from 'lucide-react';
import { Department, MixerParams } from '../../types';

interface FteManagementTabProps {
  departments: Department[];
  params: MixerParams;
  totalCurrentFTE: number;
  totalRecommendedFTE: number;
}

export const FteManagementTab: React.FC<FteManagementTabProps> = ({
  departments,
  params,
  totalCurrentFTE,
  totalRecommendedFTE,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGapOnly, setFilterGapOnly] = useState(false);

  const fteGapDepartments = departments.filter((d) => d.recommendedFTE > d.currentFTE);
  const fteSurplusDepartments = departments.filter((d) => d.recommendedFTE < d.currentFTE);
  const fteMatchDepartments = departments.filter((d) => d.recommendedFTE === d.currentFTE);

  const totalGap = fteGapDepartments.reduce(
    (acc, d) => acc + (d.recommendedFTE - d.currentFTE),
    0
  );

  const totalSurplus = fteSurplusDepartments.reduce(
    (acc, d) => acc + (d.currentFTE - d.recommendedFTE),
    0
  );

  const filteredList = departments.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGap = filterGapOnly ? d.recommendedFTE !== d.currentFTE : true;
    return matchesSearch && matchesGap;
  });

  return (
    <div className="space-y-6">
      {/* Top Method Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800">
            <Users className="w-4 h-4" />
          </span>
          <h2 className="text-base font-bold text-white tracking-tight">
            定岗定编（FTE 全时当量）双模态测算与结构优化
          </h2>
          <span className="text-xs bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800 font-mono">
            工作量法 ⊕ 班次连续覆盖法
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
          突破传统“按编制人头”粗放核算，结合临床诊疗工时测算与24小时连续班次刚性覆盖需求，
          自动生成科室理论需求FTE，并施加规划期平滑上限（±{params.fteMaxAdjustRatio}%），
          精准识别科室人员结构性缺口与冗余。
        </p>

        {/* 2 Calculation Modalities Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-blue-400 font-bold mb-1 flex items-center gap-1">
              <span>① 工作量法需求 FTE</span>
            </div>
            <div className="text-[11px] text-slate-300">
              FTE_work = 预测总工时(分) ÷ (单人年可用工时 × 工时效率)
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              适用于常规门诊、择期手术与医技检查等量化岗位
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-emerald-400 font-bold mb-1 flex items-center gap-1">
              <span>② 班次连续覆盖需求 FTE</span>
            </div>
            <div className="text-[11px] text-slate-300">
              FTE_shift = 岗位连续运转工时 ÷ (每人实际可用工时 × 85%)
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              适用于急诊抢救室、重症ICU、分娩室等24小时排班岗
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-purple-400 font-bold mb-1 flex items-center gap-1">
              <span>③ 建议规划需求 FTE (平滑后)</span>
            </div>
            <div className="text-[11px] text-slate-300">
              FTE_rec = 限制在 [现FTE × (1-12%), 现FTE × (1+12%)]
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              防止单个规划周期内编制调增或调减造成科室动荡
            </div>
          </div>
        </div>
      </div>

      {/* Hospital-wide FTE Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <span className="text-xs text-slate-400">全院当前在岗有效FTE</span>
          <p className="text-xl font-bold font-mono text-white mt-1">
            {totalCurrentFTE} <span className="text-xs font-normal text-slate-400">人</span>
          </p>
          <span className="text-[10px] text-slate-500">已折算产假、进修折半系数</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <span className="text-xs text-slate-400">全院建议规划总FTE</span>
          <p className="text-xl font-bold font-mono text-cyan-400 mt-1">
            {totalRecommendedFTE} <span className="text-xs font-normal text-slate-400">人</span>
          </p>
          <span className="text-[10px] text-blue-400">
            净调整: {totalRecommendedFTE - totalCurrentFTE >= 0 ? '+' : ''}
            {totalRecommendedFTE - totalCurrentFTE} 人
          </span>
        </div>

        <div className="bg-slate-900 border border-blue-900/40 rounded-xl p-4 shadow">
          <div className="flex justify-between items-center">
            <span className="text-xs text-blue-300 font-medium">存在编制缺口科室</span>
            <span className="text-xs font-bold bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
              {fteGapDepartments.length} 科室
            </span>
          </div>
          <p className="text-xl font-bold font-mono text-blue-400 mt-1">
            缺口 {totalGap} <span className="text-xs font-normal text-slate-400">人</span>
          </p>
          <span className="text-[10px] text-slate-400">重点集中在急诊中心、ICU及麻醉</span>
        </div>

        <div className="bg-slate-900 border border-amber-900/40 rounded-xl p-4 shadow">
          <div className="flex justify-between items-center">
            <span className="text-xs text-amber-300 font-medium">效率待挖潜科室</span>
            <span className="text-xs font-bold bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
              {fteSurplusDepartments.length} 科室
            </span>
          </div>
          <p className="text-xl font-bold font-mono text-amber-400 mt-1">
            富余 {totalSurplus} <span className="text-xs font-normal text-slate-400">人</span>
          </p>
          <span className="text-[10px] text-slate-400">人均RVU产出偏低，宜内部转岗流转</span>
        </div>
      </div>

      {/* FTE Allocation Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">
              科室定岗定编测算明细与配置建议表
            </h3>
            <p className="text-xs text-slate-400">
              比对现有FTE、工作量需求、班次覆盖刚性需求及平滑调整后建议编制
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索科室..."
                className="bg-slate-900 text-xs text-slate-200 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 focus:ring-1 focus:ring-cyan-400 w-44"
              />
            </div>
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={filterGapOnly}
                onChange={(e) => setFilterGapOnly(e.target.checked)}
                className="rounded accent-cyan-500"
              />
              <span>仅看有缺口/富余科室</span>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">科室名称</th>
                <th className="py-3 px-3 text-center">核定床位</th>
                <th className="py-3 px-3 text-right">现有有效FTE</th>
                <th className="py-3 px-3 text-right">工作量法需求</th>
                <th className="py-3 px-3 text-right">班次覆盖需求</th>
                <th className="py-3 px-3 text-right">建议规划FTE</th>
                <th className="py-3 px-3 text-center">编制差额(增/减)</th>
                <th className="py-3 px-3 text-right">人均RVU产出</th>
                <th className="py-3 px-4">人岗配置建议与治理对策</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredList.map((dept) => {
                const diff = dept.recommendedFTE - dept.currentFTE;
                const perCapitaRVU = Math.round(dept.totalWeightedRVU / dept.currentFTE);
                return (
                  <tr key={dept.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{dept.name}</div>
                      <div className="text-[10px] text-slate-400">{dept.category}</div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-300">
                      {dept.bedCount > 0 ? `${dept.bedCount}张` : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-200">
                      {dept.currentFTE}人
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-blue-400">
                      {dept.workloadFTE}人
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-400">
                      {dept.shiftFTE}人
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-white text-sm">
                      {dept.recommendedFTE}人
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold">
                      {diff > 0 ? (
                        <span className="bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded text-[11px]">
                          +{diff} (缺口)
                        </span>
                      ) : diff < 0 ? (
                        <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded text-[11px]">
                          {diff} (冗余)
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">匹配</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">
                      {perCapitaRVU.toLocaleString()} 点/人
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {diff > 0 ? (
                        <span className="text-blue-300 text-[11px]">
                          {dept.category === '重症与急诊'
                            ? '24小时刚性排班覆盖缺口，建议纳入招聘绿通优先补充'
                            : '业务量高负荷运转，建议增加1~2名住院医师/责任护士'}
                        </span>
                      ) : diff < 0 ? (
                        <span className="text-amber-300 text-[11px]">
                          人均点数偏低，宜压缩非临床行政借调，提升床位周转率
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">
                          人岗匹配合理，保持当前编制稳定运行
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
