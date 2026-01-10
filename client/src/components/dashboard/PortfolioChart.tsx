import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PortfolioChartProps {
  data?: Array<{ month: string; value: number }>;
  totalValue?: number;
}

type Period = "1W" | "1M" | "3M" | "1Y" | "All";

export function PortfolioChart({ data: propData, totalValue = 0 }: PortfolioChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("1Y");

  // Generate chart data based on portfolio value over time if no data provided
  const generateChartData = (period: Period) => {
    if (propData) {
      // Filter propData based on period
      const today = new Date();
      let daysToShow = 365; // Default to 1 year
      
      switch (period) {
        case "1W":
          daysToShow = 7;
          break;
        case "1M":
          daysToShow = 30;
          break;
        case "3M":
          daysToShow = 90;
          break;
        case "1Y":
          daysToShow = 365;
          break;
        case "All":
          return propData;
      }
      
      const cutoffDate = new Date(today);
      cutoffDate.setDate(cutoffDate.getDate() - daysToShow);
      
      return propData.filter((item, index) => {
        // For simplicity, if data is in chronological order, take last N items
        return index >= propData.length - daysToShow;
      });
    }
    
    let days = 30; // Default to 1 month
    switch (period) {
      case "1W":
        days = 7;
        break;
      case "1M":
        days = 30;
        break;
      case "3M":
        days = 90;
        break;
      case "1Y":
        days = 365;
        break;
      case "All":
        days = 365;
        break;
    }
    
    const data = [];
    const today = new Date();
    
    // Start at 45k and end at 125k with 3 ups and downs
    const startValue = 45000;
    const endValue = 125000;
    const totalGrowth = endValue - startValue;
    
    // Adjust start/end values based on period
    let periodStartValue = startValue;
    let periodEndValue = endValue;
    
    if (period === "1W") {
      // For 1 week, show a smaller range
      periodStartValue = endValue * 0.96;
      periodEndValue = endValue;
    } else if (period === "1M") {
      // For 1 month, show last portion of growth
      periodStartValue = startValue + (totalGrowth * 0.75);
      periodEndValue = endValue;
    } else if (period === "3M") {
      // For 3 months, show last half of growth
      periodStartValue = startValue + (totalGrowth * 0.5);
      periodEndValue = endValue;
    }
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const progress = (days - i) / days; // 0 to 1
      
      // Define key points for 3 ups and downs with heavier movements (progress from 0 to 1)
      const movements = [
        { progress: 0.20, change: -0.25 }, // First dip (heavier)
        { progress: 0.40, change: 0.30 },  // First recovery (heavier)
        { progress: 0.55, change: -0.18 }, // Second dip (heavier)
        { progress: 0.75, change: 0.35 },  // Second recovery (heavier)
        { progress: 0.88, change: -0.12 }, // Third dip (heavier)
        { progress: 1.00, change: 0.00 },  // Final recovery (ends at target)
      ];
      
      let currentMultiplier = 1;
      for (let j = 0; j < movements.length; j++) {
        if (progress <= movements[j].progress) {
          const prevProgress = j > 0 ? movements[j - 1].progress : 0;
          const prevChange = j > 0 ? movements[j - 1].change : 0;
          const segmentProgress = (progress - prevProgress) / (movements[j].progress - prevProgress);
          currentMultiplier = 1 + prevChange + (movements[j].change - prevChange) * segmentProgress;
          break;
        }
      }
      
      const value = periodStartValue + (periodEndValue - periodStartValue) * progress * currentMultiplier;
      
      // Add small smooth variation
      const smoothVariation = (Math.random() - 0.5) * 0.005;
      const finalValue = value * (1 + smoothVariation);
      
      data.push({ 
        month: "", // Empty string to hide dates
        value: Math.max(0, finalValue) 
      });
    }
    
    return data;
  };

  const data = useMemo(() => generateChartData(selectedPeriod), [selectedPeriod, propData, totalValue]);
  return (
    <div className="portfolio-chart-container">
      <div className="portfolio-chart-card">
        <div className="portfolio-chart-header">
          <div>
            <h3 className="portfolio-chart-title">Portfolio Performance</h3>
            <p className="portfolio-chart-subtitle">Track your portfolio growth over time</p>
          </div>
          <div className="portfolio-chart-periods">
            {(["1W", "1M", "3M", "1Y", "All"] as Period[]).map((period) => (
              <button
                key={period}
                className={`portfolio-chart-period-btn ${period === selectedPeriod ? "active" : ""}`}
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        <div className="portfolio-chart-content">
          <div style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  hide={true}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  style={{ fill: "rgba(255, 255, 255, 0.7)", fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                    borderRadius: "8px",
                    color: "white",
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Portfolio Value"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
