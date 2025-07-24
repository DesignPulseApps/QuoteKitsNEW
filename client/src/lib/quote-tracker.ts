// Quote tracking utility for subscription management
interface QuoteUsage {
  month: string;
  count: number;
  lastUpdated: string;
}

interface SubscriptionLimits {
  free: number;
  pro: number;
  business: number;
  enterprise: number;
}

const SUBSCRIPTION_LIMITS: SubscriptionLimits = {
  free: 5,
  pro: 25,
  business: 50,
  enterprise: 999
};

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getQuoteUsageKey(): string {
  const userSession = localStorage.getItem('user_session') || 'default';
  return `quote_usage_${userSession}`;
}

export function getSubscriptionKey(): string {
  const userSession = localStorage.getItem('user_session') || 'default';
  return `subscription_${userSession}`;
}

export function getCurrentQuoteUsage(): QuoteUsage {
  const key = getQuoteUsageKey();
  const stored = localStorage.getItem(key);
  const currentMonth = getCurrentMonth();
  
  if (stored) {
    const usage: QuoteUsage = JSON.parse(stored);
    // Reset count if it's a new month
    if (usage.month !== currentMonth) {
      return {
        month: currentMonth,
        count: 0,
        lastUpdated: new Date().toISOString()
      };
    }
    return usage;
  }
  
  return {
    month: currentMonth,
    count: 0,
    lastUpdated: new Date().toISOString()
  };
}

export function incrementQuoteUsage(): QuoteUsage {
  const currentUsage = getCurrentQuoteUsage();
  const newUsage: QuoteUsage = {
    ...currentUsage,
    count: currentUsage.count + 1,
    lastUpdated: new Date().toISOString()
  };
  
  const key = getQuoteUsageKey();
  localStorage.setItem(key, JSON.stringify(newUsage));
  
  // Dispatch custom event to notify dashboard of usage update
  window.dispatchEvent(new CustomEvent('quoteUsageUpdated', { 
    detail: newUsage 
  }));
  
  return newUsage;
}

export function getUserSubscription(): keyof SubscriptionLimits {
  const key = getSubscriptionKey();
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : 'free';
}

export function getQuoteLimit(): number {
  const subscription = getUserSubscription();
  return SUBSCRIPTION_LIMITS[subscription];
}

export function canGenerateQuote(): { allowed: boolean; current: number; limit: number; remaining: number } {
  const usage = getCurrentQuoteUsage();
  const limit = getQuoteLimit();
  const remaining = Math.max(0, limit - usage.count);
  
  return {
    allowed: usage.count < limit,
    current: usage.count,
    limit: limit,
    remaining: remaining
  };
}

export function getQuoteStats() {
  const usage = getCurrentQuoteUsage();
  const subscription = getUserSubscription();
  const limit = getQuoteLimit();
  const percentage = limit > 0 ? Math.round((usage.count / limit) * 100) : 0;
  
  return {
    used: usage.count,
    limit: limit,
    remaining: Math.max(0, limit - usage.count),
    percentage: percentage,
    subscription: subscription,
    month: usage.month,
    lastUpdated: usage.lastUpdated
  };
}

// Reset usage for testing purposes
export function resetQuoteUsage(): void {
  const key = getQuoteUsageKey();
  localStorage.removeItem(key);
  window.dispatchEvent(new CustomEvent('quoteUsageUpdated', { 
    detail: getCurrentQuoteUsage() 
  }));
}