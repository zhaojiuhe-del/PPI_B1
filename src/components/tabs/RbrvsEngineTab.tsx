import React, { useState } from 'react';
import {
  Calculator,
  Search,
  BookOpen,
  Filter,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Sliders,
  Layers,
  Activity,
  Layers3,
} from 'lucide-react';
import { CCHIMappingItem, MixerParams } from '../../types';
import { initialCCHIItems } from '../../mock/initialData';

interface RbrvsEngineTabProps {
  params: MixerParams;
  predictedPointValue: number;
  baselinePointValue: number;
}

export const RbrvsEngineTab: React.FC<RbrvsEngineTabProps> = ({
  params,
  predictedPointValue,
  baselinePointValue,
}) => {
  const [items, setItems] = useState<CCHIMappingItem[]>(initialCCHIItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Simulator state
  const [simItem, setSimItem] = useState<CCHIMappingItem>(initialCCHIItems[0]);
  const [simQuantity, setSimQuantity] = useState<number>(5);
  const [simRole, setSimRole] = useState<string>('主刀');
  const [simTitle, setSimTitle] = useState<string>('正高');
  const [simDeptStrategic, setSimDeptStrategic] = useState<number>(1.15);

  const filteredItems = items.filter((item) => {
    const matchSearch =
      item.internalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.internalCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cchiCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cchiName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory =
      selectedCategory === 'ALL' || item.category.includes(selectedCategory);
    return matchSearch && matchCategory;
  });

  // Simulator calculations
  const roleFactorMap: Record<string, number> = {
    主刀: params.surgeonWeight,
    一助: params.firstAssistantWeight,
    二助: params.secondAssistantWeight,
    洗手护士: params.nurseRoleWeight,
    巡回护士: params.nurseRoleWeight,
    主检签发: 1.0,
    独立执行: 1.0,
  };

  const titleFactorMap: Record<string, number> = {
    正高: 1.2,
    副高: 1.1,
    中级: 1.0,
    初级: 0.9,
  };

  const simRoleFactor = roleFactorMap[simRole] || 1.0;
  const simTitleFactor = titleFactorMap[simTitle] || 1.0;
  const simBaseRVU = simItem.standardRVU;
  const simTotalWeightedRVU = Number(
    (
      simQuantity *
      simBaseRVU *
      simRoleFactor *
      simTitleFactor *
      simDeptStrategic
    ).toFixed(2)
  );

  const simCalculatedAmount = Number(
    (simTotalWeightedRVU * predictedPointValue).toFixed(1)
  );

  return (
    <div className="space-y-6">
      {/* Top Math Logic & Standard Specification Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 rounded-lg bg-blue-950 text-blue-400 border border-blue-800">
            <Calculator className="w-4 h-4" />
          </span>
          <h2 className="text-base font-bold text-white tracking-tight">
            RBRVS相对价值点数体系与国家CCHI标尺引擎
          </h2>
          <span className="text-xs bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-mono">
            五维相对价值度量 (W+S+R+T+Res)
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
          建立以**国家医疗服务项目分类与编码（CCHI）**为项目粒度底座，全面度量临床劳动的
          <strong className="text-slate-200">工作量(Work)、技能(Skill)、风险(Risk)、工时(Time)、资源(Resource)</strong>，
          形成客观标准点数（RVU），辅以去重角色系数与战略倾斜，彻底破除“以收扣支”。
        </p>

        {/* Formula Whitebox Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono space-y-1">
            <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
              <span className="text-cyan-400">公式 1:</span> 标准项目点数 (Standard RVU)
            </div>
            <div className="text-cyan-300 font-bold text-[11px]">
              RVU = (工作量Work + 技能Skill + 风险Risk + 时间Time + 资源Res) × 项目难度系数
            </div>
            <div className="text-[10px] text-slate-500">
              *难度系数：四级高危手术 1.25~1.35 | 三级手术 1.15 | 普通诊疗 1.0
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono space-y-1">
            <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
              <span className="text-emerald-400">公式 2:</span> 个人/事件加权总点数
            </div>
            <div className="text-emerald-300 font-bold text-[11px]">
              加权RVU = 业务量 × 标准点数 × 角色系数 × 职称系数 × 科室战略倾斜
            </div>
            <div className="text-[10px] text-slate-500">
              *严禁主刀责任在岗位系数中重复叠加加权（管理去重约束严格门禁）
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Section */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-blue-800/40 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              诊疗项目点数与金额实时仿真试算器
            </h3>
          </div>
          <span className="text-xs font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
            统一点值: ¥{predictedPointValue} 元/点
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Item Selector */}
          <div className="space-y-1 lg:col-span-2">
            <label className="text-slate-400">选择医疗服务项目 (CCHI):</label>
            <select
              value={simItem.id}
              onChange={(e) => {
                const found = items.find((x) => x.id === e.target.value);
                if (found) setSimItem(found);
              }}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-cyan-400"
            >
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  [{i.cchiCode}] {i.internalName} (基础RVU: {i.standardRVU})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div className="space-y-1">
            <label className="text-slate-400">执行业务量 (例次):</label>
            <input
              type="number"
              min="1"
              max="500"
              value={simQuantity}
              onChange={(e) => setSimQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs font-mono"
            />
          </div>

          {/* Role */}
          <div className="space-y-1">
            <label className="text-slate-400">执行角色 (分工责任):</label>
            <select
              value={simRole}
              onChange={(e) => setSimRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs"
            >
              <option value="主刀">主刀专家 (系数: {params.surgeonWeight})</option>
              <option value="一助">第一助手 (系数: {params.firstAssistantWeight})</option>
              <option value="二助">第二助手 (系数: {params.secondAssistantWeight})</option>
              <option value="洗手护士">专科洗手护士 (系数: {params.nurseRoleWeight})</option>
              <option value="独立执行">独立执行操作 (系数: 1.0)</option>
              <option value="主检签发">主检审签 (系数: 1.0)</option>
            </select>
          </div>

          {/* Title & Strategic */}
          <div className="space-y-1">
            <label className="text-slate-400">科室战略倾斜系数:</label>
            <input
              type="number"
              step="0.05"
              min="0.9"
              max="1.4"
              value={simDeptStrategic}
              onChange={(e) => setSimDeptStrategic(parseFloat(e.target.value) || 1.0)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs font-mono"
            />
          </div>
        </div>

        {/* Simulation Output Banner */}
        <div className="bg-slate-950/80 border border-cyan-800/50 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 text-[10px] block">标准项目RVU</span>
              <span className="text-sm font-bold text-white">{simBaseRVU}</span>
            </div>
            <span className="text-slate-500">×</span>
            <div>
              <span className="text-slate-400 text-[10px] block">业务量</span>
              <span className="text-sm font-bold text-white">{simQuantity}</span>
            </div>
            <span className="text-slate-500">×</span>
            <div>
              <span className="text-slate-400 text-[10px] block">角色系数</span>
              <span className="text-sm font-bold text-cyan-400">{simRoleFactor}</span>
            </div>
            <span className="text-slate-500">×</span>
            <div>
              <span className="text-slate-400 text-[10px] block">战略倾斜</span>
              <span className="text-sm font-bold text-purple-400">{simDeptStrategic}</span>
            </div>
            <span className="text-slate-500">=</span>
            <div>
              <span className="text-slate-400 text-[10px] block">总加权点数</span>
              <span className="text-base font-bold text-emerald-400">
                {simTotalWeightedRVU} 点
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">测算个人工作量应得绩效</span>
              <span className="text-lg font-bold font-mono text-cyan-400">
                ¥ {simCalculatedAmount.toLocaleString()} 元
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CCHI and RBRVS Item Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">
              院内收费目录与国家CCHI标准映射库
            </h3>
            <p className="text-xs text-slate-400">
              已映射国家标准编码、五维资源相对价值点数及无收费劳动项目
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索项目、CCHI编码..."
                className="bg-slate-900 text-xs text-slate-200 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 focus:ring-1 focus:ring-cyan-400 w-52"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 text-xs text-slate-300 border border-slate-700 rounded-lg p-1.5"
            >
              <option value="ALL">全部项目分类</option>
              <option value="手术">手术与介入</option>
              <option value="诊断">医技诊断</option>
              <option value="护理">重症护理</option>
              <option value="无收费">无收费劳动补贴</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">院内编码 / 项目名称</th>
                <th className="py-3 px-3">国家CCHI编码 / 标准名称</th>
                <th className="py-3 px-3">项目类别</th>
                <th className="py-3 px-2 text-right">工时(分)</th>
                <th className="py-3 px-2 text-right">工作量(W)</th>
                <th className="py-3 px-2 text-right">技术技能(S)</th>
                <th className="py-3 px-2 text-right">医疗风险(R)</th>
                <th className="py-3 px-2 text-right">难度系数</th>
                <th className="py-3 px-3 text-right">基准RVU</th>
                <th className="py-3 px-4 text-right">历史年业务量</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{item.internalName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {item.internalCode}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-cyan-300 font-mono text-[11px]">
                      {item.cchiCode}
                    </div>
                    <div className="text-[10px] text-slate-400">{item.cchiName}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-700">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-slate-400">
                    {item.timeMinutes}分
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-slate-300">
                    {item.workload}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-slate-300">
                    {item.skill}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-slate-300">
                    {item.risk}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-purple-400 font-semibold">
                    {item.difficultyFactor}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 text-sm">
                    {item.standardRVU}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400">
                    {item.annualVolume.toLocaleString()} 例
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
