'use client'

import { FileText, Clock, AlertTriangle, CheckCircle } from 'lucide-react'

export default function AIReportingDutiesCompliancePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-[#263976]" />
                  <h1 className="ml-2 text-xl font-semibold text-gray-900">
                    AI Reporting Duties Compliance Agent
                  </h1>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 mb-6">
            <FileText className="h-12 w-12 text-[#263976]" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Reporting Duties Compliance Agent
          </h2>
          
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Automated monitoring and compliance checking for sponsor reporting obligations.
          </p>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Key Features Coming Soon:</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-[#263976]" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Reporting Deadline Tracking</h4>
                    <p className="text-sm text-gray-600">Automated deadline monitoring and alerts</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Obligation Monitoring</h4>
                    <p className="text-sm text-gray-600">Comprehensive obligation tracking and verification</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Automated Compliance Alerts</h4>
                    <p className="text-sm text-gray-600">Timely alerts for reporting requirements</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-orange-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Report Generation Assistance</h4>
                    <p className="text-sm text-gray-600">AI-powered report creation and formatting</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-red-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Compliance Status Tracking</h4>
                    <p className="text-sm text-gray-600">Real-time compliance status monitoring</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-indigo-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Reporting Dashboard</h4>
                    <p className="text-sm text-gray-600">Comprehensive reporting overview and management</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This AI agent is currently in development. It will provide automated monitoring and compliance checking for sponsor reporting obligations with deadline tracking and professional reporting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
