import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';

// For server-side operations, use direct PostgreSQL connection
const sql = postgres(process.env.DATABASE_URL!);

// Export sql for use in other modules
export { sql };

// Initialize Supabase client for browser operations
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Authentication functions
export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`
    }
  });
  return { user: data.user, error };
}

export async function loginWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { user: data.user, session: data.session, error };
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
}

// Database types for calculator templates
export interface CalculatorTemplate {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  layout_json: any;
  logic_json: any;
  style_json: any;
  prompt_md: string;
  created_at: string;
}

// Database types for user calculators (cloned instances)
export interface UserCalculator {
  id: string;
  user_id: string;
  template_id: string;
  slug: string;
  name: string;
  layout_json: any;
  logic_json: any;
  style_json: any;
  prompt_md: string;
  logo_url?: string;
  is_active: boolean;
  embed_url: string;
  config?: any;
  created_at: string;
  updated_at: string;
}

// Get all calculator templates
export async function getCalculatorTemplates(): Promise<CalculatorTemplate[]> {
  try {
    const data = await sql`
      SELECT * FROM calculator_templates 
      ORDER BY created_at DESC
    `;
    return data as any[];
  } catch (error) {
    console.error('Error fetching calculator templates:', error);
    return [];
  }
}

// Get specific calculator template by slug
export async function getCalculatorTemplate(slug: string): Promise<CalculatorTemplate | null> {
  try {
    const data = await sql`
      SELECT * FROM calculator_templates 
      WHERE slug = ${slug}
      LIMIT 1
    `;
    return data.length ? data[0] as any : null;
  } catch (error) {
    console.error('Error fetching calculator template:', error);
    return null;
  }
}

// Helper function to generate UUID for temporary users
function generateUuidForTempUser(tempUserId: string): string {
  // Create a consistent UUID based on the temp user ID using simple hash
  let hash = 0;
  for (let i = 0; i < tempUserId.length; i++) {
    const char = tempUserId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to positive number and pad with zeros
  const hashStr = Math.abs(hash).toString(16).padStart(8, '0');
  // Use deterministic suffix based on the hash instead of random
  const deterministicSuffix = Math.abs(hash * 31).toString(16).padStart(8, '0');
  
  // Format as UUID v4
  return [
    hashStr.substring(0, 8),
    hashStr.substring(0, 4),
    '4' + hashStr.substring(1, 4),
    '8' + deterministicSuffix.substring(0, 3),
    deterministicSuffix + hashStr.substring(4, 8)
  ].join('-');
}

// Clone a calculator template for a user
export async function cloneCalculator(userId: string, templateId: string): Promise<UserCalculator | null> {
  try {
    // First try to get template by UUID ID (new format)
    let templates = await sql`
      SELECT * FROM calculator_templates 
      WHERE id = ${templateId}
      LIMIT 1
    `;

    // If not found and templateId is numeric, try legacy slug mapping
    if (!templates.length && /^\d+$/.test(templateId)) {
      const templateSlugMap: { [key: string]: string } = {
        '1': 'wedding-photography',
        '2': 'boudoir-photography', 
        '3': 'real-estate-photography',
        '4': 'drone-photography',
        '5': 'event-videography',
        '6': 'electrician-services',
        '7': 'home-renovation',
        '8': 'plumbing-services'
      };

      const templateSlug = templateSlugMap[templateId];
      if (templateSlug) {
        templates = await sql`
          SELECT * FROM calculator_templates 
          WHERE slug = ${templateSlug}
          LIMIT 1
        `;
      }
    }

    if (!templates.length) {
      console.error('Template not found:', templateId);
      return null;
    }

    const template = templates[0];

    // Handle UUID conversion for temporary users
    let actualUserId = userId;
    if (userId.startsWith('temp_')) {
      actualUserId = generateUuidForTempUser(userId);
    }

    // Generate unique slug for user calculator
    const uniqueSlug = `${template.slug}-${userId.slice(0, 8)}-${Date.now()}`;
    // Create embed ID for unique calculator instance
    const embedId = `embed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // Point to the embed route that will serve the customized calculator
    const baseUrl = process.env.CUSTOM_DOMAIN || 'https://quotekits.com';
    const embedUrl = `${baseUrl}/embed/${embedId}`;
    const adminUrl = `${baseUrl}/dashboard`;
    
    // Generate calculator_id based on template mapping (only using valid IDs 1-3)
    const calculatorIdMap: { [key: string]: number } = {
      'wedding-photography': 1,
      'boudoir-photography': 2,
      'real-estate-photography': 3,
      'drone-photography': 1,
      'event-videography': 2,
      'electrician-services': 3,
      'home-renovation': 2,
      'plumbing-services': 3
    };
    const calculatorId = calculatorIdMap[template.slug] || 1;

    // Create user calculator clone
    const userCalculators = await sql`
      INSERT INTO user_calculators (
        user_id, template_id, calculator_id, embed_id, slug, name, 
        layout_json, logic_json, style_json, prompt_md, is_active, 
        embed_url, admin_url
      ) VALUES (
        ${actualUserId}, ${template.id}, ${calculatorId}, ${embedId}, 
        ${uniqueSlug}, ${template.name}, ${template.layout_json}, 
        ${template.logic_json}, ${template.style_json}, ${template.prompt_md}, 
        true, ${embedUrl}, ${adminUrl}
      ) RETURNING *
    `;

    if (!userCalculators.length) {
      console.error('Error cloning calculator');
      return null;
    }

    return userCalculators[0] as any;
  } catch (error) {
    console.error('Error in cloneCalculator:', error);
    return null;
  }
}

