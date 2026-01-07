import Database from 'better-sqlite3'
import { join } from 'path'

const dbPath = join(process.cwd(), 'data', 'ecodash.db')

// Ensure data directory exists
import { mkdirSync, existsSync } from 'fs'
const dataDir = join(process.cwd(), 'data')
if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
}

const db = new Database(dbPath)

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'electricity',
    value REAL NOT NULL,
    unit TEXT NOT NULL DEFAULT 'kWh',
    source TEXT DEFAULT 'manual',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE INDEX IF NOT EXISTS idx_readings_timestamp ON readings(timestamp);
  CREATE INDEX IF NOT EXISTS idx_readings_type ON readings(type);
  
  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    severity TEXT NOT NULL,
    message TEXT NOT NULL,
    context TEXT,
    acknowledged INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS tariffs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price_per_kwh REAL NOT NULL,
    start_hour INTEGER,
    end_hour INTEGER,
    is_default INTEGER DEFAULT 0
  );
  
  CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    transport_mode TEXT NOT NULL,
    distance REAL NOT NULL,
    co2_kg REAL NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE INDEX IF NOT EXISTS idx_trips_date ON trips(date);
  CREATE INDEX IF NOT EXISTS idx_trips_transport_mode ON trips(transport_mode);
  
  CREATE TABLE IF NOT EXISTS meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    meal_type TEXT NOT NULL,
    meal_category TEXT NOT NULL,
    co2_kg REAL NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date);
  CREATE INDEX IF NOT EXISTS idx_meals_type ON meals(meal_type);
  CREATE INDEX IF NOT EXISTS idx_meals_category ON meals(meal_category);
  
  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT NOT NULL,
    quantity REAL,
    unit TEXT,
    co2_kg REAL NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date);
  CREATE INDEX IF NOT EXISTS idx_activities_category ON activities(category);
  CREATE INDEX IF NOT EXISTS idx_activities_subcategory ON activities(subcategory);
`)

// Insert default tariff if not exists
const defaultTariff = db.prepare('SELECT * FROM tariffs WHERE is_default = 1').get()
if (!defaultTariff) {
    db.prepare('INSERT INTO tariffs (name, price_per_kwh, is_default) VALUES (?, ?, 1)').run('Tarif Base EDF 2024', 0.2516)
}

// Insert default settings if not exists
const defaultSettings = [
    { key: 'daily_limit_kwh', value: '15' },
    { key: 'peak_power_kw', value: '6' },
    { key: 'subscription_power_kva', value: '9' },
    { key: 'co2_factor', value: '0.0569' },
    { key: 'notifications_enabled', value: 'true' }
]

const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)')
for (const setting of defaultSettings) {
    insertSetting.run(setting.key, setting.value)
}

export default db
