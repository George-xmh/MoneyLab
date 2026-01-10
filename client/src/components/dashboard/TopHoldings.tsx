import React from "react";

interface Holding {
  name: string;
  symbol: string;
  shares: number;
  value: number;
  change: number;
  logo: string;
}

interface TopHoldingsProps {
  holdings?: Holding[];
}

const defaultHoldings: Holding[] = [
  { name: "Apple Inc.", symbol: "AAPL", shares: 50, value: 8947.50, change: 2.34, logo: "🍎" },
  { name: "Microsoft Corp.", symbol: "MSFT", shares: 30, value: 11234.80, change: 1.87, logo: "💻" },
  { name: "Tesla Inc.", symbol: "TSLA", shares: 15, value: 3705.45, change: -1.23, logo: "🚗" },
  { name: "Bitcoin", symbol: "BTC", shares: 0.5, value: 21500.00, change: 5.67, logo: "₿" },
  { name: "Ethereum", symbol: "ETH", shares: 5, value: 11250.00, change: 3.45, logo: "Ξ" },
];

export function TopHoldings({ holdings = defaultHoldings }: TopHoldingsProps) {
  return (
    <div className="top-holdings-container">
      <div className="top-holdings-card">
        <div className="top-holdings-header">
          <h3 className="top-holdings-title">Top Holdings</h3>
          <p className="top-holdings-subtitle">Your best performing assets</p>
        </div>
        <div className="top-holdings-content">
          <div className="top-holdings-list">
            {holdings.map((holding, index) => (
              <div
                key={holding.symbol}
                className="top-holdings-item"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="top-holdings-item-left">
                  <div className="top-holdings-logo">
                    {holding.logo}
                  </div>
                  <div className="top-holdings-info">
                    <p className="top-holdings-name">{holding.name}</p>
                    <p className="top-holdings-shares">
                      {holding.shares} {holding.shares === 1 ? "share" : "shares"}
                    </p>
                  </div>
                </div>
                <div className="top-holdings-item-right">
                  <p className="top-holdings-value">${holding.value.toLocaleString()}</p>
                  <div className={`top-holdings-change ${holding.change > 0 ? 'positive' : 'negative'}`}>
                    <span className="trend-icon">{holding.change > 0 ? '↑' : '↓'}</span>
                    <span>
                      {holding.change > 0 ? "+" : ""}
                      {holding.change}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
