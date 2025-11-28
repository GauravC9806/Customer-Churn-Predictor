import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";

// Generate sample customer data with realistic patterns
export const generateSampleData = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Clear existing data
    const existingCustomers = await ctx.db.query("customers").collect();
    for (const customer of existingCustomers) {
      await ctx.db.delete(customer._id);
    }

    const sampleCustomers = [
      {
        customerId: "CUST001",
        gender: "Female",
        seniorCitizen: false,
        partner: true,
        dependents: false,
        tenure: 1,
        phoneService: false,
        multipleLines: "No phone service",
        internetService: "DSL",
        onlineSecurity: "No",
        onlineBackup: "Yes",
        deviceProtection: "No",
        techSupport: "No",
        streamingTV: "No",
        streamingMovies: "No",
        contract: "Month-to-month",
        paperlessBilling: true,
        paymentMethod: "Electronic check",
        monthlyCharges: 29.85,
        totalCharges: 29.85,
        churn: false,
        lastUpdated: Date.now(),
      },
      {
        customerId: "CUST002",
        gender: "Male",
        seniorCitizen: false,
        partner: false,
        dependents: false,
        tenure: 34,
        phoneService: true,
        multipleLines: "No",
        internetService: "DSL",
        onlineSecurity: "Yes",
        onlineBackup: "No",
        deviceProtection: "Yes",
        techSupport: "No",
        streamingTV: "No",
        streamingMovies: "No",
        contract: "One year",
        paperlessBilling: false,
        paymentMethod: "Mailed check",
        monthlyCharges: 56.95,
        totalCharges: 1889.5,
        churn: false,
        lastUpdated: Date.now(),
      },
      {
        customerId: "CUST003",
        gender: "Male",
        seniorCitizen: false,
        partner: false,
        dependents: false,
        tenure: 2,
        phoneService: true,
        multipleLines: "No",
        internetService: "DSL",
        onlineSecurity: "Yes",
        onlineBackup: "Yes",
        deviceProtection: "No",
        techSupport: "No",
        streamingTV: "No",
        streamingMovies: "No",
        contract: "Month-to-month",
        paperlessBilling: true,
        paymentMethod: "Mailed check",
        monthlyCharges: 53.85,
        totalCharges: 108.15,
        churn: true,
        lastUpdated: Date.now(),
      },
      {
        customerId: "CUST004",
        gender: "Male",
        seniorCitizen: false,
        partner: false,
        dependents: false,
        tenure: 45,
        phoneService: false,
        multipleLines: "No phone service",
        internetService: "DSL",
        onlineSecurity: "Yes",
        onlineBackup: "No",
        deviceProtection: "Yes",
        techSupport: "Yes",
        streamingTV: "No",
        streamingMovies: "No",
        contract: "One year",
        paperlessBilling: false,
        paymentMethod: "Bank transfer (automatic)",
        monthlyCharges: 42.30,
        totalCharges: 1840.75,
        churn: false,
        lastUpdated: Date.now(),
      },
      {
        customerId: "CUST005",
        gender: "Female",
        seniorCitizen: false,
        partner: false,
        dependents: false,
        tenure: 2,
        phoneService: true,
        multipleLines: "No",
        internetService: "Fiber optic",
        onlineSecurity: "No",
        onlineBackup: "No",
        deviceProtection: "No",
        techSupport: "No",
        streamingTV: "No",
        streamingMovies: "No",
        contract: "Month-to-month",
        paperlessBilling: true,
        paymentMethod: "Electronic check",
        monthlyCharges: 70.70,
        totalCharges: 151.65,
        churn: true,
        lastUpdated: Date.now(),
      },
      {
        customerId: "CUST006",
        gender: "Female",
        seniorCitizen: false,
        partner: false,
        dependents: false,
        tenure: 8,
        phoneService: true,
        multipleLines: "Yes",
        internetService: "Fiber optic",
        onlineSecurity: "No",
        onlineBackup: "No",
        deviceProtection: "Yes",
        techSupport: "No",
        streamingTV: "Yes",
        streamingMovies: "Yes",
        contract: "Month-to-month",
        paperlessBilling: true,
        paymentMethod: "Electronic check",
        monthlyCharges: 99.65,
        totalCharges: 820.5,
        churn: true,
        lastUpdated: Date.now(),
      },
      {
        customerId: "CUST007",
        gender: "Male",
        seniorCitizen: true,
        partner: true,
        dependents: false,
        tenure: 22,
        phoneService: true,
        multipleLines: "Yes",
        internetService: "Fiber optic",
        onlineSecurity: "No",
        onlineBackup: "Yes",
        deviceProtection: "No",
        techSupport: "No",
        streamingTV: "Yes",
        streamingMovies: "No",
        contract: "Month-to-month",
        paperlessBilling: true,
        paymentMethod: "Credit card (automatic)",
        monthlyCharges: 89.10,
        totalCharges: 1949.4,
        churn: false,
        lastUpdated: Date.now(),
      },
      {
        customerId: "CUST008",
        gender: "Female",
        seniorCitizen: false,
        partner: true,
        dependents: true,
        tenure: 10,
        phoneService: false,
        multipleLines: "No phone service",
        internetService: "DSL",
        onlineSecurity: "Yes",
        onlineBackup: "No",
        deviceProtection: "No",
        techSupport: "No",
        streamingTV: "No",
        streamingMovies: "No",
        contract: "Month-to-month",
        paperlessBilling: false,
        paymentMethod: "Mailed check",
        monthlyCharges: 29.75,
        totalCharges: 301.9,
        churn: false,
        lastUpdated: Date.now(),
      }
    ];

    for (const customer of sampleCustomers) {
      await ctx.db.insert("customers", customer);
    }

    return { message: "Sample data generated successfully", count: sampleCustomers.length };
  },
});

