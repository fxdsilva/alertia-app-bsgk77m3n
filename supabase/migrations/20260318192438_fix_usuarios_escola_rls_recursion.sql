-- Fix for infinite recursion (42P17) in usuarios_escola RLS policies
-- The previous "View school peers" policy used a function that queried the same table, causing a loop.

-- 1. Drop the problematic recursive policy
DROP POLICY IF EXISTS "View school peers" ON public.usuarios_escola;

-- 2. Drop other potentially recursive/duplicate policies that might have been added in the past
DROP POLICY IF EXISTS "Analistas can view school users" ON public.usuarios_escola;
DROP POLICY IF EXISTS "Director Compliance Read All Users" ON public.usuarios_escola;
DROP POLICY IF EXISTS "Directors can view all users" ON public.usuarios_escola;
DROP POLICY IF EXISTS "usuarios_escola_select_school_or_admin" ON public.usuarios_escola;

-- 3. Create a safe, non-recursive policy for viewing peers
-- This uses the JWT metadata which is injected at login/token refresh, avoiding recursive table queries
CREATE POLICY "View school peers" ON public.usuarios_escola
FOR SELECT
TO authenticated
USING (
    escola_id IS NOT NULL AND (
        escola_id::text = (auth.jwt() -> 'user_metadata' ->> 'escola_id') OR
        escola_id::text = (auth.jwt() -> 'app_metadata' ->> 'escola_id')
    )
);
