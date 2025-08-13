import { pool } from "./db";

export interface CacheEntry {
  key: string;
  value: Buffer;
  created_at: Date;
}

class PostgresCache {
  constructor() {
    this.ensureTableExists();
  }

  private async ensureTableExists(): Promise<void> {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS cache (
          key VARCHAR(255) PRIMARY KEY,
          value BYTEA NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);
    } catch (error) {
      console.error("Failed to create cache table:", error);
      throw error;
    }
  }

  async get(key: string): Promise<CacheEntry | null> {
    try {
      const result = await pool.query("SELECT value, created_at FROM cache WHERE key = $1", [key]);

      if (result.rows.length === 0) {
        return null;
      }

      return {
        key,
        value: result.rows[0].value,
        created_at: result.rows[0].created_at,
      };
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  async set(key: string, value: Buffer): Promise<void> {
    try {
      await pool.query(
        "INSERT INTO cache (key, value, created_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, created_at = NOW()",
        [key, value],
      );
    } catch (error) {
      console.error("Cache set error:", error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await pool.query("DELETE FROM cache WHERE key = $1", [key]);
    } catch (error) {
      console.error("Cache delete error:", error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await pool.query("DELETE FROM cache");
    } catch (error) {
      console.error("Cache clear error:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const cache = new PostgresCache();

// Helper function to check if cache entry is expired
export function isExpired(entry: CacheEntry, expiryMinutes: number): boolean {
  const now = new Date();
  const expiryTime = new Date(entry.created_at.getTime() + expiryMinutes * 60 * 1000);
  return now > expiryTime;
}
