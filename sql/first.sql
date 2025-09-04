-- Create users profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('guest', 'user', 'creator', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory templates table
CREATE TABLE IF NOT EXISTS public.inventory_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create custom fields for templates
CREATE TABLE IF NOT EXISTS public.template_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.inventory_templates(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'boolean', 'select')),
  field_options JSONB, -- For select field options
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventories table
CREATE TABLE IF NOT EXISTS public.inventories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.inventory_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  custom_id TEXT, -- User-defined ID format
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory items table
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES public.inventories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 0,
  custom_fields JSONB DEFAULT '{}', -- Store custom field values
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create discussions table
CREATE TABLE IF NOT EXISTS public.discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES public.inventories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create likes table for templates
CREATE TABLE IF NOT EXISTS public.template_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.inventory_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, user_id)
);

-- Create likes table for inventories
CREATE TABLE IF NOT EXISTS public.inventory_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES public.inventories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(inventory_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- RLS Policies for inventory templates
CREATE POLICY "templates_select_public_or_own" ON public.inventory_templates FOR SELECT USING (is_public = true OR creator_id = auth.uid());
CREATE POLICY "templates_insert_own" ON public.inventory_templates FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "templates_update_own" ON public.inventory_templates FOR UPDATE USING (creator_id = auth.uid());
CREATE POLICY "templates_delete_own" ON public.inventory_templates FOR DELETE USING (creator_id = auth.uid());

-- RLS Policies for template fields
CREATE POLICY "template_fields_select_via_template" ON public.template_fields FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.inventory_templates t 
    WHERE t.id = template_id AND (t.is_public = true OR t.creator_id = auth.uid())
  )
);
CREATE POLICY "template_fields_insert_own_template" ON public.template_fields FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.inventory_templates t 
    WHERE t.id = template_id AND t.creator_id = auth.uid()
  )
);
CREATE POLICY "template_fields_update_own_template" ON public.template_fields FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.inventory_templates t 
    WHERE t.id = template_id AND t.creator_id = auth.uid()
  )
);
CREATE POLICY "template_fields_delete_own_template" ON public.template_fields FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.inventory_templates t 
    WHERE t.id = template_id AND t.creator_id = auth.uid()
  )
);

-- RLS Policies for inventories
CREATE POLICY "inventories_select_public_or_own" ON public.inventories FOR SELECT USING (is_public = true OR creator_id = auth.uid());
CREATE POLICY "inventories_insert_own" ON public.inventories FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "inventories_update_own" ON public.inventories FOR UPDATE USING (creator_id = auth.uid());
CREATE POLICY "inventories_delete_own" ON public.inventories FOR DELETE USING (creator_id = auth.uid());

-- RLS Policies for inventory items
CREATE POLICY "inventory_items_select_via_inventory" ON public.inventory_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.inventories i 
    WHERE i.id = inventory_id AND (i.is_public = true OR i.creator_id = auth.uid())
  )
);
CREATE POLICY "inventory_items_insert_own_inventory" ON public.inventory_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.inventories i 
    WHERE i.id = inventory_id AND i.creator_id = auth.uid()
  )
);
CREATE POLICY "inventory_items_update_own_inventory" ON public.inventory_items FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.inventories i 
    WHERE i.id = inventory_id AND i.creator_id = auth.uid()
  )
);
CREATE POLICY "inventory_items_delete_own_inventory" ON public.inventory_items FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.inventories i 
    WHERE i.id = inventory_id AND i.creator_id = auth.uid()
  )
);

-- RLS Policies for discussions
CREATE POLICY "discussions_select_via_inventory" ON public.discussions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.inventories i 
    WHERE i.id = inventory_id AND (i.is_public = true OR i.creator_id = auth.uid())
  )
);
CREATE POLICY "discussions_insert_authenticated" ON public.discussions FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.inventories i 
    WHERE i.id = inventory_id AND (i.is_public = true OR i.creator_id = auth.uid())
  )
);
CREATE POLICY "discussions_update_own" ON public.discussions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "discussions_delete_own" ON public.discussions FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for template likes
CREATE POLICY "template_likes_select_all" ON public.template_likes FOR SELECT USING (true);
CREATE POLICY "template_likes_insert_own" ON public.template_likes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "template_likes_delete_own" ON public.template_likes FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for inventory likes
CREATE POLICY "inventory_likes_select_all" ON public.inventory_likes FOR SELECT USING (true);
CREATE POLICY "inventory_likes_insert_own" ON public.inventory_likes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "inventory_likes_delete_own" ON public.inventory_likes FOR DELETE USING (user_id = auth.uid());
