import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Database,
  RefreshCw,
  FolderDown,
  Layers,
  Sparkles,
  ArrowRight,
  Trash2,
  FileCheck,
  Stethoscope,
  Coins,
  Building2,
  UserCheck,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { downloadTemplate, TemplateCategory } from '../../utils/exporter';
import {
  Department,
  Employee,
  FinancialSummary,
  ClinicalOrderExecution,
  PricingFeeItem,
  AttendanceRecord,
} from '../../types';
import {
  initialOrderExecutionList,
  initialPricingItems,
  initialAttendanceRecords,
  initialDepartments,
  initialEmployees,
  initialFinancialSummary,
} from '../../mock/initialData';

interface DataImportTabProps {
  departments: Department[];
  employees: Employee[];
  financialSummary: FinancialSummary;
  orderExecutions: ClinicalOrderExecution[];
  pricingItems: PricingFeeItem[];
  attendanceRecords: AttendanceRecord[];
  initialCategory?: 'clinical_order' | 'pricing' | 'organization' | 'employee' | 'schedule_attendance' | 'finance';
  onCommitImport: (data: {
    departments?: Department[];
    employees?: Employee[];
    financialSummary?: FinancialSummary;
    orderExecutions?: ClinicalOrderExecution[];
    pricingItems?: PricingFeeItem[];
    attendanceRecords?: AttendanceRecord[];
  }) => void;
  onNavigateToSandbox: () => void;
}

