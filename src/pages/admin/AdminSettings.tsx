import { useEffect, useState, useRef } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Image as ImageIcon, Loader2, Link as LinkIcon, Save, Trash2, Facebook, Globe, MapPin, ExternalLink, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SiteSettings {
  logo_url: string | null;
  favicon_url: string | null;
  facebook_pixel_id: string | null;
  facebook_domain_verification: string | null;
  sitemap_domain: string | null;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    logo_url: null,
    favicon_url: null,
    facebook_pixel_id: null,
    facebook_domain_verification: null,
    sitemap_domain: null,
  });
  const [sitemapCopied, setSitemapCopied] = useState(false);
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
        facebook_pixel_id: null,
        facebook_domain_verification: null,
        sitemap_domain: null,
      };
      data?.forEach((item) => {
        if (item.key === 'logo_url') settingsMap.logo_url = item.value;
        if (item.key === 'favicon_url') settingsMap.favicon_url = item.value;
        if (item.key === 'facebook_pixel_id') settingsMap.facebook_pixel_id = item.value;
        if (item.key === 'facebook_domain_verification') settingsMap.facebook_domain_verification = item.value;
        if (item.key === 'sitemap_domain') settingsMap.sitemap_domain = item.value;
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

  const handleFacebookSave = async () => {
    setIsSaving(true);
    try {
      // Upsert facebook_pixel_id
      const { error: pixelError } = await supabase
        .from('site_settings')
        .upsert({ 
          key: 'facebook_pixel_id', 
          value: settings.facebook_pixel_id 
        }, { onConflict: 'key' });

      if (pixelError) throw pixelError;

      // Upsert facebook_domain_verification
      const { error: domainError } = await supabase
        .from('site_settings')
        .upsert({ 
          key: 'facebook_domain_verification', 
          value: settings.facebook_domain_verification 
        }, { onConflict: 'key' });

      if (domainError) throw domainError;

      toast({
        title: 'Muvaffaqiyat',
        description: 'Facebook sozlamalari saqlandi',
      });
    } catch (error) {
      console.error('Facebook save error:', error);
      toast({
        title: 'Xatolik',
        description: 'Saqlashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSitemapSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ 
          key: 'sitemap_domain', 
          value: settings.sitemap_domain 
        }, { onConflict: 'key' });

      if (error) throw error;

      toast({
        title: 'Muvaffaqiyat',
        description: 'Sitemap sozlamalari saqlandi',
      });
    } catch (error) {
      console.error('Sitemap save error:', error);
      toast({
        title: 'Xatolik',
        description: 'Saqlashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const sitemapUrl = `https://pfcqwwbhzyuabttjzcqi.supabase.co/functions/v1/sitemap`;

  const copySitemapUrl = () => {
    navigator.clipboard.writeText(sitemapUrl);
    setSitemapCopied(true);
    setTimeout(() => setSitemapCopied(false), 2000);
    toast({
      title: 'Nusxalandi',
      description: 'Sitemap URL nusxalandi',
    });
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
            Sayt logo, favicon va integratsiya sozlamalari
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

        {/* Facebook Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Facebook className="h-5 w-5 text-[#1877F2]" />
              Facebook sozlamalari
            </CardTitle>
            <CardDescription>
              Facebook Pixel va Domain Verification sozlamalari
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Facebook Pixel ID */}
              <div className="space-y-2">
                <Label htmlFor="facebook_pixel_id" className="flex items-center gap-2">
                  Facebook Pixel ID
                </Label>
                <Input
                  id="facebook_pixel_id"
                  value={settings.facebook_pixel_id || ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, facebook_pixel_id: e.target.value }))}
                  placeholder="Masalan: 902186118024639"
                />
                <p className="text-xs text-muted-foreground">
                  Facebook Events Manager dan Pixel ID ni oling
                </p>
              </div>

              {/* Domain Verification */}
              <div className="space-y-2">
                <Label htmlFor="facebook_domain_verification" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Domain Verification kodi
                </Label>
                <Input
                  id="facebook_domain_verification"
                  value={settings.facebook_domain_verification || ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, facebook_domain_verification: e.target.value }))}
                  placeholder="Masalan: cbsnjzgkil9w1igb8dsuigz3lf033"
                />
                <p className="text-xs text-muted-foreground">
                  Facebook Business Settings → Brand Safety → Domains dan oling
                </p>
              </div>
            </div>

            <Button
              onClick={handleFacebookSave}
              disabled={isSaving}
              className="w-full md:w-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Facebook sozlamalarini saqlash
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Sitemap Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              Sitemap sozlamalari
            </CardTitle>
            <CardDescription>
              Google Search Console uchun sitemap domain sozlamalari
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Domain Input */}
              <div className="space-y-2">
                <Label htmlFor="sitemap_domain">
                  Sayt domeni
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="sitemap_domain"
                    value={settings.sitemap_domain || ''}
                    onChange={(e) => setSettings((prev) => ({ ...prev, sitemap_domain: e.target.value }))}
                    placeholder="https://kiraska.uz"
                  />
                  <Button
                    onClick={handleSitemapSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Domenni https:// bilan kiriting (masalan: https://kiraska.uz)
                </p>
              </div>

              {/* Sitemap URL */}
              <div className="space-y-2">
                <Label>Sitemap URL</Label>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3">
                  <code className="flex-1 text-sm break-all">{sitemapUrl}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={copySitemapUrl}
                  >
                    {sitemapCopied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                  >
                    <a href={sitemapUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Bu URL ni Google Search Console ga qo'shing
                </p>
              </div>

              {/* Instructions */}
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                <h4 className="font-medium text-sm">Google Search Console uchun qo'llanma:</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Google Search Console ga kiring</li>
                  <li>"Индексирование" → "Файлы Sitemap" bo'limiga o'ting</li>
                  <li>Yuqoridagi Sitemap URL ni nusxalab qo'ying</li>
                  <li>"ОТПРАВИТЬ" tugmasini bosing</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