// Get user calculator by embed ID (needed for embed system)
export async function getUserCalculatorByEmbedId(embedId: string): Promise<UserCalculator | null> {
  try {
    const data = await sql`
      SELECT * FROM user_calculators 
      WHERE embed_id = ${embedId}
      LIMIT 1
    `;
    
    if (!data.length) return null;
    
    const calc = data[0] as any;
    // Parse JSON fields properly
    return {
      ...calc,
      config: calc.config ? (typeof calc.config === 'string' ? JSON.parse(calc.config) : calc.config) : null
    };
  } catch (error) {
    console.error('Error fetching user calculator by embed ID:', error);
    return null;
  }
}

// Get user's calculators
export async function getUserCalculators(userId: string): Promise<UserCalculator[]> {
  try {
    // Handle UUID conversion for temporary users
    let actualUserId = userId;
    if (userId.startsWith('temp_')) {
      actualUserId = generateUuidForTempUser(userId);
    }

    const data = await sql`
      SELECT * FROM user_calculators 
      WHERE user_id = ${actualUserId}
      ORDER BY created_at DESC
    `;
    
    // Parse JSON fields properly
    return data.map((calc: any) => ({
      ...calc,
      config: calc.config ? (typeof calc.config === 'string' ? JSON.parse(calc.config) : calc.config) : null
    })) as any[];
  } catch (error) {
    console.error('Error fetching user calculators:', error);
    return [];
  }
}

// Get specific user calculator
export async function getUserCalculator(userId: string, slug: string): Promise<UserCalculator | null> {
  try {
    // Handle UUID conversion for temporary users
    let actualUserId = userId;
    if (userId.startsWith('temp_')) {
      actualUserId = generateUuidForTempUser(userId);
    }

    const data = await sql`
      SELECT * FROM user_calculators 
      WHERE user_id = ${actualUserId} AND slug = ${slug}
      LIMIT 1
    `;
    
    if (!data.length) return null;
    
    const calc = data[0] as any;
    // Parse JSON fields properly
    return {
      ...calc,
      config: calc.config ? (typeof calc.config === 'string' ? JSON.parse(calc.config) : calc.config) : null
    };
  } catch (error) {
    console.error('Error fetching user calculator:', error);
    return null;
  }
}

