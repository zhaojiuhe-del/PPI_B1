import React, { useState } from 'react';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  MessageSquare,
  Shield,
  Layers,
  ChevronRight,
  Printer,
  Sparkles,
  Bot,
  UserCheck,
  Send,
  PlusCircle,
} from 'lucide-react';
import { GatekeeperStage, IssueFeedbackItem, Department } from '../../types';
import { initialGatekeeperStages, initialIssueFeedbackList } from '../../mock/initialData';

interface DiagnosisAndGatekeeperTabProps {
  departments: Department[];
  onSelectDepartmentForAi: (dept: Department) => void;
}

export const DiagnosisAndGatekeeperTab: React.FC<DiagnosisAndGatekeeperTabProps> = ({
  departments,
  onSelectDepartmentForAi,
}) => {
  const [activeView, setActiveView] = useState<'GATEKEEPER' | 'DIAGNOSIS_CARD' | 'ISSUE_LOG'>('GATEKEEPER');
  const [stages, setStages] = useState<GatekeeperStage[]>(initialGatekeeperStages);
  const [issues, setIssues] = useState<IssueFeedbackItem[]>(initialIssueFeedbackList);
  const [selectedDeptCard, setSelectedDeptCard] = useState<Department>(departments[0]);
  const [newIssueText, setNewIssueText] = useState('');
  const [newIssueDept, setNewIssueDept] = useState(departments[0].name);

  const handleAddNewIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssueText.trim()) return;

    const newItem: IssueFeedbackItem = {
      id: `ISSUE-0${issues.length + 1}`,
      departmentId: departments.find((d) => d.name === newIssueDept)?.id || 'dept-01',
      departmentName: newIssueDept,
      submitter: '科室联系人',
      submitTime: new Date().toISOString().split('T')[0],
      category: '无收费劳动与项目映射遗漏',
      description: newIssueText.trim(),
      status: 'PENDING_REVIEW',
      actionTaken: '已登记入库，等待工作组专家集体核查。',
      reviewer: '改革工作组',
    };

    setIssues([newItem, ...issues]);
    setNewIssueText('');
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            改革实施管理：14阶段门禁看板、科室诊断卡与异议闭环台账
          </h2>
          <p className="text-xs text-slate-400">
            落实“数据说话、流程规范、闭环管理”，严格把控8大决策门禁与第二轮科室调研沟通
          </p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveView('GATEKEEPER')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              activeView === 'GATEKEEPER'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            14阶段与8大门禁
          </button>
          <button
            onClick={() => setActiveView('DIAGNOSIS_CARD')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              activeView === 'DIAGNOSIS_CARD'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            科室绩效诊断卡
          </button>
          <button
            onClick={() => setActiveView('ISSUE_LOG')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              activeView === 'ISSUE_LOG'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            异议与变更台账 ({issues.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: GATEKEEPER 14 STAGES */}
      {activeView === 'GATEKEEPER' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white">
                改革实施阶段进度与8大决策门禁 (Gatekeepers)
              </h3>
              <span className="text-xs text-slate-400">
                当前阶段：阶段9 (多情景沙盘模拟与合理性验证)
              </span>
            </div>

            <div className="space-y-3">
              {stages.map((stage) => {
                const isDone = stage.status === 'COMPLETED';
                const isCurrent = stage.status === 'IN_PROGRESS';
                return (
                  <div
                    key={stage.id}
                    className={`border rounded-xl p-4 transition-all text-xs ${
                      isDone
                        ? 'bg-slate-950/60 border-slate-800'
                        : isCurrent
                        ? 'bg-blue-950/30 border-blue-600 shadow-md ring-1 ring-blue-500/30'
                        : 'bg-slate-950/30 border-slate-800/60 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold font-mono text-xs ${
                            isDone
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : isCurrent
                              ? 'bg-blue-900 text-blue-200 border border-blue-600 animate-pulse'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {stage.id}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs flex items-center gap-2">
                            <span>{stage.name}</span>
                            <span className="text-[10px] text-cyan-400 font-mono">
                              [{stage.gatekeeperName}]
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            责任归属: {stage.owner} | 交付物: {stage.keyArtifact}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        {isDone ? (
                          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            已审批通过 ({stage.approvedDate})
                          </span>
                        ) : isCurrent ? (
                          <span className="bg-blue-950 text-blue-300 border border-blue-700 px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-400 animate-spin" />
                            正在推演验证 ({stage.completionRate}%)
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">待开展</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                      <strong>工作进展备注:</strong> {stage.notes}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DEPARTMENT DIAGNOSIS CARD */}
      {activeView === 'DIAGNOSIS_CARD' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Department List Picker */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2 h-[680px] flex flex-col">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              选择需打印 / 沟通的科室
            </h3>
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {departments.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDeptCard(d)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                    selectedDeptCard.id === d.id
                      ? 'bg-cyan-950/80 border-cyan-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{d.name}</div>
                    <div className="text-[10px] text-slate-500">{d.category}</div>
                  </div>
                  <span
                    className={`font-mono text-xs ${
                      d.changeRate >= 0 ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {d.changeRate >= 0 ? '+' : ''}
                    {d.changeRate}%
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Printable Diagnostic Card */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  工作手册工具表 17_科室绩效诊断反馈卡
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {selectedDeptCard.name} · 绩效改革测算诊断沟通卡
                </h3>
                <p className="text-xs text-slate-400">
                  供第二轮科室调研深度访谈、答疑及科务会通报使用
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>打印反馈单</span>
                </button>
                <button
                  onClick={() => onSelectDepartmentForAi(selectedDeptCard)}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>AI生成深度诊断</span>
                </button>
              </div>
            </div>

            {/* Core Metrics Comparison Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">历史实发绩效</span>
                <span className="text-base font-bold text-white">
                  {selectedDeptCard.historicalBonus} 万元
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">新方案预测绩效</span>
                <span className="text-base font-bold text-cyan-400">
                  {selectedDeptCard.predictedBonus} 万元
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">保底封顶后实得</span>
                <span className="text-base font-bold text-emerald-400">
                  {selectedDeptCard.protectedBonus} 万元
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">变化率与防断崖</span>
                <span
                  className={`text-base font-bold ${
                    selectedDeptCard.changeRate >= 0 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {selectedDeptCard.changeRate >= 0 ? '+' : ''}
                  {selectedDeptCard.changeRate}%
                </span>
              </div>
            </div>

            {/* FTE & Headcount Findings */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
              <h4 className="font-bold text-cyan-300">定岗定编（FTE）测算结论与人均效能</h4>
              <div className="grid grid-cols-3 gap-2 text-center font-mono py-1">
                <div className="bg-slate-900 p-2 rounded">
                  <span className="text-slate-500 text-[10px]">现有有效FTE</span>
                  <div className="font-bold text-white text-sm">{selectedDeptCard.currentFTE}人</div>
                </div>
                <div className="bg-slate-900 p-2 rounded">
                  <span className="text-slate-500 text-[10px]">工作量测算FTE</span>
                  <div className="font-bold text-blue-400 text-sm">
                    {selectedDeptCard.workloadFTE}人
                  </div>
                </div>
                <div className="bg-slate-900 p-2 rounded">
                  <span className="text-slate-500 text-[10px]">建议编制FTE</span>
                  <div className="font-bold text-emerald-400 text-sm">
                    {selectedDeptCard.recommendedFTE}人
                  </div>
                </div>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                人岗匹配分析：人均产出加权RVU为{' '}
                <strong className="text-slate-200">
                  {Math.round(selectedDeptCard.totalWeightedRVU / selectedDeptCard.currentFTE).toLocaleString()} 点/人
                </strong>
                。建议编制为 {selectedDeptCard.recommendedFTE}人。
              </p>
            </div>

            {/* Key Talking Points for Meeting with Department Director */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
              <h4 className="font-bold text-purple-300">
                第二轮科室调研核心沟通要点（话术底稿）
              </h4>
              <ul className="list-disc pl-4 space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                <li>
                  <strong>政策导向定性：</strong> 明确向科主任传达，本次改革旨在破除收支倒挂，
                  重点激励高难度手术、疑难危重抢救与医疗质量安全，而非单纯靠药品耗材走量。
                </li>
                <li>
                  <strong>数据复核机制：</strong> 如科室对工作量数据存在疑义，可在5个工作日内
                  提交具体HIS病案编码清单，工作组在《18_问题与变更台账》中全额核查并更正。
                </li>
                <li>
                  <strong>平稳过渡安排：</strong> 当前已启动 {selectedDeptCard.isFloorTriggered ? '88%保底保护机制，杜绝断崖下跌' : '平稳过渡保护机制'}，
                  科室在过渡期内享有充分的业务调整与技术升级窗口。
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: ISSUE LOG & CHANGE MANAGEMENT */}
      {activeView === 'ISSUE_LOG' && (
        <div className="space-y-4">
          {/* Add New Issue Input */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              登记新异议或科室诉求（闭环台账）
            </h3>
            <form onSubmit={handleAddNewIssue} className="flex flex-col sm:flex-row gap-2">
              <select
                value={newIssueDept}
                onChange={(e) => setNewIssueDept(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newIssueText}
                onChange={(e) => setNewIssueText(e.target.value)}
                placeholder="简述科室反馈的异议、遗漏项目或无收费劳动认领诉求..."
                className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-cyan-400"
              />
              <button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shrink-0"
              >
                登记问题
              </button>
            </form>
          </div>

          {/* Issue Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">
                问题与变更闭环台账 (Issue & Change Log)
              </h3>
              <span className="text-xs text-slate-400">已闭环处理 100% 审核完成</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">问题编号</th>
                    <th className="py-3 px-3">反馈科室</th>
                    <th className="py-3 px-3">异议分类</th>
                    <th className="py-3 px-4">问题与诉求具体描述</th>
                    <th className="py-3 px-3">处理状态</th>
                    <th className="py-3 px-4">处理决定与处置动作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {issues.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                        {item.id}
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">
                        {item.departmentName}
                      </td>
                      <td className="py-3 px-3">
                        <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 leading-relaxed text-[11px]">
                        {item.description}
                      </td>
                      <td className="py-3 px-3">
                        {item.status === 'VERIFIED_ACCEPTED' ? (
                          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 w-max">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            已采纳调整
                          </span>
                        ) : (
                          <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 w-max">
                            <Clock className="w-3 h-3 text-amber-400" />
                            复核审查中
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {item.actionTaken}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
