import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface TwoFactorVerification {
  isValid: boolean;
  usedBackupCode?: boolean;
}

export class TwoFactorAuth {
  static generateSecret(userEmail: string): { secret: string; otpauthUrl: string } {
    const secret = speakeasy.generateSecret({
      name: userEmail,
      issuer: 'QuoteKits',
      length: 32,
    });

    return {
      secret: secret.base32!,
      otpauthUrl: secret.otpauth_url!,
    };
  }

  static async generateQRCode(otpauthUrl: string): Promise<string> {
    try {
      return await QRCode.toDataURL(otpauthUrl);
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  static generateBackupCodes(count: 8): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character backup codes
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    return codes;
  }

  static verifyToken(secret: string, token: string, window = 1): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: token.replace(/\s/g, ''), // Remove any spaces
      window, // Allow 1 step before/after for clock drift
    });
  }

  static verifyBackupCode(storedCodes: string[], providedCode: string): { isValid: boolean; remainingCodes: string[] } {
    const cleanCode = providedCode.replace(/\s/g, '').toUpperCase();
    const codeIndex = storedCodes.findIndex(code => code.replace('-', '') === cleanCode.replace('-', ''));
    
    if (codeIndex === -1) {
      return { isValid: false, remainingCodes: storedCodes };
    }

    // Remove the used backup code
    const remainingCodes = storedCodes.filter((_, index) => index !== codeIndex);
    return { isValid: true, remainingCodes };
  }

  static async setupTwoFactor(userEmail: string): Promise<TwoFactorSetup> {
    const { secret, otpauthUrl } = this.generateSecret(userEmail);
    const qrCodeUrl = await this.generateQRCode(otpauthUrl);
    const backupCodes = this.generateBackupCodes(8);

    return {
      secret,
      qrCodeUrl,
      backupCodes,
    };
  }

  static verifyTwoFactorCode(secret: string, token: string, backupCodes: string[]): TwoFactorVerification {
    // First try TOTP verification
    if (this.verifyToken(secret, token)) {
      return { isValid: true, usedBackupCode: false };
    }

    // If TOTP fails, try backup codes
    const backupResult = this.verifyBackupCode(backupCodes, token);
    if (backupResult.isValid) {
      return { isValid: true, usedBackupCode: true };
    }

    return { isValid: false };
  }
}