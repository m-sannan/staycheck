CREATE TABLE IF NOT EXISTS usage_counters (
  scope TEXT NOT NULL,
  bucket TEXT NOT NULL,
  counter_key TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (scope, bucket, counter_key)
);
