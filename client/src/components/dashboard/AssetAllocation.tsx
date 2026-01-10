import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// Dark theme color palette - muted colors that work well on dark backgrounds
const COLORS = [
  '#22c55e', // Green - Stocks (primary theme color)
  '#f59e0b', // Amber - Crypto (warmer, less bright)
  '#3b82f6', // Blue - Bonds
  '#8b5cf6', // Violet - ETF (softer purple)
  '#14b8a6', // Teal - Cash (muted cyan)
  '#f472b6', // Pink - Real Estate (softer pink)
  '#64748b', // Slate - Other (muted gray)
];

interface Asset {
  id: number;
  symbol: string;
  name: string;
  asset_type: string;
  value: number;
  quantity: number;
  price: number;
  quote?: {
    price: number;
    changePercent: number;
  };
}

interface AssetAllocationProps {
  assets?: Asset[];
}

interface AllocationData {
  name: string;
  value: number;
  rawValue: number;
}

export function AssetAllocation({ assets = [] }: AssetAllocationProps) {
  // Calculate allocation data from assets
  const calculateAllocationData = (): AllocationData[] => {
    if (!assets || assets.length === 0) {
      return [
        { name: "Stocks", value: 45, rawValue: 45000 },
        { name: "Bonds", value: 25, rawValue: 25000 },
        { name: "Crypto", value: 15, rawValue: 15000 },
        { name: "Real Estate", value: 10, rawValue: 10000 },
        { name: "Cash", value: 5, rawValue: 5000 },
      ];
    }

    // Calculate total value - use quote price if available, otherwise use stored value
    const totalValue = assets.reduce((sum, asset) => {
      // If asset has a quote with current price, use that for more accurate allocation
      const assetValue = (asset as any).quote?.price && asset.quantity 
        ? asset.quantity * (asset as any).quote.price 
        : asset.value;
      return sum + assetValue;
    }, 0);

    if (totalValue === 0) {
      return [{ name: "No assets", value: 100, rawValue: 0 }];
    }

    // Normalize and group by asset type
    const typeMap: { [key: string]: number } = {};
    
    assets.forEach(asset => {
      let type = (asset.asset_type || '').toLowerCase().trim();
      
      // Normalize asset types to match what's saved in ManagePortfolio
      if (!type || type === 'stock' || type === 'stocks') {
        type = 'stock';
      } else if (type === 'bond' || type === 'bonds') {
        type = 'bond';
      } else if (type === 'crypto' || type === 'cryptocurrency' || type === 'cryptocurrencies') {
        type = 'crypto';
      } else if (type === 'etf' || type === 'etfs') {
        type = 'etf';
      } else if (type === 'cash' || type === 'currency') {
        type = 'cash';
      } else if (type === 'real estate' || type === 'realestate') {
        type = 'real estate';
      } else {
        type = 'other';
      }

      // Calculate asset value (use current price if available, otherwise stored value)
      const assetValue = (asset as any).quote?.price && asset.quantity 
        ? asset.quantity * (asset as any).quote.price 
        : asset.value;

      typeMap[type] = (typeMap[type] || 0) + assetValue;
    });

    // Map to display names
    const typeNameMap: { [key: string]: string } = {
      'stock': 'Stocks',
      'bond': 'Bonds',
      'crypto': 'Crypto',
      'etf': 'ETF',
      'cash': 'Cash',
      'real estate': 'Real Estate',
      'other': 'Other',
    };

    // Convert to percentage and format, sort by value descending
    const allocationData = Object.entries(typeMap)
      .map(([type, value]) => ({
        name: typeNameMap[type] || type.charAt(0).toUpperCase() + type.slice(1),
        value: Math.round((value / totalValue) * 100),
        rawValue: value,
      }))
      .sort((a, b) => b.rawValue - a.rawValue); // Sort by value descending

    // Ensure percentages add up to 100% (adjust the largest if needed)
    const sum = allocationData.reduce((s, item) => s + item.value, 0);
    if (sum !== 100 && allocationData.length > 0) {
      allocationData[0].value += (100 - sum);
    }

    return allocationData;
  };

  const data = calculateAllocationData();
  return (
    <div className="asset-allocation-container">
      <div className="asset-allocation-card">
        <div className="asset-allocation-header">
          <h3 className="asset-allocation-title">Asset Allocation</h3>
          <p className="asset-allocation-subtitle">Distribution of your investments</p>
        </div>
        <div className="asset-allocation-content">
          <div className="asset-allocation-chart-wrapper">
            <div style={{ height: "200px", width: "200px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid rgba(34, 197, 94, 0.3)",
                      borderRadius: "8px",
                      color: "white",
                    }}
                    formatter={(value: number, name: string, props: any) => {
                      const payload = props.payload as AllocationData;
                      const dollarValue = payload?.rawValue || 0;
                      return [`${value}% ($${dollarValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`, "Allocation"];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="asset-allocation-legend">
              {data.map((item, index) => {
                const dollarValue = item.rawValue || 0;
                return (
                  <div key={item.name} className="asset-allocation-legend-item">
                    <div className="asset-allocation-legend-content">
                      <div
                        className="asset-allocation-legend-color"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="asset-allocation-legend-name">{item.name}</span>
                    </div>
                    <div className="asset-allocation-legend-values">
                      <span className="asset-allocation-legend-value">{item.value}%</span>
                      <span className="asset-allocation-legend-dollar">${dollarValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
