import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

export function RetentionCampaigns() {
  const campaigns = useQuery(api.retentionCampaigns.getAllCampaigns);
  const activeCampaigns = useQuery(api.retentionCampaigns.getActiveCampaigns);
  const createCampaign = useMutation(api.retentionCampaigns.createCampaign);
  const generateRecommendations = useAction(api.retentionCampaigns.generateCampaignRecommendations);
  const updateCampaignStatus = useMutation(api.retentionCampaigns.updateCampaignStatus);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState("High");
  const [recommendations, setRecommendations] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    targetRiskLevel: "High",
    description: "",
    discount: 0,
    offerType: "Discount",
    durationDays: 30
  });

  const handleGenerateRecommendations = async () => {
    setIsGenerating(true);
    try {
      const result = await generateRecommendations({ riskLevel: selectedRiskLevel });
      setRecommendations(result);
      toast.success(`Generated ${result.recommendations.length} campaign recommendations`);
    } catch (error) {
      toast.error("Failed to generate recommendations");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createCampaign(formData);
      toast.success(`Campaign created! Targeting ${result.customersTargeted} customers`);
      setShowCreateForm(false);
      setFormData({
        name: "",
        targetRiskLevel: "High",
        description: "",
        discount: 0,
        offerType: "Discount",
        durationDays: 30
      });
    } catch (error) {
      toast.error("Failed to create campaign");
    }
  };

  const handleToggleCampaign = async (campaignId: string, isActive: boolean) => {
    try {
      await updateCampaignStatus({ campaignId, isActive: !isActive });
      toast.success(`Campaign ${!isActive ? "activated" : "deactivated"}`);
    } catch (error) {
      toast.error("Failed to update campaign status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Retention Campaigns</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Create Campaign
          </button>
        </div>
      </div>

      {/* AI Recommendations Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI Campaign Recommendations</h3>
        <div className="flex items-center space-x-4 mb-4">
          <label className="text-sm font-medium text-gray-700">Target Risk Level:</label>
          <select
            value={selectedRiskLevel}
            onChange={(e) => setSelectedRiskLevel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>
          <button
            onClick={handleGenerateRecommendations}
            disabled={isGenerating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isGenerating ? "Generating..." : "Generate AI Recommendations"}
          </button>
        </div>

        {recommendations && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-3">
              Found {recommendations.targetCount} customers at {selectedRiskLevel.toLowerCase()} risk
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.recommendations.map((rec: any, index: number) => (
                <RecommendationCard
                  key={index}
                  recommendation={rec}
                  onUse={() => {
                    setFormData({
                      name: rec.name,
                      targetRiskLevel: selectedRiskLevel,
                      description: rec.description,
                      discount: rec.discount || 0,
                      offerType: rec.offerType,
                      durationDays: 30
                    });
                    setShowCreateForm(true);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Campaigns */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Campaigns</h3>
        {activeCampaigns && activeCampaigns.length > 0 ? (
          <div className="space-y-4">
            {activeCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign._id}
                campaign={campaign}
                onToggle={handleToggleCampaign}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No active campaigns. Create one to start retaining customers!
          </div>
        )}
      </div>

      {/* All Campaigns */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Campaigns</h3>
        {campaigns && campaigns.length > 0 ? (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign._id}
                campaign={campaign}
                onToggle={handleToggleCampaign}
                showDetails
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No campaigns created yet.
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Campaign</h3>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Risk Level
                </label>
                <select
                  value={formData.targetRiskLevel}
                  onChange={(e) => setFormData({...formData, targetRiskLevel: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="High">High Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="Low">Low Risk</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Offer Type
                </label>
                <select
                  value={formData.offerType}
                  onChange={(e) => setFormData({...formData, offerType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Discount">Discount</option>
                  <option value="Upgrade">Service Upgrade</option>
                  <option value="Contract">Contract Incentive</option>
                  <option value="Service">Additional Service</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={(e) => setFormData({...formData, discount: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.durationDays}
                  onChange={(e) => setFormData({...formData, durationDays: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function RecommendationCard({ recommendation, onUse }: {
  recommendation: any;
  onUse: () => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900">{recommendation.name}</h4>
        <div className="text-sm text-gray-500">
          Effectiveness: {recommendation.effectiveness}/10
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-3">{recommendation.description}</p>
      <div className="flex justify-between items-center">
        <div className="text-sm">
          <span className="font-medium">Type:</span> {recommendation.offerType}
          {recommendation.discount && (
            <span className="ml-2 text-green-600 font-medium">
              {recommendation.discount}% off
            </span>
          )}
        </div>
        <button
          onClick={onUse}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
        >
          Use Template
        </button>
      </div>
    </div>
  );
}

function CampaignCard({ campaign, onToggle, showDetails = false }: {
  campaign: any;
  onToggle: (campaignId: string, isActive: boolean) => void;
  showDetails?: boolean;
}) {
  const isActive = campaign.isActive && campaign.endDate > Date.now();
  
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-medium text-gray-900">{campaign.name}</h4>
          <p className="text-sm text-gray-600">{campaign.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
          }`}>
            {isActive ? "Active" : "Inactive"}
          </span>
          <button
            onClick={() => onToggle(campaign.campaignId, campaign.isActive)}
            className={`px-3 py-1 text-sm rounded ${
              isActive 
                ? "bg-red-100 text-red-700 hover:bg-red-200" 
                : "bg-green-100 text-green-700 hover:bg-green-200"
            } transition-colors`}
          >
            {isActive ? "Deactivate" : "Activate"}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Target:</span> {campaign.targetRiskLevel} Risk
        </div>
        <div>
          <span className="text-gray-600">Customers:</span> {campaign.customersTargeted}
        </div>
        <div>
          <span className="text-gray-600">Offer:</span> {campaign.offerType}
          {campaign.discount && ` (${campaign.discount}%)`}
        </div>
        <div>
          <span className="text-gray-600">Duration:</span> {Math.ceil((campaign.endDate - campaign.startDate) / (1000 * 60 * 60 * 24))} days
        </div>
      </div>
      
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Start: {new Date(campaign.startDate).toLocaleDateString()}</span>
            <span>End: {new Date(campaign.endDate).toLocaleDateString()}</span>
            {campaign.successRate && (
              <span className="text-green-600 font-medium">
                Success Rate: {campaign.successRate}%
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
