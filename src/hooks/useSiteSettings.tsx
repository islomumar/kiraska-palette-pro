import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SiteSettings {
  logo_url: string | null;
  favicon_url: string | null;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    logo_url: null,
    favicon_url: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['logo_url', 'favicon_url']);

      if (data) {
        const settingsMap: SiteSettings = {
          logo_url: null,
          favicon_url: null,
        };
        data.forEach((item) => {
          if (item.key === 'logo_url') settingsMap.logo_url = item.value;
          if (item.key === 'favicon_url') settingsMap.favicon_url = item.value;
        });
        setSettings(settingsMap);

        // Update favicon dynamically
        if (settingsMap.favicon_url) {
          let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = settingsMap.favicon_url;
        }
      }
      setIsLoading(false);
    };

    fetchSettings();
  }, []);

  return { settings, isLoading };
}
