import type { CacheData, CacheResult } from "../@types/extension";

export class CacheService {
  private static _instance: CacheService;
  cache: CacheData[] = [];

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

  /* A method that takes in a entity and data. It then checks if the record exists and if it
  doesn't it pushes it to the cache. */
  public set = (entity: string, data: any, result: any): void => {
    if (!this.recordExists(entity, data)) {
      this.cache.push({
        entity: entity,
        data: data,
        result,
      });
    }
  };

  /* A method that takes in entity and data. It then checks if the record exists and if it
    doesn't it pushes it to the cache. */
  public get = (entity: string, data: any): CacheResult | null => {
    const cacheRecord = this.cache.find((x) => {
      if (data) {
        return x.entity === entity && x.data === data;
      }

      return x.entity === entity;
    });

    if (cacheRecord) {
      return cacheRecord.result;
    }

    return null;
  };

  /* It's a method that takes in entity and data . It then checks if the record exists and if it
      doesn't it pushes it to the cache. */
  public recordExists = (entity: string, data: any): boolean => {
    return !!this.get(entity, data);
  };
}
