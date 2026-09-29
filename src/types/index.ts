export type DepartmentCategory =
  | '临床外科'
  | '临床内科'
  | '重症与急诊'
  | '医技平台'
  | '门急诊与医辅'
  | '行政后勤';

export type CampusType = '总院区(本部)' | '东院区(微创)' | '南院区(妇儿)';

// 国家标准 CCHI 医疗服务操作分类与编码 (中华人民共和国国家卫生健康委标准)
export type CCHICategoryType =
  | '综合医疗服务类' // 含门急诊诊查、住院监护、专科护理、通用处置
  | '诊断性操作与检查类' // 含影像诊断(CT/DR/MR)、超声诊断、内镜检查、电生理
  | '实验室与病理诊断类' // 含生化/免疫/分子/血液体液检验及病理组织学诊断
  | '临床治疗性操作类' // 含非手术专科治疗、穿刺引流、血液透析、体外循环
  | '手术治疗类' // 各科外科手术操作
  | '微创介入诊疗类' // 心脑血管与外周微创介入手术
  | '中医及民族医诊疗类' // 中医辨证、针灸推拿、中医拔罐及特色诊疗
  | '康复医疗服务类'; // 运动/作业/言语康复评定及训练

export type ClinicalCategoryType = CCHICategoryType;

export type MetricDimensionType = '全部要素' | '工作量' | '服务质量' | '综合奖惩' | 'CMI' | 'DRG' | '单项奖励' | '运营成本';

export type EmploymentType = '在编' | '人事代理/合同制' | '劳务派遣' | '规培生/进修';

export type ProfessionalTitle = '正高' | '副高' | '中级' | '初级/士' | '员级/其他';

// 系统展现模式：深邃黑夜模式、清爽白天模式、经典菜单独立模式
export type AppDisplayMode = 'dark' | 'light' | 'classic_menu';

export interface Department {
  id: string;
  code: string;
  name: string;
  category: DepartmentCategory;
  campus?: CampusType;
  accountingUnit?: string; // 核算单元名称
  bedCount: number;
  currentFTE: number;
  workloadFTE: number;
  shiftFTE: number;
  recommendedFTE: number;
  historicalBonus: number; // 万元/年
  predictedBonus: number; // 万元/年
  protectedBonus: number; // 万元/年 (经保底封顶)
  changeRate: number; // % 变动率
  isFloorTriggered: boolean;
  isCapTriggered: boolean;
  cmi: number;
  drgCaseCount: number;
  level34SurgeryRate: number; // %
  drugConsumableRatio: number; // %
  costMarginRate: number; // %
  strategicFactor: number; // 科室战略倾斜系数 (1.0 ~ 1.35)
  qualityScore: number; // 0-100分
  totalWeightedRVU: number; // 总加权点数
  director: string;
  headNurse: string;
  // 一次分配明细 (万元)
  workloadBonusPool?: number; // 工作量池分配
  qualityBonusPool?: number; // 质量与安全池分配
  drgBonusPool?: number; // DRG精益与CMI难度池
  strategicBonusPool?: number; // 战略重点专科倾斜池
  costSavingBonus?: number; // 运营成本结余返还
  singleSpecialReward?: number; // 单项技术/科研突破奖励
  singlePenalty?: number; // 单项违规/院感/不良事件扣罚
  floorSupplement?: number; // 保底补差金额
  capReduction?: number; // 封顶削峰调减
  doctorGroupRatio?: number; // 建议医生组二次分配占比 (如 0.60)
  nurseGroupRatio?: number; // 建议护理组二次分配占比 (如 0.35)
  techGroupRatio?: number; // 建议医技组二次分配占比 (如 0.05)
}

