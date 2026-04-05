-- ============================================================
-- AI Settings Table - User configurable AI provider settings
-- ============================================================

CREATE TABLE public.ai_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  provider TEXT NOT NULL DEFAULT 'openrouter' CHECK (provider IN ('openrouter', 'anthropic', 'openai', 'custom')),
  api_key TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'anthropic/claude-sonnet-4.6',
  base_url TEXT,
  system_prompt TEXT,
  max_tokens INTEGER NOT NULL DEFAULT 4096,
  max_steps INTEGER NOT NULL DEFAULT 5,
  temperature NUMERIC NOT NULL DEFAULT 0.3 CHECK (temperature >= 0 AND temperature <= 2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_settings_user_id ON public.ai_settings(user_id);

ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI settings"
  ON public.ai_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI settings"
  ON public.ai_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI settings"
  ON public.ai_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI settings"
  ON public.ai_settings FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_ai_settings_updated_at
  BEFORE UPDATE ON public.ai_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();