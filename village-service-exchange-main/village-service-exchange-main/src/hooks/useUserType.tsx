import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type UserType = 'buyer' | 'seller' | 'both' | null;

export const useUserType = () => {
  const { user } = useAuth();
  const [userType, setUserType] = useState<UserType>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserType = async () => {
      if (!user) {
        setUserType(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUserType(data?.user_type || null);
      } catch (error) {
        console.error('Error fetching user type:', error);
        setUserType(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserType();
  }, [user]);

  const canListServices = userType === 'seller' || userType === 'both';
  const canBookServices = userType === 'buyer' || userType === 'both';

  return { userType, loading, canListServices, canBookServices };
};