export interface Employee {
  id: string;
  empNo: string;
  name: string;
  gender: '男' | '女';
  departmentId: string;
  departmentName: string;
  campus?: CampusType;
  accountingUnit?: string;
  role: string; // 主任医师、副主任护师等
  title: ProfessionalTitle;
  duty?: string; // 职务：科主任、副主任、护士长、医疗组长、主治带组、普通等
  position?: string; // 岗位：临床医师、责任护士、医技技师、药师等
  postGrade: string; // 医疗组长、主治医师、责任护士、技师等
  recordDate?: string; // 考勤与核算日期 (如 2026-09-01)
  employmentType: EmploymentType;
  effectiveFTE: number; // 1.0, 0.8, 0.5
  baseSalary: number; // 元/月
  rbrvsPoints: number; // 个人工作量RVU点数
  qualityBonus: number; // 质量绩效
  drgBonus: number; // DRG/国考效率绩效
  totalMonthlyBonus: number; // 个人当月应发绩效
  annualBonus: number; // 个人年累计绩效
  monthWorkHours: number; // 当月工时
  nightShiftCount: number; // 夜班次数
  // 二次分配明细 (元/月)
  workloadBonusShare?: number; // 工作量积分实发
  responsibilityAllowance?: number; // 医疗组长/主刀带组津贴
  titleAllowance?: number; // 岗位职级与职称津贴
  nightEmergencyAllowance?: number; // 夜班与急诊津贴
  qualityKpiAdjust?: number; // 个人医疗质量考评增减
  personalSpecialReward?: number; // 个人单项奖励
  personalPenalty?: number; // 个人差错/投诉扣罚
  preTaxBonus?: number; // 税前应发总额
  estimatedTax?: number; // 个人所得税估算
}

export interface CCHIMappingItem {
  id: string;
  internalCode: string;
  internalName: string;
  cchiCode: string;
  cchiName: string;
  category: string; // 手术、治疗、诊断、护理、医技
  workload: number; // 基础工作量点数
  skill: number; // 技能难度点数
  risk: number; // 风险程度点数
  timeMinutes: number; // 标准工时(分)
  resource: number; // 资源消耗
  difficultyFactor: number; // 项目难度系数
  standardRVU: number; // (W+S+R+T+Res) * diff
  annualVolume: number; // 历史年业务量
}

export interface ExecutionEventDetail {
  id: string;
  eventDate: string;
  patientId: string;
  patientName: string;
  departmentName: string;
  internalCode: string;
  itemName: string;
  cchiCode: string;
  quantity: number;
  performerName: string;
  performerTitle: string;
  roleType: '主刀' | '一助' | '二助' | '洗手护士' | '巡回护士' | '独立执行' | '主检签发';
  roleFactor: number;
  postFactor: number;
  titleFactor: number;
  strategicFactor: number;
  baseRVU: number;
  finalWeightedRVU: number;
}

export interface MixerParams {
  totalPoolRatio: number; // 绩效大盘占有效收入比例 25% ~ 35%
  workloadPoolRatio: number; // 工作量池比例 60% ~ 75%
  guaranteePoolRatio: number; // 固定保障池 10% ~ 20%
  qualityPoolRatio: number; // 质量与DRG效率池 5% ~ 15%
  specialDisciplinePoolRatio: number; // 专项学科池 2% ~ 8%
  surgeonWeight: number; // 主刀角色系数 (默认 1.0)
  firstAssistantWeight: number; // 一助系数 (0.3 ~ 0.5)
  secondAssistantWeight: number; // 二助系数 (0.1 ~ 0.25)
  nurseRoleWeight: number; // 专科护理系数 (0.15 ~ 0.3)
  protectFloor: number; // 保底保护线下限 (如 88%)
  protectCap: number; // 封顶上限 (如 125%)
  criticalDisciplineStrategicFactor: number; // 急诊/重症/儿科战略倾斜 (1.0 ~ 1.35)
  surgeryDifficultyFactor: number; // 三四级高难度手术倾斜 (1.0 ~ 1.3)
  drgEfficiencyWeight: number; // DRG/CMI激励力度 (0.8 ~ 1.3)
  fteMaxAdjustRatio: number; // 单期FTE调整上限幅度 (10% ~ 20%)
  rollingSmoothMonths: number; // 平滑移动月数 (1, 3, 6)
  costSavingShareRate: number; // 成本结余激励比例 (10% ~ 30%)
}

