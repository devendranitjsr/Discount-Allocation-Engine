const { calculateAllocation } = require('../services/allocationService');

exports.postAllocation = (req, res) => {
  try {
    const { siteKitty, salesAgents } = req.body;
    const allocations = calculateAllocation(siteKitty, salesAgents);

    const summary = {
      totalAllocated: allocations.allocations.reduce((sum, a) => sum + a.assignedDiscount, 0),
      remainingKitty: siteKitty - allocations.allocations.reduce((sum, a) => sum + a.assignedDiscount, 0),
      totalAgents: salesAgents.length,
      averageAllocation: siteKitty / salesAgents.length
    };
    
    // Ensure remainingKitty is not a tiny negative value due to floating point math
    if (Math.abs(summary.remainingKitty) < 0.01) {
        summary.remainingKitty = 0;
    }
    
    res.status(200).json({
      allocations: allocations.allocations,
      summary: summary
    });
  } catch (error) {
    console.error('Allocation Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};