"""
Portfolio rebalancing calculation utilities
"""
from typing import List, Dict

def calculate_rebalancing(
    current_holdings: List[Dict],
    target_allocations: List[Dict],
    total_value: float
) -> List[Dict]:
    """
    Calculate rebalancing recommendations
    
    Args:
        current_holdings: List of current asset holdings with 'symbol' and 'value'
        target_allocations: List of target allocations with 'symbol' and 'target_percentage'
        total_value: Total portfolio value
        
    Returns:
        List of rebalancing recommendations with buy/sell amounts
    """
    # Create dictionaries for easier lookup
    current_dict = {holding['symbol']: holding['value'] for holding in current_holdings}
    target_dict = {alloc['symbol']: alloc['target_percentage'] / 100 for alloc in target_allocations}
    
    recommendations = []
    
    for symbol, target_pct in target_dict.items():
        current_value = current_dict.get(symbol, 0)
        target_value = total_value * target_pct
        difference = target_value - current_value
        
        recommendations.append({
            'symbol': symbol,
            'current_value': current_value,
            'target_value': target_value,
            'current_percentage': (current_value / total_value * 100) if total_value > 0 else 0,
            'target_percentage': target_pct * 100,
            'difference': difference,
            'action': 'BUY' if difference > 0 else 'SELL' if difference < 0 else 'HOLD'
        })
    
    return recommendations

def calculate_portfolio_metrics(holdings: List[Dict], total_value: float) -> Dict:
    """
    Calculate portfolio metrics
    
    Args:
        holdings: List of holdings with 'symbol' and 'value'
        total_value: Total portfolio value
        
    Returns:
        Dictionary with portfolio metrics
    """
    if total_value == 0:
        return {
            'total_value': 0,
            'num_holdings': 0,
            'largest_holding': None,
            'diversification_score': 0
        }
    
    # Calculate diversification (inverse of concentration)
    # Using Herfindahl-Hirschman Index (HHI)
    percentages = [h['value'] / total_value for h in holdings]
    hhi = sum(p ** 2 for p in percentages)
    diversification_score = 1 - hhi  # Normalized to 0-1
    
    largest = max(holdings, key=lambda x: x['value']) if holdings else None
    
    return {
        'total_value': total_value,
        'num_holdings': len(holdings),
        'largest_holding': largest['symbol'] if largest else None,
        'diversification_score': round(diversification_score, 3)
    }
