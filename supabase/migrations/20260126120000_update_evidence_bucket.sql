-- Update the complaint-evidence bucket to allow multimedia files and larger sizes (50MB)
UPDATE storage.buckets
SET public = true,
    file_size_limit = 52428800, -- 50MB
    allowed_mime_types = ARRAY[
        'image/jpeg', 
        'image/png', 
        'image/gif', 
        'image/webp', 
        'application/pdf', 
        'audio/mpeg', 
        'audio/wav', 
        'audio/mp4', 
        'audio/x-m4a', 
        'audio/ogg',
        'video/mp4', 
        'video/quicktime', 
        'video/webm',
        'video/x-msvideo'
    ]
WHERE id = 'complaint-evidence';

-- If the bucket doesn't exist (e.g. if previous migration failed), insert it
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'complaint-evidence', 
    'complaint-evidence', 
    true, 
    52428800, 
    ARRAY[
        'image/jpeg', 
        'image/png', 
        'image/gif', 
        'image/webp', 
        'application/pdf', 
        'audio/mpeg', 
        'audio/wav', 
        'audio/mp4', 
        'audio/x-m4a', 
        'audio/ogg',
        'video/mp4', 
        'video/quicktime', 
        'video/webm',
        'video/x-msvideo'
    ]
)
ON CONFLICT (id) DO UPDATE SET 
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;
