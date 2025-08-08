const { calculateAllocation } = require('../services/allocationService');

describe('Smart Discount Allocation Engine Unit Tests', () => {

    // Test Case 1: Normal Case
    test('should correctly allocate discount based on varied agent scores', () => {
        const input = {
            siteKitty: 10000,
            salesAgents: [
                { id: "A1", performanceScore: 90, seniorityMonths: 18, targetAchievedPercent: 85, activeClients: 12 },
                { id: "A2", performanceScore: 70, seniorityMonths: 6, targetAchievedPercent: 60, activeClients: 8 },
                { id: "A3", performanceScore: 95, seniorityMonths: 36, targetAchievedPercent: 98, activeClients: 15 },
                { id: "A4", performanceScore: 55, seniorityMonths: 2, targetAchievedPercent: 40, activeClients: 5 }
            ]
        };
        const result = calculateAllocation(input.siteKitty, input.salesAgents);
        
        
        const a3Allocation = result.allocations.find(a => a.id === "A3").assignedDiscount;
        const a4Allocation = result.allocations.find(a => a.id === "A4").assignedDiscount;
        

        
        expect(a3Allocation).toBeGreaterThan(a4Allocation);
        
        // Agent A4 has the lowest scores, so should get the least (or near-least)
        const a2Allocation = result.allocations.find(a => a.id === "A2").assignedDiscount;
        expect(a4Allocation).toBeLessThan(a2Allocation);
        
        // Assert total allocation is within a small tolerance of siteKitty
        const totalAllocated = result.allocations.reduce((sum, a) => sum + a.assignedDiscount, 0);
        expect(totalAllocated).toBeCloseTo(10000, 2);
    });

    // Test Case 2: All-Same Scores Case - Corrected to handle rounding
    test('should allocate equally when all agents have identical scores', () => {
        const input = {
            siteKitty: 10000,
            salesAgents: [
                { id: "A1", performanceScore: 80, seniorityMonths: 12, targetAchievedPercent: 80, activeClients: 10 },
                { id: "A2", performanceScore: 80, seniorityMonths: 12, targetAchievedPercent: 80, activeClients: 10 },
                { id: "A3", performanceScore: 80, seniorityMonths: 12, targetAchievedPercent: 80, activeClients: 10 }
            ]
        };
        const result = calculateAllocation(input.siteKitty, input.salesAgents);
        
        // The expected values should be rounded to 2 decimal places.
        // The total is 10000, and 10000 / 3 = 3333.333...
        // The final amounts will be 3333.34, 3333.33, and 3333.33 to sum to 10000.
        const expectedAllocations = [3333.34, 3333.33, 3333.33];
        
        result.allocations.forEach((a, index) => {
            expect(a.assignedDiscount).toBeCloseTo(expectedAllocations[index], 2);
        });
        
        const totalAllocated = result.allocations.reduce((sum, a) => sum + a.assignedDiscount, 0);
        expect(totalAllocated).toBeCloseTo(10000, 2);
    });

    // Test Case 3: Rounding and Min/Max Thresholds
    test('should correctly apply min/max thresholds and re-distribute funds', () => {
        const input = {
            siteKitty: 10000,
            salesAgents: [
                { id: "A1", performanceScore: 95, seniorityMonths: 24, targetAchievedPercent: 95, activeClients: 20 },
                { id: "A2", performanceScore: 50, seniorityMonths: 6, targetAchievedPercent: 50, activeClients: 5 }
            ]
        };
        // The config.json has minDiscount: 500, maxDiscount: 5000.
        // The initial proportional share for A2 would be less than 500.
        // The engine should allocate A2 at least 500 and reduce A1's share.
        
        const result = calculateAllocation(input.siteKitty, input.salesAgents);
        
        const a1Allocation = result.allocations.find(a => a.id === "A1").assignedDiscount;
        const a2Allocation = result.allocations.find(a => a.id === "A2").assignedDiscount;

        // Verify that A2 received at least the min discount. The logic will force it to be at least the min.
        expect(a2Allocation).toBeGreaterThanOrEqual(500);
        
        // The total allocated amount should still be the site kitty.
        const totalAllocated = result.allocations.reduce((sum, a) => sum + a.assignedDiscount, 0);
        expect(totalAllocated).toBeCloseTo(10000, 2);
    });
});