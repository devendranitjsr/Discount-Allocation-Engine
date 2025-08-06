# Smart Discount Allocation Engine

## Table of Contents

1. Introduction  
2. Approach and Justification  
3. Assumptions Made  
4. How to Run  
5. Sample Inputs & Outputs  
6. Unit Tests  

---

## 1. Introduction

This project presents a smart discount allocation engine designed to fairly distribute a fixed discount kitty among sales agents at a specific location. The system is built to be data-driven, transparent, and easily extensible. It takes into account multiple agent attributes—such as performance, seniority, and sales targets—to calculate a justifiable discount allocation for each agent.

---

## 2. Approach and Justification

The core of this engine is a weighted score-based allocation system. This approach was chosen for its flexibility, fairness, and transparency. Instead of a single metric, it considers multiple factors that contribute to an agent's value, making the allocation more holistic and less biased toward any one aspect of performance.

The allocation process is broken down into the following steps:

- **Normalization of Attributes**: The input attributes (performanceScore, seniorityMonths, targetAchievedPercent, activeClients) have different scales and ranges. To ensure each attribute contributes fairly to the final score, they are first normalized. The normalization process scales each value to a range of 0 to 1, where 1 represents the highest value for that attribute across all agents. This prevents any single attribute from disproportionately influencing the final score simply because it has a larger numerical range.

- **Weighted Scoring**: Each normalized attribute is assigned a configurable weight. These weights determine the importance of each factor in the overall allocation. For instance, if performanceScore is considered more critical, it can be given a higher weight than seniorityMonths. The final "raw score" for each agent is calculated as a weighted sum of their normalized attributes.

- **Proportional Allocation**: The raw scores are used to determine the proportion of the total kitty each agent receives. The sum of all agents' raw scores acts as the total "pool" of points. Each agent's assigned discount is then calculated by taking their individual raw score, dividing it by the total raw score pool, and multiplying it by the total siteKitty. This ensures the sum of all allocated discounts exactly matches the total kitty.

- **Justification Generation**: A clear, concise justification is generated for each agent's allocation. This justification is based on the agent's relative performance across the key metrics, highlighting their strengths (e.g., "high performer," "long-term contributor"). This makes the decision-making process transparent and easy for agents and managers to understand.

This modular approach allows for easy tuning of the system's behavior by simply adjusting the weights or adding new attributes without overhauling the core logic.

---

## 3. Assumptions Made

- **Attribute Values**: It's assumed that the input attribute values for agents are accurate and within a reasonable range (e.g., performanceScore is between 0–100, targetAchievedPercent is between 0–100, seniorityMonths and activeClients are non-negative).

- **Input Validity**: The system assumes the input JSON format is correct and contains all the required fields.

- **No Minimum/Maximum Thresholds**: For the base implementation, a minimum and maximum threshold per agent is not enforced. The allocation is purely proportional. This can be easily added as an optional configuration.

- **Rounding**: The final allocated amounts are rounded to the nearest integer to handle floating-point results, but the total sum will always equal the siteKitty. In cases where rounding might cause a total difference, the remaining amount is allocated to the highest-scoring agent to maintain the total.

---

## 4. How to Run

### Prerequisites

Ensure you have **Node.js** installed. No external libraries are required for the base implementation.

### Save the Code

Save the provided code as a JavaScript file, e.g., `allocateDiscounts.js`.

### Prepare Input

Create an input JSON file, e.g., `input_sample.json`, following the format specified below.

### Execute

Run the script from your terminal using the following command:

```bash
node allocateDiscounts.js input_sample.json
Output
The script will print the resulting JSON object directly to the console.

5. Sample Inputs & Outputs
Sample Input (input_sample.json)
json
Copy
Edit
{
  "siteKitty": 10000,
  "salesAgents": [
    {
      "id": "A1",
      "performanceScore": 90,
      "seniorityMonths": 18,
      "targetAchievedPercent": 85,
      "activeClients": 12
    },
    {
      "id": "A2",
      "performanceScore": 70,
      "seniorityMonths": 6,
      "targetAchievedPercent": 60,
      "activeClients": 8
    }
  ]
}


Sample Output
json
Copy
Edit
{
  "allocations": [
    {
      "id": "A1",
      "assignedDiscount": 6250,
      "justification": "Top performer with high client engagement and long-term contribution."
    },
    {
      "id": "A2",
      "assignedDiscount": 3750,
      "justification": "Consistent performance and steady contribution."
    }
  ],
  "totalAllocated": 10000,
  "remainingKitty": 0
}



6. Unit Tests
The following scenarios are included to test the logic:

Normal Case: Tests a standard allocation with varying scores and multiple agents to ensure the proportional logic works as expected. The output should be a fair, justifiable distribution where the total allocated amount equals the siteKitty.

All-Same Scores Case: Tests a scenario where all agents have identical scores across all attributes. The system should allocate the kitty equally among all agents, demonstrating fairness in a neutral situation. This confirms that the normalization and weighted scoring don't create unintended biases when scores are equal.

Rounding Edge Case: Tests a scenario where the proportional allocation results in non-integer values. The system should correctly handle rounding and ensure the sum of all allocated amounts equals the total siteKitty. This verifies that no money is lost or created due to rounding discrepancies.