export type ScenarioType =
  | 'conservative' // 稳健平稳过渡型
  | 'high_tech_national_exam' // 高精尖与国考攻坚型
  | 'basic_discipline_support' // 基层兜底与紧缺学科扶持型
  | 'drg_cost_control' // DRG精细化与成本管控型
  | 'expansion_ramp_up' // 新院区快速爬坡型
  | 'custom'; // 自定义多轮推演

export interface FinancialSummary {
  grossIncome: number; // 医疗总收入 (万元)
  drugRevenue: number; // 药品转付 (万元)
  consumableRevenue: number; // 耗材转付 (万元)
  policyExcludedIncome: number; // 财政与代收代付排除 (万元)
  effectiveIncome: number; // 有效收入 = 医疗收入 - 药耗 - 排除
  controllableCost: number; // 可控运营成本
  riskReserve: number; // 风险发展留存资金
  distributableSurplus: number; // 可分配结余
  totalBonusPool: number; // 目标绩效大盘
  workloadPool: number; // 工作量池
  guaranteePool: number; // 固定保障池
  qualityPool: number; // 质量池
  specialPool: number; // 专项池
  baselinePointValue: number; // 历史隐含点值 (元/点)
  predictedPointValue: number; // 预测统一点值 (元/点)
  totalHistoricalBonus: number; // 历史实发总绩效
  totalNewBonus: number; // 新方案测算总绩效
}

export interface GatekeeperStage {
  id: number;
  code: string;
  name: string;
  gatekeeperName: string;
  owner: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'REJECTED';
  keyArtifact: string;
  completionRate: number;
  approvedDate?: string;
  notes: string;
}

export interface IssueFeedbackItem {
  id: string;
  departmentId: string;
  departmentName: string;
  submitter: string;
  submitTime: string;
  category: '数据差错回查' | '无收费劳动与项目映射遗漏' | '定岗定编争议' | '政策与特殊学科倾斜诉求';
  description: string;
  status: 'PENDING_REVIEW' | 'VERIFIED_ACCEPTED' | 'REJECTED_EXPLAINED';
  actionTaken: string;
  reviewer: string;
}

// 诊疗项目开单研判与执行明细
export interface ClinicalOrderExecution {
  id: string;
  orderDept: string; // 开单科室
  execDept: string; // 执行科室
  campus?: CampusType; // 所属院区
  clinicalCategory?: ClinicalCategoryType; // 诊疗项目分类：诊察、检查、检验、手术、影像、治疗、护理
  doctorName: string; // 开单/研判医师
  itemCode: string; // 院内项目编码
  itemName: string; // 诊疗项目名称
  volume: number; // 业务频次
  unitPrice: number; // 收费单价(元)
  orderShareRate: number; // 开单分成比例 (如 0.2)
  execShareRate: number; // 执行分成比例 (如 0.8)
  cchiCode: string; // 映射CCHI国家编码
  cchiRVU: number; // 标准RBRVS点数
  totalRVU: number; // 业务总RVU
}

// 医疗服务项目价格与收费目录
export interface PricingFeeItem {
  itemCode: string;
  itemName: string;
  price: number; // 院内收费价格
  insuranceCategory: '甲类' | '乙类' | '自费';
  serviceCategory: string; // 医疗类目
  standardMinutes: number; // 标准工时(分钟)
  consumableRate: number; // 耗材成本占比
  rvuWork: number; // 劳务RVU基准
}

// 排班考勤与工时数据
export interface AttendanceRecord {
  employeeId: string;
  employeeName: string;
  departmentName: string;
  scheduledDays: number; // 应排班天数
  actualHours: number; // 实际工时
  nightShifts: number; // 夜班数
  emergencyShifts: number; // 急诊值班数
  surgeryUnits: number; // 手术台次
  leaveHours: number; // 请假工时
  attendanceScore: number; // 出勤系数
}
