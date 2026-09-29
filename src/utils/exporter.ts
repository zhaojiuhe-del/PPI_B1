import { Department, Employee, CCHIMappingItem } from '../types';

export function exportDepartmentsToCSV(departments: Department[]) {
  const headers = [
    '科室编码',
    '科室名称',
    '核算大类',
    '核定床位',
    '现有效FTE',
    '工作量需求FTE',
    '班次覆盖FTE',
    '建议规划FTE',
    '编制差额(增/减)',
    '历史实发绩效(万元)',
    '新方案预测(万元)',
    '保护后实际(万元)',
    '变动率(%)',
    '保底触发',
    '封顶触发',
    'CMI值',
    '三四级手术占比(%)',
    '药耗占比(%)',
    '战略倾斜系数',
    '总加权RVU点数',
  ];

  const rows = departments.map((d) => [
    d.code,
    d.name,
    d.category,
    d.bedCount,
    d.currentFTE,
    d.workloadFTE,
    d.shiftFTE,
    d.recommendedFTE,
    d.recommendedFTE - d.currentFTE,
    d.historicalBonus,
    d.predictedBonus,
    d.protectedBonus,
    d.changeRate,
    d.isFloorTriggered ? '是' : '否',
    d.isCapTriggered ? '是' : '否',
    d.cmi,
    d.level34SurgeryRate,
    d.drugConsumableRatio,
    d.strategicFactor,
    d.totalWeightedRVU,
  ]);

  const csvContent =
    '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  downloadBlob(csvContent, `公立医院绩效改革科室测算总台账_${getTimestamp()}.csv`, 'text/csv;charset=utf-8;');
}

export function exportEmployeesToCSV(employees: Employee[]) {
  const headers = [
    '工号',
    '姓名',
    '科室',
    '职称',
    '岗位级别',
    '用工形式',
    '有效FTE',
    '基本工资(元)',
    'RBRVS点数',
    '工作量绩效(元)',
    '质量绩效(元)',
    'DRG效率绩效(元)',
    '当月应发绩效(元)',
    '预测年绩效(元)',
    '月工时',
    '夜班天数',
  ];

  const rows = employees.map((e) => [
    e.empNo,
    e.name,
    e.departmentName,
    e.title,
    e.postGrade,
    e.employmentType,
    e.effectiveFTE,
    e.baseSalary,
    e.rbrvsPoints,
    Math.round(e.totalMonthlyBonus * 0.65),
    e.qualityBonus,
    e.drgBonus,
    e.totalMonthlyBonus,
    e.annualBonus,
    e.monthWorkHours,
    e.nightShiftCount,
  ]);

  const csvContent =
    '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadBlob(csvContent, `全院职工个人绩效台账_${getTimestamp()}.csv`, 'text/csv;charset=utf-8;');
}

export type TemplateCategory =
  | 'department'
  | 'employee'
  | 'cchi'
  | 'finance'
  | 'clinical_order'
  | 'schedule_attendance'
  | 'pricing'
  | 'organization';

