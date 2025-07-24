import { db } from "./db";
import { 
  users, 
  calculators, 
  userCalculators, 
  leads, 
  sessions, 
  subscriptions,
  type User,
  type Calculator,
  type UserCalculator,
  type Lead,
  type Session,
  type Subscription,
  type InsertUser,
  type InsertCalculator,
  type InsertUserCalculator,
  type InsertLead,
  type InsertSession,
  type InsertSubscription
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { IStorage } from "./storage";
import crypto from 'crypto';

export class PostgresStorage implements IStorage {
  
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUserSubscription(userId: string, data: Partial<User>): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async resetUserQuotes(userId: string): Promise<void> {
    await db.update(users)
      .set({ 
        quotesUsedThisMonth: 0, 
        lastQuoteReset: new Date() 
      })
      .where(eq(users.id, userId));
  }

  async incrementUserQuotes(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      await db.update(users)
        .set({ quotesUsedThisMonth: (user.quotesUsedThisMonth || 0) + 1 })
        .where(eq(users.id, userId));
    }
  }

  // Sessions
  async createSession(session: InsertSession): Promise<Session> {
    const [newSession] = await db.insert(sessions).values(session).returning();
    return newSession;
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.token, token));
    return session;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  // Subscriptions
  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSubscription] = await db.insert(subscriptions).values(subscription).returning();
    return newSubscription;
  }

  async getSubscriptionByUserId(userId: string): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
    return subscription;
  }

  async updateSubscription(subscriptionId: string, data: Partial<Subscription>): Promise<Subscription> {
    const [updatedSubscription] = await db.update(subscriptions)
      .set(data)
      .where(eq(subscriptions.id, subscriptionId))
      .returning();
    return updatedSubscription;
  }

  // Calculators
  async getCalculators(): Promise<Calculator[]> {
    return await db.select().from(calculators);
  }

  async getCalculatorBySlug(slug: string): Promise<Calculator | undefined> {
    const [calculator] = await db.select().from(calculators).where(eq(calculators.slug, slug));
    return calculator;
  }

  async getCalculatorsByCategory(category: string): Promise<Calculator[]> {
    return await db.select().from(calculators).where(eq(calculators.category, category));
  }

  async createCalculator(calculator: InsertCalculator): Promise<Calculator> {
    const [newCalculator] = await db.insert(calculators).values(calculator).returning();
    return newCalculator;
  }

  // User Calculators
  async getUserCalculators(userId: string): Promise<UserCalculator[]> {
    return await db.select().from(userCalculators).where(eq(userCalculators.userId, userId));
  }

  async getUserCalculatorByEmbedId(embedId: string): Promise<UserCalculator | undefined> {
    const [userCalculator] = await db.select().from(userCalculators).where(eq(userCalculators.embedId, embedId));
    return userCalculator;
  }

  async createUserCalculator(userCalculator: InsertUserCalculator): Promise<UserCalculator> {
    const [newUserCalculator] = await db.insert(userCalculators).values(userCalculator).returning();
    return newUserCalculator;
  }

  async updateUserCalculator(id: string, data: Partial<UserCalculator>): Promise<UserCalculator> {
    const [updatedUserCalculator] = await db.update(userCalculators)
      .set({ ...data, lastUpdated: new Date() })
      .where(eq(userCalculators.id, id))
      .returning();
    return updatedUserCalculator;
  }

  // Leads
  async getLeadsByUserCalculator(userCalculatorId: string): Promise<Lead[]> {
    return await db.select().from(leads).where(eq(leads.userCalculatorId, userCalculatorId));
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db.insert(leads).values(lead).returning();
    return newLead;
  }

  // Two-Factor Authentication
  async enableTwoFactor(userId: string, secret: string, backupCodes: string[]): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        backupCodes: backupCodes
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async disableTwoFactor(userId: string): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: null
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async updateUserBackupCodes(userId: string, backupCodes: string[]): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({ backupCodes })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async getUserById(userId: string): Promise<User | undefined> {
    return this.getUser(userId);
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAllCalculators(): Promise<Calculator[]> {
    return await db.select().from(calculators);
  }

  async getUserCount(): Promise<number> {
    const result = await db.select().from(users);
    return result.length;
  }

  async getCalculatorCount(): Promise<number> {
    const result = await db.select().from(calculators);
    return result.length;
  }

  async getActiveSubscriptionCount(): Promise<number> {
    const result = await db.select().from(subscriptions).where(eq(subscriptions.status, 'active'));
    return result.length;
  }
}