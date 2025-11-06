import * as crypto from "node:crypto";
import type { CacheData, CacheResult } from "../@types/extension";

interface CacheEntry extends CacheData {
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export class CacheService {
  private static _instance: CacheService;
  private cache: Map<string, CacheEntry> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default TTL

  /**
   * Returns the singleton instance of the class
   * @returns {CacheService} The instance of the class.
   */
  public static getInstance(): CacheService {
    if (!CacheService._instance) {
      CacheService._instance = new CacheService();
    }
    return CacheService._instance;
  }

  /**
   * Create a hash key from entity and data for efficient lookups
   */
  private createHashKey(entity: string, data: string): string {
    // Use SHA-256 hash for long diff content to avoid memory issues with large keys
    const hash = crypto.createHash("sha256");
    hash.update(`${entity}:${data}`);
    return hash.digest("hex");
  }

  /**
   * Clean expired cache entries
   */
  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Set a cache entry with optional TTL
   */
  public set = (entity: string, data: string, result: CacheResult, ttl?: number): void => {
    const key = this.createHashKey(entity, data);

    // Clean expired entries periodically (every 10th set operation)
    if (this.cache.size % 10 === 0) {
      this.cleanExpired();
    }

    this.cache.set(key, {
      entity,
      data,
      result,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL,
    });
  };

  /**
   * Get a cache entry if it exists and hasn't expired
   */
  public get = (entity: string, data: string): CacheResult | null => {
    const key = this.createHashKey(entity, data);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.result;
  };

  /**
   * Check if a cache record exists and is valid
   */
  public recordExists = (entity: string, data: string): boolean => {
    return this.get(entity, data) !== null;
  };

  /**
   * Clear all cache entries
   */
  public clear = (): void => {
    this.cache.clear();
  };

  /**
   * Get cache statistics
   */
  public getStats = () => {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.values()).map((entry) => ({
        entity: entry.entity,
        timestamp: entry.timestamp,
        ttl: entry.ttl,
        expired: Date.now() - entry.timestamp > entry.ttl,
      })),
    };
  };
}
