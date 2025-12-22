import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml; charset=utf-8",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const baseUrl = "https://kiraska.uz";
    const languages = ["uz", "ru", "ky", "tj", "zh"];

    // Fetch active categories
    const { data: categories } = await supabase
      .from("categories")
      .select("slug, updated_at")
      .eq("is_active", true);

    // Fetch active products
    const { data: products } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("is_active", true);

    // Generate sitemap XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

    // Static pages
    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "daily" },
      { url: "/products", priority: "0.9", changefreq: "daily" },
      { url: "/catalog", priority: "0.9", changefreq: "daily" },
      { url: "/about", priority: "0.7", changefreq: "monthly" },
      { url: "/contact", priority: "0.7", changefreq: "monthly" },
    ];

    for (const page of staticPages) {
      for (const lang of languages) {
        const langPrefix = lang === "uz" ? "" : `/${lang}`;
        xml += `  <url>
    <loc>${baseUrl}${langPrefix}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
`;
        // Add hreflang alternates
        for (const altLang of languages) {
          const altPrefix = altLang === "uz" ? "" : `/${altLang}`;
          xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${baseUrl}${altPrefix}${page.url}" />
`;
        }
        xml += `  </url>
`;
      }
    }

    // Category pages
    if (categories) {
      for (const category of categories) {
        for (const lang of languages) {
          const langPrefix = lang === "uz" ? "" : `/${lang}`;
          const lastmod = category.updated_at ? new Date(category.updated_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
          
          xml += `  <url>
    <loc>${baseUrl}${langPrefix}/catalog?category=${category.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
`;
          for (const altLang of languages) {
            const altPrefix = altLang === "uz" ? "" : `/${altLang}`;
            xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${baseUrl}${altPrefix}/catalog?category=${category.slug}" />
`;
          }
          xml += `  </url>
`;
        }
      }
    }

    // Product pages
    if (products) {
      for (const product of products) {
        for (const lang of languages) {
          const langPrefix = lang === "uz" ? "" : `/${lang}`;
          const lastmod = product.updated_at ? new Date(product.updated_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
          
          xml += `  <url>
    <loc>${baseUrl}${langPrefix}/product/${product.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
`;
          for (const altLang of languages) {
            const altPrefix = altLang === "uz" ? "" : `/${altLang}`;
            xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${baseUrl}${altPrefix}/product/${product.slug}" />
`;
          }
          xml += `  </url>
`;
        }
      }
    }

    xml += `</urlset>`;

    return new Response(xml, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
