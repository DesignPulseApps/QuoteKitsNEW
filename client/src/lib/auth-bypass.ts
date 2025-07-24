// Temporary authentication bypass for unconfirmed Supabase users
// This allows users to proceed with registration even if email confirmation is required

interface TempUser {
  id: string;
  email: string;
  password: string;
  created_at: string;
  confirmed: boolean;
}

const TEMP_USERS_KEY = 'quotekit_temp_users';

export function storeTempUser(email: string, password: string): TempUser {
  const tempUser: TempUser = {
    id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email,
    password, // In production, this should be hashed
    created_at: new Date().toISOString(),
    confirmed: false
  };

  const existingUsers = getTempUsers();
  const userIndex = existingUsers.findIndex(u => u.email === email);
  
  if (userIndex >= 0) {
    existingUsers[userIndex] = tempUser;
  } else {
    existingUsers.push(tempUser);
  }

  localStorage.setItem(TEMP_USERS_KEY, JSON.stringify(existingUsers));
  return tempUser;
}

export function getTempUser(email: string, password: string): TempUser | null {
  const users = getTempUsers();
  return users.find(u => u.email === email && u.password === password) || null;
}

export function getTempUsers(): TempUser[] {
  const stored = localStorage.getItem(TEMP_USERS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function removeTempUser(email: string): void {
  const users = getTempUsers();
  const filtered = users.filter(u => u.email !== email);
  localStorage.setItem(TEMP_USERS_KEY, JSON.stringify(filtered));
}

export function createTempSession(user: TempUser) {
  const session = {
    user: {
      id: user.id,
      email: user.email,
      email_confirmed_at: null, // Mark as unconfirmed but allow access
      created_at: user.created_at,
      app_metadata: {},
      user_metadata: {}
    },
    access_token: `temp_token_${user.id}`,
    refresh_token: `temp_refresh_${user.id}`,
    expires_in: 3600,
    token_type: 'bearer'
  };

  localStorage.setItem('supabase_session', JSON.stringify(session));
  localStorage.setItem('user', JSON.stringify(session.user));
  
  return session;
}