import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { CsvUpload } from "./CsvUpload";

export function Dashboard() {
  const stats = useQuery(api.customers.getChurnStatistics);
  const generateSampleData = useMutation(api.customers.generateSampleData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCsvUpload, setShowCsvUpload] = useState(false);

  const handleGenerateSampleData = async () => {
    setIsGenerating(true);
    try {
      const result = await generateSampleData({});
      toast.success(`Generated ${result.count} sample customers`);
    } catch (error) {
      toast.error("Failed to generate sample data");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCsvUploadComplete = () => {
    setShowCsvUpload(false);
    // The stats will automatically refresh due to Convex reactivity
  };

  if (!stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Data Import Options */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCsvUpload(!showCsvUpload)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            📁 Upload CSV
          </button>
          <button
            onClick={handleGenerateSampleData}
            disabled={isGenerating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? "Generating..." : "Generate Sample Data"}
          </button>
        </div>
      </div>

      {/* CSV Upload Section */}
      {showCsvUpload && (
        <CsvUpload onUploadComplete={handleCsvUploadComplete} />
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Customers"
          value={stats.totalCustomers.toLocaleString()}
          icon="👥"
          color="blue"
        />
        <MetricCard
          title="Active Customers"
          value={stats.activeCustomers.toLocaleString()}
          icon="✅"
          color="green"
        />
        <MetricCard
          title="Churned Customers"
          value={stats.churnedCustomers.toLocaleString()}
          icon="❌"
          color="red"
        />
        <MetricCard
          title="Churn Rate"
          value={`${stats.churnRate}%`}
          icon="📉"
          color="orange"
        />
      </div>

      {/* Risk Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Level Distribution</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{stats.riskDistribution.high}</div>
            <div className="text-sm text-gray-600">High Risk</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-red-600 h-2 rounded-full" 
                style={{ width: `${stats.totalCustomers > 0 ? (stats.riskDistribution.high / stats.totalCustomers) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.riskDistribution.medium}</div>
            <div className="text-sm text-gray-600">Medium Risk</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-yellow-600 h-2 rounded-full" 
                style={{ width: `${stats.totalCustomers > 0 ? (stats.riskDistribution.medium / stats.totalCustomers) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.riskDistribution.low}</div>
            <div className="text-sm text-gray-600">Low Risk</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${stats.totalCustomers > 0 ? (stats.riskDistribution.low / stats.totalCustomers) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Analysis */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Churn Rate by Contract Type</h3>
        <div className="space-y-4">
          <ContractAnalysisRow
            title="Month-to-month"
            data={stats.contractAnalysis.monthToMonth}
            color="red"
          />
          <ContractAnalysisRow
            title="One year"
            data={stats.contractAnalysis.oneYear}
            color="yellow"
          />
          <ContractAnalysisRow
            title="Two year"
            data={stats.contractAnalysis.twoYear}
            color="green"
          />
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Contract Impact</h4>
            <p className="text-sm text-gray-600">
              Month-to-month contracts show {stats.contractAnalysis.monthToMonth.churnRate.toFixed(1)}% churn rate, 
              significantly higher than long-term contracts.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Risk Assessment</h4>
            <p className="text-sm text-gray-600">
              {stats.riskDistribution.high} customers are at high risk of churning and need immediate attention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }: {
  title: string;
  value: string;
  icon: string;
  color: string;
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    orange: "bg-orange-50 text-orange-700"
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ContractAnalysisRow({ title, data, color }: {
  title: string;
  data: { total: number; churned: number; churnRate: number };
  color: string;
}) {
  const colorClasses = {
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    green: "bg-green-500"
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-900">{title}</span>
          <span className="text-sm text-gray-600">
            {data.churned}/{data.total} ({data.churnRate.toFixed(1)}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}
            style={{ width: `${data.churnRate}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
