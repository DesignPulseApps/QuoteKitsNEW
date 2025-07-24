import { pgTable, text, integer, boolean, timestamp, uuid, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  passwordHash: text("password_hash"),
  subscriptionStatus: text("subscription_status").default("free"), // free, starter, pro, enterprise
  stripeCustomerId: text("stripe_customer_id"),
  quotesUsedThisMonth: integer("quotes_used_this_month").default(0),
  quotesLimit: integer("quotes_limit").default(5), // based on plan
  subscriptionStartDate: timestamp("subscription_start_date"),
  lastQuoteReset: timestamp("last_quote_reset").defaultNow(),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  backupCodes: jsonb("backup_codes"), // array of one-time backup codes
  createdAt: timestamp("created_at").defaultNow(),
});

export const calculators = pgTable("calculators", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  category: text("category").notNull(),
  description: text("description"),
  defaultConfig: jsonb("default_config"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userCalculators = pgTable("user_calculators", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  calculatorId: integer("calculator_id").references(() => calculators.id, { onDelete: "cascade" }).notNull(),
  embedId: text("embed_id").unique().notNull(),
  config: jsonb("config"),
  customBranding: jsonb("custom_branding"), // logo, colors, fonts
  embedUrl: text("embed_url").notNull(),
  adminUrl: text("admin_url").notNull(),
  isActive: boolean("is_active").default(true),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  userCalculatorId: uuid("user_calculator_id").references(() => userCalculators.id, { onDelete: "cascade" }).notNull(),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  quoteData: jsonb("quote_data"),
  estimatedValue: text("estimated_value"),
  status: text("status").default("new"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  status: text("status").notNull(), // active, canceled, past_due, etc.
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const calculatorVisits = pgTable("calculator_visits", {
  id: uuid("id").primaryKey().defaultRandom(),
  userCalculatorId: uuid("user_calculator_id").references(() => userCalculators.id, { onDelete: "cascade" }).notNull(),
  visitorId: text("visitor_id"), // anonymous tracking ID
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  conversionCompleted: boolean("conversion_completed").default(false),
  sessionDuration: integer("session_duration"), // in seconds
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin-specific tables
export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").default("admin"), // admin, super_admin
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const supportTickets = pgTable("support_tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  priority: text("priority").default("normal"), // normal, high, urgent
  status: text("status").default("open"), // open, in_progress, resolved, closed
  assignedTo: uuid("assigned_to").references(() => adminUsers.id),
  adminReply: text("admin_reply"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const promoCodes = pgTable("promo_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").unique().notNull(),
  discountValue: integer("discount_value").notNull(), // in cents
  discountType: text("discount_type").default("percentage"), // percentage, fixed
  maxUses: integer("max_uses"),
  currentUses: integer("current_uses").default(0),
  expiryDate: timestamp("expiry_date"),
  isActive: boolean("is_active").default(true),
  createdBy: uuid("created_by").references(() => adminUsers.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminLogs = pgTable("admin_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  adminId: uuid("admin_id").references(() => adminUsers.id).notNull(),
  action: text("action").notNull(),
  resourceType: text("resource_type"), // user, calculator, promo_code, etc.
  resourceId: text("resource_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const affiliates = pgTable("affiliates", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  referralCode: text("referral_code").unique().notNull(),
  commissionRate: integer("commission_rate").default(30), // percentage
  totalEarnings: integer("total_earnings").default(0), // in cents
  pendingPayout: integer("pending_payout").default(0), // in cents
  totalReferrals: integer("total_referrals").default(0),
  paypalEmail: text("paypal_email"),
  bankDetails: jsonb("bank_details"),
  lastPayout: timestamp("last_payout"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").default("eur"),
  status: text("status").notNull(), // succeeded, pending, failed, refunded
  subscriptionId: uuid("subscription_id").references(() => subscriptions.id),
  affiliateId: uuid("affiliate_id").references(() => affiliates.id),
  affiliateCommission: integer("affiliate_commission").default(0), // in cents
  refundedAmount: integer("refunded_amount").default(0), // in cents
  refundReason: text("refund_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  refundedAt: timestamp("refunded_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  fullName: true,
  passwordHash: true,
});

export const registerUserSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  password: z.string().min(8),
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const insertCalculatorSchema = createInsertSchema(calculators).pick({
  name: true,
  slug: true,
  category: true,
  description: true,
  defaultConfig: true,
});

export const insertUserCalculatorSchema = createInsertSchema(userCalculators).pick({
  userId: true,
  calculatorId: true,
  embedId: true,
  config: true,
  customBranding: true,
  embedUrl: true,
  adminUrl: true,
});

export const insertLeadSchema = createInsertSchema(leads).pick({
  userCalculatorId: true,
  name: true,
  email: true,
  phone: true,
  quoteData: true,
  estimatedValue: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  userId: true,
  stripeSubscriptionId: true,
  status: true,
  currentPeriodStart: true,
  currentPeriodEnd: true,
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  userId: true,
  token: true,
  expiresAt: true,
});

export const insertCalculatorVisitSchema = createInsertSchema(calculatorVisits).pick({
  userCalculatorId: true,
  visitorId: true,
  ipAddress: true,
  userAgent: true,
  referrer: true,
  conversionCompleted: true,
  sessionDuration: true,
});

// Admin schema inserts
export const insertAdminUserSchema = createInsertSchema(adminUsers).pick({
  email: true,
  passwordHash: true,
  role: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).pick({
  userId: true,
  email: true,
  subject: true,
  message: true,
  priority: true,
});

export const insertPromoCodeSchema = createInsertSchema(promoCodes).pick({
  code: true,
  discountValue: true,
  discountType: true,
  maxUses: true,
  expiryDate: true,
  createdBy: true,
});

export const insertAdminLogSchema = createInsertSchema(adminLogs).pick({
  adminId: true,
  action: true,
  resourceType: true,
  resourceId: true,
  details: true,
  ipAddress: true,
  userAgent: true,
});

export const insertAffiliateSchema = createInsertSchema(affiliates).pick({
  userId: true,
  referralCode: true,
  commissionRate: true,
  paypalEmail: true,
  bankDetails: true,
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  userId: true,
  stripePaymentIntentId: true,
  amount: true,
  currency: true,
  status: true,
  subscriptionId: true,
  affiliateId: true,
  affiliateCommission: true,
});

// Select schemas
export const selectUserSchema = createSelectSchema(users);
export const selectCalculatorSchema = createSelectSchema(calculators);
export const selectUserCalculatorSchema = createSelectSchema(userCalculators);
export const selectLeadSchema = createSelectSchema(leads);
export const selectSubscriptionSchema = createSelectSchema(subscriptions);
export const selectSessionSchema = createSelectSchema(sessions);
export const selectCalculatorVisitSchema = createSelectSchema(calculatorVisits);
export const selectAdminUserSchema = createSelectSchema(adminUsers);
export const selectSupportTicketSchema = createSelectSchema(supportTickets);
export const selectPromoCodeSchema = createSelectSchema(promoCodes);
export const selectAdminLogSchema = createSelectSchema(adminLogs);
export const selectAffiliateSchema = createSelectSchema(affiliates);
export const selectPaymentSchema = createSelectSchema(payments);

// Type exports
export type User = typeof users.$inferSelect;
export type Calculator = typeof calculators.$inferSelect;
export type UserCalculator = typeof userCalculators.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type CalculatorVisit = typeof calculatorVisits.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type PromoCode = typeof promoCodes.$inferSelect;
export type AdminLog = typeof adminLogs.$inferSelect;
export type Affiliate = typeof affiliates.$inferSelect;
export type Payment = typeof payments.$inferSelect;

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type InsertCalculator = z.infer<typeof insertCalculatorSchema>;
export type InsertUserCalculator = z.infer<typeof insertUserCalculatorSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;
export type InsertAdminLog = z.infer<typeof insertAdminLogSchema>;
export type InsertAffiliate = z.infer<typeof insertAffiliateSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
