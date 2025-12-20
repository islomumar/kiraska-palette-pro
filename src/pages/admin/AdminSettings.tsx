import { useEffect, useState, useRef } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Image as ImageIcon, Loader2, Link as LinkIcon, Save, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SiteSettings {
  logo_url: string | null;
  favicon_url: string | null;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    logo_url: null,
    favicon_url: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [logoInputMode, setLogoInputMode] = useState<'upload' | 'url'>('upload');
  const [faviconInputMode, setFaviconInputMode] = useState<'upload' | 'url'>('upload');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchSettings = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value');

    if (error) {
      toast({
        title: 'Xatolik',
        description: 'Sozlamalarni yuklashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } else {
      const settingsMap: SiteSettings = {
        logo_url: null,
        favicon_url: null,
      };
      data?.forEach((item) => {
        if (item.key === 'logo_url') settingsMap.logo_url = item.value;
        if (item.key === 'favicon_url') settingsMap.favicon_url = item.value;
      });
      setSettings(settingsMap);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleFileUpload = async (
    file: File,
    type: 'logo' | 'favicon'
  ) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Xatolik',
        description: 'Faqat rasm fayllarini yuklash mumkin',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Xatolik',
        description: 'Fayl hajmi 5MB dan oshmasligi kerak',
        variant: 'destructive',
      });
      return;
    }

    const setUploading = type === 'logo' ? setIsUploadingLogo : setIsUploadingFavicon;
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = `site/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      // Update in database
      const key = type === 'logo' ? 'logo_url' : 'favicon_url';
      const { error: updateError } = await supabase
        .from('site_settings')
        .update({ value: publicUrl })
        .eq('key', key);

      if (updateError) throw updateError;

      setSettings((prev) => ({
        ...prev,
        [key]: publicUrl,
      }));

      toast({
        title: 'Muvaffaqiyat',
        description: `${type === 'logo' ? 'Logo' : 'Favicon'} yuklandi`,
      });

      // Update favicon in document if it's favicon
      if (type === 'favicon') {
        updateFavicon(publicUrl);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Xatolik',
        description: 'Faylni yuklashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSave = async (url: string, type: 'logo' | 'favicon') => {
    setIsSaving(true);
    try {
      const key = type === 'logo' ? 'logo_url' : 'favicon_url';
      const { error } = await supabase
        .from('site_settings')
        .update({ value: url || null })
        .eq('key', key);

      if (error) throw error;

      setSettings((prev) => ({
        ...prev,
        [key]: url || null,
      }));

      toast({
        title: 'Muvaffaqiyat',
        description: `${type === 'logo' ? 'Logo' : 'Favicon'} saqlandi`,
      });

      if (type === 'favicon' && url) {
        updateFavicon(url);
      }
    } catch (error) {
      toast({
        title: 'Xatolik',
        description: 'Saqlashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (type: 'logo' | 'favicon') => {
    setIsSaving(true);
    try {
      const key = type === 'logo' ? 'logo_url' : 'favicon_url';
      const { error } = await supabase
        .from('site_settings')
        .update({ value: null })
        .eq('key', key);

      if (error) throw error;

      setSettings((prev) => ({
        ...prev,
        [key]: null,
      }));

      toast({
        title: 'Muvaffaqiyat',
        description: `${type === 'logo' ? 'Logo' : 'Favicon'} o'chirildi`,
      });
    } catch (error) {
      toast({
        title: 'Xatolik',
        description: 'O\'chirishda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateFavicon = (url: string) => {
    // Update or create favicon link element
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = url;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sozlamalar</h1>
          <p className="text-muted-foreground">
            Sayt logo va favicon sozlamalari
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Logo Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Logo</CardTitle>
              <CardDescription>
                Sayt logosini yuklang yoki URL kiriting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={logoInputMode} onValueChange={(v) => setLogoInputMode(v as 'upload' | 'url')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Yuklash
                  </TabsTrigger>
                  <TabsTrigger value="url">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    URL
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="space-y-4">
                  <input
                    type="file"
                    ref={logoInputRef}
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={isUploadingLogo}
                  >
                    {isUploadingLogo ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Yuklanmoqda...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Rasm tanlash
                      </>
                    )}
                  </Button>
                </TabsContent>
                <TabsContent value="url" className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={settings.logo_url || ''}
                      onChange={(e) => setSettings((prev) => ({ ...prev, logo_url: e.target.value }))}
                      placeholder="https://example.com/logo.png"
                    />
                    <Button
                      type="button"
                      onClick={() => handleUrlSave(settings.logo_url || '', 'logo')}
                      disabled={isSaving}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Logo Preview */}
              {settings.logo_url ? (
                <div className="space-y-2">
                  <Label>Ko'rinishi:</Label>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <img
                      src={settings.logo_url}
                      alt="Logo"
                      className="h-12 max-w-[200px] object-contain"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleRemove('logo')}
                      disabled={isSaving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border bg-muted/50">
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-1 text-sm text-muted-foreground">Logo yuklanmagan</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Favicon Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Favicon</CardTitle>
              <CardDescription>
                Brauzer tabidagi kichik rasm (32x32 yoki 64x64 piksel tavsiya etiladi)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={faviconInputMode} onValueChange={(v) => setFaviconInputMode(v as 'upload' | 'url')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Yuklash
                  </TabsTrigger>
                  <TabsTrigger value="url">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    URL
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="space-y-4">
                  <input
                    type="file"
                    ref={faviconInputRef}
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'favicon')}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => faviconInputRef.current?.click()}
                    disabled={isUploadingFavicon}
                  >
                    {isUploadingFavicon ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Yuklanmoqda...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Rasm tanlash
                      </>
                    )}
                  </Button>
                </TabsContent>
                <TabsContent value="url" className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={settings.favicon_url || ''}
                      onChange={(e) => setSettings((prev) => ({ ...prev, favicon_url: e.target.value }))}
                      placeholder="https://example.com/favicon.ico"
                    />
                    <Button
                      type="button"
                      onClick={() => handleUrlSave(settings.favicon_url || '', 'favicon')}
                      disabled={isSaving}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Favicon Preview */}
              {settings.favicon_url ? (
                <div className="space-y-2">
                  <Label>Ko'rinishi:</Label>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={settings.favicon_url}
                        alt="Favicon"
                        className="h-8 w-8 object-contain"
                      />
                      <span className="text-sm text-muted-foreground">32x32 ko'rinishi</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleRemove('favicon')}
                      disabled={isSaving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border bg-muted/50">
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-1 text-sm text-muted-foreground">Favicon yuklanmagan</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
