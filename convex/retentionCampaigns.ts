import { query, mutation, action, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

export const createCampaign = mutation({
  args: {
    name: v.string(),
    targetRiskLevel: v.string(),
    description: v.string(),
    discount: v.optional(v.number()),
    offerType: v.string(),
    durationDays: v.number()
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const campaignId = `CAMP_${Date.now()}`;
    const startDate = Date.now();
    const endDate = startDate + (args.durationDays * 24 * 60 * 60 * 1000);

    // Count target customers
    const targetCustomers = await ctx.db
      .query("customers")
      .withIndex("by_risk_level", (q) => q.eq("riskLevel", args.targetRiskLevel))
      .collect();

    await ctx.db.insert("retentionCampaigns", {
      campaignId,
      name: args.name,
      targetRiskLevel: args.targetRiskLevel,
      description: args.description,
      discount: args.discount,
      offerType: args.offerType,
      startDate,
      endDate,
      isActive: true,
      customersTargeted: targetCustomers.length
    });

    return { campaignId, customersTargeted: targetCustomers.length };
  },
});

export const getAllCampaigns = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.query("retentionCampaigns").order("desc").collect();
  },
});

export const getActiveCampaigns = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    const campaigns = await ctx.db
      .query("retentionCampaigns")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    return campaigns.filter(campaign => 
      campaign.startDate <= now && campaign.endDate >= now
    );
  },
});

export const generateCampaignRecommendations = action({
  args: { riskLevel: v.string() },
  handler: async (ctx, args): Promise<{ recommendations: any[]; targetCount: number; patterns?: any }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const customers: any[] = await ctx.runQuery(internal.retentionCampaigns.getCustomersByRiskLevel, {
      riskLevel: args.riskLevel
    });

    if (customers.length === 0) {
      return { recommendations: [], targetCount: 0 };
    }

    // Analyze customer patterns
    const patterns = analyzeCustomerPatterns(customers);

    const prompt = `
    Generate retention campaign recommendations for ${args.riskLevel} risk telecom customers.
    
    Customer Analysis:
    - Total customers: ${customers.length}
    - Average tenure: ${patterns.avgTenure} months
    - Average monthly charges: $${patterns.avgMonthlyCharges}
    - Most common contract: ${patterns.mostCommonContract}
    - Most common payment method: ${patterns.mostCommonPayment}
    - Internet service distribution: ${JSON.stringify(patterns.internetServices)}
    
    Generate 3 targeted campaign recommendations with:
    1. Campaign name
    2. Offer type (discount, upgrade, service addition, etc.)
    3. Discount percentage (if applicable)
    4. Description
    5. Expected effectiveness (1-10)
    
    Respond in JSON format:
    {
      "recommendations": [
        {
          "name": "Campaign Name",
          "offerType": "Discount|Upgrade|Service|Contract",
          "discount": number or null,
          "description": "Detailed description",
          "effectiveness": number
        }
      ]
    }
    `;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return { 
        recommendations: result.recommendations || [],
        targetCount: customers.length,
        patterns
      };
    } catch (error) {
      console.error("Campaign generation error:", error);
      
      // Fallback recommendations
      const fallbackRecommendations = generateFallbackRecommendations(args.riskLevel, patterns);
      return {
        recommendations: fallbackRecommendations,
        targetCount: customers.length,
        patterns
      };
    }
  },
});

function analyzeCustomerPatterns(customers: any[]) {
  const avgTenure = customers.reduce((sum, c) => sum + c.tenure, 0) / customers.length;
  const avgMonthlyCharges = customers.reduce((sum, c) => sum + c.monthlyCharges, 0) / customers.length;
  
  const contractCounts = customers.reduce((acc, c) => {
    acc[c.contract] = (acc[c.contract] || 0) + 1;
    return acc;
  }, {});
  
  const paymentCounts = customers.reduce((acc, c) => {
    acc[c.paymentMethod] = (acc[c.paymentMethod] || 0) + 1;
    return acc;
  }, {});
  
  const internetCounts = customers.reduce((acc, c) => {
    acc[c.internetService] = (acc[c.internetService] || 0) + 1;
    return acc;
  }, {});

  return {
    avgTenure: Math.round(avgTenure * 10) / 10,
    avgMonthlyCharges: Math.round(avgMonthlyCharges * 100) / 100,
    mostCommonContract: Object.keys(contractCounts).reduce((a, b) => 
      contractCounts[a] > contractCounts[b] ? a : b
    ),
    mostCommonPayment: Object.keys(paymentCounts).reduce((a, b) => 
      paymentCounts[a] > paymentCounts[b] ? a : b
    ),
    internetServices: internetCounts
  };
}

function generateFallbackRecommendations(riskLevel: string, patterns: any) {
  const recommendations = [];

  if (riskLevel === "High") {
    recommendations.push({
      name: "Emergency Retention Offer",
      offerType: "Discount",
      discount: 25,
      description: "25% discount for 6 months to retain high-risk customers",
      effectiveness: 8
    });
    
    recommendations.push({
      name: "Contract Upgrade Incentive",
      offerType: "Contract",
      discount: 15,
      description: "15% discount for upgrading to annual contract",
      effectiveness: 7
    });
  } else if (riskLevel === "Medium") {
    recommendations.push({
      name: "Loyalty Reward Program",
      offerType: "Service",
      discount: null,
      description: "Free premium services for 3 months",
      effectiveness: 6
    });
    
    recommendations.push({
      name: "Payment Method Incentive",
      offerType: "Discount",
      discount: 10,
      description: "10% discount for switching to automatic payments",
      effectiveness: 7
    });
  } else {
    recommendations.push({
      name: "Preventive Care Package",
      offerType: "Service",
      discount: null,
      description: "Free tech support and device protection",
      effectiveness: 5
    });
  }

  return recommendations;
}

export const getCustomersByRiskLevel = internalQuery({
  args: { riskLevel: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customers")
      .withIndex("by_risk_level", (q) => q.eq("riskLevel", args.riskLevel))
      .collect();
  },
});

export const updateCampaignStatus = mutation({
  args: {
    campaignId: v.string(),
    isActive: v.boolean(),
    successRate: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const campaign = await ctx.db
      .query("retentionCampaigns")
      .withIndex("by_campaign_id", (q) => q.eq("campaignId", args.campaignId))
      .unique();

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    await ctx.db.patch(campaign._id, {
      isActive: args.isActive,
      successRate: args.successRate
    });

    return { success: true };
  },
});
