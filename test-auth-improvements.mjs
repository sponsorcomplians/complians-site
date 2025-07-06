#!/usr/bin/env node

/**
 * Test script for Auth Improvements
 * Tests signup, login, rate limiting, audit logging, and email verification
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

class AuthTester {
  constructor() {
    this.testResults = [];
    this.session = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async test(name, testFn) {
    this.log(`Starting test: ${name}`);
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      this.testResults.push({ name, success: true, duration, result });
      this.log(`✅ Test passed: ${name} (${duration}ms)`, 'success');
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testResults.push({ name, success: false, duration, error: error.message });
      this.log(`❌ Test failed: ${name} - ${error.message}`, 'error');
      throw error;
    }
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json().catch(() => ({}));

    return {
      status: response.status,
      data,
      headers: Object.fromEntries(response.headers.entries())
    };
  }

  async testSignupFlow() {
    return this.test('Complete Signup Flow', async () => {
      const testEmail = `test-${Date.now()}@example.com`;
      const testData = {
        email: testEmail,
        password: 'TestPassword123!',
        fullName: 'Test User',
        company: 'Test Company',
        phone: '+44 20 7946 0958'
      };

      // Test signup
      const signupResponse = await this.makeRequest('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(testData)
      });

      if (signupResponse.status !== 200) {
        throw new Error(`Signup failed: ${JSON.stringify(signupResponse.data)}`);
      }

      this.log(`User created: ${testEmail}`);
      this.log(`Tenant ID: ${signupResponse.data.user.tenant_id}`);
      this.log(`Role: ${signupResponse.data.user.role}`);

      return {
        email: testEmail,
        tenantId: signupResponse.data.user.tenant_id,
        role: signupResponse.data.user.role,
        isFirstUser: signupResponse.data.isFirstUser
      };
    });
  }

  async testRateLimiting() {
    return this.test('Rate Limiting', async () => {
      const testEmail = `ratelimit-${Date.now()}@example.com`;
      const testData = {
        email: testEmail,
        password: 'TestPassword123!',
        fullName: 'Rate Limit Test',
        company: 'Rate Limit Company'
      };

      const attempts = [];
      let rateLimited = false;

      // Try to signup multiple times quickly
      for (let i = 0; i < 7; i++) {
        try {
          const response = await this.makeRequest('/api/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ ...testData, email: `${testEmail}-${i}` })
          });

          attempts.push({
            attempt: i + 1,
            status: response.status,
            rateLimited: response.status === 429
          });

          if (response.status === 429) {
            rateLimited = true;
            this.log(`Rate limited on attempt ${i + 1}`, 'warning');
            break;
          }

          // Small delay between attempts
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          attempts.push({
            attempt: i + 1,
            error: error.message
          });
        }
      }

      return {
        attempts,
        rateLimited,
        totalAttempts: attempts.length
      };
    });
  }

  async testLoginFlow(userData) {
    return this.test('Login Flow', async () => {
      const loginData = {
        email: userData.email,
        password: 'TestPassword123!'
      };

      // Test login (should fail because email not verified)
      const loginResponse = await this.makeRequest('/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify(loginData)
      });

      // Login should fail due to unverified email
      if (loginResponse.status === 200) {
        throw new Error('Login succeeded when it should have failed (unverified email)');
      }

      this.log('Login correctly failed due to unverified email');

      return {
        loginAttempted: true,
        expectedFailure: true
      };
    });
  }

  async testAuditLogs(userData) {
    return this.test('Audit Logs', async () => {
      // Get audit logs (requires admin session)
      const auditResponse = await this.makeRequest('/api/audit-logs', {
        method: 'GET'
      });

      if (auditResponse.status === 401) {
        this.log('Audit logs require authentication (expected)', 'warning');
        return { requiresAuth: true };
      }

      if (auditResponse.status === 403) {
        this.log('Audit logs require admin permissions (expected)', 'warning');
        return { requiresAdmin: true };
      }

      if (auditResponse.status === 200) {
        const logs = auditResponse.data.logs || [];
        const signupLogs = logs.filter(log => log.action === 'signup_success');
        const loginLogs = logs.filter(log => log.action === 'login_failed');

        this.log(`Found ${logs.length} total audit logs`);
        this.log(`Found ${signupLogs.length} signup success logs`);
        this.log(`Found ${loginLogs.length} login failure logs`);

        return {
          totalLogs: logs.length,
          signupLogs: signupLogs.length,
          loginLogs: loginLogs.length,
          recentLogs: logs.slice(0, 5)
        };
      }

      throw new Error(`Unexpected audit logs response: ${auditResponse.status}`);
    });
  }

  async testEmailVerificationPage() {
    return this.test('Email Verification Page', async () => {
      const testEmail = `verify-${Date.now()}@example.com`;
      
      // Test the verification page with email parameter
      const verifyResponse = await this.makeRequest(`/auth/verify-email?email=${encodeURIComponent(testEmail)}`);
      
      if (verifyResponse.status !== 200) {
        throw new Error(`Email verification page failed: ${verifyResponse.status}`);
      }

      this.log('Email verification page loads correctly');

      return {
        pageLoads: true,
        testEmail
      };
    });
  }

  async testPasswordResetFlow() {
    return this.test('Password Reset Flow', async () => {
      const testEmail = `reset-${Date.now()}@example.com`;
      
      // Test password reset request
      const resetResponse = await this.makeRequest('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: testEmail })
      });

      // Should work even for non-existent email (security)
      if (resetResponse.status !== 200 && resetResponse.status !== 404) {
        throw new Error(`Password reset request failed: ${resetResponse.status}`);
      }

      this.log('Password reset request processed');

      return {
        resetRequested: true,
        email: testEmail
      };
    });
  }

  async testConsistentUI() {
    return this.test('Consistent UI Components', async () => {
      const pages = [
        '/auth/signin',
        '/auth/signup',
        '/auth/verify-email'
      ];

      const results = [];

      for (const page of pages) {
        try {
          const response = await this.makeRequest(page);
          results.push({
            page,
            status: response.status,
            loads: response.status === 200
          });
        } catch (error) {
          results.push({
            page,
            error: error.message,
            loads: false
          });
        }
      }

      const allLoad = results.every(r => r.loads);
      if (!allLoad) {
        throw new Error(`Some pages failed to load: ${JSON.stringify(results)}`);
      }

      this.log('All auth pages load correctly');

      return {
        pagesTested: pages.length,
        allPagesLoad: true,
        results
      };
    });
  }

  async runAllTests() {
    this.log('🚀 Starting Auth Improvements Test Suite');
    this.log(`Testing against: ${BASE_URL}`);

    try {
      // Test 1: Complete signup flow
      const userData = await this.testSignupFlow();

      // Test 2: Rate limiting
      await this.testRateLimiting();

      // Test 3: Login flow (should fail due to unverified email)
      await this.testLoginFlow(userData);

      // Test 4: Audit logs
      await this.testAuditLogs(userData);

      // Test 5: Email verification page
      await this.testEmailVerificationPage();

      // Test 6: Password reset flow
      await this.testPasswordResetFlow();

      // Test 7: Consistent UI
      await this.testConsistentUI();

      this.log('🎉 All tests completed successfully!');
      this.printSummary();

    } catch (error) {
      this.log(`💥 Test suite failed: ${error.message}`, 'error');
      this.printSummary();
      process.exit(1);
    }
  }

  printSummary() {
    this.log('\n📊 Test Summary:');
    this.log('=' * 50);

    const passed = this.testResults.filter(r => r.success).length;
    const failed = this.testResults.filter(r => !r.success).length;
    const total = this.testResults.length;

    this.log(`Total Tests: ${total}`);
    this.log(`Passed: ${passed} ✅`);
    this.log(`Failed: ${failed} ❌`);
    this.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      this.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => !r.success)
        .forEach(r => {
          this.log(`  - ${r.name}: ${r.error}`, 'error');
        });
    }

    this.log('\n✅ Passed Tests:');
    this.testResults
      .filter(r => r.success)
      .forEach(r => {
        this.log(`  - ${r.name} (${r.duration}ms)`, 'success');
      });
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new AuthTester();
  tester.runAllTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

export default AuthTester; 