type FxApiResponse = {
  result: string;
  rates: Record<string, number>;
};

export class FxService {
  private ratesCache = new Map<string, Record<string, number>>();

  private createCacheKey(base: string, targets: string[]): string {
    const dayKey = new Date().toISOString().slice(0, 10);
    const normalizedTargets = [...new Set(targets)].sort();
    return `${dayKey}:${base}:${normalizedTargets.join(",")}`;
  }

  async getRates(
    base: string,
    targets: string[],
  ): Promise<Record<string, number>> {
    const cacheKey = this.createCacheKey(base, targets);
    const cached = this.ratesCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const response = await fetch(`https://open.er-api.com/v6/latest/${base}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates: ${response.status}`);
    }

    const data = (await response.json()) as FxApiResponse;

    if (data.result !== "success") {
      throw new Error("Exchange rates API returned non-success result");
    }

    const rates: Record<string, number> = {};

    for (const target of targets) {
      if (target === base) {
        rates[target] = 1;
        continue;
      }

      const rate = data.rates[target];

      if (typeof rate === "number") {
        rates[target] = rate;
      }
    }

    this.ratesCache.set(cacheKey, rates);
    return rates;
  }

  convert(amount: number, rate: number): number {
    return amount * rate;
  }
}

export const fxService = new FxService();
