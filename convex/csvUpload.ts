import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const uploadCsvData = mutation({
  args: {
    customers: v.array(v.any())
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Clear existing data
    const existingCustomers = await ctx.db.query("customers").collect();
    for (const customer of existingCustomers) {
      await ctx.db.delete(customer._id);
    }

    let successCount = 0;
    let errorCount = 0;

    for (const customerData of args.customers) {
      try {
        // Helper function to convert boolean-like values
        const toBoolean = (value: any): boolean => {
          if (typeof value === 'boolean') return value;
          if (typeof value === 'number') return value === 1;
          if (typeof value === 'string') {
            const lower = value.toLowerCase().trim();
            return lower === 'yes' || lower === 'true' || lower === '1';
          }
          return false;
        };

        // Helper function to convert to number
        const toNumber = (value: any, defaultValue: number = 0): number => {
          if (value === null || value === undefined || value === '') return defaultValue;
          const num = parseFloat(value);
          return isNaN(num) ? defaultValue : num;
        };

        // Helper function to get string value
        const toString = (value: any, defaultValue: string = "No"): string => {
          if (value === null || value === undefined || value === '') return defaultValue;
          return String(value);
        };

        // Map new format (age, income, tenure_months, etc.) to old format
        // Handle both old format and new format column names
        const normalizedCustomer = {
          customerId: customerData.customerID || customerData.customerId || customerData.customer_id || `CUST_${Date.now()}_${successCount}`,
          gender: customerData.gender || (customerData.age ? (parseFloat(customerData.age) >= 65 ? "Senior" : "Adult") : "Unknown"),
          seniorCitizen: toBoolean(customerData.SeniorCitizen) || toBoolean(customerData.seniorCitizen) || (customerData.age ? parseFloat(customerData.age) >= 65 : false),
          partner: toBoolean(customerData.Partner) || toBoolean(customerData.partner) || false,
          dependents: toBoolean(customerData.Dependents) || toBoolean(customerData.dependents) || false,
          tenure: toNumber(customerData.tenure) || toNumber(customerData.tenure_months) || 0,
          phoneService: toBoolean(customerData.PhoneService) || toBoolean(customerData.phoneService) || toBoolean(customerData.has_phone) || false,
          multipleLines: toString(customerData.MultipleLines || customerData.multipleLines || (toBoolean(customerData.has_multiple_lines) ? "Yes" : "No"), "No"),
          internetService: toString(customerData.InternetService || customerData.internetService || (toBoolean(customerData.has_internet) ? "Yes" : "No"), "No"),
          onlineSecurity: toString(customerData.OnlineSecurity || customerData.onlineSecurity || (toBoolean(customerData.has_online_security) ? "Yes" : "No"), "No"),
          onlineBackup: toString(customerData.OnlineBackup || customerData.onlineBackup || (toBoolean(customerData.has_online_backup) ? "Yes" : "No"), "No"),
          deviceProtection: toString(customerData.DeviceProtection || customerData.deviceProtection || (toBoolean(customerData.has_device_protection) ? "Yes" : "No"), "No"),
          techSupport: toString(customerData.TechSupport || customerData.techSupport || (toBoolean(customerData.has_tech_support) ? "Yes" : "No"), "No"),
          streamingTV: toString(customerData.StreamingTV || customerData.streamingTV || (toBoolean(customerData.has_streaming_tv) ? "Yes" : "No"), "No"),
          streamingMovies: toString(customerData.StreamingMovies || customerData.streamingMovies || (toBoolean(customerData.has_streaming_movies) ? "Yes" : "No"), "No"),
          contract: toString(customerData.Contract || customerData.contract || customerData.contract_type, "Month-to-month"),
          paperlessBilling: toBoolean(customerData.PaperlessBilling) || toBoolean(customerData.paperlessBilling) || false,
          paymentMethod: toString(customerData.PaymentMethod || customerData.paymentMethod || customerData.payment_method, "Electronic check"),
          monthlyCharges: toNumber(customerData.MonthlyCharges || customerData.monthlyCharges || customerData.monthly_charges, 0),
          totalCharges: toNumber(customerData.TotalCharges || customerData.totalCharges || customerData.total_charges, 0),
          churn: toBoolean(customerData.Churn) || toBoolean(customerData.churn) || toBoolean(customerData.churned) || false,
          lastUpdated: Date.now(),
        };

        await ctx.db.insert("customers", normalizedCustomer);
        successCount++;
      } catch (error) {
        console.error("Error inserting customer:", error);
        errorCount++;
      }
    }

    return { 
      message: `CSV data uploaded successfully`, 
      successCount, 
      errorCount,
      totalProcessed: args.customers.length 
    };
  },
});
