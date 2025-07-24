-- QuoteKit Supabase Database Schema
-- Run this in your Supabase SQL editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Calculator Templates Table (Master templates)
CREATE TABLE calculator_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    layout_json JSONB NOT NULL DEFAULT '{}',
    logic_json JSONB NOT NULL DEFAULT '{}',
    style_json JSONB NOT NULL DEFAULT '{}',
    prompt_md TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Calculators Table (User-owned clones)
CREATE TABLE user_calculators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES calculator_templates(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    layout_json JSONB NOT NULL DEFAULT '{}',
    logic_json JSONB NOT NULL DEFAULT '{}',
    style_json JSONB NOT NULL DEFAULT '{}',
    prompt_md TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    embed_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for user_calculators
ALTER TABLE user_calculators ENABLE ROW LEVEL SECURITY;

-- Users can only see their own calculators
CREATE POLICY "Users can view own calculators" ON user_calculators
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own calculators
CREATE POLICY "Users can insert own calculators" ON user_calculators
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own calculators
CREATE POLICY "Users can update own calculators" ON user_calculators
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own calculators
CREATE POLICY "Users can delete own calculators" ON user_calculators
    FOR DELETE USING (auth.uid() = user_id);

-- Calculator templates are publicly readable
ALTER TABLE calculator_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Calculator templates are publicly readable" ON calculator_templates
    FOR SELECT USING (true);

-- Insert default calculator templates
INSERT INTO calculator_templates (slug, name, category, description, layout_json, logic_json, style_json, prompt_md) VALUES
('wedding-photography', 'Wedding Photography', 'Photography', 'Custom quote calculator for wedding photography services', 
    '{"type": "multi-step", "steps": ["package", "addons", "details"], "components": ["package-selector", "addon-grid", "form"]}',
    '{"packages": [{"id": "basic", "label": "Basic Package", "price": 950, "hours": 4, "icon": "💕"}, {"id": "standard", "label": "Standard Package", "price": 1200, "hours": 6, "icon": "⭐", "popular": true}, {"id": "premium", "label": "Premium Package", "price": 1800, "hours": 8, "icon": "💍"}, {"id": "ultimate", "label": "Ultimate Package", "price": 2500, "hours": 12, "icon": "✈️"}], "addons": [{"id": "engagement", "label": "Engagement Session", "price": 300}, {"id": "album", "label": "Wedding Album", "price": 200}, {"id": "prints", "label": "Print Package", "price": 150}]}',
    '{"theme": "elegant", "primaryColor": "#f8fafc", "layout": "stepped"}',
    'You are a professional wedding photographer providing custom quotes. Calculate pricing based on package selection, hours, and additional services.'
),
('home-renovation', 'Home Renovation', 'Construction', 'Professional home renovation quote calculator', 
    '{"type": "form", "layout": "single-page", "components": ["project-type", "room-selector", "materials", "timeline"]}',
    '{"baseRates": {"kitchen": 15000, "bathroom": 8000, "living": 5000}, "materials": {"premium": 1.5, "standard": 1.0, "budget": 0.7}, "timeline": {"rush": 1.3, "standard": 1.0, "flexible": 0.9}}',
    '{"theme": "modern", "primaryColor": "#3b82f6", "layout": "card-based"}',
    'You are a home renovation contractor. Provide accurate quotes based on room type, materials, and project timeline.'
),
('electrician-services', 'Electrician Services', 'Home Services', 'Electrical work and installation quotes', 
    '{"type": "service-selector", "layout": "grid", "components": ["service-type", "property-details", "urgency"]}',
    '{"services": {"wiring": {"base": 200, "perHour": 75}, "panel": {"base": 500, "perHour": 100}, "outlets": {"base": 50, "perUnit": 25}}, "urgency": {"emergency": 2.0, "urgent": 1.5, "standard": 1.0}}',
    '{"theme": "professional", "primaryColor": "#10b981", "layout": "stepped"}',
    'You are a licensed electrician providing service quotes. Calculate based on work type, property size, and urgency.'
);

-- Create indexes for better performance
CREATE INDEX idx_user_calculators_user_id ON user_calculators(user_id);
CREATE INDEX idx_user_calculators_template_id ON user_calculators(template_id);
CREATE INDEX idx_user_calculators_slug ON user_calculators(slug);
CREATE INDEX idx_calculator_templates_slug ON calculator_templates(slug);
CREATE INDEX idx_calculator_templates_category ON calculator_templates(category);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_calculators_updated_at
    BEFORE UPDATE ON user_calculators
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();