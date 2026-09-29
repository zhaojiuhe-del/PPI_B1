import { Department, Employee, FinancialSummary, MixerParams } from '../types';

export interface CalculationResult {
  financialSummary: FinancialSummary;
  departments: Department[];
  employees: Employee[];
  floorCount: number;
  capCount: number;
  totalCurrentFTE: number;
  totalRecommendedFTE: number;
  averageChangeRate: number;
  pointValueChangeRate: number;
}

export function computeSystemState(
  baseSummary: FinancialSummary,
  baseDepartments: Department[],
  baseEmployees: Employee[],
  params: MixerParams
): CalculationResult {
  // 1. Calculate financial pool splits
  const effectiveIncome = Math.max(
    0,
    baseSummary.grossIncome -
      baseSummary.drugRevenue -
      baseSummary.consumableRevenue -
      baseSummary.policyExcludedIncome
  );

  const distributableSurplus = Math.max(
    0,
    effectiveIncome - baseSummary.controllableCost - baseSummary.riskReserve
  );

  const targetTotalPool = Math.max(
    0,
    Math.min(effectiveIncome * (params.totalPoolRatio / 100), distributableSurplus)
  );

  // Four pools
  const workloadPool = targetTotalPool * (params.workloadPoolRatio / 100);
  const guaranteePool = targetTotalPool * (params.guaranteePoolRatio / 100);
  const qualityPool = targetTotalPool * (params.qualityPoolRatio / 100);
  const specialPool = targetTotalPool * (params.specialDisciplinePoolRatio / 100);

  // 2. Adjust department RVUs and preliminary scores based on Mixer parameters
  let totalHospitalWeightedRVU = 0;

  const intermediateDepts = baseDepartments.map((dept) => {
    let strategicMult = dept.strategicFactor;

    // Critical care / Pediatric / Emergency extra tilt
    if (
      dept.category === '重症与急诊' ||
      dept.name.includes('儿科') ||
      dept.name.includes('急诊') ||
      dept.name.includes('ICU')
    ) {
      strategicMult *= params.criticalDisciplineStrategicFactor / 1.25;
    }

    // High difficulty surgery / CMI extra tilt
    if (dept.category === '临床外科' && dept.level34SurgeryRate > 60) {
      strategicMult *= params.surgeryDifficultyFactor / 1.18;
    }

    // CMI guidance power
    const cmiFactor = Math.pow(Math.max(0.8, dept.cmi), params.drgEfficiencyWeight - 1);

    // Adjusted RVU for this department
    const adjustedRVU = Math.round(dept.totalWeightedRVU * strategicMult * cmiFactor);
    totalHospitalWeightedRVU += adjustedRVU;

    return {
      dept,
      adjustedRVU,
      strategicMult,
      cmiFactor,
    };
  });

  // 3. Compute predicted unified point value (元/点)
  const predictedPointValue =
    totalHospitalWeightedRVU > 0 ? (workloadPool * 10000) / totalHospitalWeightedRVU : 12.5;

  let floorCount = 0;
  let capCount = 0;
  let totalCurrentFTE = 0;
  let totalRecommendedFTE = 0;
  let sumChangeRate = 0;

  // 4. Compute Department predicted bonuses & apply Floor/Cap protection
  const updatedDepartments: Department[] = intermediateDepts.map(
    ({ dept, adjustedRVU, strategicMult }) => {
      // Primary allocation components:
      // (1) Workload allocation: adjustedRVU * predictedPointValue (in 万元)
      const workloadBonus = (adjustedRVU * predictedPointValue) / 10000;

      // (2) Guarantee pool share: based on FTE & bedCount
      const guaranteeShare =
        guaranteePool * (dept.currentFTE / 800) * (dept.bedCount > 0 ? 1.05 : 0.95);

      // (3) Quality & DRG pool share
      const qualityShare = qualityPool * (dept.qualityScore / 100) * (adjustedRVU / totalHospitalWeightedRVU);

      // (4) Special discipline support
      let specialShare = 0;
      if (
        dept.category === '重症与急诊' ||
        dept.name.includes('儿科') ||
        dept.name.includes('ICU')
      ) {
        specialShare = specialPool * 0.18;
      } else if (dept.category === '临床外科' && dept.level34SurgeryRate > 75) {
        specialShare = specialPool * 0.12;
      }

      // (5) Controllable Cost Saving Incentive
      const costSavingBonus = Math.max(0, (dept.costMarginRate - 20) * (params.costSavingShareRate / 100) * 1.5);

      const rawPredictedBonus = Math.round(
        workloadBonus + guaranteeShare + qualityShare + specialShare + costSavingBonus
      );

      // Protective Floor & Cap rules
      const minAllowed = Math.round(dept.historicalBonus * (params.protectFloor / 100));
      const maxAllowed = Math.round(dept.historicalBonus * (params.protectCap / 100));

      let protectedBonus = rawPredictedBonus;
      let isFloorTriggered = false;
      let isCapTriggered = false;

      if (rawPredictedBonus < minAllowed) {
        protectedBonus = minAllowed;
        isFloorTriggered = true;
        floorCount++;
      } else if (rawPredictedBonus > maxAllowed) {
        protectedBonus = maxAllowed;
        isCapTriggered = true;
        capCount++;
      }

      const changeRate = Number(
        (((protectedBonus - dept.historicalBonus) / dept.historicalBonus) * 100).toFixed(1)
      );
      sumChangeRate += changeRate;

      // 5. Compute FTE Capacity (Workload FTE vs Shift Coverage FTE vs Recommended FTE with smoothing cap)
      // Workload FTE = Adjusted Workload / Standard annual workload per person (approx 1,750 RVU/person)
      const workloadFTE = Number((adjustedRVU / 1750).toFixed(1));

      // Shift FTE = based on beds & 24h coverage
      let shiftFTE = dept.shiftFTE;
      if (dept.category === '重症与急诊') {
        shiftFTE = Math.max(shiftFTE, Math.round(dept.currentFTE * 1.08));
      }

      const prelimFTE = Math.max(workloadFTE, shiftFTE);

      // Smooth by max adjust ratio
      const maxAllowedFTE = dept.currentFTE * (1 + params.fteMaxAdjustRatio / 100);
      const minAllowedFTE = dept.currentFTE * (1 - params.fteMaxAdjustRatio / 100);
      const recommendedFTE = Math.round(
        Math.max(minAllowedFTE, Math.min(maxAllowedFTE, prelimFTE))
      );

      totalCurrentFTE += dept.currentFTE;
      totalRecommendedFTE += recommendedFTE;

      // Assign campus and accountingUnit if not set
      const campus =
        dept.campus ||
        (['dept-01', 'dept-02', 'dept-03', 'dept-07', 'dept-08', 'dept-09', 'dept-10', 'dept-11', 'dept-12', 'dept-13'].includes(dept.id)
          ? '总院区(本部)'
          : ['dept-04', 'dept-05', 'dept-14', 'dept-15'].includes(dept.id)
          ? '东院区(微创)'
          : '南院区(妇儿)');

      const accountingUnit =
        dept.accountingUnit ||
        (dept.category === '临床外科'
          ? '微创外科与手术中心单元'
          : dept.category === '临床内科'
          ? '心脑血管与脏器疾病单元'
          : dept.category === '重症与急诊'
          ? '急危重症抢救监护单元'
          : dept.category === '医技平台'
          ? '医学影像与分子检验单元'
          : '全院行政后勤综合保障单元');

      const singleSpecialReward = dept.singleSpecialReward ?? (dept.level34SurgeryRate > 75 ? 35 : 15);
      const singlePenalty = dept.singlePenalty ?? (dept.qualityScore < 92 ? 12 : 2);
      const floorSupplement = isFloorTriggered ? minAllowed - rawPredictedBonus : 0;
      const capReduction = isCapTriggered ? rawPredictedBonus - maxAllowed : 0;

      const doctorGroupRatio =
        dept.doctorGroupRatio || (dept.category === '临床外科' ? 0.62 : dept.category === '临床内科' ? 0.60 : 0.55);
      const nurseGroupRatio =
        dept.nurseGroupRatio || (dept.category === '临床外科' ? 0.33 : dept.category === '临床内科' ? 0.35 : 0.38);
      const techGroupRatio =
        dept.techGroupRatio || (dept.category === '医技平台' ? 0.50 : 0.05);

      return {
        ...dept,
        campus,
        accountingUnit,
        predictedBonus: rawPredictedBonus,
        protectedBonus,
        changeRate,
        isFloorTriggered,
        isCapTriggered,
        workloadFTE,
        recommendedFTE,
        totalWeightedRVU: adjustedRVU,
        strategicFactor: Number(strategicMult.toFixed(2)),
        // First distribution components
        workloadBonusPool: Math.round(workloadBonus),
        qualityBonusPool: Math.round(qualityShare),
        drgBonusPool: Math.round((adjustedRVU * 0.06) * (dept.cmi / 1.2)),
        strategicBonusPool: Math.round(specialShare),
        costSavingBonus: Math.round(costSavingBonus),
        singleSpecialReward,
        singlePenalty,
        floorSupplement,
        capReduction,
        doctorGroupRatio,
        nurseGroupRatio,
        techGroupRatio,
      };
    }
  );

  // 5. Update employees based on their department's performance ratio and secondary distribution
  const updatedEmployees = baseEmployees.map((emp) => {
    const parentDept = updatedDepartments.find((d) => d.id === emp.departmentId);
    const growthRatio = parentDept
      ? parentDept.protectedBonus / parentDept.historicalBonus
      : 1.0;

    // Role factor impact
    let roleMultiplier = 1.0;
    if (emp.role.includes('主刀')) {
      roleMultiplier = params.surgeonWeight;
    } else if (emp.role.includes('一助')) {
      roleMultiplier = params.firstAssistantWeight / 0.4;
    } else if (emp.role.includes('护士长') || emp.role.includes('护师')) {
      roleMultiplier = params.nurseRoleWeight / 0.2;
    }

    const newPoints = Math.round(emp.rbrvsPoints * growthRatio * roleMultiplier);
    const newMonthly = Math.round(emp.totalMonthlyBonus * growthRatio * roleMultiplier);

    const campus = emp.campus || parentDept?.campus || '总院区(本部)';
    const accountingUnit = emp.accountingUnit || parentDept?.accountingUnit || '临床医学核算单元';

    // Detailed secondary distribution breakdowns (in 元/月)
    const workloadBonusShare = Math.round(newMonthly * 0.58);
    const responsibilityAllowance = Math.round(
      emp.role.includes('主刀') || emp.postGrade.includes('组长')
        ? newMonthly * 0.16
        : newMonthly * 0.06
    );
    const titleAllowance = Math.round(
      emp.title === '正高' ? 3800 : emp.title === '副高' ? 2600 : emp.title === '中级' ? 1500 : 800
    );
    const nightEmergencyAllowance = Math.round(
      (emp.nightShiftCount || 4) * 280 + (emp.monthWorkHours > 180 ? 600 : 0)
    );
    const qualityKpiAdjust = Math.round(
      parentDept?.qualityScore && parentDept.qualityScore > 94 ? 650 : -200
    );
    const personalSpecialReward = Math.round(emp.title === '正高' ? 1200 : 400);
    const personalPenalty = Math.round(
      parentDept?.qualityScore && parentDept.qualityScore < 90 ? 350 : 0
    );
    const preTaxBonus = newMonthly;
    const estimatedTax = Math.max(0, Math.round((newMonthly - 5000) * 0.10 - 210));

    return {
      ...emp,
      campus,
      accountingUnit,
      rbrvsPoints: newPoints,
      totalMonthlyBonus: newMonthly,
      annualBonus: newMonthly * 12,
      workloadBonusShare,
      responsibilityAllowance,
      titleAllowance,
      nightEmergencyAllowance,
      qualityKpiAdjust,
      personalSpecialReward,
      personalPenalty,
      preTaxBonus,
      estimatedTax,
    };
  });

  const totalNewBonus = updatedDepartments.reduce((acc, d) => acc + d.protectedBonus, 0);

  const updatedFinancialSummary: FinancialSummary = {
    ...baseSummary,
    effectiveIncome,
    distributableSurplus,
    totalBonusPool: targetTotalPool,
    workloadPool: Math.round(workloadPool),
    guaranteePool: Math.round(guaranteePool),
    qualityPool: Math.round(qualityPool),
    specialPool: Math.round(specialPool),
    predictedPointValue: Number(predictedPointValue.toFixed(2)),
    totalNewBonus,
  };

  const averageChangeRate = Number(
    (sumChangeRate / updatedDepartments.length).toFixed(1)
  );

  const pointValueChangeRate = Number(
    (
      ((predictedPointValue - baseSummary.baselinePointValue) /
        baseSummary.baselinePointValue) *
      100
    ).toFixed(1)
  );

  return {
    financialSummary: updatedFinancialSummary,
    departments: updatedDepartments,
    employees: updatedEmployees,
    floorCount,
    capCount,
    totalCurrentFTE,
    totalRecommendedFTE,
    averageChangeRate,
    pointValueChangeRate,
  };
}
