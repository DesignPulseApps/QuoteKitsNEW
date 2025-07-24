import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for browser operations
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
);

// Authentication functions
export async function signUpWithEmail(email: string, password: string) {
  try {
    // First attempt: Try signup with email confirmation disabled
    const { data: signupData, error: signupError } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          email_confirmation: false
        }
      }
    });
    
    // If rate limited or email error, try to sign in directly (user might already exist)
    if (signupError && (
      signupError.message?.includes('rate limit') || 
      signupError.message?.includes('email') ||
      signupError.message?.includes('confirmation')
    )) {
      console.log('Signup failed, attempting direct login:', signupError.message);
      return await loginWithEmail(email, password);
    }
    
    return { user: signupData.user, session: signupData.session, error: signupError };
  } catch (error: any) {
    console.error('Signup error:', error);
    return { user: null, session: null, error };
  }
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

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });
  return { error };
}