export const getAllCustomers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.query("customers").order("desc").collect();
  },
});

export const getCustomerById = query({
  args: { customerId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db
      .query("customers")
      .withIndex("by_customer_id", (q) => q.eq("customerId", args.customerId))
      .unique();
  },
});

export const getChurnStatistics = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const allCustomers = await ctx.db.query("customers").collect();
    const totalCustomers = allCustomers.length;
    const churnedCustomers = allCustomers.filter(c => c.churn).length;
    const activeCustomers = totalCustomers - churnedCustomers;
    const churnRate = totalCustomers > 0 ? (churnedCustomers / totalCustomers) * 100 : 0;

    // Risk level distribution
    const highRisk = allCustomers.filter(c => c.riskLevel === "High").length;
    const mediumRisk = allCustomers.filter(c => c.riskLevel === "Medium").length;
    const lowRisk = allCustomers.filter(c => c.riskLevel === "Low").length;

    // Contract type analysis
    const monthToMonth = allCustomers.filter(c => c.contract === "Month-to-month");
    const oneYear = allCustomers.filter(c => c.contract === "One year");
    const twoYear = allCustomers.filter(c => c.contract === "Two year");

    const contractAnalysis = {
      monthToMonth: {
        total: monthToMonth.length,
        churned: monthToMonth.filter(c => c.churn).length,
        churnRate: monthToMonth.length > 0 ? (monthToMonth.filter(c => c.churn).length / monthToMonth.length) * 100 : 0
      },
      oneYear: {
        total: oneYear.length,
        churned: oneYear.filter(c => c.churn).length,
        churnRate: oneYear.length > 0 ? (oneYear.filter(c => c.churn).length / oneYear.length) * 100 : 0
      },
      twoYear: {
        total: twoYear.length,
        churned: twoYear.filter(c => c.churn).length,
        churnRate: twoYear.length > 0 ? (twoYear.filter(c => c.churn).length / twoYear.length) * 100 : 0
      }
    };

    return {
      totalCustomers,
      activeCustomers,
      churnedCustomers,
      churnRate: Math.round(churnRate * 100) / 100,
      riskDistribution: {
        high: highRisk,
        medium: mediumRisk,
        low: lowRisk
      },
      contractAnalysis
    };
  },
});

export const searchCustomers = query({
  args: { 
    searchTerm: v.string(),
    riskLevel: v.optional(v.string()),
    churnStatus: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (args.searchTerm) {
      const searchQuery = ctx.db.query("customers").withSearchIndex("search_customers", (q) => {
        let searchQuery = q.search("customerId", args.searchTerm);
        if (args.riskLevel) {
          searchQuery = searchQuery.eq("riskLevel", args.riskLevel);
        }
        if (args.churnStatus === "churned") {
          searchQuery = searchQuery.eq("churn", true);
        } else if (args.churnStatus === "active") {
          searchQuery = searchQuery.eq("churn", false);
        }
        return searchQuery;
      });
      return await searchQuery.take(50);
    }

    // If no search term, return all customers with filters
    if (args.riskLevel) {
      return await ctx.db.query("customers")
        .withIndex("by_risk_level", (q) => q.eq("riskLevel", args.riskLevel))
        .take(50);
    } else if (args.churnStatus === "churned") {
      return await ctx.db.query("customers")
        .withIndex("by_churn", (q) => q.eq("churn", true))
        .take(50);
    } else if (args.churnStatus === "active") {
      return await ctx.db.query("customers")
        .withIndex("by_churn", (q) => q.eq("churn", false))
        .take(50);
    }

    return await ctx.db.query("customers").take(50);
  },
});

export const updateCustomer = mutation({
  args: {
    customerId: v.string(),
    updates: v.object({
      monthlyCharges: v.optional(v.number()),
      contract: v.optional(v.string()),
      paymentMethod: v.optional(v.string()),
      internetService: v.optional(v.string()),
    })
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const customer = await ctx.db
      .query("customers")
      .withIndex("by_customer_id", (q) => q.eq("customerId", args.customerId))
      .unique();

    if (!customer) {
      throw new Error("Customer not found");
    }

    await ctx.db.patch(customer._id, {
      ...args.updates,
      lastUpdated: Date.now()
    });

    // Trigger churn prediction update
    await ctx.scheduler.runAfter(0, internal.churnPrediction.predictChurnForCustomer, {
      customerId: args.customerId
    });

    return { success: true };
  },
});
