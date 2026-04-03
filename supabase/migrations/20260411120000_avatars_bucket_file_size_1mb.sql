-- Align avatars bucket with app validation (1 MB). Supabase/project defaults may cap lower than the previous 5 MB setting.
UPDATE storage.buckets
SET file_size_limit = 1048576
WHERE id = 'avatars';
