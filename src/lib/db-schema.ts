export const SCHEMA = `
CREATE TABLE IF NOT EXISTS agents (
  id            TEXT PRIMARY KEY,
  name_th       TEXT NOT NULL,
  name_en       TEXT NOT NULL,
  role          TEXT NOT NULL,
  personality   TEXT NOT NULL DEFAULT '',
  system_prompt TEXT NOT NULL DEFAULT '',
  model         TEXT NOT NULL DEFAULT 'claude-sonnet-4-6',
  effort_level  TEXT NOT NULL DEFAULT 'medium',
  team          TEXT NOT NULL,
  avatar_url    TEXT DEFAULT NULL,
  status        TEXT NOT NULL DEFAULT 'idle',
  skills        TEXT NOT NULL DEFAULT '[]',
  config        TEXT NOT NULL DEFAULT '{}',
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS missions (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  agent_id      TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',
  priority      INTEGER NOT NULL DEFAULT 5,
  input         TEXT NOT NULL DEFAULT '',
  output        TEXT NOT NULL DEFAULT '',
  tokens_used   INTEGER NOT NULL DEFAULT 0,
  duration_ms   INTEGER NOT NULL DEFAULT 0,
  parent_id     TEXT DEFAULT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  started_at    TEXT DEFAULT NULL,
  completed_at  TEXT DEFAULT NULL,
  FOREIGN KEY (agent_id) REFERENCES agents(id),
  FOREIGN KEY (parent_id) REFERENCES missions(id)
);

CREATE TABLE IF NOT EXISTS mission_chunks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  mission_id  TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  content     TEXT NOT NULL,
  chunk_type  TEXT NOT NULL DEFAULT 'text',
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (mission_id) REFERENCES missions(id)
);
CREATE INDEX IF NOT EXISTS idx_chunks_mission ON mission_chunks(mission_id, chunk_index);

CREATE TABLE IF NOT EXISTS memory (
  id          TEXT PRIMARY KEY,
  agent_id    TEXT NOT NULL,
  content     TEXT NOT NULL,
  memory_type TEXT NOT NULL DEFAULT 'observation',
  importance  INTEGER NOT NULL DEFAULT 5,
  mission_id  TEXT DEFAULT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (agent_id) REFERENCES agents(id),
  FOREIGN KEY (mission_id) REFERENCES missions(id)
);
CREATE INDEX IF NOT EXISTS idx_memory_agent ON memory(agent_id, importance DESC);

CREATE TABLE IF NOT EXISTS skills (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  instructions TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'general',
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
  id          TEXT PRIMARY KEY,
  from_agent  TEXT NOT NULL,
  to_agent    TEXT NOT NULL,
  content     TEXT NOT NULL,
  msg_type    TEXT NOT NULL DEFAULT 'request',
  mission_id  TEXT DEFAULT NULL,
  status      TEXT NOT NULL DEFAULT 'pending',
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (from_agent) REFERENCES agents(id),
  FOREIGN KEY (to_agent) REFERENCES agents(id),
  FOREIGN KEY (mission_id) REFERENCES missions(id)
);
CREATE INDEX IF NOT EXISTS idx_messages_to ON messages(to_agent, status);

CREATE TABLE IF NOT EXISTS artifacts (
  id          TEXT PRIMARY KEY,
  mission_id  TEXT DEFAULT NULL,
  agent_id    TEXT DEFAULT NULL,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  mime_type   TEXT NOT NULL DEFAULT 'text/plain',
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (mission_id) REFERENCES missions(id),
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);
`
