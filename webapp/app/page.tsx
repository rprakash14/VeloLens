"use client";

import { useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import Dashboard from "@/components/Dashboard/Dashboard";
import { StravaDataProvider } from "@/contexts/StravaDataContext";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "chat">("dashboard");

  return (
    <StravaDataProvider>
      {/* Desktop: Side-by-side layout */}
      <div className="hidden lg:flex h-screen">
        {/* Dashboard - 60% */}
        <div className="w-[60%] border-r border-gray-200">
          <Dashboard />
        </div>

        {/* Chat - 40% */}
        <div className="w-[40%]">
          <ChatInterface />
        </div>
      </div>

      {/* Mobile/Tablet: Tabbed layout */}
      <div className="lg:hidden h-screen flex flex-col">
        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200 flex">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex-1 py-4 px-6 font-semibold transition-colors ${
              activeTab === "dashboard"
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-4 px-6 font-semibold transition-colors ${
              activeTab === "chat"
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Chat
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "dashboard" ? <Dashboard /> : <ChatInterface />}
        </div>
      </div>
    </StravaDataProvider>
  );
}
