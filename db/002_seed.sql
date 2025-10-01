INSERT INTO public.config(key, value) VALUES
  ('metro.defaults', '{"line":"M1","headwayMin":3,"tz":"Europe/Paris"}'),
  ('metro.last', '{"Chatelet":"01:10","Nation":"01:05"}');
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
