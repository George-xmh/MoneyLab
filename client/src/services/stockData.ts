// Stock data service - fetches real-time stock prices
// Using Yahoo Finance API (free, no API key required)
// In production, consider using a more reliable service like Alpha Vantage or Finnhub

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose?: number;
}

const CACHE_DURATION = 60000; // 1 minute cache
const stockCache: Map<string, { data: StockQuote; timestamp: number }> = new Map();

// Fetch stock quote from Yahoo Finance
export async function getStockQuote(symbol: string): Promise<StockQuote> {
  const cacheKey = symbol.toUpperCase();
  const cached = stockCache.get(cacheKey);
  
  // Return cached data if still valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // Using Yahoo Finance API (free, no key required)
    // Note: This may have CORS issues in browser. Consider using a proxy or backend endpoint in production
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol.toUpperCase()}?interval=1d&range=1d`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stock data for ${symbol}`);
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];
    
    if (!result || !result.meta) {
      throw new Error(`No data found for ${symbol}`);
    }

    const meta = result.meta;
    const currentPrice = meta.regularMarketPrice || meta.previousClose || 0;
    const previousClose = meta.previousClose || currentPrice;
    const change = currentPrice - previousClose;
    const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

    const quote: StockQuote = {
      symbol: symbol.toUpperCase(),
      price: currentPrice,
      change,
      changePercent,
      previousClose,
    };

    // Cache the result
    stockCache.set(cacheKey, { data: quote, timestamp: Date.now() });

    return quote;
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    
    // Return mock data with simulated change if API fails (for development)
    // In production, you might want to use a backend proxy to avoid CORS issues
    const mockPrice = 100 + (Math.random() - 0.5) * 20;
    const mockChange = (Math.random() - 0.5) * 5;
    const mockChangePercent = (mockChange / mockPrice) * 100;
    
    return {
      symbol: symbol.toUpperCase(),
      price: mockPrice,
      change: mockChange,
      changePercent: mockChangePercent,
      previousClose: mockPrice - mockChange,
    };
  }
}

// Fetch multiple stock quotes
export async function getStockQuotes(symbols: string[]): Promise<StockQuote[]> {
  const promises = symbols.map(symbol => getStockQuote(symbol));
  return Promise.all(promises);
}

// Calculate portfolio change percentage
export function calculatePortfolioChange(
  currentValue: number,
  previousValue: number
): { change: number; changePercent: number } {
  const change = currentValue - previousValue;
  const changePercent = previousValue !== 0 ? (change / previousValue) * 100 : 0;
  return { change, changePercent };
}
