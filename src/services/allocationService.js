

const config = require('../config/config.json');

const normalize = (value, cap) => (value / cap) * 100;

const calculateAgentScore = (agent) => {
  const { performanceScore, seniorityMonths, targetAchievedPercent, activeClients } = agent;
  const { weights, normalizationCaps } = config;

  const normalizedSeniority = Math.min(seniorityMonths, normalizationCaps.seniorityMonths);
  const normalizedClients = Math.min(activeClients, normalizationCaps.activeClients);

  const weightedScore =
    (performanceScore * weights.performanceScore) +
    (normalize(normalizedSeniority, normalizationCaps.seniorityMonths) * weights.seniorityMonths) +
    (targetAchievedPercent * weights.targetAchievedPercent) +
    (normalize(normalizedClients, normalizationCaps.activeClients) * weights.activeClients);

  return weightedScore;
};

const generateJustification = (agent, agentScore, averageScore) => {
  if (agentScore > averageScore * 1.1) {
    return "Consistently high performance and long-term contribution, excelling in all key metrics.";
  }
  if (agentScore > averageScore * 0.9) {
    return "Above average performance with consistent contribution across key metrics.";
  }
  if (agentScore < averageScore * 0.7) {
    return "Performance below the group average, with a focus on improving key metrics.";
  }
  return "Moderate performance with potential for growth.";
};

exports.calculateAllocation = (siteKitty, salesAgents) => {
  if (!salesAgents || salesAgents.length === 0) {
    return { allocations: [] };
  }

  const agentScores = salesAgents.map(agent => ({
    id: agent.id,
    score: calculateAgentScore(agent),
    originalAgent: agent
  }));

  const totalScore = agentScores.reduce((sum, agent) => sum + agent.score, 0);

  
  if (totalScore === 0) {
    const equalAllocation = siteKitty / salesAgents.length;
    let allocations = salesAgents.map((agent, index) => ({
      id: agent.id,
      assignedDiscount: parseFloat(equalAllocation.toFixed(2)),
      justification: "All agents have identical performance scores, resulting in an equal distribution."
    }));
    
    // Adjust first agent to account for rounding errors
    const roundedTotal = allocations.reduce((sum, a) => sum + a.assignedDiscount, 0);
    const diff = siteKitty - roundedTotal;
    if (Math.abs(diff) > 0.01) {
      allocations[0].assignedDiscount = parseFloat((allocations[0].assignedDiscount + diff).toFixed(2));
    }
    
    return { allocations };
  }

  const averageScore = totalScore / salesAgents.length;
  const { minDiscount, maxDiscount } = config;

  let allocations = agentScores.map(agent => ({
    id: agent.id,
    score: agent.score,
    assignedDiscount: (agent.score / totalScore) * siteKitty,
    justification: generateJustification(agent.originalAgent, agent.score, averageScore)
  }));
  
  const clampedAllocations = allocations.map(a => ({...a}));
  let totalClampedAmount = 0;
  
  // First pass: clamp all agents and calculate the total clamped amount
  clampedAllocations.forEach(a => {
      if (a.assignedDiscount < minDiscount) {
          a.assignedDiscount = minDiscount;
      } else if (a.assignedDiscount > maxDiscount) {
          a.assignedDiscount = maxDiscount;
      }
      totalClampedAmount += a.assignedDiscount;
  });

  // Calculate the difference between the total clamped amount and the kitty
  const diff = siteKitty - totalClampedAmount;
  
  if (Math.abs(diff) > 0.01) {
      const redistributableAgents = clampedAllocations.filter(a => a.assignedDiscount > minDiscount && a.assignedDiscount < maxDiscount);
      const redistributableScore = redistributableAgents.reduce((sum, a) => sum + a.score, 0);

      if (redistributableScore > 0) {
          clampedAllocations.forEach(a => {
              if (a.assignedDiscount > minDiscount && a.assignedDiscount < maxDiscount) {
                  a.assignedDiscount += (a.score / redistributableScore) * diff;
              }
          });
      }
  }

  // Final rounding and formatting
  const finalResult = clampedAllocations.map(({ id, assignedDiscount, justification }) => ({
    id,
    assignedDiscount: parseFloat(assignedDiscount.toFixed(2)),
    justification
  }));

  // Final check to ensure total sum is exactly siteKitty
  const finalTotal = finalResult.reduce((sum, a) => sum + a.assignedDiscount, 0);
  const totalDiff = siteKitty - finalTotal;
  if (Math.abs(totalDiff) > 0.01) {
    finalResult[0].assignedDiscount = parseFloat((finalResult[0].assignedDiscount + totalDiff).toFixed(2));
  }
  
  return { allocations: finalResult };
};