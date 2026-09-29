import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Download,
  Filter,
  Eye,
  CheckCircle2,
  Calendar,
  User,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Award,
  Clock,
  ChevronDown,
  Building2,
  Stethoscope,
  Coins,
  Activity,
  AlertTriangle,
  Scale,
  Sliders,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle,
  FileCheck,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import {
  Employee,
  Department,
  ExecutionEventDetail,
  ClinicalOrderExecution,
  FinancialSummary,
  CampusType,
  ClinicalCategoryType,
  MetricDimensionType,
} from '../../types';
import { initialExecutionEvents, initialOrderExecutionList } from '../../mock/initialData';
import { exportEmployeesToCSV, exportDepartmentsToCSV } from '../../utils/exporter';

interface LedgerTraceabilityTabProps {
  employees: Employee[];
  departments: Department[];
  predictedPointValue: number;
  orderExecutions?: ClinicalOrderExecution[];
  financialSummary?: FinancialSummary;
}

export const LedgerTraceabilityTab: React.FC<LedgerTraceabilityTabProps> = ({
  employees,
  departments,
  predictedPointValue,
  orderExecutions = initialOrderExecutionList,
  financialSummary,
}) => {
  // Navigation mode: 'primary' (一次分配: 院到科) | 'secondary' (二次分配: 科到人) | 'step_campus' (分步分区测算与诊疗项目穿透) | 'audit_events' (事件级穿透)
  const [activeMode, setActiveMode] = useState<
    'primary' | 'secondary' | 'step_campus' | 'audit_events'
  >('primary');

  // Multi-dimensional filters
  const [selectedCampus, setSelectedCampus] = useState<string>('ALL');
  const [selectedAccountingUnit, setSelectedAccountingUnit] = useState<string>('ALL');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('ALL');
  const [selectedPersonnelRole, setSelectedPersonnelRole] = useState<string>('ALL');
  const [selectedMetricDimension, setSelectedMetricDimension] = useState<MetricDimensionType>('全部要素');
  const [selectedClinicalCategory, setSelectedClinicalCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected item modals
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDeptDetail, setSelectedDeptDetail] = useState<Department | null>(null);
  const [traceEventModal, setTraceEventModal] = useState<ExecutionEventDetail | null>(null);

  // Quick reset filters
  const handleResetFilters = () => {
    setSelectedCampus('ALL');
    setSelectedAccountingUnit('ALL');
    setSelectedDeptId('ALL');
    setSelectedPersonnelRole('ALL');
    setSelectedMetricDimension('全部要素');
    setSelectedClinicalCategory('ALL');
    setSearchTerm('');
  };

  // Filtered Departments (for First Distribution - 一次分配)
  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) => {
      const matchCampus = selectedCampus === 'ALL' || dept.campus === selectedCampus;
      const matchUnit =
        selectedAccountingUnit === 'ALL' || dept.accountingUnit === selectedAccountingUnit;
      const matchDept = selectedDeptId === 'ALL' || dept.id === selectedDeptId;
      const matchSearch =
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.director.toLowerCase().includes(searchTerm.toLowerCase());

      // Metric dimension filter
      let matchMetric = true;
      if (selectedMetricDimension === '工作量') {
        matchMetric = (dept.workloadBonusPool || 0) > 0;
      } else if (selectedMetricDimension === '服务质量') {
        matchMetric = dept.qualityScore >= 90;
      } else if (selectedMetricDimension === '综合奖惩') {
        matchMetric = (dept.singlePenalty || 0) > 0 || (dept.singleSpecialReward || 0) > 0;
      } else if (selectedMetricDimension === 'CMI') {
        matchMetric = dept.cmi >= 1.25;
      } else if (selectedMetricDimension === 'DRG') {
        matchMetric = dept.drgCaseCount > 1500;
      } else if (selectedMetricDimension === '单项奖励') {
        matchMetric = (dept.singleSpecialReward || 0) > 15;
      } else if (selectedMetricDimension === '运营成本') {
        matchMetric = (dept.costSavingBonus || 0) > 0;
      }

      return matchCampus && matchUnit && matchDept && matchSearch && matchMetric;
    });
  }, [
    departments,
    selectedCampus,
    selectedAccountingUnit,
    selectedDeptId,
    searchTerm,
    selectedMetricDimension,
  ]);

  // Filtered Employees (for Second Distribution - 二次分配)
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchCampus = selectedCampus === 'ALL' || emp.campus === selectedCampus;
      const matchUnit =
        selectedAccountingUnit === 'ALL' || emp.accountingUnit === selectedAccountingUnit;
      const matchDept = selectedDeptId === 'ALL' || emp.departmentId === selectedDeptId;

      let matchRole = true;
      if (selectedPersonnelRole === 'doctor_senior') {
        matchRole = emp.role.includes('医师') && (emp.title === '正高' || emp.title === '副高');
      } else if (selectedPersonnelRole === 'doctor_junior') {
        matchRole = emp.role.includes('医师') && (emp.title === '中级' || emp.title === '初级/士');
      } else if (selectedPersonnelRole === 'nurse') {
        matchRole = emp.role.includes('护') || emp.title.includes('护');
      } else if (selectedPersonnelRole === 'tech') {
        matchRole = emp.role.includes('技') || emp.postGrade.includes('技');
      }

      const matchSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.empNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.postGrade.toLowerCase().includes(searchTerm.toLowerCase());

      return matchCampus && matchUnit && matchDept && matchRole && matchSearch;
    });
  }, [
    employees,
    selectedCampus,
    selectedAccountingUnit,
    selectedDeptId,
    selectedPersonnelRole,
    searchTerm,
  ]);

  // Filtered Clinical Order Executions (for Category & Step Simulation)
  const filteredOrders = useMemo(() => {
    return orderExecutions.filter((ord) => {
      const matchCat =
        selectedClinicalCategory === 'ALL' || ord.clinicalCategory === selectedClinicalCategory;
      const matchCampus = selectedCampus === 'ALL' || ord.campus === selectedCampus;
      const matchSearch =
        ord.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ord.orderDept.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ord.execDept.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ord.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchCampus && matchSearch;
    });
  }, [orderExecutions, selectedClinicalCategory, selectedCampus, searchTerm]);

  // Multi-Campus Aggregate Metrics
  const campusMetrics = useMemo(() => {
    const list = [
      { id: '总院区(本部)', name: '总院区 (本部核心中心)', beds: 1000 },
      { id: '东院区(微创)', name: '东院区 (城东微创分部)', beds: 500 },
      { id: '南院区(妇儿)', name: '南院区 (妇儿专科分部)', beds: 400 },
    ];

    return list.map((c) => {
      const campusDepts = departments.filter((d) => d.campus === c.id);
      const campusEmps = employees.filter((e) => e.campus === c.id);
      const totalBonus = campusDepts.reduce((acc, d) => acc + d.protectedBonus, 0);
      const histBonus = campusDepts.reduce((acc, d) => acc + d.historicalBonus, 0);
      const totalRVU = campusDepts.reduce((acc, d) => acc + d.totalWeightedRVU, 0);
      const changeRate =
        histBonus > 0 ? Number((((totalBonus - histBonus) / histBonus) * 100).toFixed(1)) : 0;
      const avgMonthly =
        campusEmps.length > 0
          ? Math.round(
              campusEmps.reduce((acc, e) => acc + e.totalMonthlyBonus, 0) / campusEmps.length
            )
          : 0;

      return {
        ...c,
        deptCount: campusDepts.length,
        empCount: campusEmps.length,
        totalBonus,
        histBonus,
        totalRVU,
        changeRate,
        avgMonthly,
      };
    });
  }, [departments, employees]);

  // Clinical Categories Overview (严格遵循国家卫生健康委 CCHI 八大标准分类)
  const clinicalCategoryStats = useMemo(() => {
    const categories: ClinicalCategoryType[] = [
      '综合医疗服务类',
      '诊断性操作与检查类',
      '实验室与病理诊断类',
      '临床治疗性操作类',
      '手术治疗类',
      '微创介入诊疗类',
      '中医及民族医诊疗类',
      '康复医疗服务类',
    ];

    return categories.map((cat) => {
      const matched = orderExecutions.filter((o) => o.clinicalCategory === cat);
      const totalVol = matched.reduce((acc, o) => acc + o.volume, 0);
      const totalRVU = matched.reduce((acc, o) => acc + o.totalRVU, 0);
      const totalIncome = matched.reduce((acc, o) => acc + (o.volume * o.unitPrice) / 10000, 0);
      return {
        category: cat,
        count: matched.length,
        totalVol,
        totalRVU,
        totalIncome: Number(totalIncome.toFixed(1)),
      };
    });
  }, [orderExecutions]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Hierarchy Notice */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
              <Scale className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white tracking-tight">
              公立医院一次分配与二次分配一体化核算与穿透中枢
            </h2>
            <span className="text-xs bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800 font-mono">
              院到科一次大盘 ➔ 科到人二次积分
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
            提供从<strong>院级四大绩效池切分至科室（一次分配）</strong>，到
            <strong>科室按岗位/工作量/夜班工时/质量细化到人（二次分配）</strong>的全流程闭环；
            支持按<strong>院区、核算单元、科室、人员角色、核心绩效要素及7大诊疗分类</strong>
            进行多维立体过滤与分步分区测算。
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => exportDepartmentsToCSV(departments)}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs px-3.5 py-2 rounded-xl border border-slate-700 transition-colors shadow cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出一次分配总账</span>
          </button>

          <button
            onClick={() => exportEmployeesToCSV(employees)}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs px-3.5 py-2 rounded-xl transition-all shadow-md cursor-pointer font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出二次分配台账</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Mode Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1">
          <button
            onClick={() => setActiveMode('primary')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeMode === 'primary'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>🏛️ 一次分配：院到科大盘测算与核算池拆解</span>
            <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded font-mono">
              {departments.length}个科室
            </span>
          </button>

          <button
            onClick={() => setActiveMode('secondary')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeMode === 'secondary'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>👨‍⚕️ 二次分配：科到人/医疗组综合积分台账</span>
            <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded font-mono">
              {employees.length}名在岗
            </span>
          </button>

          <button
            onClick={() => setActiveMode('step_campus')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeMode === 'step_campus'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>🩺 诊疗项目穿透与分步分区测算</span>
            <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded font-mono">
              7大类·3大院区
            </span>
          </button>

          <button
            onClick={() => setActiveMode('audit_events')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeMode === 'audit_events'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>🔍 医嘱与手术事件审计证据链</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 pl-2">
          <span>统一点值:</span>
          <span className="font-mono font-bold text-cyan-300 text-sm">
            ¥{predictedPointValue.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Multi-Dimensional Filter Toolbar (多维立体过滤中枢) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span>多维穿透滤镜过滤中枢</span>
            <span className="text-[11px] text-slate-400 font-normal">
              (院区 - 核算单元 - 科室 - 人员角色 - 考核指标 - 诊疗分类多维度联动)
            </span>
          </div>

          <button
            onClick={handleResetFilters}
            className="text-[11px] text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>重置所有筛选</span>
          </button>
        </div>

        {/* 6 Selector Dropdowns with High Contrast Dark Theme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Dimension 1: Campus (院区) */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-medium block">① 院区维度</label>
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-cyan-400 cursor-pointer"
            >
              <option value="ALL">全部院区 (3个院区)</option>
              <option value="总院区(本部)">总院区 (本部核心中心)</option>
              <option value="东院区(微创)">东院区 (城东微创分部)</option>
              <option value="南院区(妇儿)">南院区 (妇儿专科分部)</option>
            </select>
          </div>

          {/* Dimension 2: Accounting Unit (核算单元) */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-medium block">② 医院核算单元</label>
            <select
              value={selectedAccountingUnit}
              onChange={(e) => setSelectedAccountingUnit(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-cyan-400 cursor-pointer"
            >
              <option value="ALL">全部核算单元</option>
              <option value="微创外科与手术中心单元">微创外科与手术中心单元</option>
              <option value="心脑血管与脏器疾病单元">心脑血管与脏器疾病单元</option>
              <option value="急危重症抢救监护单元">急危重症抢救监护单元</option>
              <option value="医学影像与分子检验单元">医学影像与分子检验单元</option>
              <option value="全院行政后勤综合保障单元">全院行政后勤综合保障单元</option>
            </select>
          </div>

          {/* Dimension 3: Department (科室) */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-medium block">③ 临床医技科室</label>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-cyan-400 cursor-pointer"
            >
              <option value="ALL">全部科室 (16个单元)</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.campus ? d.campus.slice(0, 3) : '总院'})
                </option>
              ))}
            </select>
          </div>

          {/* Dimension 4: Personnel Hierarchy / Role (人员角色/组别) */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-medium block">④ 人员组别与职称</label>
            <select
              value={selectedPersonnelRole}
              onChange={(e) => setSelectedPersonnelRole(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-cyan-400 cursor-pointer"
            >
              <option value="ALL">全部人员类别</option>
              <option value="doctor_senior">医生组 (高级职称: 正高/副高)</option>
              <option value="doctor_junior">医生组 (中初级: 主治/住院)</option>
              <option value="nurse">护理组 (护士长/主管/护士)</option>
              <option value="tech">医技平台组 (技师/检验师)</option>
            </select>
          </div>

          {/* Dimension 5: Performance Metric Dimensions (核心考核指标维度) */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-medium block">⑤ 核心绩效考核维度</label>
            <select
              value={selectedMetricDimension}
              onChange={(e) => setSelectedMetricDimension(e.target.value as any)}
              className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-cyan-400 cursor-pointer"
            >
              <option value="全部要素">全部考核要素维度</option>
              <option value="工作量">工作量 (RBRVS点数高)</option>
              <option value="服务质量">医疗质量 (质量考评≥90)</option>
              <option value="综合奖惩">综合奖惩 (含惩处扣款)</option>
              <option value="CMI">CMI难度梯度 (CMI≥1.25)</option>
              <option value="DRG">DRG精益 (入组病例&gt;1500)</option>
              <option value="单项奖励">单项奖励 (重大突破&gt;15万)</option>
              <option value="运营成本">成本管控 (成本结余激励)</option>
            </select>
          </div>

          {/* Dimension 6: Clinical Category (严格遵循国家卫生健康委 CCHI 八大标准分类) */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-medium block">⑥ CCHI国家标准项目分类</label>
            <select
              value={selectedClinicalCategory}
              onChange={(e) => setSelectedClinicalCategory(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-cyan-400 cursor-pointer"
            >
              <option value="ALL">全部 CCHI 诊疗操作大类</option>
              <option value="综合医疗服务类">🩺 01. 综合医疗服务类 (诊查/监护/专科护理)</option>
              <option value="诊断性操作与检查类">🔬 02. 诊断性操作与检查类 (影像/超声/内镜/电生理)</option>
              <option value="实验室与病理诊断类">🧪 03. 实验室与病理诊断类 (生化/免疫/分子/病理)</option>
              <option value="临床治疗性操作类">⚡ 04. 临床治疗性操作类 (非手术处置/穿刺/透析/理疗)</option>
              <option value="手术治疗类">🔪 05. 手术治疗类 (各系统外科手术操作)</option>
              <option value="微创介入诊疗类">🩸 06. 微创介入诊疗类 (血管与非血管介入手术)</option>
              <option value="中医及民族医诊疗类">🌿 07. 中医及民族医诊疗类 (辨证施治/针灸/推拿)</option>
              <option value="康复医疗服务类">🏃 08. 康复医疗服务类 (PT运动/OT作业/言语康复)</option>
            </select>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-800">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="快速检索科室、员工姓名、工号、诊疗项目名称..."
              className="w-full bg-slate-950 text-xs text-slate-200 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 focus:ring-1 focus:ring-cyan-400 placeholder:text-slate-500"
            />
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-3">
            <span>当前筛选结果:</span>
            {activeMode === 'primary' && (
              <span className="font-bold text-cyan-300 font-mono">
                {filteredDepartments.length} 个科室
              </span>
            )}
            {activeMode === 'secondary' && (
              <span className="font-bold text-emerald-300 font-mono">
                {filteredEmployees.length} 名在岗职工
              </span>
            )}
            {activeMode === 'step_campus' && (
              <span className="font-bold text-purple-300 font-mono">
                {filteredOrders.length} 项诊疗执行记录
              </span>
            )}
            {activeMode === 'audit_events' && (
              <span className="font-bold text-amber-300 font-mono">
                {initialExecutionEvents.length} 条医嘱流水
              </span>
            )}
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: 一次分配（院到科大盘测算与核算池拆解） */}
      {activeMode === 'primary' && (
        <div className="space-y-4">
          {/* Top 4 Pools Architecture KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>① 工作量分配池 (68%)</span>
                <span className="font-mono text-cyan-400">RBRVS点值联动</span>
              </div>
              <div className="text-xl font-bold font-mono text-white">
                ¥{financialSummary ? ((financialSummary.workloadPool || 14008) / 10000).toFixed(2) : '1.40'}亿元
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                按科室加权总RVU × 预测统一点值(¥{predictedPointValue.toFixed(2)})切分
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>② 综合医疗质量安全池 (11%)</span>
                <span className="font-mono text-purple-400">红线与满意度</span>
              </div>
              <div className="text-xl font-bold font-mono text-purple-300">
                ¥{financialSummary ? ((financialSummary.qualityPool || 2266) / 10000).toFixed(2) : '0.23'}亿元
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                依据三级公立医院绩效国考质量、感控与处方病历评分调节
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>③ 重点学科与紧缺战略池 (5%)</span>
                <span className="font-mono text-amber-400">战略扶持</span>
              </div>
              <div className="text-xl font-bold font-mono text-amber-300">
                ¥{financialSummary ? ((financialSummary.specialPool || 1030) / 10000).toFixed(2) : '0.10'}亿元
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                倾斜儿科、急危重症NICU/EICU与四级重大疑难手术团队
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>④ 成本结余与奖惩调节</span>
                <span className="font-mono text-emerald-400">保底兜底</span>
              </div>
              <div className="text-xl font-bold font-mono text-emerald-300">
                88%保底 / 125%封顶
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                可控运营支出节约返还，单项重大科研奖罚并自动防断崖兜底
              </p>
            </div>
          </div>

          {/* Department Primary Distribution Detailed Ledger */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>全院科室一次分配测算与核算池拆解台账</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  清晰展示工作量池、质量池、DRG难度、战略倾斜、单项奖惩、保底补差及科内二次分配建议比例。
                </p>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                合计一次分配预算: ¥
                {(
                  filteredDepartments.reduce((acc, d) => acc + d.protectedBonus, 0) / 10000
                ).toFixed(2)}
                亿元
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800 sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3">科室编码/名称</th>
                    <th className="py-2.5 px-2">院区</th>
                    <th className="py-2.5 px-2">核算类别</th>
                    <th className="py-2.5 px-3 text-right">历史实发(万)</th>
                    <th className="py-2.5 px-3 text-right text-cyan-300">工作量池(万)</th>
                    <th className="py-2.5 px-3 text-right text-purple-300">质量池(万)</th>
                    <th className="py-2.5 px-3 text-right text-amber-300">战略倾斜(万)</th>
                    <th className="py-2.5 px-3 text-right">成本结余(万)</th>
                    <th className="py-2.5 px-3 text-right">单项奖/惩(万)</th>
                    <th className="py-2.5 px-3 text-right">保底补差(万)</th>
                    <th className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                      一次分配下拨(万)
                    </th>
                    <th className="py-2.5 px-2 text-center">变动率</th>
                    <th className="py-2.5 px-3 text-center">科内二次分配建议 (医:护:技)</th>
                    <th className="py-2.5 px-2 text-center">详情</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-[11px]">
                  {filteredDepartments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-white">{dept.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{dept.code}</div>
                      </td>
                      <td className="py-2.5 px-2 text-slate-300 whitespace-nowrap">
                        <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                          {dept.campus ? dept.campus.replace('(本部)', '').replace('(微创)', '').replace('(妇儿)', '') : '总院'}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-slate-300">{dept.category}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                        ¥{dept.historicalBonus.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-cyan-300 font-semibold">
                        ¥{dept.workloadBonusPool || Math.round(dept.predictedBonus * 0.68)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-purple-300">
                        ¥{dept.qualityBonusPool || Math.round(dept.predictedBonus * 0.11)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-300">
                        ¥{dept.strategicBonusPool || Math.round(dept.predictedBonus * 0.05)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                        +¥{dept.costSavingBonus || 0}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                        <span className="text-emerald-400">+{dept.singleSpecialReward || 15}</span>
                        <span className="text-slate-500"> / </span>
                        <span className="text-rose-400">-{dept.singlePenalty || 2}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {dept.isFloorTriggered ? (
                          <span className="text-amber-400 font-semibold">
                            +¥{dept.floorSupplement || 32}
                          </span>
                        ) : dept.isCapTriggered ? (
                          <span className="text-blue-400">-¥{dept.capReduction || 45}</span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold text-xs">
                        ¥{dept.protectedBonus.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span
                          className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            dept.changeRate > 0
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : dept.changeRate < -10
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {dept.changeRate > 0 ? `+${dept.changeRate}%` : `${dept.changeRate}%`}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="bg-slate-800/90 text-cyan-300 px-2 py-0.5 rounded font-mono text-[10px] border border-slate-700">
                          {((dept.doctorGroupRatio || 0.6) * 100).toFixed(0)}% :{' '}
                          {((dept.nurseGroupRatio || 0.35) * 100).toFixed(0)}% :{' '}
                          {((dept.techGroupRatio || 0.05) * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          onClick={() => setSelectedDeptDetail(dept)}
                          className="text-cyan-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                          title="查看一次分配构成拆解单"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: 二次分配（科到人/医疗组综合积分台账） */}
      {activeMode === 'secondary' && (
        <div className="space-y-4">
          {/* Secondary Distribution Principle Guidance */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-800/40 rounded-2xl p-4 shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <User className="w-3.5 h-3.5" />
                </span>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  科室内部二次分配（综合积分法）计算规则说明
                </h3>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">
                破除简单“大锅饭”与单纯创收挂钩
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>个人月度实发绩效</strong> =
              <strong>【工作量积分】</strong>(个人管床/手术主刀/门诊人次RVU × 科室工作量点值) +
              <strong>【岗位责任津贴】</strong>(医疗组长/主刀带组/专科护理加权) +
              <strong>【职称基本补贴】</strong>(正高3800元、副高2600元、中级1500元) +
              <strong>【夜班与急诊考勤】</strong>(夜班280元/次 + 超时津贴) +
              <strong>【服务质量KPI调节】</strong>(病历甲级率/处方合格/满意度) +
              <strong>【重大攻坚奖励与差错扣罚】</strong>。
            </p>
          </div>

          {/* Employee Secondary Distribution Ledger Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>个人薪酬绩效二次分配综合积分台账</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  支持穿透查验每位在岗职工的工作量积分、责任津贴、夜班考勤、服务质量加减及个税测算。
                </p>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                当前筛选职工人数: <strong className="text-emerald-300">{filteredEmployees.length}</strong> 人
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800 sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3">人员姓名 / 工号</th>
                    <th className="py-2.5 px-2">院区 / 核算日期</th>
                    <th className="py-2.5 px-3">所属科室</th>
                    <th className="py-2.5 px-3">职称 / 职务 / 岗位</th>
                    <th className="py-2.5 px-2 text-center">编制与FTE</th>
                    <th className="py-2.5 px-3 text-right">月基本工资</th>
                    <th className="py-2.5 px-3 text-right text-cyan-300">工作量积分(元)</th>
                    <th className="py-2.5 px-3 text-right text-amber-300">岗位责任津贴(元)</th>
                    <th className="py-2.5 px-3 text-right text-purple-300">职称补贴(元)</th>
                    <th className="py-2.5 px-3 text-right text-rose-300">夜班急诊(元)</th>
                    <th className="py-2.5 px-3 text-right">质量考评(元)</th>
                    <th className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                      当月应发绩效(元)
                    </th>
                    <th className="py-2.5 px-3 text-right text-slate-400">预扣个税(元)</th>
                    <th className="py-2.5 px-3 text-center">证据链穿透</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-[11px]">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-white">{emp.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{emp.empNo}</div>
                      </td>
                      <td className="py-2.5 px-2 text-slate-300 whitespace-nowrap">
                        <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                          {emp.campus ? emp.campus.slice(0, 3) : '总院'}
                        </span>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {emp.recordDate || '2026-09'}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-200">{emp.departmentName}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1 py-0.2 rounded font-semibold">
                            {emp.title}
                          </span>
                          <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-1 py-0.2 rounded">
                            {emp.duty || (emp.postGrade.includes('主任') ? '科主任/组长' : emp.postGrade.includes('护士长') ? '护士长' : '骨干带组')}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 font-medium mt-0.5">{emp.postGrade}</div>
                      </td>
                      <td className="py-2.5 px-2 text-center whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-200">{emp.effectiveFTE.toFixed(1)}</div>
                        <div className="text-[9px] text-slate-400">{emp.employmentType}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                        ¥{emp.baseSalary.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-cyan-300 font-semibold">
                        ¥{(emp.workloadBonusShare || Math.round(emp.totalMonthlyBonus * 0.58)).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-300">
                        ¥{(emp.responsibilityAllowance || 1200).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-purple-300">
                        ¥{(emp.titleAllowance || 1500).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-rose-300">
                        ¥{(emp.nightEmergencyAllowance || 1120).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {(emp.qualityKpiAdjust || 650) > 0 ? (
                          <span className="text-emerald-400">+{emp.qualityKpiAdjust || 650}</span>
                        ) : (
                          <span className="text-rose-400">{emp.qualityKpiAdjust || -200}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold text-xs">
                        ¥{emp.totalMonthlyBonus.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                        ¥{(emp.estimatedTax || 680).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => setSelectedEmployee(emp)}
                          className="bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white px-2 py-1 rounded text-[10px] border border-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>穿透溯源</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 3: 诊疗项目穿透与分步分区测算 (Step-by-step Tiered & Multi-Campus Simulation) */}
      {activeMode === 'step_campus' && (
        <div className="space-y-6">
          {/* 7 Clinical Categories Quick Filtering Hub */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-purple-950 text-purple-400 border border-purple-800">
                  <Stethoscope className="w-3.5 h-3.5" />
                </span>
                <h3 className="text-sm font-bold text-white">
                  7大诊疗项目类别分布与技术劳务收益穿透
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                点击卡片直接按项目分类快速筛选
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              {[
                { cat: '综合医疗服务类', label: '综合医疗', icon: Stethoscope, color: 'text-cyan-400' },
                { cat: '诊断性操作与检查类', label: '诊断检查', icon: Eye, color: 'text-blue-400' },
                { cat: '实验室与病理诊断类', label: '检验病理', icon: Scale, color: 'text-indigo-400' },
                { cat: '临床治疗性操作类', label: '治疗操作', icon: Award, color: 'text-amber-400' },
                { cat: '手术治疗类', label: '手术治疗', icon: Sparkles, color: 'text-emerald-400' },
                { cat: '微创介入诊疗类', label: '微创介入', icon: Activity, color: 'text-rose-400' },
                { cat: '中医及民族医诊疗类', label: '中医民族医', icon: HeartIcon, color: 'text-teal-400' },
                { cat: '康复医疗服务类', label: '康复服务', icon: Clock, color: 'text-purple-400' },
              ].map((item) => {
                const stat = clinicalCategoryStats.find((s) => s.category === item.cat);
                const isSelected = selectedClinicalCategory === item.cat;
                const IconComp = item.icon;
                return (
                  <button
                    key={item.cat}
                    onClick={() =>
                      setSelectedClinicalCategory(isSelected ? 'ALL' : (item.cat as any))
                    }
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/80 border-purple-500 shadow-md ring-1 ring-purple-400'
                        : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <IconComp className={`w-3.5 h-3.5 ${item.color}`} />
                        {item.label}
                      </span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      总产生: <strong className="text-slate-200">{stat?.totalRVU.toLocaleString()}</strong> 点
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      收入 ¥{stat?.totalIncome}万 · {stat?.totalVol}次
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Multi-Campus Breakdown Section (分区测算矩阵) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-blue-950 text-blue-400 border border-blue-800">
                  <Building2 className="w-3.5 h-3.5" />
                </span>
                <h3 className="text-sm font-bold text-white">
                  多院区（总院区 / 东院区 / 南院区）分区独立核算与横向对比矩阵
                </h3>
              </div>
              <span className="text-xs text-cyan-400 font-mono">
                统一点值基准联动测算
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {campusMetrics.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{c.name}</h4>
                      <p className="text-[11px] text-slate-400">
                        编制床位: {c.beds}张 · 在岗人员: {c.empCount}人
                      </p>
                    </div>
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                        c.changeRate > 0
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {c.changeRate > 0 ? `+${c.changeRate}%` : `${c.changeRate}%`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">一次分配总额</span>
                      <span className="text-sm font-bold text-cyan-300">
                        ¥{(c.totalBonus / 10000).toFixed(2)}亿
                      </span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">二次分配人均月绩效</span>
                      <span className="text-sm font-bold text-emerald-300">
                        ¥{c.avgMonthly.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
                    <span>总加权RVU产出:</span>
                    <span className="font-mono text-slate-200 font-bold">
                      {c.totalRVU.toLocaleString()} 点
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5-Step Pipeline Architecture Roadmap (分步测算流) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>《公立医院绩效改革一体化测算工具包》5步分步测算执行流水线</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {[
                {
                  step: '第 1 步',
                  title: '业务归集与药耗剔除',
                  desc: '严格剔除药品与高值耗材转付收入，生成全院纯劳务有效收入底座（7.24亿元）。',
                  badge: '收入纯化',
                },
                {
                  step: '第 2 步',
                  title: '大盘反推与四池切分',
                  desc: '依据历史基线反推统一点值（¥13.15），切分工作量池、保障池、质量池与战略池。',
                  badge: '点值确定',
                },
                {
                  step: '第 3 步',
                  title: 'CMI/DRG与质量奖惩',
                  desc: '加载CMI权重加成、三四级手术难度倾斜、医疗质量红线与重大科研单项奖罚。',
                  badge: '价值导向',
                },
                {
                  step: '第 4 步',
                  title: '防断崖保底与封顶削峰',
                  desc: '自动启动保底保护线（88%）与超发封顶（125%），确保全院多科室平稳过渡。',
                  badge: '安全保护',
                },
                {
                  step: '第 5 步',
                  title: '科内二次综合积分到人',
                  desc: '科室切分医生/护士/医技三块，按管床、主刀、夜班、急诊工时精准核算至个人。',
                  badge: '落地实发',
                },
              ].map((p, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">
                      {p.step}
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                      {p.badge}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{p.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Order Execution Stream Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-purple-400" />
                  <span>诊疗项目开单研判、执行分担与技术劳务明细表</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  支持查看具体诊疗收费项目的开单科室分成比（如20%）与执行科室分成比（如80%）的实际落地情况。
                </p>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                当前筛选记录: <strong className="text-purple-300">{filteredOrders.length}</strong> 条
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800 sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3">流水号</th>
                    <th className="py-2.5 px-2">院区</th>
                    <th className="py-2.5 px-2">项目分类</th>
                    <th className="py-2.5 px-3">开单科室</th>
                    <th className="py-2.5 px-3">执行科室(平台)</th>
                    <th className="py-2.5 px-3">项目名称</th>
                    <th className="py-2.5 px-2 text-right">频次</th>
                    <th className="py-2.5 px-3 text-right">单价(元)</th>
                    <th className="py-2.5 px-3 text-center">开单 / 执行分成</th>
                    <th className="py-2.5 px-2 font-mono">国家CCHI码</th>
                    <th className="py-2.5 px-3 text-right text-amber-300">项目RVU</th>
                    <th className="py-2.5 px-3 text-right text-emerald-400 font-bold">总RVU产出</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-[11px]">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-cyan-400">{ord.id}</td>
                      <td className="py-2.5 px-2 text-slate-300 whitespace-nowrap">
                        <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                          {ord.campus ? ord.campus.slice(0, 3) : '总院'}
                        </span>
                      </td>
                      <td className="py-2.5 px-2">
                        <span className="bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          {ord.clinicalCategory || '手术'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-200">{ord.orderDept}</td>
                      <td className="py-2.5 px-3 text-slate-300">{ord.execDept}</td>
                      <td className="py-2.5 px-3 font-semibold text-white max-w-[200px] truncate" title={ord.itemName}>
                        {ord.itemName}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono">{ord.volume}</td>
                      <td className="py-2.5 px-3 text-right font-mono">¥{ord.unitPrice.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-cyan-300 text-[10px]">
                          {(ord.orderShareRate * 100).toFixed(0)}% : {(ord.execShareRate * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-2 font-mono text-slate-400 text-[10px]">{ord.cchiCode}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-300 font-semibold">{ord.cchiRVU}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">
                        {ord.totalRVU.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 4: 医嘱与手术事件审计证据链 */}
      {activeMode === 'audit_events' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>电子病历医嘱与手术诊疗事件审计溯源全量证据链</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                支持直接对账HIS医嘱流水号、主刀/一助/二助/巡回角色系数、CCHI国家标准代码与公式计算结果。
              </p>
            </div>
            <span className="text-xs text-amber-400 font-mono">共 {initialExecutionEvents.length} 条已核验事件</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">事件流水号</th>
                  <th className="py-2.5 px-3">执行日期</th>
                  <th className="py-2.5 px-3">执行科室</th>
                  <th className="py-2.5 px-3">患者编号/脱敏姓名</th>
                  <th className="py-2.5 px-3">诊疗项目名称</th>
                  <th className="py-2.5 px-3">执行医师/职称</th>
                  <th className="py-2.5 px-2 text-center">角色责任</th>
                  <th className="py-2.5 px-2 text-right">角色系数</th>
                  <th className="py-2.5 px-2 text-right">学科倾斜</th>
                  <th className="py-2.5 px-3 text-right">基准RVU</th>
                  <th className="py-2.5 px-3 text-right text-emerald-400 font-bold">最终实计点数</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-[11px]">
                {initialExecutionEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-amber-400">{evt.id}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{evt.eventDate}</td>
                    <td className="py-2.5 px-3 text-slate-300">{evt.departmentName}</td>
                    <td className="py-2.5 px-3 text-slate-200">
                      {evt.patientName}{' '}
                      <span className="text-[10px] text-slate-500 font-mono">({evt.patientId})</span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white max-w-[200px] truncate" title={evt.itemName}>
                      {evt.itemName}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-slate-200">{evt.performerName}</div>
                      <div className="text-[10px] text-slate-500">{evt.performerTitle}</div>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-cyan-300">
                        {evt.roleType}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono">{evt.roleFactor.toFixed(2)}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-purple-300">
                      {evt.strategicFactor.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">{evt.baseRVU}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">
                      {evt.finalWeightedRVU.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Department Detail Modal (科室一次分配拆解通知单) */}
      {selectedDeptDetail && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 flex justify-center items-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{selectedDeptDetail.name} - 一次分配核算下拨通知单</span>
                  <span className="text-xs bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800 font-mono">
                    {selectedDeptDetail.code}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  院区: {selectedDeptDetail.campus || '总院区(本部)'} · 核算单元: {selectedDeptDetail.accountingUnit || selectedDeptDetail.category} ·
                  科主任: {selectedDeptDetail.director}
                </p>
              </div>
              <button
                onClick={() => setSelectedDeptDetail(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">工作量池分摊</span>
                <span className="text-base font-bold text-cyan-400">
                  ¥{selectedDeptDetail.workloadBonusPool || Math.round(selectedDeptDetail.predictedBonus * 0.68)}万
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">综合质量安全池</span>
                <span className="text-base font-bold text-purple-400">
                  ¥{selectedDeptDetail.qualityBonusPool || Math.round(selectedDeptDetail.predictedBonus * 0.11)}万
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">重点学科倾斜池</span>
                <span className="text-base font-bold text-amber-400">
                  ¥{selectedDeptDetail.strategicBonusPool || Math.round(selectedDeptDetail.predictedBonus * 0.05)}万
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">最终核算总额</span>
                <span className="text-base font-bold text-emerald-400">
                  ¥{selectedDeptDetail.protectedBonus}万
                </span>
              </div>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="font-semibold text-white">科内二次分配建议方案（科室管理委员会审议）：</div>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-700">
                  <div className="text-slate-400">医生组 (60%~65%)</div>
                  <div className="text-cyan-300 font-bold mt-0.5">
                    ¥{Math.round(selectedDeptDetail.protectedBonus * (selectedDeptDetail.doctorGroupRatio || 0.6))}万元
                  </div>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-700">
                  <div className="text-slate-400">护理组 (30%~35%)</div>
                  <div className="text-emerald-300 font-bold mt-0.5">
                    ¥{Math.round(selectedDeptDetail.protectedBonus * (selectedDeptDetail.nurseGroupRatio || 0.35))}万元
                  </div>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-700">
                  <div className="text-slate-400">医技及其他 (5%)</div>
                  <div className="text-purple-300 font-bold mt-0.5">
                    ¥{Math.round(selectedDeptDetail.protectedBonus * (selectedDeptDetail.techGroupRatio || 0.05))}万元
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDeptDetail(null)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                确定并关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Event-Level Full Traceability Modal (二次分配穿透证据链) */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 flex justify-center items-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 text-slate-100 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{selectedEmployee.name} - 个人二次分配绩效证据链溯源</span>
                  <span className="text-xs bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800 font-mono">
                    {selectedEmployee.empNo}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  院区: {selectedEmployee.campus || '总院区(本部)'} · {selectedEmployee.departmentName} · {selectedEmployee.postGrade} (
                  {selectedEmployee.title}) · 月工时: {selectedEmployee.monthWorkHours}h ·
                  夜班: {selectedEmployee.nightShiftCount}次
                </p>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Monthly Compensation Composition Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] block">工作量积分 (58%)</span>
                <span className="text-sm font-bold text-cyan-400">
                  ¥{(selectedEmployee.workloadBonusShare || Math.round(selectedEmployee.totalMonthlyBonus * 0.58)).toLocaleString()}
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] block">岗位与主刀责任津贴</span>
                <span className="text-sm font-bold text-amber-400">
                  ¥{(selectedEmployee.responsibilityAllowance || 1200).toLocaleString()}
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] block">夜班急诊津贴</span>
                <span className="text-sm font-bold text-rose-400">
                  ¥{(selectedEmployee.nightEmergencyAllowance || 1120).toLocaleString()}
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] block">实发月薪绩效</span>
                <span className="text-sm font-bold text-emerald-400">
                  ¥{selectedEmployee.totalMonthlyBonus.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Sample Event Level Trace Log */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <h4 className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>当月HIS医嘱与手术操作执行对账记录（部分样例）</span>
                <span className="text-[10px] text-slate-500 font-mono">门禁审核通过</span>
              </h4>

              <div className="bg-slate-950 rounded-xl border border-slate-800 divide-y divide-slate-800/80 text-xs">
                {(() => {
                  const matched = initialExecutionEvents.filter((e) =>
                    e.performerName.includes(selectedEmployee.name.slice(0, 2))
                  );
                  const seenIds = new Set<string>();
                  const dedupedEvents: typeof initialExecutionEvents = [];
                  for (const evt of [...matched, ...initialExecutionEvents]) {
                    if (!seenIds.has(evt.id)) {
                      seenIds.add(evt.id);
                      dedupedEvents.push(evt);
                    }
                    if (dedupedEvents.length >= 3) break;
                  }
                  return dedupedEvents.map((evt, idx) => (
                    <div key={`${evt.id}-${idx}`} className="p-3 space-y-1.5 hover:bg-slate-900/60 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-white">{evt.itemName}</span>
                        <span className="text-cyan-400 font-mono font-bold">
                          +{evt.finalWeightedRVU.toFixed(1)} RVU
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-4">
                        <span>流水号: <code className="text-slate-300 font-mono">{evt.id}</code></span>
                        <span>角色: <strong className="text-slate-200">{evt.roleType}</strong> (×{evt.roleFactor})</span>
                        <span>国家CCHI码: <code className="text-slate-300 font-mono">{evt.cchiCode}</code></span>
                        <span>基准RVU: {evt.baseRVU}</span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
              <span>税后预估到手: ¥{(selectedEmployee.totalMonthlyBonus - (selectedEmployee.estimatedTax || 680)).toLocaleString()}元</span>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
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

// Simple heart icon for nursing category
function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}
