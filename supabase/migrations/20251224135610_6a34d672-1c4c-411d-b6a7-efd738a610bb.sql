-- Drop existing delete policy
DROP POLICY IF EXISTS "Superadmin can delete orders" ON public.orders;

-- Create new policy allowing admin and superadmin to delete orders
CREATE POLICY "Admin roles can delete orders" 
ON public.orders 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));