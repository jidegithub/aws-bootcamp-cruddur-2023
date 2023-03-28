-- this file was manually created
INSERT INTO public.users (display_name, email, handle, cognito_user_id)
VALUES
  ('Grahams Tartar', 'grahams-tartar.0x@icloud.com', 'grahams', 'MOCK'),
  ('Wriggle Reef', 'wriggle.reef_0m@icloud.com', 'reef', 'MOCK'),
  ('Londo Mollari', 'lmollari@centari.com', 'londo', 'MOCK');

INSERT INTO public.activities (user_uuid, message, expires_at)
VALUES
  (
    (SELECT uuid from public.users WHERE users.handle = 'grahams' LIMIT 1),
    'This was imported as seed data!',
    current_timestamp + interval '10 day'
  )