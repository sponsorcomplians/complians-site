#!/usr/bin/env node

/**
 * Test script for Audit Logging System
 * Run with: node test-audit-logs.mjs
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testpassword123';

// Test data
const TEST_TENANT = {
  name: 'Test Company Ltd',
  email: TEST_EMAIL,
  password: TEST_PASSWORD
};

const TEST_WORKER = {
  agentType: 'ai-right-to-work-compliance',
  name: 'John Doe',
  jobTitle: 'Software Engineer',
  socCode: '2136',
  cosReference: 'COS123456',
  complianceStatus: 'COMPLIANT',
  riskLevel: 'LOW',
  redFlag: false,
  globalRiskScore: 0,
  assignmentDate: '2024-01-15'
};

const TEST_NARRATIVE = {
  workerName: 'John Doe',
  jobTitle: 'Software Engineer',
  socCode: '2136',
  assignmentDate: '2024-01-15',
  cosDuties: 'Develop software applications',
  jobDescriptionDuties: 'Write code, debug, test',
  cvSummary: '5 years experience in software development',
  referenceSummary: 'Previous employer confirms experience',
  employmentEvidenceSummary: 'Payslips and contracts provided',
  missingDocs: 'None',
  inconsistencies: 'None',
  experienceConcerns: 'None',
  isCompliant: true
};

class AuditLogsTester {
  constructor() {
    this.session = null;
    this.testResults = [];
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type] || 'ℹ️';
    
    console.log(`${emoji} [${timestamp}] ${message}`);
  }

  async test(name, testFn) {
    try {
      this.log(`Starting test: ${name}`);
      const result = await testFn();
      this.testResults.push({ name, status: 'PASS', result });
      this.log(`Test passed: ${name}`, 'success');
      return result;
    } catch (error) {
      this.testResults.push({ name, status: 'FAIL', error: error.message });
      this.log(`Test failed: ${name} - ${error.message}`, 'error');
      throw error;
    }
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.session?.accessToken && {
          'Authorization': `Bearer ${this.session.accessToken}`
        }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data.error || data.message || 'Unknown error'}`);
      }
      
      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(`Server not running at ${BASE_URL}. Please start the development server.`);
      }
      throw error;
    }
  }

  async signup() {
    return this.test('User Signup', async () => {
      const response = await this.makeRequest('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(TEST_TENANT)
      });
      
      this.session = {
        accessToken: response.accessToken,
        user: response.user
      };
      
      return response;
    });
  }

  async signin() {
    return this.test('User Signin', async () => {
      const response = await this.makeRequest('/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({
          email: TEST_EMAIL,
          password: TEST_PASSWORD
        })
      });
      
      this.session = {
        accessToken: response.accessToken,
        user: response.user
      };
      
      return response;
    });
  }

  async getAuditLogs() {
    return this.test('Get Audit Logs', async () => {
      return await this.makeRequest('/api/audit-logs');
    });
  }

  async getAuditSummary() {
    return this.test('Get Audit Summary', async () => {
      return await this.makeRequest('/api/audit-logs?summary=true&days=30');
    });
  }

  async addWorker() {
    return this.test('Add Worker (Generate Audit Log)', async () => {
      return await this.makeRequest('/api/workers', {
        method: 'POST',
        body: JSON.stringify(TEST_WORKER)
      });
    });
  }

  async generateNarrative() {
    return this.test('Generate Narrative (Generate Audit Log)', async () => {
      return await this.makeRequest('/api/generate-narrative', {
        method: 'POST',
        body: JSON.stringify(TEST_NARRATIVE)
      });
    });
  }

  async testAuditLogFiltering() {
    return this.test('Test Audit Log Filtering', async () => {
      // Test filtering by action
      const workerLogs = await this.makeRequest('/api/audit-logs?action=worker_created');
      
      // Test filtering by date
      const today = new Date().toISOString().split('T')[0];
      const todayLogs = await this.makeRequest(`/api/audit-logs?start_date=${today}`);
      
      // Test pagination
      const paginatedLogs = await this.makeRequest('/api/audit-logs?limit=5&offset=0');
      
      return {
        workerLogs: workerLogs.data?.length || 0,
        todayLogs: todayLogs.data?.length || 0,
        paginatedLogs: paginatedLogs.data?.length || 0
      };
    });
  }

  async testAuditLogPermissions() {
    return this.test('Test Audit Log Permissions', async () => {
      // Test that non-admin users cannot access audit logs
      // This would require creating a non-admin user first
      // For now, we'll just test that the endpoint requires authentication
      
      const response = await fetch(`${BASE_URL}/api/audit-logs`);
      if (response.ok) {
        throw new Error('Audit logs should require authentication');
      }
      
      return { unauthorized: true };
    });
  }

  async cleanOldLogs() {
    return this.test('Clean Old Audit Logs', async () => {
      return await this.makeRequest('/api/audit-logs', {
        method: 'POST',
        body: JSON.stringify({
          action: 'clean_old_logs',
          days_to_keep: 365
        })
      });
    });
  }

  async verifyAuditLogGeneration() {
    return this.test('Verify Audit Log Generation', async () => {
      // Get logs before action
      const beforeLogs = await this.makeRequest('/api/audit-logs?limit=1');
      const beforeCount = beforeLogs.data?.length || 0;
      
      // Perform an action that should generate a log
      await this.addWorker();
      
      // Wait a moment for the log to be written
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get logs after action
      const afterLogs = await this.makeRequest('/api/audit-logs?limit=1');
      const afterCount = afterLogs.data?.length || 0;
      
      // Check if new logs were generated
      const newLogsGenerated = afterCount > beforeCount;
      
      if (!newLogsGenerated) {
        throw new Error('No new audit logs were generated after worker creation');
      }
      
      return { 
        beforeCount, 
        afterCount, 
        newLogsGenerated,
        logsGenerated: afterCount - beforeCount
      };
    });
  }

  async testAuditLogContent() {
    return this.test('Test Audit Log Content', async () => {
      const logs = await this.makeRequest('/api/audit-logs?action=worker_created&limit=1');
      
      if (!logs.data || logs.data.length === 0) {
        throw new Error('No worker creation logs found');
      }
      
      const log = logs.data[0];
      
      // Verify required fields
      const requiredFields = ['id', 'tenant_id', 'user_id', 'action', 'timestamp'];
      for (const field of requiredFields) {
        if (!log[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
      
      // Verify action type
      if (log.action !== 'worker_created') {
        throw new Error(`Expected action 'worker_created', got '${log.action}'`);
      }
      
      // Verify details contain worker information
      if (!log.details || !log.details.worker_name) {
        throw new Error('Log details should contain worker information');
      }
      
      return {
        logId: log.id,
        action: log.action,
        workerName: log.details.worker_name,
        hasDetails: !!log.details,
        hasIpAddress: !!log.ip_address,
        hasUserAgent: !!log.user_agent
      };
    });
  }

  async runAllTests() {
    this.log('🚀 Starting Audit Logging System Tests', 'info');
    this.log('=' * 60);
    
    try {
      // Authentication tests
      await this.signup();
      await this.signin();
      
      // Basic audit log functionality
      await this.getAuditLogs();
      await this.getAuditSummary();
      
      // Generate audit logs through actions
      await this.addWorker();
      await this.generateNarrative();
      
      // Test audit log features
      await this.testAuditLogFiltering();
      await this.testAuditLogPermissions();
      await this.verifyAuditLogGeneration();
      await this.testAuditLogContent();
      
      // Maintenance tests
      await this.cleanOldLogs();
      
      this.log('=' * 60);
      this.log('🎉 All audit logging tests completed successfully!', 'success');
      
    } catch (error) {
      this.log('=' * 60);
      this.log('💥 Test suite failed!', 'error');
      this.log(`Error: ${error.message}`, 'error');
    }
    
    // Print test summary
    this.printTestSummary();
  }

  printTestSummary() {
    this.log('\n📊 Test Summary:', 'info');
    this.log('=' * 40);
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const total = this.testResults.length;
    
    this.log(`Total Tests: ${total}`, 'info');
    this.log(`Passed: ${passed} ✅`, 'success');
    this.log(`Failed: ${failed} ❌`, failed > 0 ? 'error' : 'info');
    
    if (failed > 0) {
      this.log('\n❌ Failed Tests:', 'error');
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(r => {
          this.log(`  - ${r.name}: ${r.error}`, 'error');
        });
    }
    
    this.log('\n📋 All Test Results:', 'info');
    this.testResults.forEach(r => {
      const status = r.status === 'PASS' ? '✅' : '❌';
      this.log(`  ${status} ${r.name}`);
    });
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new AuditLogsTester();
  tester.runAllTests().catch(error => {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  });
}

export default AuditLogsTester; 