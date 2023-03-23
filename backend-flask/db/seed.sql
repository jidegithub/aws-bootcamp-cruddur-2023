-- this file was manually created
INSERT INTO public.users (display_name, handle, email, cognito_user_id)
VALUES
  ('Andrew Brown', 'andrewbrown', 'andrewbrown@exampro.co', 'MOCK'),
  ('Andrew Bayko', 'andrewbayko', 'andrewbayko@exampro.co', 'MOCK'),
  ('Grahams Tartar', 'grahams', 'grahams-tartar.0x@icloud.com', 'MOCK'),
  ('Wriggle Reef', 'reef', 'wriggle.reef_0m@icloud.com', 'MOCK'),
  ('Chitty Bang', 'chitty', 'chittybang@exampro.co', 'MOCK');

INSERT INTO public.activities (user_uuid, message, expires_at)
VALUES
  (
    (SELECT uuid from public.users WHERE users.handle = 'andrewbrown' LIMIT 1),
    'This was imported as seed data!',
    current_timestamp + interval '10 day'
  )