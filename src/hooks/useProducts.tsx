import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  price: number;
  old_price: number | null;
  volume: string | null;
  short_description: string | null;
  full_description: string | null;
  image_url: string | null;
  color_name: string | null;
  is_bestseller: boolean | null;
  is_featured: boolean | null;
  in_stock: boolean | null;
  category_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products_public')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

export function useProductBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from('products_public')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data as Product;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

export function useBestsellers() {
  return useQuery({
    queryKey: ['bestsellers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products_public')
        .select('*')
        .eq('is_bestseller', true)
        .limit(8);

      if (error) throw error;
      return data as Product[];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

export function useProductsByCategory(categoryId: string | undefined) {
  return useQuery({
    queryKey: ['products', 'category', categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      
      const { data, error } = await supabase
        .from('products_public')
        .select('*')
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5,
  });
}

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
};