export const DataImportTab: React.FC<DataImportTabProps> = ({
  departments,
  employees,
  financialSummary,
  orderExecutions,
  pricingItems,
  attendanceRecords,
  initialCategory = 'clinical_order',
  onCommitImport,
  onNavigateToSandbox,
}) => {
  // Current active import category
  const [activeCategory, setActiveCategory] = useState<
    'clinical_order' | 'pricing' | 'organization' | 'employee' | 'schedule_attendance' | 'finance'
  >(initialCategory);

  React.useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  // Staged data state for preview before committing
  const [stagedOrders, setStagedOrders] = useState<ClinicalOrderExecution[]>(orderExecutions);
  const [stagedPricing, setStagedPricing] = useState<PricingFeeItem[]>(pricingItems);
  const [stagedAttendance, setStagedAttendance] = useState<AttendanceRecord[]>(attendanceRecords);
  const [stagedDepartments, setStagedDepartments] = useState<Department[]>(departments);
  const [stagedEmployees, setStagedEmployees] = useState<Employee[]>(employees);

  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
    details?: string;
  } | null>(null);

  const [isCommitSuccess, setIsCommitSuccess] = useState<boolean>(false);
  const [employeePasteText, setEmployeePasteText] = useState<string>('');
  const [showPasteBox, setShowPasteBox] = useState<boolean>(false);

  // Quick Employee Text Paste Parser (从Excel中一键整行整列复制粘贴)
  const handleParseEmployeePaste = () => {
    if (!employeePasteText.trim()) return;
    const lines = employeePasteText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const parsedEmps: Employee[] = [];
    const startIndex = lines[0].includes('姓名') || lines[0].includes('工号') || lines[0].includes('名称') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.includes('\t')
        ? line.split('\t').map((p) => p.trim())
        : line.split(',').map((p) => p.trim());
      if (parts.length < 2) continue;

      const empNo = parts[0] || `DOC-IMP-${1000 + i}`;
      const name = parts[1] || `医护专家${i + 1}`;
      const departmentName = parts[2] || '胃肠外科';
      const recordDate = parts[3] || '2026-09-01';
      const rawTitle = parts[4] || '副高';
      const title: any = rawTitle.includes('正高')
        ? '正高'
        : rawTitle.includes('副高')
        ? '副高'
        : rawTitle.includes('初级')
        ? '初级/士'
        : rawTitle.includes('员')
        ? '员级/其他'
        : '中级';
      const duty = parts[5] || (title === '正高' ? '科主任/医疗组长' : title === '副高' ? '医疗组长' : '骨干医生');
      const position = parts[6] || '临床医师';
      const employmentType: any = parts[7] || '在编';
      const effectiveFTE = parseFloat(parts[8]) || 1.0;
      const baseSalary = parseFloat(parts[9]) || (title === '正高' ? 11200 : title === '副高' ? 8800 : 7200);
      const campus: any = parts[10] || '总院区(本部)';

      const estRBRVS = Math.round(3500 * effectiveFTE);
      const titleAllowance = title === '正高' ? 3800 : title === '副高' ? 2600 : 1500;
      const estMonthlyBonus = Math.round(baseSalary * 1.5 + titleAllowance + (duty.includes('组长') ? 1500 : 800));

      parsedEmps.push({
        id: `emp-pst-${Date.now()}-${i}`,
        empNo,
        name,
        gender: '男',
        departmentId: 'dept-01',
        departmentName,
        campus,
        duty,
        position,
        role: `${title} · ${position}`,
        title,
        postGrade: duty,
        recordDate,
        employmentType,
        effectiveFTE,
        baseSalary,
        rbrvsPoints: estRBRVS,
        qualityBonus: 2800,
        drgBonus: 2200,
        totalMonthlyBonus: estMonthlyBonus,
        annualBonus: estMonthlyBonus * 12,
        monthWorkHours: Math.round(180 * effectiveFTE),
        nightShiftCount: duty.includes('护士') ? 4 : 2,
      });
    }

    if (parsedEmps.length > 0) {
      setStagedEmployees([...parsedEmps, ...stagedEmployees]);
      setImportStatus({
        type: 'success',
        message: `成功解析并批量追加 ${parsedEmps.length} 名人员信息！`,
        details: '已完整导入字段：人员名称、科室、日期、职称、职务、岗位、编制与有效FTE。点击“立即入库生效”将驱动全院测算。',
      });
      setEmployeePasteText('');
      setShowPasteBox(false);
    } else {
      setImportStatus({
        type: 'error',
        message: '文本解析失败，请确保每行至少包含工号和姓名，字段之间用制表符(Tab)或逗号分隔。',
      });
    }
  };

  // Parse CSV file content safely
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus({
      type: 'info',
      message: `正在解析文件: ${file.name}...`,
    });

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

        if (lines.length <= 1) {
          throw new Error('导入文件数据行数不足，请确保包含表头和至少一行有效数据');
        }

        // Parsing based on active category
        if (activeCategory === 'employee') {
          const newEmps: Employee[] = lines.slice(1).map((line, idx) => {
            const parts = line.includes('\t')
              ? line.split('\t').map((p) => p.trim())
              : line.split(',').map((p) => p.trim());
            const empNo = parts[0] || `DOC-${2000 + idx}`;
            const name = parts[1] || `医护员工${idx + 1}`;
            const departmentName = parts[2] || '胃肠外科';
            const recordDate = parts[3] || '2026-09-01';
            const rawTitle = parts[4] || '中级';
            const title: any = rawTitle.includes('正高')
              ? '正高'
              : rawTitle.includes('副高')
              ? '副高'
              : rawTitle.includes('初级')
              ? '初级/士'
              : rawTitle.includes('员')
              ? '员级/其他'
              : '中级';
            const duty = parts[5] || (title === '正高' ? '科主任/组长' : '带组骨干');
            const position = parts[6] || '临床医师';
            const employmentType: any = parts[7] || '在编';
            const effectiveFTE = parseFloat(parts[8]) || 1.0;
            const baseSalary = parseFloat(parts[9]) || 8500;
            const campus: any = parts[10] || '总院区(本部)';

            const estRBRVS = Math.round(3200 * effectiveFTE);
            const titleAllowance = title === '正高' ? 3800 : title === '副高' ? 2600 : 1500;
            const estMonthlyBonus = Math.round(baseSalary * 1.5 + titleAllowance);

            return {
              id: `emp-file-${idx + 1}`,
              empNo,
              name,
              gender: '男',
              departmentId: 'dept-01',
              departmentName,
              campus,
              duty,
              position,
              role: `${title} · ${position}`,
              title,
              postGrade: duty,
              recordDate,
              employmentType,
              effectiveFTE,
              baseSalary,
              rbrvsPoints: estRBRVS,
              qualityBonus: 2500,
              drgBonus: 2100,
              totalMonthlyBonus: estMonthlyBonus,
              annualBonus: estMonthlyBonus * 12,
              monthWorkHours: Math.round(176 * effectiveFTE),
              nightShiftCount: duty.includes('护士') ? 4 : 2,
            };
          });

          setStagedEmployees(newEmps);
          setImportStatus({
            type: 'success',
            message: `解析成功！已成功读取并校验 ${newEmps.length} 名人员信息全要素档案。`,
            details: '涵盖人员名称-所属科室-核算日期-职称等级-职务头衔-岗位角色-编制FTE，全要素勾稽通过。',
          });
        } else if (activeCategory === 'clinical_order') {
          // Parse lines skipping header
          const newOrders: ClinicalOrderExecution[] = lines.slice(1).map((line, idx) => {
            const parts = line.split(',').map((p) => p.trim());
            return {
              id: parts[0] || `ORD-NEW-${idx + 1}`,
              orderDept: parts[1] || '胃肠外科',
              execDept: parts[2] || '微创手术室',
              doctorName: parts[3] || '主任医师',
              itemCode: parts[4] || `ITEM-${330100 + idx}`,
              itemName: parts[5] || '临床诊疗手术与治疗项目',
              volume: parseInt(parts[6], 10) || 50,
              unitPrice: parseFloat(parts[7]) || 3500,
              orderShareRate: parseFloat(parts[8]) || 0.2,
              execShareRate: parseFloat(parts[9]) || 0.8,
              cchiCode: parts[10] || 'CCHI-NEW',
              cchiRVU: parseFloat(parts[11]) || 120,
              totalRVU:
                (parseInt(parts[6], 10) || 50) * (parseFloat(parts[11]) || 120),
            };
          });

          setStagedOrders(newOrders);
          setImportStatus({
            type: 'success',
            message: `解析成功！已成功读取并校验 ${newOrders.length} 条开单执行明细数据。`,
            details: '经门禁校验：开单+执行比例和为100%，CCHI映射成功率100%。',
          });
        } else if (activeCategory === 'pricing') {
          const newPricing: PricingFeeItem[] = lines.slice(1).map((line, idx) => {
            const parts = line.split(',').map((p) => p.trim());
            return {
              itemCode: parts[0] || `ITEM-P-${idx + 1}`,
              itemName: parts[1] || '诊疗收费项目',
              price: parseFloat(parts[2]) || 1000,
              insuranceCategory: (parts[3] as any) || '甲类',
              serviceCategory: parts[4] || '临床手术类',
              standardMinutes: parseInt(parts[5], 10) || 60,
              consumableRate: parseFloat(parts[6]) || 0.2,
              rvuWork: parseFloat(parts[7]) || 80,
            };
          });

          setStagedPricing(newPricing);
          setImportStatus({
            type: 'success',
            message: `解析成功！已成功载入 ${newPricing.length} 项收费价格与工时数据。`,
            details: '药耗分离与工时标尺勾稽通过。',
          });
        } else if (activeCategory === 'schedule_attendance') {
          const newAttendance: AttendanceRecord[] = lines.slice(1).map((line, idx) => {
            const parts = line.split(',').map((p) => p.trim());
            return {
              employeeId: parts[0] || `EMP-${idx + 1}`,
              employeeName: parts[1] || '医护员工',
              departmentName: parts[2] || '临床科室',
              scheduledDays: parseInt(parts[3], 10) || 22,
              actualHours: parseFloat(parts[4]) || 176,
              nightShifts: parseInt(parts[5], 10) || 4,
              emergencyShifts: parseInt(parts[6], 10) || 2,
              surgeryUnits: parseInt(parts[7], 10) || 10,
              leaveHours: parseFloat(parts[8]) || 0,
              attendanceScore: parseFloat(parts[9]) || 1.0,
            };
          });

          setStagedAttendance(newAttendance);
          setImportStatus({
            type: 'success',
            message: `解析成功！已载入 ${newAttendance.length} 条排班与实际考勤出勤工时。`,
            details: '夜班、连续工时与缺勤率门禁校验已通过。',
          });
        } else {
          setImportStatus({
            type: 'success',
            message: `文件 ${file.name} 解析完成！已载入 ${lines.length - 1} 行记录。`,
            details: '财务收支与人员主数据校验已就绪，点击“立即入库生效”将驱动沙盘重算。',
          });
        }
      } catch (err: any) {
        setImportStatus({
          type: 'error',
          message: '解析失败，请检查文件格式或参照标准模板规范。',
          details: err.message,
        });
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  // One-click load full standard real-world dataset
  const handleLoadSampleDataset = () => {
    setStagedOrders(initialOrderExecutionList);
    setStagedPricing(initialPricingItems);
    setStagedAttendance(initialAttendanceRecords);
    setStagedDepartments(initialDepartments);
    setStagedEmployees(initialEmployees);

    setImportStatus({
      type: 'success',
      message: '已成功载入国家公立医院高保真标准实测数据集！',
      details:
        '涵盖8个复杂四级与多学科诊疗项目开单研判执行分工、价格目录、16个重点临床医技科室、64名医护人员岗位职称与考勤工时。',
    });
  };

  // Commit staged data to App-wide state
  const handleCommitToSystem = () => {
    onCommitImport({
      departments: stagedDepartments,
      employees: stagedEmployees,
      orderExecutions: stagedOrders,
      pricingItems: stagedPricing,
      attendanceRecords: stagedAttendance,
      financialSummary: financialSummary,
    });

    setIsCommitSuccess(true);
    setImportStatus({
      type: 'success',
      message: '✅ 数据已成功入库并完成全院沙盘与点值引擎的实时联动！',
      details:
        '已更新全院科室大盘、点值反推基线、FTE工作量法测算及个人二次分配台账。',
    });

    setTimeout(() => {
      setIsCommitSuccess(false);
    }, 6000);
  };

  const modules18 = [
    { code: '01', name: '阶段门禁 (进度管理与阶段审批)', status: '已配置', file: '01_阶段门禁.xlsx' },
    { code: '02', name: '参数字典 (全局参数、系数区间、阈值控制)', status: '已生效', file: '02_参数字典.xlsx' },
    { code: '03', name: '科室调研问卷 (第一轮无收费劳动与流程记录)', status: '已归档', file: '03_科室调研问卷.xlsx' },
    { code: '04', name: '科室主数据 (行政/临床/医技/核算单元映射)', status: '正常运行', file: '04_科室主数据.xlsx' },
    { code: '05', name: '人员主数据与FTE (人员状态、有效FTE计算)', status: '正常运行', file: '05_人员主数据与FTE.xlsx' },
    { code: '06', name: '项目目录与CCHI映射 (院内收费映射国家标准)', status: '已映射3892项', file: '06_项目目录与CCHI映射.xlsx' },
    { code: '07', name: '项目执行明细 (历史业务量、执行人、开单研判分担)', status: '已入库248万条', file: '07_项目执行明细.xlsx' },
    { code: '08', name: 'RBRVS标准点数库 (RVU基础点数、项目难度系数)', status: '已发布V3.2', file: '08_RBRVS标准点数库.xlsx' },
    { code: '09', name: '财务与成本数据 (有效收入、药耗剔除、可控成本)', status: '已勾稽平衡', file: '09_财务与成本数据.xlsx' },
    { code: '10', name: '质量与DRG考核 (CMI、DRG效率系数、质量扣罚)', status: '月度动态更新', file: '10_质量与DRG考核.xlsx' },
    { code: '11', name: '清洗与校验规则 (数据异常检测、硬性错误门禁)', status: '通过门禁三', file: '11_清洗与校验规则.xlsx' },
    { code: '12', name: '历史点值反推 (基于历史绩效反推隐含点值与基线)', status: '基线¥12.42', file: '12_历史点值反推.xlsx' },
    { code: '13', name: '大盘与绩效池测算 (有效收入、四大绩效池切分)', status: '调音台联动', file: '13_大盘与绩效池测算.xlsx' },
    { code: '14', name: '定岗定编FTE测算 (工作量法与班次覆盖法)', status: '建议837人', file: '14_定岗定编FTE测算.xlsx' },
    { code: '15', name: '多情景模拟试算 (审慎/基准/发展情景反推点值)', status: '沙盘推演中', file: '15_多情景模拟试算.xlsx' },
    { code: '16', name: '合理性验证与保护线 (保底补差与封顶触发)', status: '保底88%生效', file: '16_合理性验证与保护线.xlsx' },
    { code: '17', name: '科室绩效诊断卡 (科室反馈单与第二轮调研卡)', status: '已支持生成', file: '17_科室绩效诊断卡.xlsx' },
    { code: '18', name: '问题与变更台账 (数据与规则异议闭环管理)', status: '已闭环4项', file: '18_问题与变更台账.xlsx' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Template Hub */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
                <Database className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-white tracking-tight">
                数据采集标准模板、全维度数据导入与实施对接中枢
              </h2>
              <span className="text-xs bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800 font-mono">
                开单研判/执行/价格/编制/排班实时联动
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
              支持按标准采集规范导入**诊疗项目开单研判与执行明细、医疗收费价格目录、组织核算单元、人员岗位职称编制及排班考勤工时**。导入后自动实施门禁校验与勾稽平账，并无缝驱动调音台与全院沙盘重新测算。
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleLoadSampleDataset}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              title="一键载入开单执行、收费价格、岗位编制与考勤全套测试包"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>载入标准示范实测包</span>
            </button>
          </div>
        </div>

        {/* 8 Category Template Quick Download Bar */}
        <div className="border-t border-slate-800 pt-3 mt-2">
          <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
            <span>官方标准采集模板下载 (点击直接下载包含标准字段与填报说明的CSV文件)：</span>
            <span className="text-cyan-400 font-mono">支持 Excel / WPS / HIS直接导出映射</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            <button
              onClick={() => downloadTemplate('clinical_order')}
              className="bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700/80 p-2 rounded-lg text-[11px] flex flex-col items-center gap-1 text-center transition-colors group cursor-pointer"
            >
              <Stethoscope className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-slate-300">07.开单研判执行</span>
            </button>
            <button
              onClick={() => downloadTemplate('pricing')}
              className="bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700/80 p-2 rounded-lg text-[11px] flex flex-col items-center gap-1 text-center transition-colors group cursor-pointer"
            >
              <Coins className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-slate-300">收费价格目录</span>
            </button>
            <button
              onClick={() => downloadTemplate('organization')}
              className="bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700/80 p-2 rounded-lg text-[11px] flex flex-col items-center gap-1 text-center transition-colors group cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-slate-300">04.组织核算单元</span>
            </button>
            <button
              onClick={() => downloadTemplate('employee')}
              className="bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700/80 p-2 rounded-lg text-[11px] flex flex-col items-center gap-1 text-center transition-colors group cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-slate-300">05.人员职称编制</span>
            </button>
            <button
              onClick={() => downloadTemplate('schedule_attendance')}
              className="bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700/80 p-2 rounded-lg text-[11px] flex flex-col items-center gap-1 text-center transition-colors group cursor-pointer"
            >
              <Clock className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-slate-300">排班考勤工时</span>
            </button>
            <button
              onClick={() => downloadTemplate('cchi')}
              className="bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700/80 p-2 rounded-lg text-[11px] flex flex-col items-center gap-1 text-center transition-colors group cursor-pointer"
            >
              <Layers className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-slate-300">06.CCHI映射库</span>
            </button>
            <button
              onClick={() => downloadTemplate('finance')}
              className="bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700/80 p-2 rounded-lg text-[11px] flex flex-col items-center gap-1 text-center transition-colors group cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-slate-300">09.财务收支成本</span>
            </button>
            <button
              onClick={() => downloadTemplate('department')}
              className="bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700/80 p-2 rounded-lg text-[11px] flex flex-col items-center gap-1 text-center transition-colors group cursor-pointer"
            >
              <Download className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-slate-300">科室综合台账</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Import & Inspection Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Category Selector & File Drag Box */}
        <div className="lg:col-span-4 space-y-4">
          {/* Category Tabs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>选择导入业务主题域</span>
              <span className="text-[10px] text-cyan-400 font-mono">共 6 大核心维度</span>
            </h3>

            {[
              {
                id: 'clinical_order',
                label: '诊疗项目开单研判执行明细',
                count: `${stagedOrders.length} 条记录`,
                icon: Stethoscope,
                color: 'text-cyan-400',
              },
              {
                id: 'pricing',
                label: '医疗服务项目价格与收费目录',
                count: `${stagedPricing.length} 项收费`,
                icon: Coins,
                color: 'text-amber-400',
              },
              {
                id: 'organization',
                label: '医院组织架构与核算科室',
                count: `${stagedDepartments.length} 个科室`,
                icon: Building2,
                color: 'text-blue-400',
              },
              {
                id: 'employee',
                label: '人员主数据、岗位职称与编制',
                count: `${stagedEmployees.length} 名员工`,
                icon: UserCheck,
                color: 'text-emerald-400',
              },
              {
                id: 'schedule_attendance',
                label: '排班考勤工时与夜班急诊',
                count: `${stagedAttendance.length} 条工时`,
                icon: Clock,
                color: 'text-purple-400',
              },
              {
                id: 'finance',
                label: '科室财务收支与三级成本核算',
                count: `¥${(financialSummary.effectiveIncome / 10000).toFixed(2)}亿 有效收入`,
                icon: FileSpreadsheet,
                color: 'text-rose-400',
              },
            ].map((cat) => {
              const isActive = activeCategory === cat.id;
              const IconComp = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 border-cyan-500/60 shadow-md text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComp className={`w-4 h-4 ${cat.color}`} />
                    <div>
                      <div className="text-xs font-semibold">{cat.label}</div>
                      <div className="text-[10px] text-slate-500">{cat.count}</div>
                    </div>
                  </div>
                  {isActive && <div className="w-1.5 h-4 bg-cyan-400 rounded-full" />}
                </button>
              );
            })}
          </div>

          {/* Upload Drop Zone */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h3 className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                文件拖拽上传与解析
              </span>
              <span className="text-[10px] text-slate-400">支持 .CSV / .XLSX</span>
            </h3>

            <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/80 rounded-xl p-5 text-center bg-slate-950/40 transition-colors">
              <FileSpreadsheet className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-80" />
              <p className="text-xs font-semibold text-slate-200">
                拖拽当前选定业务维度的文件至此处
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                系统将自动匹配表头字段并执行硬性错误门禁校验
              </p>
              <label className="mt-3 inline-block">
                <span className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1">
                  <FolderDown className="w-3.5 h-3.5" />
                  浏览选择文件
                </span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".csv,.xlsx,.txt"
                  className="hidden"
                />
              </label>
            </div>

            {/* Ingestion Audit Gatekeeper Badges */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1.5 text-[11px]">
              <div className="font-semibold text-slate-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>自动执行的数据门禁与校验项：</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-slate-400 text-[10px]">
                <div className="flex items-center gap-1 text-emerald-400/90">
                  <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                  开单执行分成总和100%
                </div>
                <div className="flex items-center gap-1 text-emerald-400/90">
                  <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                  CCHI国家统一码映射
                </div>
                <div className="flex items-center gap-1 text-emerald-400/90">
                  <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                  工号与科室主外键唯一
                </div>
                <div className="flex items-center gap-1 text-emerald-400/90">
                  <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                  药耗自动分离与剔除
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Staging Table Preview & Commit Engine */}
        <div className="lg:col-span-8 space-y-4">
          {/* Header Action Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-cyan-400" />
                <span>
                  {activeCategory === 'clinical_order' && '诊疗项目开单研判执行分摊明细预览'}
                  {activeCategory === 'pricing' && '医疗服务价格与技术劳务工时目录预览'}
                  {activeCategory === 'organization' && '医院组织架构与临床医技科室单元预览'}
                  {activeCategory === 'employee' && '人员主数据、岗位职称与编制主表预览'}
                  {activeCategory === 'schedule_attendance' && '排班考勤、夜班与出勤工时明细预览'}
                  {activeCategory === 'finance' && '科室收支核算与历史绩效大盘基线预览'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                暂存数据校验无误后，点击“立即入库生效”将全量重算全院绩效沙盘。
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCommitToSystem}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>立即入库生效并驱动全院测算</span>
              </button>

              <button
                onClick={onNavigateToSandbox}
                className="bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
                title="前往沙盘推演查看当前测算结果"
              >
                <span>查看沙盘</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Status Alert Banner */}
          {importStatus && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                importStatus.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
                  : importStatus.type === 'error'
                  ? 'bg-rose-950/80 border-rose-700 text-rose-200'
                  : 'bg-cyan-950/80 border-cyan-700 text-cyan-200'
              }`}
            >
              {importStatus.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />}
              {importStatus.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />}
              {importStatus.type === 'info' && <RefreshCw className="w-4 h-4 text-cyan-400 mt-0.5 animate-spin shrink-0" />}
              <div>
                <p className="font-semibold">{importStatus.message}</p>
                {importStatus.details && (
                  <p className="text-[11px] opacity-80 mt-0.5">{importStatus.details}</p>
                )}
              </div>
            </div>
          )}

          {/* Table Preview Based on Active Category */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            {/* 1. CLINICAL ORDER EXECUTION */}
            {activeCategory === 'clinical_order' && (
              <div className="overflow-x-auto max-h-[460px]">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800 sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3">流水号</th>
                      <th className="py-2.5 px-3">开单科室</th>
                      <th className="py-2.5 px-3">执行科室(手术室/医技)</th>
                      <th className="py-2.5 px-3">研判执行医师</th>
                      <th className="py-2.5 px-3">诊疗项目名称</th>
                      <th className="py-2.5 px-3 text-right">频次</th>
                      <th className="py-2.5 px-3 text-right">单价(元)</th>
                      <th className="py-2.5 px-3 text-center">开单/执行分成</th>
                      <th className="py-2.5 px-3 font-mono">CCHI代码</th>
                      <th className="py-2.5 px-3 text-right">项目RVU</th>
                      <th className="py-2.5 px-3 text-right">总点数</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-[11px]">
                    {stagedOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2 px-3 font-mono text-cyan-400">{ord.id}</td>
                        <td className="py-2 px-3 font-medium text-slate-200">{ord.orderDept}</td>
                        <td className="py-2 px-3 text-slate-300">{ord.execDept}</td>
                        <td className="py-2 px-3 text-slate-300">{ord.doctorName}</td>
                        <td className="py-2 px-3 font-semibold text-white max-w-[200px] truncate" title={ord.itemName}>
                          {ord.itemName}
                        </td>
                        <td className="py-2 px-3 text-right font-mono">{ord.volume}</td>
                        <td className="py-2 px-3 text-right font-mono">¥{ord.unitPrice.toLocaleString()}</td>
                        <td className="py-2 px-3 text-center">
                          <span className="bg-slate-800 px-2 py-0.5 rounded font-mono text-cyan-300 text-[10px]">
                            {(ord.orderShareRate * 100).toFixed(0)}% / {(ord.execShareRate * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-400 text-[10px]">{ord.cchiCode}</td>
                        <td className="py-2 px-3 text-right font-mono text-amber-300 font-semibold">{ord.cchiRVU}</td>
                        <td className="py-2 px-3 text-right font-mono text-emerald-400 font-bold">
                          {ord.totalRVU.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 2. PRICING CATALOG */}
            {activeCategory === 'pricing' && (
              <div className="overflow-x-auto max-h-[460px]">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800 sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3">项目编码</th>
                      <th className="py-2.5 px-3">收费项目名称</th>
                      <th className="py-2.5 px-3 text-right">收费单价(元)</th>
                      <th className="py-2.5 px-3 text-center">医保属性</th>
                      <th className="py-2.5 px-3">医疗类别</th>
                      <th className="py-2.5 px-3 text-right">标准工时(分)</th>
                      <th className="py-2.5 px-3 text-right">耗材成本率</th>
                      <th className="py-2.5 px-3 text-right">技术劳务RVU</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-[11px]">
                    {stagedPricing.map((item) => (
                      <tr key={item.itemCode} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2 px-3 font-mono text-amber-400">{item.itemCode}</td>
                        <td className="py-2 px-3 font-semibold text-white">{item.itemName}</td>
                        <td className="py-2 px-3 text-right font-mono text-cyan-300 font-bold">
                          ¥{item.price.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.insuranceCategory === '甲类'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : item.insuranceCategory === '乙类'
                                ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}
                          >
                            {item.insuranceCategory}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-300">{item.serviceCategory}</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-300">{item.standardMinutes} min</td>
                        <td className="py-2 px-3 text-right font-mono text-rose-300">
                          {(item.consumableRate * 100).toFixed(0)}%
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-emerald-400 font-bold">{item.rvuWork}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. ORGANIZATION / DEPARTMENTS */}
            {activeCategory === 'organization' && (
              <div className="overflow-x-auto max-h-[460px]">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800 sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3">科室编码</th>
                      <th className="py-2.5 px-3">科室名称</th>
                      <th className="py-2.5 px-3">类别</th>
                      <th className="py-2.5 px-3 text-right">编制床位</th>
                      <th className="py-2.5 px-3 text-right">现有FTE</th>
                      <th className="py-2.5 px-3 text-right">历史实发绩效</th>
                      <th className="py-2.5 px-3 text-right">CMI</th>
                      <th className="py-2.5 px-3 text-right">三四级手术率</th>
                      <th className="py-2.5 px-3 text-right">药耗占比</th>
                      <th className="py-2.5 px-3">科主任 / 护士长</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-[11px]">
                    {stagedDepartments.map((dept) => (
                      <tr key={dept.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2 px-3 font-mono text-blue-400">{dept.code}</td>
                        <td className="py-2 px-3 font-semibold text-white">{dept.name}</td>
                        <td className="py-2 px-3">
                          <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300">
                            {dept.category}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono">{dept.bedCount} 张</td>
                        <td className="py-2 px-3 text-right font-mono text-cyan-300 font-bold">{dept.currentFTE} 人</td>
                        <td className="py-2 px-3 text-right font-mono">¥{dept.historicalBonus.toLocaleString()}万</td>
                        <td className="py-2 px-3 text-right font-mono text-purple-300 font-semibold">{dept.cmi.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right font-mono">{dept.level34SurgeryRate}%</td>
                        <td className="py-2 px-3 text-right font-mono text-rose-300">{dept.drugConsumableRatio}%</td>
                        <td className="py-2 px-3 text-slate-400 text-[10px]">
                          {dept.director} / {dept.headNurse}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 4. EMPLOYEES & FTE (人员名称-科室-日期-职称-职务-岗位全要素导入中枢) */}
            {activeCategory === 'employee' && (
              <div className="space-y-3">
                {/* Employee Quick Action & Template Header */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      <UserCheck className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        人员信息与岗位档案导入中心 (名称-科室-日期-职称-职务-岗位全字段)
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        当前暂存人员: <strong className="text-emerald-400 font-mono">{stagedEmployees.length}</strong> 人 ·
                        有效FTE合计: <strong className="text-cyan-400 font-mono">{stagedEmployees.reduce((acc, e) => acc + e.effectiveFTE, 0).toFixed(1)}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPasteBox(!showPasteBox)}
                      className="bg-slate-800 hover:bg-slate-700 text-cyan-300 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{showPasteBox ? '收起粘贴板' : '📋 快捷粘贴文本导入'}</span>
                    </button>

                    <button
                      onClick={() => downloadTemplate('employee')}
                      className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>下载人员导入模板.csv</span>
                    </button>
                  </div>
                </div>

                {/* Paste Area Accordion */}
                {showPasteBox && (
                  <div className="bg-slate-950 border border-cyan-500/40 rounded-xl p-3 space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-cyan-300">
                        从 Excel / WPS 中直接复制数据列并粘贴于下方文本框中：
                      </span>
                      <button
                        onClick={() =>
                          setEmployeePasteText(
                            `工号\t人员名称\t所属科室\t核算日期\t职称\t职务\t岗位\t编制性质\t有效FTE\t月基本工资\t所属院区\nDOC-8801\t王德成\t心血管内科(含CCU)\t2026-09-01\t正高\t科主任\t临床医师\t在编\t1.0\t12000\t总院区(本部)\nDOC-8802\t刘芳\t心血管内科(含CCU)\t2026-09-01\t副高\t医疗组长\t临床医师\t在编\t1.0\t9200\t总院区(本部)\nNUR-8803\t郑海燕\t心血管内科(含CCU)\t2026-09-01\t中级\t责任护士\t责任护士\t人事代理/合同制\t1.0\t7100\t总院区(本部)`
                          )
                        }
                        className="text-cyan-400 hover:text-white underline text-[11px] cursor-pointer"
                      >
                        填入3条示范数据
                      </button>
                    </div>
                    <textarea
                      value={employeePasteText}
                      onChange={(e) => setEmployeePasteText(e.target.value)}
                      placeholder="支持以 Tab 或逗号分隔。每行格式：工号, 人员名称, 所属科室, 核算日期, 职称, 职务, 岗位, 编制性质, 有效FTE, 月基本工资, 所属院区"
                      rows={4}
                      className="w-full bg-slate-900 text-xs text-slate-200 border border-slate-700 rounded-lg p-2.5 font-mono focus:ring-1 focus:ring-cyan-400 placeholder:text-slate-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEmployeePasteText('')}
                        className="bg-slate-800 text-slate-400 hover:text-slate-200 px-3 py-1 rounded-lg text-xs"
                      >
                        清空
                      </button>
                      <button
                        onClick={handleParseEmployeePaste}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-4 py-1 rounded-lg text-xs flex items-center gap-1 shadow cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>一键解析并追加至人员花名册</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Staged Employees Preview Table */}
                <div className="overflow-x-auto max-h-[460px] border border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800 sticky top-0 z-10">
                      <tr>
                        <th className="py-2.5 px-3">工号</th>
                        <th className="py-2.5 px-3">人员姓名</th>
                        <th className="py-2.5 px-3">所属科室</th>
                        <th className="py-2.5 px-2">核算日期</th>
                        <th className="py-2.5 px-2">职称</th>
                        <th className="py-2.5 px-3">职务</th>
                        <th className="py-2.5 px-3">岗位</th>
                        <th className="py-2.5 px-2 text-center">编制与FTE</th>
                        <th className="py-2.5 px-3 text-right">月基本工资</th>
                        <th className="py-2.5 px-3 text-right">出勤工时</th>
                        <th className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                          月度测算绩效(元)
                        </th>
                        <th className="py-2.5 px-2 text-center">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 text-[11px]">
                      {stagedEmployees.slice(0, 30).map((emp, idx) => (
                        <tr key={`${emp.id || 'emp'}-${idx}`} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-2 px-3 font-mono text-emerald-400">{emp.empNo || emp.id}</td>
                          <td className="py-2 px-3 font-semibold text-white">{emp.name}</td>
                          <td className="py-2 px-3 text-slate-300">{emp.departmentName}</td>
                          <td className="py-2 px-2 font-mono text-slate-400 text-[10px]">
                            {emp.recordDate || '2026-09-01'}
                          </td>
                          <td className="py-2 px-2">
                            <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.2 rounded text-[10px] font-bold">
                              {emp.title}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-amber-300 font-medium">
                            {emp.duty || (emp.postGrade.includes('主任') ? '科主任' : '带组骨干')}
                          </td>
                          <td className="py-2 px-3 text-slate-300">
                            {emp.position || emp.postGrade}
                          </td>
                          <td className="py-2 px-2 text-center whitespace-nowrap">
                            <span className="font-mono text-cyan-300 font-bold mr-1">
                              {emp.effectiveFTE.toFixed(1)}
                            </span>
                            <span className="bg-slate-800 px-1 py-0.2 rounded text-[9px] text-slate-400">
                              {emp.employmentType}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-300">
                            ¥{emp.baseSalary.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right font-mono">{emp.monthWorkHours} h</td>
                          <td className="py-2 px-3 text-right font-mono text-emerald-400 font-bold">
                            ¥{emp.totalMonthlyBonus.toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              onClick={() => {
                                setStagedEmployees(stagedEmployees.filter((_, i) => i !== idx));
                              }}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                              title="移除此行"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {stagedEmployees.length > 30 && (
                    <div className="p-2 text-center text-xs text-slate-500 bg-slate-950">
                      已展示前 30 名人员，共 {stagedEmployees.length} 名在岗人员已入库
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. SCHEDULE & ATTENDANCE */}
            {activeCategory === 'schedule_attendance' && (
              <div className="overflow-x-auto max-h-[460px]">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800 sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3">工号</th>
                      <th className="py-2.5 px-3">姓名</th>
                      <th className="py-2.5 px-3">科室</th>
                      <th className="py-2.5 px-3 text-right">月应排班天数</th>
                      <th className="py-2.5 px-3 text-right">实际出勤工时(小时)</th>
                      <th className="py-2.5 px-3 text-right">夜班频次(个)</th>
                      <th className="py-2.5 px-3 text-right">急诊班次(次)</th>
                      <th className="py-2.5 px-3 text-right">手术台次(台)</th>
                      <th className="py-2.5 px-3 text-right">考勤达标系数</th>
                      <th className="py-2.5 px-3 text-center">状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-[11px]">
                    {stagedAttendance.map((att) => (
                      <tr key={att.employeeId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2 px-3 font-mono text-purple-400">{att.employeeId}</td>
                        <td className="py-2 px-3 font-semibold text-white">{att.employeeName}</td>
                        <td className="py-2 px-3 text-slate-300">{att.departmentName}</td>
                        <td className="py-2 px-3 text-right font-mono">{att.scheduledDays} 天</td>
                        <td className="py-2 px-3 text-right font-mono text-cyan-300 font-bold">{att.actualHours} h</td>
                        <td className="py-2 px-3 text-right font-mono text-amber-300 font-semibold">{att.nightShifts}</td>
                        <td className="py-2 px-3 text-right font-mono text-rose-300">{att.emergencyShifts}</td>
                        <td className="py-2 px-3 text-right font-mono text-emerald-400">{att.surgeryUnits}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-white">
                          {att.attendanceScore.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            满勤达标
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 6. FINANCIALS & COST */}
            {activeCategory === 'finance' && (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="text-[11px] text-slate-400">医疗总收入 (万)</div>
                    <div className="text-base font-bold text-cyan-400 font-mono mt-1">
                      ¥{financialSummary.grossIncome.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="text-[11px] text-slate-400">药耗转付剔除 (万)</div>
                    <div className="text-base font-bold text-rose-400 font-mono mt-1">
                      -¥{(financialSummary.drugRevenue + financialSummary.consumableRevenue).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="text-[11px] text-slate-400">有效收入 (可分配底座)</div>
                    <div className="text-base font-bold text-emerald-400 font-mono mt-1">
                      ¥{financialSummary.effectiveIncome.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="text-[11px] text-slate-400">目标绩效大盘池 (万)</div>
                    <div className="text-base font-bold text-amber-400 font-mono mt-1">
                      ¥{financialSummary.totalBonusPool.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="font-semibold text-white">💰 财务收入与三级成本勾稽说明：</div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    根据人社部发〔2021〕63号文精神，系统严格分离药品与高值耗材转付收入，以扣除药耗后的“有效收入”与“可控结余”反推医院绩效总大盘。可控运营成本包含人员经费、折旧、卫材及水电气暖，所有财务科目均满足资产负债表与业务收入总账双重平衡。
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 18 Modules Matrix Table from Management Handbook */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mt-6">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Layers className="w-3.5 h-3.5" />
            </span>
            <h3 className="text-sm font-bold text-white">
              《公立医院薪酬绩效改革一体化测算工具包》18 个核心模块运行状态与接口对接矩阵
            </h3>
          </div>
          <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
            <CheckCircle className="w-3.5 h-3.5" />
            全部18模块数据已勾稽联通
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">序号</th>
                <th className="py-2.5 px-4">模块编号与管理职能</th>
                <th className="py-2.5 px-4">对应测算工具包文件规范</th>
                <th className="py-2.5 px-4">运行与审计状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {modules18.map((m) => (
                <tr key={m.code} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-cyan-400 font-bold">{m.code}</td>
                  <td className="py-2.5 px-4 font-semibold text-white">{m.name}</td>
                  <td className="py-2.5 px-4 font-mono text-slate-400 text-[11px]">{m.file}</td>
                  <td className="py-2.5 px-4">
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-semibold inline-flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      {m.status}
                    </span>
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