// Update user calculator
export async function updateUserCalculator(id: string, updates: Partial<UserCalculator>): Promise<boolean> {
  try {
    if (Object.keys(updates).length === 0) return true;

    // Simple approach: update only config field for now
    if (updates.config) {
      await sql`
        UPDATE user_calculators 
        SET config = ${JSON.stringify(updates.config)}, updated_at = NOW()
        WHERE id = ${id}
      `;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating user calculator:', error);
    return false;
  }
}

// Delete user calculator
export async function deleteUserCalculator(id: string, userId: string): Promise<boolean> {
  try {
    await sql`
      DELETE FROM user_calculators 
      WHERE id = ${id} AND user_id = ${userId}
    `;
    return true;
  } catch (error) {
    console.error('Error deleting user calculator:', error);
    return false;
  }
}

// Analytics functions
export async function trackCalculatorVisit(data: {
  userCalculatorId: string;
  visitorId: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
}): Promise<string | null> {
  try {
    const visits = await sql`
      INSERT INTO calculator_visits (
        user_calculator_id, visitor_id, ip_address, user_agent, referrer
      ) VALUES (
        ${data.userCalculatorId}, ${data.visitorId}, ${data.ipAddress || null}, 
        ${data.userAgent || null}, ${data.referrer || null}
      ) RETURNING id
    `;
    
    return visits[0]?.id || null;
  } catch (error) {
    console.error('Error tracking calculator visit:', error);
    return null;
  }
}

export async function markConversion(visitId: string): Promise<boolean> {
  try {
    await sql`
      UPDATE calculator_visits 
      SET conversion_completed = true 
      WHERE id = ${visitId}
    `;
    return true;
  } catch (error) {
    console.error('Error marking conversion:', error);
    return false;
  }
}

export async function getUserAnalytics(userId: string): Promise<{
  totalVisits: number;
  totalConversions: number;
  conversionRate: number;
  totalQuotes: number;
  chartData: Array<{
    date: string;
    visits: number;
    conversions: number;
    quotes: number;
  }>;
  calculatorPerformance: Array<{
    name: string;
    visits: number;
    conversions: number;
    conversionRate: number;
  }>;
}> {
  try {
    // Handle UUID conversion for temporary users
    let actualUserId = userId;
    if (userId.startsWith('temp_')) {
      actualUserId = generateUuidForTempUser(userId);
    }

    // Get visits and conversions for user's calculators
    const analytics = await sql`
      SELECT 
        COUNT(cv.id) as total_visits,
        COUNT(CASE WHEN cv.conversion_completed = true THEN 1 END) as total_conversions
      FROM calculator_visits cv
      JOIN user_calculators uc ON cv.user_calculator_id = uc.id
      WHERE uc.user_id = ${actualUserId}
      AND cv.created_at >= NOW() - INTERVAL '30 days'
    `;

    // Get total quotes (leads) for user's calculators
    const quotes = await sql`
      SELECT COUNT(l.id) as total_quotes
      FROM leads l
      JOIN user_calculators uc ON l.user_calculator_id = uc.id
      WHERE uc.user_id = ${actualUserId}
      AND l.created_at >= NOW() - INTERVAL '30 days'
    `;

    // Get daily chart data for the last 7 days
    const chartData = await sql`
      SELECT 
        DATE(cv.created_at) as date,
        COUNT(cv.id) as visits,
        COUNT(CASE WHEN cv.conversion_completed = true THEN 1 END) as conversions,
        COUNT(l.id) as quotes
      FROM calculator_visits cv
      JOIN user_calculators uc ON cv.user_calculator_id = uc.id
      LEFT JOIN leads l ON l.user_calculator_id = uc.id AND DATE(l.created_at) = DATE(cv.created_at)
      WHERE uc.user_id = ${actualUserId}
      AND cv.created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(cv.created_at)
      ORDER BY DATE(cv.created_at)
    `;

    // Get calculator performance data
    const calculatorPerformance = await sql`
      SELECT 
        ct.name,
        COUNT(cv.id) as visits,
        COUNT(CASE WHEN cv.conversion_completed = true THEN 1 END) as conversions,
        CASE 
          WHEN COUNT(cv.id) > 0 THEN ROUND((COUNT(CASE WHEN cv.conversion_completed = true THEN 1 END)::decimal / COUNT(cv.id)) * 100)
          ELSE 0 
        END as conversion_rate
      FROM user_calculators uc
      LEFT JOIN calculator_visits cv ON cv.user_calculator_id = uc.id
      JOIN calculator_templates ct ON ct.id = uc.template_id
      WHERE uc.user_id = ${actualUserId}
      AND (cv.created_at IS NULL OR cv.created_at >= NOW() - INTERVAL '30 days')
      GROUP BY ct.name, uc.id
      ORDER BY visits DESC
    `;

    const totalVisits = parseInt(analytics[0]?.total_visits || '0');
    const totalConversions = parseInt(analytics[0]?.total_conversions || '0');
    const totalQuotes = parseInt(quotes[0]?.total_quotes || '0');
    const conversionRate = totalVisits > 0 ? Math.round((totalConversions / totalVisits) * 100) : 0;

    return {
      totalVisits,
      totalConversions,
      conversionRate,
      totalQuotes,
      chartData: chartData.map((row: any) => ({
        date: row.date,
        visits: parseInt(row.visits || '0'),
        conversions: parseInt(row.conversions || '0'),
        quotes: parseInt(row.quotes || '0')
      })),
      calculatorPerformance: calculatorPerformance.map((row: any) => ({
        name: row.name,
        visits: parseInt(row.visits || '0'),
        conversions: parseInt(row.conversions || '0'),
        conversionRate: parseInt(row.conversion_rate || '0')
      }))
    };
  } catch (error) {
    console.error('Error getting user analytics:', error);
    return {
      totalVisits: 0,
      totalConversions: 0,
      conversionRate: 0,
      totalQuotes: 0,
      chartData: [],
      calculatorPerformance: []
    };
  }
}

export async function getUserQuotes(userId: string): Promise<Array<{
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  calculatorName: string;
  estimatedValue: string;
  status: string;
  quoteData: any;
  createdAt: string;
}>> {
  try {
    // Handle UUID conversion for temporary users
    let actualUserId = userId;
    if (userId.startsWith('temp_')) {
      actualUserId = generateUuidForTempUser(userId);
    }

    const quotes = await sql`
      SELECT 
        l.id,
        l.name as client_name,
        l.email as client_email,
        l.phone as client_phone,
        ct.name as calculator_name,
        l.estimated_value,
        l.status,
        l.quote_data,
        l.created_at
      FROM leads l
      JOIN user_calculators uc ON l.user_calculator_id = uc.id
      JOIN calculator_templates ct ON ct.id = uc.template_id
      WHERE uc.user_id = ${actualUserId}
      ORDER BY l.created_at DESC
      LIMIT 100
    `;

    return quotes.map((quote: any) => ({
      id: quote.id,
      clientName: quote.client_name || 'Anonymous',
      clientEmail: quote.client_email || '',
      clientPhone: quote.client_phone || '',
      calculatorName: quote.calculator_name,
      estimatedValue: quote.estimated_value || '$0',
      status: quote.status || 'new',
      quoteData: quote.quote_data,
      createdAt: quote.created_at
    }));
  } catch (error) {
    console.error('Error getting user quotes:', error);
    return [];
  }
}