INSERT INTO config (key, value) VALUES
VALUE ('metro', '{"headway": 3, "timezone": "Europe/Paris", "last_train_times": {"line_1": "01:15", "line_2": "01:25"}}')
ON CONFLICT (key) DO NOTHING;