import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { Dashboard } from "./components/Dashboard";
import { CustomerList } from "./components/CustomerList";
import { ChurnPrediction } from "./components/ChurnPrediction";
import { RetentionCampaigns } from "./components/RetentionCampaigns";
import { useState } from "react";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="px-4 h-16 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-blue-600">Telecom Churn Analytics</h2>
          <SignOutButton />
        </div>
        <Authenticated>
          <nav className="px-4 pb-3">
            <div className="flex space-x-1">
              {[
                { id: "dashboard", label: "Dashboard", icon: "📊" },
                { id: "customers", label: "Customers", icon: "👥" },
                { id: "prediction", label: "Churn Prediction", icon: "🔮" },
                { id: "campaigns", label: "Retention", icon: "🎯" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
        </Authenticated>
      </header>

      <main className="flex-1 p-6">
        <Content activeTab={activeTab} />
      </main>
      <Toaster />
    </div>
  );
}

function Content({ activeTab }: { activeTab: string }) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Authenticated>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {loggedInUser?.email?.split('@')[0] || "Analyst"}!
          </h1>
          <p className="text-gray-600">
            Monitor customer churn patterns and optimize retention strategies
          </p>
        </div>

        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "customers" && <CustomerList />}
        {activeTab === "prediction" && <ChurnPrediction />}
        {activeTab === "campaigns" && <RetentionCampaigns />}
      </Authenticated>

      <Unauthenticated>
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🔮 Telecom Churn Analytics
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              AI-powered customer retention platform
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-medium">Real-time Analytics</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl mb-2">🤖</div>
                <div className="font-medium">AI Predictions</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-medium">Targeted Campaigns</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl mb-2">💡</div>
                <div className="font-medium">Actionable Insights</div>
              </div>
            </div>
          </div>
          <SignInForm />
        </div>
      </Unauthenticated>
    </div>
  );
}
