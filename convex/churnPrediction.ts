import { action, internalAction, internalMutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

export const predictChurnForAllCustomers = action({
  args: {},
  handler: async (ctx): Promise<{ message: string; count: number }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const customers: any[] = await ctx.runQuery(internal.churnPrediction.getAllCustomersInternal, {});
    
    for (const customer of customers) {
      await ctx.runAction(internal.churnPrediction.predictChurnForCustomer, {
        customerId: customer.customerId
      });
    }

    return { message: "Churn prediction completed for all customers", count: customers.length };
  },
});

export const predictChurnForCustomer = internalAction({
  args: { customerId: v.string() },
  handler: async (ctx, args) => {
    const customer = await ctx.runQuery(internal.churnPrediction.getCustomerInternal, {
      customerId: args.customerId
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    // Prepare customer data for AI analysis
    const customerProfile = {
      tenure: customer.tenure,
      monthlyCharges: customer.monthlyCharges,
      totalCharges: customer.totalCharges,
      contract: customer.contract,
      paymentMethod: customer.paymentMethod,
      internetService: customer.internetService,
      seniorCitizen: customer.seniorCitizen,
      partner: customer.partner,
      dependents: customer.dependents,
      phoneService: customer.phoneService,
      multipleLines: customer.multipleLines,
      onlineSecurity: customer.onlineSecurity,
      onlineBackup: customer.onlineBackup,
      deviceProtection: customer.deviceProtection,
      techSupport: customer.techSupport,
      streamingTV: customer.streamingTV,
      streamingMovies: customer.streamingMovies,
      paperlessBilling: customer.paperlessBilling
    };

    const prompt = `
    Analyze this telecom customer profile and predict churn probability:
    
    Customer Profile:
    ${JSON.stringify(customerProfile, null, 2)}
    
    Based on telecom industry patterns, provide:
    1. Churn probability (0-100%)
    2. Risk level (Low/Medium/High)
    3. Top 3 key factors contributing to churn risk
    4. Top 3 retention recommendations
    5. Confidence level (0-100%)
    
    Consider these churn indicators:
    - Short tenure (< 12 months)
    - Month-to-month contracts
    - High monthly charges
    - Electronic check payments
    - No additional services
    - Senior citizens
    - No dependents/partners
    
    Respond in JSON format:
    {
      "churnProbability": number,
      "riskLevel": "Low|Medium|High",
      "keyFactors": ["factor1", "factor2", "factor3"],
      "recommendations": ["rec1", "rec2", "rec3"],
      "confidence": number
    }
    `;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");

      // Save prediction
      await ctx.runMutation(internal.churnPrediction.savePrediction, {
        customerId: args.customerId,
        churnProbability: result.churnProbability,
        riskLevel: result.riskLevel,
        keyFactors: result.keyFactors,
        recommendations: result.recommendations,
        confidence: result.confidence
      });

      // Update customer record
      await ctx.runMutation(internal.churnPrediction.updateCustomerRisk, {
        customerId: args.customerId,
        churnProbability: result.churnProbability,
        riskLevel: result.riskLevel
      });

      return result;
    } catch (error) {
      console.error("Churn prediction error:", error);
      
      // Fallback simple rule-based prediction
      const fallbackPrediction = calculateFallbackPrediction(customerProfile);
      
      await ctx.runMutation(internal.churnPrediction.savePrediction, {
        customerId: args.customerId,
        churnProbability: fallbackPrediction.churnProbability,
        riskLevel: fallbackPrediction.riskLevel,
        keyFactors: fallbackPrediction.keyFactors,
        recommendations: fallbackPrediction.recommendations,
        confidence: fallbackPrediction.confidence
      });

      return fallbackPrediction;
    }
  },
});

function calculateFallbackPrediction(profile: any) {
  let riskScore = 0;
  const factors = [];
  const recommendations = [];

  // Tenure risk
  if (profile.tenure < 6) {
    riskScore += 30;
    factors.push("Very short tenure (< 6 months)");
    recommendations.push("Implement early engagement program");
  } else if (profile.tenure < 12) {
    riskScore += 20;
    factors.push("Short tenure (< 12 months)");
    recommendations.push("Provide loyalty incentives");
  }

  // Contract risk
  if (profile.contract === "Month-to-month") {
    riskScore += 25;
    factors.push("Month-to-month contract");
    recommendations.push("Offer contract upgrade incentives");
  }

  // Payment method risk
  if (profile.paymentMethod === "Electronic check") {
    riskScore += 15;
    factors.push("Electronic check payment method");
    recommendations.push("Encourage automatic payment setup");
  }

  // High charges risk
  if (profile.monthlyCharges > 80) {
    riskScore += 20;
    factors.push("High monthly charges");
    recommendations.push("Offer service optimization consultation");
  }

  // Senior citizen risk
  if (profile.seniorCitizen) {
    riskScore += 10;
    factors.push("Senior citizen demographic");
    recommendations.push("Provide senior-friendly support");
  }

  const churnProbability = Math.min(riskScore, 95);
  let riskLevel = "Low";
  if (churnProbability > 60) riskLevel = "High";
  else if (churnProbability > 30) riskLevel = "Medium";

  return {
    churnProbability,
    riskLevel,
    keyFactors: factors.slice(0, 3),
    recommendations: recommendations.slice(0, 3),
    confidence: 75
  };
}

export const getAllCustomersInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("customers").collect();
  },
});

export const getCustomerInternal = internalQuery({
  args: { customerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customers")
      .withIndex("by_customer_id", (q) => q.eq("customerId", args.customerId))
      .unique();
  },
});

export const savePrediction = internalMutation({
  args: {
    customerId: v.string(),
    churnProbability: v.number(),
    riskLevel: v.string(),
    keyFactors: v.array(v.string()),
    recommendations: v.array(v.string()),
    confidence: v.number()
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("churnPredictions", {
      customerId: args.customerId,
      predictionDate: Date.now(),
      churnProbability: args.churnProbability,
      riskLevel: args.riskLevel,
      keyFactors: args.keyFactors,
      recommendations: args.recommendations,
      confidence: args.confidence
    });
  },
});

export const updateCustomerRisk = internalMutation({
  args: {
    customerId: v.string(),
    churnProbability: v.number(),
    riskLevel: v.string()
  },
  handler: async (ctx, args) => {
    const customer = await ctx.db
      .query("customers")
      .withIndex("by_customer_id", (q) => q.eq("customerId", args.customerId))
      .unique();

    if (customer) {
      await ctx.db.patch(customer._id, {
        churnProbability: args.churnProbability,
        riskLevel: args.riskLevel,
        lastUpdated: Date.now()
      });
    }
  },
});

export const getLatestPredictions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db
      .query("churnPredictions")
      .order("desc")
      .take(args.limit || 10);
  },
});

export const getPredictionsByRisk = query({
  args: { riskLevel: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db
      .query("churnPredictions")
      .withIndex("by_risk_level", (q) => q.eq("riskLevel", args.riskLevel))
      .order("desc")
      .take(20);
  },
});
