-- Leads table + coverage fields
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  notes TEXT,
  pkg_code TEXT,
  pkg_text TEXT,
  town TEXT,
  hostname TEXT,
  product TEXT,        -- FTTH / WIRELESS / PARTNER
  fno TEXT,            -- e.g. VinetFibre / Frogfoot
  lat REAL,
  lng REAL,
  source TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_hostname ON leads(hostname);
CREATE INDEX IF NOT EXISTS idx_leads_product ON leads(product);
CREATE INDEX IF NOT EXISTS idx_leads_fno ON leads(fno);
