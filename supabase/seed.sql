-- ============================================================
-- Agent007 - Seed Data for Testing
-- Run this AFTER schema.sql
-- ============================================================

-- Note: In production, users are created via Google OAuth.
-- This seed is for local testing only.

-- Test user profile (you need to create a user in Supabase Auth first)
-- After creating the auth user, their profile will be auto-created by the trigger.
-- You can then update it:

-- UPDATE public.profiles
-- SET plan = 'pro', telegram_chat_id = 'YOUR_TELEGRAM_CHAT_ID'
-- WHERE email = 'your-test-email@gmail.com';

-- Sample execution logs for testing the monitoring dashboard
-- Replace 'YOUR_USER_ID' with your actual user UUID from auth.users

/*
INSERT INTO public.execution_logs (user_id, workflow_id, workflow_name, execution_id, status, started_at, finished_at)
VALUES
  ('YOUR_USER_ID', 'wf_001', 'Daily Report', 'exec_001', 'success', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 58 minutes'),
  ('YOUR_USER_ID', 'wf_002', 'Email Sync', 'exec_002', 'success', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '58 minutes'),
  ('YOUR_USER_ID', 'wf_003', 'Backup Database', 'exec_003', 'error', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '28 minutes'),
  ('YOUR_USER_ID', 'wf_001', 'Daily Report', 'exec_004', 'running', NOW() - INTERVAL '5 minutes', NULL),
  ('YOUR_USER_ID', 'wf_004', 'Slack Notifications', 'exec_005', 'success', NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '9 minutes');

-- Sample chat history
INSERT INTO public.chat_history (user_id, role, content, source)
VALUES
  ('YOUR_USER_ID', 'user', 'List my workflows', 'app'),
  ('YOUR_USER_ID', 'assistant', 'Here are your workflows:\n\n1. **Daily Report** (wf_001) - Active\n2. **Email Sync** (wf_002) - Active\n3. **Backup Database** (wf_003) - Inactive\n4. **Slack Notifications** (wf_004) - Active', 'app'),
  ('YOUR_USER_ID', 'user', 'Why did Backup Database fail?', 'app'),
  ('YOUR_USER_ID', 'assistant', 'The Backup Database workflow failed with a connection timeout error. The database server at db.example.com did not respond within 30 seconds. I recommend:\n\n1. Check if the database server is running\n2. Verify network connectivity\n3. Consider increasing the timeout setting in the workflow', 'app');
*/
