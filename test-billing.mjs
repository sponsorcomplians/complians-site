#!/usr/bin/env node

/**
 * Test script for Stripe billing integration
 * Run with: node test-billing.mjs
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

class BillingTester {
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

  async getBillingPlans() {
    return this.test('Get Billing Plans', async () => {
      return await this.makeRequest('/api/billing/plans');
    });
  }

  async getBillingSummary() {
    return this.test('Get Billing Summary', async () => {
      return await this.makeRequest('/api/billing/summary');
    });
  }

  async getTenantMetrics() {
    return this.test('Get Tenant Metrics', async () => {
      return await this.makeRequest('/api/tenant-metrics');
    });
  }

  async addWorker() {
    return this.test('Add Worker (Usage Test)', async () => {
      return await this.makeRequest('/api/workers', {
        method: 'POST',
        body: JSON.stringify(TEST_WORKER)
      });
    });
  }

  async generateNarrative() {
    return this.test('Generate Narrative (Usage Test)', async () => {
      return await this.makeRequest('/api/generate-narrative', {
        method: 'POST',
        body: JSON.stringify(TEST_NARRATIVE)
      });
    });
  }

  async testUsageLimits() {
    return this.test('Test Usage Limits', async () => {
      // Try to add many workers to test limits
      const workers = [];
      let workerCount = 0;
      
      try {
        for (let i = 0; i < 10; i++) {
          const worker = {
            ...TEST_WORKER,
            name: `Test Worker ${i + 1}`,
            cosReference: `COS${100000 + i}`
          };
          
          const response = await this.makeRequest('/api/workers', {
            method: 'POST',
            body: JSON.stringify(worker)
          });
          
          workers.push(response.data);
          workerCount++;
          this.log(`Added worker ${i + 1}`);
        }
      } catch (error) {
        if (error.message.includes('Worker limit exceeded')) {
          this.log(`Worker limit reached after ${workerCount} workers`, 'warning');
          return { workerCount, limitReached: true };
        }
        throw error;
      }
      
      return { workerCount, limitReached: false };
    });
  }

  async testNarrativeLimits() {
    return this.test('Test Narrative Limits', async () => {
      const narratives = [];
      let narrativeCount = 0;
      
      try {
        for (let i = 0; i < 30; i++) {
          const narrative = {
            ...TEST_NARRATIVE,
            workerName: `Test Worker ${i + 1}`
          };
          
          const response = await this.makeRequest('/api/generate-narrative', {
            method: 'POST',
            body: JSON.stringify(narrative)
          });
          
          narratives.push(response.narrative);
          narrativeCount++;
          this.log(`Generated narrative ${i + 1}`);
        }
      } catch (error) {
        if (error.message.includes('Narrative limit exceeded')) {
          this.log(`Narrative limit reached after ${narrativeCount} narratives`, 'warning');
          return { narrativeCount, limitReached: true };
        }
        throw error;
      }
      
      return { narrativeCount, limitReached: false };
    });
  }

  async createCheckoutSession() {
    return this.test('Create Checkout Session', async () => {
      return await this.makeRequest('/api/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({
          planName: 'starter',
          billingCycle: 'monthly',
          successUrl: 'http://localhost:3000/billing?success=true',
          cancelUrl: 'http://localhost:3000/billing?canceled=true'
        })
      });
    });
  }

  async runAllTests() {
    this.log('🚀 Starting Stripe Billing Integration Tests', 'info');
    this.log('=' * 60);
    
    try {
      // Authentication tests
      await this.signup();
      await this.signin();
      
      // Billing API tests
      await this.getBillingPlans();
      await this.getBillingSummary();
      await this.getTenantMetrics();
      
      // Usage tracking tests
      await this.addWorker();
      await this.generateNarrative();
      
      // Limit testing
      await this.testUsageLimits();
      await this.testNarrativeLimits();
      
      // Billing flow tests
      await this.createCheckoutSession();
      
      this.log('=' * 60);
      this.log('🎉 All tests completed successfully!', 'success');
      
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
  const tester = new BillingTester();
  tester.runAllTests().catch(error => {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  });
}

export default BillingTester; 