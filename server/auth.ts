import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { 
  User, 
  RegisterUser, 
  LoginUser, 
  InsertUser, 
  InsertSession, 
  Session 
} from '@shared/schema';
import { storage } from './storage';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface AuthResult {
  user: User;
  token: string;
  session: Session;
}

export class AuthService {
  // Hash password
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Verify password
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate JWT token
  private generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  }

  // Generate session token
  private generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Register new user
  async register(userData: RegisterUser): Promise<AuthResult> {
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const passwordHash = await this.hashPassword(userData.password);

    // Create user
    const newUser: InsertUser = {
      email: userData.email,
      fullName: userData.fullName,
      passwordHash,
    };

    const user = await storage.createUser(newUser);

    // Create session
    const sessionToken = this.generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_DURATION);
    
    const sessionData: InsertSession = {
      userId: user.id,
      token: sessionToken,
      expiresAt,
    };

    const session = await storage.createSession(sessionData);

    // Generate JWT
    const token = this.generateToken(user.id);

    return { user, token, session };
  }

  // Login user
  async login(credentials: LoginUser): Promise<AuthResult> {
    // Find user by email
    const user = await storage.getUserByEmail(credentials.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.passwordHash) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(credentials.password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Create new session
    const sessionToken = this.generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_DURATION);
    
    const sessionData: InsertSession = {
      userId: user.id,
      token: sessionToken,
      expiresAt,
    };

    const session = await storage.createSession(sessionData);

    // Generate JWT
    const token = this.generateToken(user.id);

    return { user, token, session };
  }

  // Verify JWT token
  async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await storage.getUser(decoded.userId);
      return user || null;
    } catch (error) {
      return null;
    }
  }

  // Verify session token
  async verifySession(sessionToken: string): Promise<User | null> {
    const session = await storage.getSessionByToken(sessionToken);
    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      await storage.deleteSession(session.id);
      return null;
    }

    const user = await storage.getUser(session.userId);
    return user || null;
  }

  // Logout (delete session)
  async logout(sessionToken: string): Promise<void> {
    const session = await storage.getSessionByToken(sessionToken);
    if (session) {
      await storage.deleteSession(session.id);
    }
  }

  // Get subscription plans with pricing
  getSubscriptionPlans() {
    return {
      free: {
        name: 'Free',
        price: 0,
        quotesLimit: 5,
        features: ['5 quotes/month', 'Basic calculator', 'Email support']
      },
      starter: {
        name: 'Starter',
        price: 5, // €5/month
        quotesLimit: 20,
        features: ['20 quotes/month', 'Custom branding', 'Email integration', 'Priority support']
      },
      pro: {
        name: 'Pro',
        price: 35, // €35/month
        quotesLimit: 100,
        features: ['100 quotes/month', 'Advanced analytics', 'CRM integration', 'Custom domains', 'API access']
      },
      enterprise: {
        name: 'Enterprise',
        price: 95, // €95/month
        quotesLimit: 999999, // Unlimited
        features: ['Unlimited quotes', 'White-label solution', 'Dedicated support', 'Custom features', 'SLA guarantee']
      }
    };
  }

  // Update user subscription
  async updateSubscription(userId: string, plan: string, stripeCustomerId?: string): Promise<User> {
    const plans = this.getSubscriptionPlans();
    const selectedPlan = plans[plan as keyof typeof plans];
    
    if (!selectedPlan) {
      throw new Error('Invalid subscription plan');
    }

    return storage.updateUserSubscription(userId, {
      subscriptionStatus: plan,
      quotesLimit: selectedPlan.quotesLimit,
      stripeCustomerId,
      subscriptionStartDate: new Date(),
    });
  }

  // Check if user can create quote (within limit)
  async canCreateQuote(userId: string): Promise<boolean> {
    const user = await storage.getUser(userId);
    if (!user) return false;

    // Check if it's a new month and reset quotes
    const now = new Date();
    const lastReset = user.lastQuoteReset || new Date(0);
    const isNewMonth = now.getMonth() !== lastReset.getMonth() || 
                      now.getFullYear() !== lastReset.getFullYear();

    if (isNewMonth) {
      await storage.resetUserQuotes(userId);
      return true;
    }

    return (user.quotesUsedThisMonth || 0) < (user.quotesLimit || 5);
  }

  // Increment user quote usage
  async incrementQuoteUsage(userId: string): Promise<void> {
    await storage.incrementUserQuotes(userId);
  }
}

export const authService = new AuthService();