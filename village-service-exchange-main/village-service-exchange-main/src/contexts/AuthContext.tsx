import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Check if profile exists, create if needed
          setTimeout(() => {
            checkAndCreateProfile(session.user);
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAndCreateProfile = async (user: User) => {
    try {
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        // Check if there's signup data in localStorage
        const signupDataStr = localStorage.getItem('signupData');
        let signupData = null;
        
        if (signupDataStr) {
          try {
            signupData = JSON.parse(signupDataStr);
            localStorage.removeItem('signupData'); // Clear after use
          } catch (e) {
            console.error('Error parsing signup data:', e);
          }
        }

        const fullName = signupData?.firstName && signupData?.lastName 
          ? `${signupData.firstName} ${signupData.lastName}`
          : user.user_metadata.full_name || user.email?.split('@')[0] || 'User';

        const { error } = await supabase.from('users').insert({
          id: user.id,
          email: user.email!,
          full_name: fullName,
          phone_number: signupData?.phoneNumber || null,
          is_verified: user.email_confirmed_at ? true : false,
          user_type: signupData?.userType || 'buyer',
        });

        if (error) {
          console.error('Error creating profile:', error);
        }
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    }
  };

  const signIn = async (email: string) => {
    // Validate @ashesi.edu.gh domain
    if (!email.endsWith('@ashesi.edu.gh')) {
      return { 
        error: { 
          message: 'Only @ashesi.edu.gh email addresses are allowed' 
        } 
      };
    }
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
    });

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      navigate('/');
      toast.success('Logged out successfully');
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
