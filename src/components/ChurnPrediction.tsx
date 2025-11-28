import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

export function ChurnPrediction() {
  const predictions = useQuery(api.churnPrediction.getLatestPredictions, { limit: 20 });
  const predictAll = useAction(api.churnPrediction.predictChurnForAllCustomers);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState("");

  const handleRunPrediction = async () => {
    setIsRunning(true);
    try {
      const result = await predictAll({});
      toast.success(`Churn prediction completed for ${result.count} customers`);
    } catch (error) {
      toast.error("Failed to run churn prediction");
    } finally {
      setIsRunning(false);
    }
  };

  const filteredPredictions = predictions?.filter(p => 
    !selectedRisk || p.riskLevel === selectedRisk
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Churn Prediction Analysis</h2>
        <button
          onClick={handleRunPrediction}
          disabled={isRunning}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning ? "Running AI Analysis..." : "🤖 Run AI Prediction"}
        </button>
      </div>

      {/* Prediction Overview */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔮 AI-Powered Churn Prediction</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">Advanced ML</div>
            <div className="text-sm text-gray-600">Machine learning algorithms analyze customer behavior patterns</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl font-bold text-pink-600">Real-time</div>
            <div className="text-sm text-gray-600">Instant predictions based on current customer data</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl font-bold text-indigo-600">Actionable</div>
            <div className="text-sm text-gray-600">Specific recommendations for each customer</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by Risk Level:</label>
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Risk Levels</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>
          <div className="text-sm text-gray-600">
            Showing {filteredPredictions?.length || 0} predictions
          </div>
        </div>
      </div>

      {/* Predictions List */}
      <div className="space-y-4">
        {filteredPredictions?.map((prediction) => (
          <PredictionCard key={prediction._id} prediction={prediction} />
        ))}
        
        {!predictions && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        )}
        
        {predictions && predictions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Predictions Yet</h3>
            <p className="text-gray-600 mb-4">Run AI prediction analysis to see customer churn forecasts</p>
            <button
              onClick={handleRunPrediction}
              disabled={isRunning}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {isRunning ? "Running..." : "Start AI Analysis"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PredictionCard({ prediction }: { prediction: any }) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "High": return "border-red-200 bg-red-50";
      case "Medium": return "border-yellow-200 bg-yellow-50";
      case "Low": return "border-green-200 bg-green-50";
      default: return "border-gray-200 bg-gray-50";
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={`border rounded-lg p-6 ${getRiskColor(prediction.riskLevel)}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Customer {prediction.customerId}
          </h3>
          <p className="text-sm text-gray-600">
            Predicted on {new Date(prediction.predictionDate).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRiskBadgeColor(prediction.riskLevel)}`}>
            {prediction.riskLevel} Risk
          </span>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {prediction.churnProbability.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">
            Churn Probability
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">🔍 Key Risk Factors</h4>
          <ul className="space-y-1">
            {prediction.keyFactors.map((factor: string, index: number) => (
              <li key={index} className="text-sm text-gray-700 flex items-start">
                <span className="text-red-500 mr-2">•</span>
                {factor}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">💡 Retention Recommendations</h4>
          <ul className="space-y-1">
            {prediction.recommendations.map((rec: string, index: number) => (
              <li key={index} className="text-sm text-gray-700 flex items-start">
                <span className="text-green-500 mr-2">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Confidence Level: {prediction.confidence}%
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
              View Customer
            </button>
            <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">
              Create Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
