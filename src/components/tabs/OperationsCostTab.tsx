import React, { useState } from 'react';
import {
  PieChart,
  TrendingUp,
  DollarSign,
  Activity,
  Layers,
  Award,
  AlertCircle,
  FileCheck,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { Department, FinancialSummary } from '../../types';

interface OperationsCostTabProps {
  departments: Department[];
  financialSummary: FinancialSummary;
}

export const OperationsCostTab: React.FC<OperationsCostTabProps> = ({
  departments,
  financialSummary,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'COST' | 'NATIONAL_EXAM' | 'DRG'>('COST');

  // National exam metrics
  const nationalExamMetrics = [
    { code: 'GK-01', name: '病案首页主要诊断填写正确率', target: '≥ 95%', actual: '97.2%', status: 'PASS', weight: 4 },
    { code: 'GK-02', name: '出院患者四级手术比例', target: '≥ 25%', actual: '28.4%', status: 'PASS', weight: 5 },
    { code: 'GK-03', name: '微创手术占全部手术比例', target: '≥ 22%', actual: '24.1%', status: 'PASS', weight: 4 },
    { code: 'GK-04', name: '病例组合指数 (CMI值)', target: '≥ 1.20', actual: '1.28', status: 'PASS', weight: 5 },
    { code: 'GK-05', name: '门诊次均费用增幅', target: '≤ 3.5%', actual: '2.1%', status: 'PASS', weight: 3 },
    { code: 'GK-06', name: '住院次均费用增幅', target: '≤ 4.0%', actual: '3.4%', status: 'PASS', weight: 4 },
    { code: 'GK-07', name: '基本药物采购金额占比', target: '≥ 45%', actual: '46.8%', status: 'PASS', weight: 3 },
    { code: 'GK-08', name: '重点监控高值耗材使用占比', target: '≤ 18%', actual: '15.2%', status: 'PASS', weight: 4 },
  ];

  // 3-level cost sample data
  const costBreakdown = [
    { category: '人员经费 (直接人工)', amount: 28400, ratio: 62.0, desc: '工资、社保、工会经费、福利费' },
    { category: '卫生材料直接消耗', amount: 8200, ratio: 17.9, desc: '低值耗材、消毒试剂、防护用品' },
    { category: '仪器设备折旧与维修', amount: 4600, ratio: 10.0, desc: '大型医用设备折旧、维保合同' },
    { category: '公用及院级公摊费用', amount: 3200, ratio: 7.0, desc: '水电气暖、信息网络维护、后勤外包' },
    { category: '无形资产与其他费用', amount: 1400, ratio: 3.1, desc: '软件授权、科研教学进修分摊' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Navigation Sub-Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            医院精细化运营分析、三级成本核算与国考指标管理
          </h2>
          <p className="text-xs text-slate-400">
            科室直接/间接成本核算、病种DRG成本盈亏、药耗结构治理与“国考”三级公立医院绩效考核看板
          </p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveSubTab('COST')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              activeSubTab === 'COST'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            三级成本核算
          </button>
          <button
            onClick={() => setActiveSubTab('NATIONAL_EXAM')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              activeSubTab === 'NATIONAL_EXAM'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            国考56项与等评指标
          </button>
          <button
            onClick={() => setActiveSubTab('DRG')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              activeSubTab === 'DRG'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            DRG/DIP盈亏透视
          </button>
        </div>
      </div>

      {/* SUBTAB 1: 3-LEVEL COSTING */}
      {activeSubTab === 'COST' && (
        <div className="space-y-6">
          {/* Financial Revenue & Cost Bridge */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
              <span className="text-xs text-slate-400">全院医疗总收入</span>
              <p className="text-xl font-bold font-mono text-white mt-1">
                {(financialSummary.grossIncome / 10000).toFixed(2)} 亿元
              </p>
              <div className="flex justify-between text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-800">
                <span>药品转付: {(financialSummary.drugRevenue / 10000).toFixed(2)}亿</span>
                <span>耗材转付: {(financialSummary.consumableRevenue / 10000).toFixed(2)}亿</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
              <span className="text-xs text-slate-400">有效收入 (剔除药耗后)</span>
              <p className="text-xl font-bold font-mono text-cyan-400 mt-1">
                {(financialSummary.effectiveIncome / 10000).toFixed(2)} 亿元
              </p>
              <div className="flex justify-between text-[10px] text-cyan-400/80 mt-2 pt-2 border-t border-slate-800">
                <span>药耗剔除率: {(((financialSummary.drugRevenue + financialSummary.consumableRevenue) / financialSummary.grossIncome) * 100).toFixed(1)}%</span>
                <span>有效产出比率: {((financialSummary.effectiveIncome / financialSummary.grossIncome) * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
              <span className="text-xs text-slate-400">全院可分配结余</span>
              <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {(financialSummary.distributableSurplus / 10000).toFixed(2)} 亿元
              </p>
              <div className="flex justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
                <span>可控成本: {(financialSummary.controllableCost / 10000).toFixed(2)}亿</span>
                <span>风险发展留存: {(financialSummary.riskReserve / 10000).toFixed(2)}亿</span>
              </div>
            </div>
          </div>

          {/* Three Level Costing Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-cyan-300 font-bold border-b border-slate-800 pb-2">
                <span>① 科室成本核算 (一级)</span>
                <span className="text-[10px] bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
                  全成本核算
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                归集直接成本（人员、卫生材料、设备折旧），并经过“行政后勤 ➔ 医辅 ➔ 医技 ➔ 临床”四级阶梯分摊，明确各临床科室全成本与保本点。
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-blue-300 font-bold border-b border-slate-800 pb-2">
                <span>② 医疗服务项目成本 (二级)</span>
                <span className="text-[10px] bg-blue-950 px-1.5 py-0.5 rounded border border-blue-800">
                  CCHI基准
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                测算每项诊疗技术（如胃癌根治术、CT扫描）的标准工时消耗、材料直接费与仪器折旧成本，为RBRVS点数校准与院内定价提供科学支撑。
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-emerald-300 font-bold border-b border-slate-800 pb-2">
                <span>③ 病种与DRG/DIP成本 (三级)</span>
                <span className="text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                  医保盈亏平衡
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                以出院患者病案为核算载体，精准测算单病种实际总成本与医保DRG付费差额，有效引导临床路径规范、杜绝过度医疗与超支自负。
              </p>
            </div>
          </div>

          {/* Cost Composition Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 bg-slate-950/80 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">医院可控运营成本结构明细表</h3>
              <p className="text-xs text-slate-400">已剔除药品转付及高值耗材垫付成本</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">成本项目分类</th>
                    <th className="py-3 px-4 text-right">金额 (万元/年)</th>
                    <th className="py-3 px-4 text-right">占比 (%)</th>
                    <th className="py-3 px-4">包含主要经济要素与核算归集规则</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {costBreakdown.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-white">{c.category}</td>
                      <td className="py-3 px-4 text-right font-mono text-cyan-300 font-medium">
                        {c.amount.toLocaleString()} 万元
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-200">
                        {c.ratio}%
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">{c.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: NATIONAL EXAM */}
      {activeSubTab === 'NATIONAL_EXAM' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  国家三级公立医院绩效考核（“国考”）核心指标监测
                </h3>
                <p className="text-xs text-slate-400">
                  质量与DRG绩效池（占比11%）直接挂钩国考重点指标，强化“国考指挥棒”落地
                </p>
              </div>
              <span className="text-xs bg-purple-950 text-purple-300 px-3 py-1 rounded-full border border-purple-800 font-mono">
                综合评分: 94.8 / 100分 (A+ 等级)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {nationalExamMetrics.map((m) => (
                <div
                  key={m.code}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-xs"
                >
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="font-mono text-cyan-400">{m.code}</span>
                    <span className="text-emerald-400 font-bold">达标 ✓</span>
                  </div>
                  <div className="font-medium text-white text-[11px] truncate" title={m.name}>
                    {m.name}
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-800/80 font-mono text-[11px]">
                    <span className="text-slate-400">目标: {m.target}</span>
                    <span className="text-cyan-300 font-bold">实际: {m.actual}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: DRG */}
      {activeSubTab === 'DRG' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">
              DRG病组医保盈亏平衡与CMI象限透视
            </h3>
            <p className="text-xs text-slate-400">
              通过真实病案费用与DRG权重分值比对，引导临床科室规范诊疗路径、减少超标药耗
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400">全院入组病例总数</span>
              <p className="text-lg font-bold font-mono text-white mt-1">32,840 例</p>
              <span className="text-[10px] text-emerald-400">入组率: 99.8%</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400">全院综合CMI指数</span>
              <p className="text-lg font-bold font-mono text-cyan-400 mt-1">1.28</p>
              <span className="text-[10px] text-slate-400">重症病组占比持续提升</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400">医保DRG结算累计结余</span>
              <p className="text-lg font-bold font-mono text-emerald-400 mt-1">+1,240 万元</p>
              <span className="text-[10px] text-emerald-400">入选DRG优秀管理示范医院</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
