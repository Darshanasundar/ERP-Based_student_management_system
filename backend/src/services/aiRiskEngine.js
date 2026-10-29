/**
 * Advanced Academic AI Risk Assessment Engine
 * 
 * Features:
 * - Multi-dimensional statistical and rule-based academic risk scoring (0.05 to 0.99)
 * - Exam Marks evaluation (55% weight) with non-linear failure penalty below 50%
 * - Attendance percentage tracking (35% weight) with penalty below statutory 75%
 * - Historical backlog/remedial weighting (10% weight)
 * - Generates diagnostic risk factors and targeted faculty intervention recommendations
 */

function evaluateAcademicRisk({
  marks,
  attendancePercentage,
  pendingFeeCount = 0,
  priorBacklogs = 0,
}) {
  const numericMarks = typeof marks === 'number' ? marks : parseFloat(marks) || 75;
  const numericAttendance =
    typeof attendancePercentage === 'number'
      ? attendancePercentage
      : attendancePercentage !== undefined
      ? parseFloat(attendancePercentage)
      : 85;

  let marksRiskScore = 0.10;
  let attendanceRiskScore = 0.10;
  const primaryFactors = [];
  const recommendations = [];

  // 1. Evaluate Marks Component
  if (numericMarks < 35) {
    marksRiskScore = 0.95;
    primaryFactors.push(`Critical Exam Score: ${numericMarks}/100 is severely below the minimum pass grade (40).`);
    recommendations.push('Schedule mandatory 1-on-1 remedial mentoring.');
  } else if (numericMarks < 50) {
    marksRiskScore = 0.78;
    primaryFactors.push(`Academic Warning: ${numericMarks}/100 is below satisfactory passing threshold.`);
    recommendations.push('Assign supplemental problem sets and peer tutor.');
  } else if (numericMarks < 65) {
    marksRiskScore = 0.48;
    primaryFactors.push(`Borderline Performance: ${numericMarks}/100 requires continuous evaluation tracking.`);
    recommendations.push('Encourage tutorial session attendance.');
  } else if (numericMarks < 80) {
    marksRiskScore = 0.22;
  } else {
    marksRiskScore = 0.08;
  }

  // 2. Evaluate Attendance Component
  if (numericAttendance < 65) {
    attendanceRiskScore = 0.92;
    primaryFactors.push(`Severe Attendance Deficit: ${numericAttendance.toFixed(1)}% is below 65% statutory debarment limit.`);
    recommendations.push('Issue formal attendance warning notice to student and guardian.');
  } else if (numericAttendance < 75) {
    attendanceRiskScore = 0.72;
    primaryFactors.push(`Low Attendance: ${numericAttendance.toFixed(1)}% is below the required 75% minimum.`);
    recommendations.push('Obtain medical/absence justification from student.');
  } else if (numericAttendance < 85) {
    attendanceRiskScore = 0.28;
  } else {
    attendanceRiskScore = 0.05;
  }

  // 3. Multi-Factor Composite Calculation
  let compositeRisk = marksRiskScore * 0.55 + attendanceRiskScore * 0.35;

  if (priorBacklogs > 0) {
    compositeRisk += Math.min(0.12, priorBacklogs * 0.04);
    primaryFactors.push(`Student holds ${priorBacklogs} prior course backlogs.`);
  }

  if (pendingFeeCount > 0) {
    compositeRisk += 0.04;
    primaryFactors.push('Pending administrative/tuition fee hold.');
  }

  // Normalize between 0.05 and 0.99
  const finalScore = Math.max(0.05, Math.min(0.99, parseFloat(compositeRisk.toFixed(2))));

  // Status & Severity Categorization
  let riskStatus = 'Low Risk';
  let severityLevel = 'LOW';

  if (finalScore >= 0.70 || numericMarks < 50 || numericAttendance < 65) {
    riskStatus = 'High Risk';
    severityLevel = finalScore >= 0.85 || numericMarks < 40 ? 'CRITICAL' : 'HIGH';
  } else if (finalScore >= 0.40 || numericMarks < 65 || numericAttendance < 75) {
    riskStatus = 'Medium Risk';
    severityLevel = 'MODERATE';
  }

  if (recommendations.length === 0) {
    recommendations.push('Student is in good academic standing. Continue regular coursework.');
  }

  return {
    riskScore: finalScore,
    riskStatus,
    severityLevel,
    primaryFactors:
      primaryFactors.length > 0
        ? primaryFactors
        : ['Satisfactory academic test scores and class attendance.'],
    recommendations,
  };
}

module.exports = {
  evaluateAcademicRisk,
};
