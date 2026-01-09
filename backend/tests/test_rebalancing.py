"""
Unit tests for rebalancing utilities
"""
import pytest
from app.utils.rebalancing import calculate_rebalancing, calculate_portfolio_metrics

def test_calculate_rebalancing():
    """Test rebalancing calculation"""
    current_holdings = [
        {'symbol': 'AAPL', 'value': 5000},
        {'symbol': 'GOOGL', 'value': 3000},
        {'symbol': 'MSFT', 'value': 2000},
    ]
    
    target_allocations = [
        {'symbol': 'AAPL', 'target_percentage': 40},
        {'symbol': 'GOOGL', 'target_percentage': 30},
        {'symbol': 'MSFT', 'target_percentage': 30},
    ]
    
    total_value = 10000
    
    recommendations = calculate_rebalancing(
        current_holdings,
        target_allocations,
        total_value
    )
    
    assert len(recommendations) == 3
    assert recommendations[0]['symbol'] == 'AAPL'
    assert recommendations[0]['target_value'] == 4000
    assert recommendations[0]['difference'] == -1000
    assert recommendations[0]['action'] == 'SELL'

def test_calculate_portfolio_metrics():
    """Test portfolio metrics calculation"""
    holdings = [
        {'symbol': 'AAPL', 'value': 5000},
        {'symbol': 'GOOGL', 'value': 3000},
        {'symbol': 'MSFT', 'value': 2000},
    ]
    
    metrics = calculate_portfolio_metrics(holdings, 10000)
    
    assert metrics['total_value'] == 10000
    assert metrics['num_holdings'] == 3
    assert metrics['largest_holding'] == 'AAPL'
    assert 0 <= metrics['diversification_score'] <= 1
