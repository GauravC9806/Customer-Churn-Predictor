import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  customers: defineTable({
    customerId: v.string(),
    gender: v.string(),
    seniorCitizen: v.boolean(),
    partner: v.boolean(),
    dependents: v.boolean(),
    tenure: v.number(),
    phoneService: v.boolean(),
    multipleLines: v.string(),
    internetService: v.string(),
    onlineSecurity: v.string(),
    onlineBackup: v.string(),
    deviceProtection: v.string(),
    techSupport: v.string(),
    streamingTV: v.string(),
    streamingMovies: v.string(),
    contract: v.string(),
    paperlessBilling: v.boolean(),
    paymentMethod: v.string(),
    monthlyCharges: v.number(),
    totalCharges: v.number(),
    churn: v.boolean(),
    churnProbability: v.optional(v.number()),
    riskLevel: v.optional(v.string()),
    lastUpdated: v.number(),
  })
    .index("by_customer_id", ["customerId"])
    .index("by_churn", ["churn"])
    .index("by_risk_level", ["riskLevel"])
    .index("by_tenure", ["tenure"])
    .searchIndex("search_customers", {
      searchField: "customerId",
      filterFields: ["churn", "riskLevel", "contract"]
    }),

  churnPredictions: defineTable({
    customerId: v.string(),
    predictionDate: v.number(),
    churnProbability: v.number(),
    riskLevel: v.string(),
    keyFactors: v.array(v.string()),
    recommendations: v.array(v.string()),
    confidence: v.number(),
  })
    .index("by_customer_id", ["customerId"])
    .index("by_prediction_date", ["predictionDate"])
    .index("by_risk_level", ["riskLevel"]),

  retentionCampaigns: defineTable({
    campaignId: v.string(),
    name: v.string(),
    targetRiskLevel: v.string(),
    description: v.string(),
    discount: v.optional(v.number()),
    offerType: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    isActive: v.boolean(),
    customersTargeted: v.number(),
    successRate: v.optional(v.number()),
  })
    .index("by_campaign_id", ["campaignId"])
    .index("by_active", ["isActive"])
    .index("by_risk_level", ["targetRiskLevel"]),

  customerInteractions: defineTable({
    customerId: v.string(),
    interactionType: v.string(),
    description: v.string(),
    sentiment: v.optional(v.string()),
    resolved: v.boolean(),
    interactionDate: v.number(),
  })
    .index("by_customer_id", ["customerId"])
    .index("by_interaction_date", ["interactionDate"])
    .index("by_type", ["interactionType"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
