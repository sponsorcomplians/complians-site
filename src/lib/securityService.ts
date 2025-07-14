import crypto from 'crypto';

interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  saltLength: number;
  iterations: number;
}

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  metadata: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  result: 'success' | 'failure';
}

interface AccessControl {
  userId: string;
  roles: string[];
  permissions: string[];
}

class SecurityService {
  private encryptionConfig: EncryptionConfig = {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    saltLength: 64,
    iterations: 100000
  };

  private auditLogs: AuditLog[] = [];

  // Encryption methods
  async encryptDocument(
    document: Buffer | string,
    password: string
  ): Promise<{
    encrypted: Buffer;
    salt: Buffer;
    iv: Buffer;
    authTag: Buffer;
  }> {
    const salt = crypto.randomBytes(this.encryptionConfig.saltLength);
    const key = crypto.pbkdf2Sync(
      password,
      salt,
      this.encryptionConfig.iterations,
      this.encryptionConfig.keyLength,
      'sha256'
    );
    
    const iv = crypto.randomBytes(this.encryptionConfig.ivLength);
    const cipher = crypto.createCipheriv(
      this.encryptionConfig.algorithm,
      key,
      iv
    );
    
    const documentBuffer = Buffer.isBuffer(document) 
      ? document 
      : Buffer.from(document, 'utf8');
    
    const encrypted = Buffer.concat([
      cipher.update(documentBuffer),
      cipher.final()
    ]);
    
    const authTag = (cipher as any).getAuthTag();
    
    return { encrypted, salt, iv, authTag };
  }

  async decryptDocument(
    encryptedData: {
      encrypted: Buffer;
      salt: Buffer;
      iv: Buffer;
      authTag: Buffer;
    },
    password: string
  ): Promise<Buffer> {
    const key = crypto.pbkdf2Sync(
      password,
      encryptedData.salt,
      this.encryptionConfig.iterations,
      this.encryptionConfig.keyLength,
      'sha256'
    );
    
    const decipher = crypto.createDecipheriv(
      this.encryptionConfig.algorithm,
      key,
      encryptedData.iv
    );
    
    (decipher as any).setAuthTag(encryptedData.authTag);
    
    const decrypted = Buffer.concat([
      decipher.update(encryptedData.encrypted),
      decipher.final()
    ]);
    
    return decrypted;
  }

  // Field-level encryption for sensitive data
  encryptField(value: string, key: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decryptField(encrypted: string, key: string): string {
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // Audit logging
  async logAccess(params: {
    userId: string;
    action: string;
    resource: string;
    resourceId: string;
    metadata?: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    success: boolean;
  }): Promise<void> {
    const auditLog: AuditLog = {
      id: crypto.randomUUID(),
      userId: params.userId,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      metadata: params.metadata || {},
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      timestamp: new Date(),
      result: params.success ? 'success' : 'failure'
    };
    
    this.auditLogs.push(auditLog);
    
    // In production, save to database
    await this.saveAuditLog(auditLog);
    
    // Alert on suspicious activity
    if (!params.success) {
      await this.checkSuspiciousActivity(params.userId, params.action);
    }
  }

  private async saveAuditLog(log: AuditLog): Promise<void> {
    // Implementation to save to database
    console.log('Saving audit log:', log);
  }

  private async checkSuspiciousActivity(
    userId: string,
    action: string
  ): Promise<void> {
    // Count recent failures
    const recentFailures = this.auditLogs.filter(log => 
      log.userId === userId &&
      log.result === 'failure' &&
      log.timestamp > new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
    );
    
    if (recentFailures.length >= 5) {
      console.warn(`Suspicious activity detected for user ${userId}`);
      // Implement alerting/blocking logic
    }
  }

  // Role-based access control
  checkPermission(
    user: AccessControl,
    resource: string,
    action: string
  ): boolean {
    const requiredPermission = `${resource}:${action}`;
    
    // Check direct permissions
    if (user.permissions.includes(requiredPermission)) {
      return true;
    }
    
    // Check role-based permissions
    const rolePermissions = this.getRolePermissions(user.roles);
    return rolePermissions.includes(requiredPermission);
  }

  private getRolePermissions(roles: string[]): string[] {
    const permissionMap: Record<string, string[]> = {
      admin: ['*:*'], // All permissions
      compliance_officer: [
        'worker:read',
        'worker:write',
        'assessment:read',
        'assessment:write',
        'report:generate'
      ],
      hr_manager: [
        'worker:read',
        'assessment:read',
        'report:read'
      ],
      viewer: [
        'worker:read',
        'assessment:read'
      ]
    };
    
    const permissions = new Set<string>();
    
    roles.forEach(role => {
      const rolePerms = permissionMap[role] || [];
      rolePerms.forEach(perm => permissions.add(perm));
    });
    
    return Array.from(permissions);
  }

  // IP whitelisting
  isIpWhitelisted(ipAddress: string, whitelist: string[]): boolean {
    return whitelist.includes(ipAddress) || 
           whitelist.some(pattern => this.matchIpPattern(ipAddress, pattern));
  }

  private matchIpPattern(ip: string, pattern: string): boolean {
    // Simple IP pattern matching (e.g., "192.168.1.*")
    const regex = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*');
    return new RegExp(`^${regex}$`).test(ip);
  }

  // Session management
  generateSessionToken(userId: string): string {
    const payload = {
      userId,
      timestamp: Date.now(),
      random: crypto.randomBytes(16).toString('hex')
    };
    
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  validateSessionToken(token: string): { valid: boolean; userId?: string } {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());
      
      // Check token age (24 hours)
      const age = Date.now() - payload.timestamp;
      if (age > 24 * 60 * 60 * 1000) {
        return { valid: false };
      }
      
      return { valid: true, userId: payload.userId };
    } catch {
      return { valid: false };
    }
  }

  // Data retention
  async enforceDataRetention(retentionDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    // Remove old audit logs
    const oldLogs = this.auditLogs.filter(log => log.timestamp < cutoffDate);
    this.auditLogs = this.auditLogs.filter(log => log.timestamp >= cutoffDate);
    
    // In production, also clean database
    console.log(`Removed ${oldLogs.length} old audit logs`);
    
    return oldLogs.length;
  }

  // Get audit report
  getAuditReport(filters: {
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }): AuditLog[] {
    return this.auditLogs.filter(log => {
      if (filters.userId && log.userId !== filters.userId) return false;
      if (filters.action && log.action !== filters.action) return false;
      if (filters.startDate && log.timestamp < filters.startDate) return false;
      if (filters.endDate && log.timestamp > filters.endDate) return false;
      return true;
    });
  }
}

export const securityService = new SecurityService(); 