export function downloadTemplate(templateType: TemplateCategory) {
  let headers: string[] = [];
  let sampleRows: string[][] = [];
  let fileName = '';

  if (templateType === 'department') {
    fileName = '04_科室主数据与核算单元采集模板.csv';
    headers = ['科室编码', '科室名称', '核算大类(临床外科/内科/重症急诊/医技/行政)', '核定床位', '在岗人员数', '主任姓名', '护士长'];
    sampleRows = [
      ['WK-01', '胃肠外科', '临床外科', '78', '38', '张文远', '李雪梅'],
      ['NK-01', '心血管内科', '临床内科', '110', '58', '周晓光', '郑芳'],
      ['JZ-01', '急诊医学中心', '重症与急诊', '65', '62', '林强', '冯敏敏'],
    ];
  } else if (templateType === 'employee') {
    fileName = '05_人员信息与岗位职称职务编制导入模板.csv';
    headers = [
      '职工工号',
      '人员名称',
      '所属科室',
      '核算日期',
      '职称(正高/副高/中级/初级)',
      '职务(科主任/副主任/护士长/医疗组长/带组骨干/普通)',
      '岗位(临床医师/责任护士/医技技师/管理辅助)',
      '编制性质(在编/合同制/派遣/规培)',
      '有效FTE(1.0/0.8/0.5)',
      '月基本工资',
      '所属院区(总院区/东院区/南院区)',
    ];
    sampleRows = [
      ['DOC-1001', '张文远', '胃肠外科', '2026-09-01', '正高', '科主任', '临床医师', '在编', '1.0', '11200', '总院区(本部)'],
      ['NUR-2001', '李雪梅', '胃肠外科', '2026-09-01', '副高', '护士长', '责任护士', '在编', '1.0', '8600', '总院区(本部)'],
      ['DOC-1002', '陈明峰', '胃肠外科', '2026-09-01', '中级', '医疗组长', '临床医师', '人事代理/合同制', '1.0', '7400', '总院区(本部)'],
      ['DOC-1003', '赵建国', '肝胆胰脾外科', '2026-09-01', '正高', '科主任', '临床医师', '在编', '1.0', '11800', '东院区(微创)'],
      ['DOC-1005', '沈立新', '心血管内科(含CCU)', '2026-09-01', '正高', '科主任', '临床医师', '在编', '1.0', '11500', '总院区(本部)'],
      ['TEC-3001', '徐敏', '医学检验科', '2026-09-01', '正高', '科主任', '医技技师', '在编', '1.0', '9800', '总院区(本部)'],
    ];
  } else if (templateType === 'cchi') {
    fileName = '06_院内项目与国家CCHI映射标尺模板.csv';
    headers = ['院内收费编码', '院内项目名称', '国家CCHI编码', 'CCHI标准名称', '业务类别', '基础工时(分)', '工作量点数', '技术技能点数', '风险点数', '资源消耗'];
    sampleRows = [
      ['OP-330201', '腹腔镜胃癌根治术', 'CCHI-330200001', '腹腔镜全胃切除及淋巴结清扫术', '手术', '240', '140', '160', '110', '75.5'],
      ['TR-310508', '纤支镜肺泡灌洗', 'CCHI-310500008', '支气管镜检查与支气管肺泡灌洗', '治疗', '45', '22', '24', '14', '8.5'],
    ];
  } else if (templateType === 'clinical_order') {
    fileName = '07_诊疗项目开单研判执行业务明细模板(CCHI标准).csv';
    headers = [
      '医嘱或事件ID',
      '事件日期时间',
      '所属院区(总院区/东院区/南院区)',
      '国家CCHI大类(综合医疗服务/诊断性操作与检查/实验室与病理诊断/临床治疗性操作/手术治疗/微创介入/中医民族医/康复服务)',
      '开单科室',
      '执行科室',
      '诊疗项目编码',
      '项目名称',
      '开单研判医生',
      '执行人姓名',
      '执行角色(主刀/一助/二助/护士/独立/签发)',
      '执行数量',
      '收费单价(元)',
      '开单分成比(0.15)',
      '执行分成比(0.85)',
      '国家CCHI编码',
      '标准RVU点数',
    ];
    sampleRows = [
      ['EVT-20260901', '2026-09-20 09:30', '总院区(本部)', '手术治疗类', '胃肠外科', '胃肠外科(手术室)', 'ITEM-330101', '腹腔镜根治性全胃切除伴D2淋巴结清扫术', '陆建国', '陆建国', '主刀', '1', '9800', '0.15', '0.85', 'CCHI-330101-A', '420.5'],
      ['EVT-20260902', '2026-09-21 14:10', '总院区(本部)', '微创介入诊疗类', '心血管内科(含CCU)', '心导管介入手术室', 'ITEM-310702', '经皮冠状动脉支架植入术(复杂病变OCT引导)', '沈立新', '沈立新', '主刀', '2', '8500', '0.20', '0.80', 'CCHI-310702-B', '310.0'],
      ['EVT-20260903', '2026-09-22 10:20', '东院区(微创)', '诊断性操作与检查类', '呼吸与危重症医学科', '内镜中心', 'ITEM-220101', '高清超细支气管镜EBUS-TBNA纵隔淋巴结穿刺活检术', '陈立群', '陈立群', '主检', '1', '3200', '0.20', '0.80', 'CCHI-220101-B', '165.0'],
    ];
  } else if (templateType === 'schedule_attendance') {
    fileName = '08_临床排班考勤与夜班工时模板.csv';
    headers = ['职工工号', '姓名', '科室名称', '当月实际出勤工时', '夜班出勤天数', '节假日值班天数', '下乡或进修状态', '考勤折算系数(1.0/0.8/0.5)'];
    sampleRows = [
      ['DOC-1001', '张文远', '胃肠外科', '210', '2', '1', '正常在岗', '1.0'],
      ['DOC-1002', '陈明峰', '胃肠外科', '225', '5', '2', '正常在岗', '1.0'],
      ['NUR-2001', '李雪梅', '胃肠外科', '185', '0', '0', '正常在岗', '1.0'],
    ];
  } else if (templateType === 'pricing') {
    fileName = '09_医疗项目院内收费价格与耗材标准模板.csv';
    headers = ['项目编码', '项目名称', '现行物价基准价格(元)', '医保支付类别(甲/乙/丙)', '是否含耗材(是/否)', '耗材进销成本(元)', '建议调整价格(元)'];
    sampleRows = [
      ['OP-330201', '腹腔镜全胃切除及淋巴结清扫术', '4200', '甲类', '否', '0', '4800'],
      ['OP-330712', '冠状动脉腔内成形术并支架置入', '3500', '甲类', '是', '6800', '3500'],
      ['DG-210204', '胸腹部多排螺旋CT增强扫描', '480', '甲类', '否', '0', '480'],
    ];
  } else if (templateType === 'organization') {
    fileName = '10_医院组织架构与部门核算单元字典模板.csv';
    headers = ['组织单元编码', '组织单元名称', '组织性质(临床/医技/医辅/行政/后勤)', '上级部门', '责任中心负责人', '是否参与一次绩效核算(是/否)'];
    sampleRows = [
      ['DEPT-WK', '外科医学部', '临床大部', '医务处/业务副院长', '张文远', '是'],
      ['WK-01', '胃肠外科', '临床外科', '外科医学部', '张文远', '是'],
      ['YJ-01', '医学影像中心', '医技平台', '医技管理委员会', '高立群', '是'],
    ];
  } else {
    fileName = '11_科室财务收支与成本核算模板.csv';
    headers = ['科室名称', '医疗总收入(万元)', '药品转付(万元)', '高值耗材(万元)', '可控运营成本(万元)', '固定折旧公摊(万元)'];
    sampleRows = [
      ['胃肠外科', '8500', '1800', '1450', '2800', '650'],
      ['心血管内科', '12400', '3100', '2600', '3900', '820'],
      ['急诊医学中心(含EICU)', '6200', '1400', '850', '2900', '520'],
    ];
  }

  const csvContent =
    '\uFEFF' + [headers.join(','), ...sampleRows.map((r) => r.join(','))].join('\n');
  downloadBlob(csvContent, fileName, 'text/csv;charset=utf-8;');
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getTimestamp() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
    d.getDate()
  ).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}${String(
    d.getMinutes()
  ).padStart(2, '0')}`;
}
