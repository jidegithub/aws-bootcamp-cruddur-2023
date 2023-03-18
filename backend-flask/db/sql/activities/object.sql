SELECT
  activities.uuid,
  users.display_name,
  users.handle,
  activities.message,
  activities.created_at,
  activities.expires_at
FROM public.activities
INNER JOIN public.users ON users.uuid = activities.user_uuid 
WHERE 
  activities.uuid = %(uuid)s

  -- INNER JOIN: returns rows when there is a match in both tables
  -- activities has the user uuid of the user that posted, users have their uuid