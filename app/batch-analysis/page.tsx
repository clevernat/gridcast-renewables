"use client";

import { useState } from "react";
import Link from "next/link";
import BatchAnalysis from "@/components/BatchAnalysis";

export default function BatchAnalysisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  GridCast Renewables
                </h1>
                <p className="text-sm text-gray-600">Multi-Location Batch Analysis</p>
              </div>
            </Link>
            
            <Link
              href="/"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>←</span>
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Multi-Location Batch Analysis
          </h2>
          <p className="text-gray-600">
            Upload a CSV file with multiple locations to analyze renewable energy potential across different sites simultaneously.
          </p>
        </div>

        {/* Batch Analysis Component (without modal wrapper) */}
        <BatchAnalysis onClose={null} isFullPage={true} />
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600 text-sm">
            <p>© 2025 GridCast Renewables. Predictive Analytics for U.S. Energy Independence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

