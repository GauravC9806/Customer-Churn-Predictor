import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

export function CustomerList() {
  const customers = useQuery(api.customers.getAllCustomers);
  const updateCustomer = useMutation(api.customers.updateCustomer);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [churnFilter, setChurnFilter] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  const filteredCustomers = customers?.filter(customer => {
    const matchesSearch = customer.customerId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = !riskFilter || customer.riskLevel === riskFilter;
    const matchesChurn = !churnFilter || 
      (churnFilter === "churned" && customer.churn) ||
      (churnFilter === "active" && !customer.churn);
    
    return matchesSearch && matchesRisk && matchesChurn;
  });

  const handleUpdateCustomer = async (customerId: string, updates: any) => {
    try {
      await updateCustomer({ customerId, updates });
      toast.success("Customer updated successfully");
      setIsEditing(false);
      setSelectedCustomer(null);
    } catch (error) {
      toast.error("Failed to update customer");
    }
  };

  if (!customers) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
        <div className="text-sm text-gray-600">
          {filteredCustomers?.length || 0} of {customers.length} customers
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Customer ID
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter customer ID..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Risk Level
            </label>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Risk Levels</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={churnFilter}
              onChange={(e) => setChurnFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Customers</option>
              <option value="active">Active</option>
              <option value="churned">Churned</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setRiskFilter("");
                setChurnFilter("");
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Charges
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contract
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers?.map((customer) => (
                <tr key={customer._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {customer.customerId}
                      </div>
                      <div className="text-sm text-gray-500">
                        {customer.gender}, {customer.seniorCitizen ? "Senior" : "Adult"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RiskBadge level={customer.riskLevel} probability={customer.churnProbability} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.tenure} months
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${customer.monthlyCharges.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.contract}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      customer.churn 
                        ? "bg-red-100 text-red-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {customer.churn ? "Churned" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setIsEditing(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          isEditing={isEditing}
          onClose={() => {
            setSelectedCustomer(null);
            setIsEditing(false);
          }}
          onUpdate={handleUpdateCustomer}
        />
      )}
    </div>
  );
}

function RiskBadge({ level, probability }: { level?: string; probability?: number }) {
  if (!level) {
    return <span className="text-sm text-gray-500">Not assessed</span>;
  }

  const colors = {
    High: "bg-red-100 text-red-800",
    Medium: "bg-yellow-100 text-yellow-800",
    Low: "bg-green-100 text-green-800"
  };

  return (
    <div>
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[level as keyof typeof colors]}`}>
        {level} Risk
      </span>
      {probability && (
        <div className="text-xs text-gray-500 mt-1">
          {probability.toFixed(1)}% churn probability
        </div>
      )}
    </div>
  );
}

function CustomerDetailModal({ customer, isEditing, onClose, onUpdate }: {
  customer: any;
  isEditing: boolean;
  onClose: () => void;
  onUpdate: (customerId: string, updates: any) => void;
}) {
  const [formData, setFormData] = useState({
    monthlyCharges: customer.monthlyCharges,
    contract: customer.contract,
    paymentMethod: customer.paymentMethod,
    internetService: customer.internetService
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(customer.customerId, formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? "Edit Customer" : "Customer Details"} - {customer.customerId}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Charges
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monthlyCharges}
                  onChange={(e) => setFormData({...formData, monthlyCharges: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contract Type
                </label>
                <select
                  value={formData.contract}
                  onChange={(e) => setFormData({...formData, contract: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Month-to-month">Month-to-month</option>
                  <option value="One year">One year</option>
                  <option value="Two year">Two year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Electronic check">Electronic check</option>
                  <option value="Mailed check">Mailed check</option>
                  <option value="Bank transfer (automatic)">Bank transfer (automatic)</option>
                  <option value="Credit card (automatic)">Credit card (automatic)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Internet Service
                </label>
                <select
                  value={formData.internetService}
                  onChange={(e) => setFormData({...formData, internetService: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DSL">DSL</option>
                  <option value="Fiber optic">Fiber optic</option>
                  <option value="No">No internet service</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update Customer
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">Personal Information</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="text-gray-600">Gender:</span> {customer.gender}</p>
                  <p><span className="text-gray-600">Senior Citizen:</span> {customer.seniorCitizen ? "Yes" : "No"}</p>
                  <p><span className="text-gray-600">Partner:</span> {customer.partner ? "Yes" : "No"}</p>
                  <p><span className="text-gray-600">Dependents:</span> {customer.dependents ? "Yes" : "No"}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Account Information</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="text-gray-600">Tenure:</span> {customer.tenure} months</p>
                  <p><span className="text-gray-600">Contract:</span> {customer.contract}</p>
                  <p><span className="text-gray-600">Payment Method:</span> {customer.paymentMethod}</p>
                  <p><span className="text-gray-600">Paperless Billing:</span> {customer.paperlessBilling ? "Yes" : "No"}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Services</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="text-gray-600">Phone Service:</span> {customer.phoneService ? "Yes" : "No"}</p>
                  <p><span className="text-gray-600">Internet Service:</span> {customer.internetService}</p>
                  <p><span className="text-gray-600">Online Security:</span> {customer.onlineSecurity}</p>
                  <p><span className="text-gray-600">Tech Support:</span> {customer.techSupport}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Billing</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="text-gray-600">Monthly Charges:</span> ${customer.monthlyCharges.toFixed(2)}</p>
                  <p><span className="text-gray-600">Total Charges:</span> ${customer.totalCharges.toFixed(2)}</p>
                  <p><span className="text-gray-600">Status:</span> {customer.churn ? "Churned" : "Active"}</p>
                  {customer.riskLevel && (
                    <p><span className="text-gray-600">Risk Level:</span> {customer.riskLevel}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
