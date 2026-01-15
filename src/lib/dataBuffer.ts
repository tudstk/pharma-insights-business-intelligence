import type { SalesData } from "@/utils/csvParser";
import type { GeoPoint } from "./aggregateGeo";

interface BufferConfig {
  maxSize: number; 
  ttl: number;
}

interface BufferedData<T> {
  data: T[];
  timestamp: number;
  key: string;
}

const DEFAULT_CONFIG: BufferConfig = {
  maxSize: 10000,
  ttl: 5 * 60 * 1000, 
};

class DataBuffer {
  private cache: Map<string, BufferedData<any>> = new Map();
  private config: BufferConfig;

  constructor(config: Partial<BufferConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  
  private generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((k) => `${k}:${JSON.stringify(params[k])}`)
      .join("|");
    return `${prefix}:${sortedParams}`;
  }


  private isValid(buffered: BufferedData<any>): boolean {
    return Date.now() - buffered.timestamp < this.config.ttl;
  }


  get<T>(prefix: string, params: Record<string, any>): T[] | null {
    const key = this.generateKey(prefix, params);
    const buffered = this.cache.get(key);

    if (!buffered) return null;

    if (!this.isValid(buffered)) {
      this.cache.delete(key);
      return null;
    }

    return buffered.data as T[];
  }

 
  set<T>(prefix: string, params: Record<string, any>, data: T[]): void {
    // Check size limit
    if (data.length > this.config.maxSize) {
      console.warn(
        `Buffer size (${data.length}) exceeds max (${this.config.maxSize})`
      );
    }

    const key = this.generateKey(prefix, params);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      key,
    });
  }

  clear(prefix: string, params: Record<string, any>): void {
    const key = this.generateKey(prefix, params);
    this.cache.delete(key);
  }


  clearAll(): void {
    this.cache.clear();
  }


  getStats(): {
    totalEntries: number;
    totalSize: number;
    entries: Array<{ key: string; size: number; age: number }>;
  } {
    const entries: Array<{ key: string; size: number; age: number }> = [];
    let totalSize = 0;

    this.cache.forEach((buffered) => {
      const size = buffered.data.length;
      const age = Date.now() - buffered.timestamp;
      entries.push({ key: buffered.key, size, age });
      totalSize += size;
    });

    return {
      totalEntries: this.cache.size,
      totalSize,
      entries,
    };
  }
}

// Export singleton instance
export const dataBuffer = new DataBuffer();

export function* chunkArray<T>(arr: T[], size: number): Generator<T[]> {
  for (let i = 0; i < arr.length; i += size) {
    yield arr.slice(i, i + size);
  }
}

export function debounceData<T>(
  data: T[],
  delay: number = 300
): Promise<T[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
}
