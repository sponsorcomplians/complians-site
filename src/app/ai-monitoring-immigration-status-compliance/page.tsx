'use client'

import { Shield, Clock, AlertTriangle, Users } from 'lucide-react'

export default function AIMonitoringImmigrationStatusCompliancePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-[#263976]" />
                  <h1 className="ml-2 text-xl font-semibold text-gray-900">
                    AI Immigration Status Monitoring Agent
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
            <Shield className="h-12 w-12 text-[#263976]" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Immigration Status Monitoring Agent
          </h2>
          
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Real-time monitoring and compliance checking for migrant worker immigration status.
          </p>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Key Features Coming Soon:</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Shield className="h-4 w-4 text-[#263976]" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Immigration Status Monitoring</h4>
                    <p className="text-sm text-gray-600">Real-time status monitoring and verification</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Visa Expiry Tracking</h4>
                    <p className="text-sm text-gray-600">Automated visa expiry monitoring and alerts</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Status Change Alerts</h4>
                    <p className="text-sm text-gray-600">Immediate alerts for status changes</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Shield className="h-4 w-4 text-orange-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Compliance Verification</h4>
                    <p className="text-sm text-gray-600">Automated compliance checking and validation</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-red-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Status Reports</h4>
                    <p className="text-sm text-gray-600">Comprehensive status reporting and documentation</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-indigo-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Alert Management</h4>
                    <p className="text-sm text-gray-600">Comprehensive alert system and management</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This AI agent is currently in development. It will provide real-time monitoring and compliance checking for migrant worker immigration status with automated alerts and professional reporting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
