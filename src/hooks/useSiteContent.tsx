import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface SiteContent {
  [key: string]: string;
}

interface SiteContentContextType {
  content: SiteContent;
  isLoading: boolean;
  getText: (key: string, fallback?: string) => string;
  refetch: () => void;
}

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: content = {}, isLoading, refetch } = useQuery({
    queryKey: ['site-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('key, value');

      if (error) throw error;

      const contentMap: SiteContent = {};
      data?.forEach((item) => {
        contentMap[item.key] = item.value;
      });
      return contentMap;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });

  // Subscribe to realtime changes
  useEffect(() => {
    const channel = supabase
      .channel('site-content-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_content',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['site-content'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const getText = (key: string, fallback: string = '') => {
    return content[key] || fallback;
  };

  return (
    <SiteContentContext.Provider value={{ content, isLoading, getText, refetch }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error('useSiteContent must be used within a SiteContentProvider');
  }
  return context;
}
