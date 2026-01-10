"""
Portfolio management routes
"""
from flask import Blueprint, request, jsonify
from app import db
from app.models.portfolio import Portfolio, Asset, AssetAllocation
from app.models.user import User
from app.utils.rebalancing import calculate_rebalancing, calculate_portfolio_metrics
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
import logging

logger = logging.getLogger(__name__)

portfolio_bp = Blueprint('portfolio', __name__)

@portfolio_bp.route('', methods=['GET'])
@jwt_required()
def get_portfolios():
    """Get all portfolios for current user"""
    try:
        # Debug: Log token info
        token_data = get_jwt()
        user_id = int(get_jwt_identity())
        
        logger.info(f"Token data: {token_data}")
        logger.info(f"User ID from token: {user_id}")
        
        if not user_id:
            return jsonify({'error': 'Invalid user ID in token'}), 401
        
        portfolios = Portfolio.query.filter_by(user_id=user_id).all()
        return jsonify([p.to_dict() for p in portfolios]), 200
    except Exception as e:
        logger.error(f"Error in get_portfolios: {str(e)}")
        return jsonify({'error': str(e)}), 500

@portfolio_bp.route('', methods=['POST'])
@jwt_required()
def create_portfolio():
    """Create a new portfolio"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'error': 'Portfolio name is required'}), 400
    
    portfolio = Portfolio(
        user_id=user_id,
        name=data['name'],
        description=data.get('description', ''),
        total_value=data.get('total_value', 0.0)
    )
    
    db.session.add(portfolio)
    db.session.commit()
    
    return jsonify(portfolio.to_dict()), 201

@portfolio_bp.route('/<int:portfolio_id>', methods=['GET'])
@jwt_required()
def get_portfolio(portfolio_id):
    """Get a specific portfolio with assets and allocations"""
    user_id = int(get_jwt_identity())
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=user_id).first()
    
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404
    
    portfolio_dict = portfolio.to_dict()
    portfolio_dict['assets'] = [a.to_dict() for a in portfolio.assets]
    portfolio_dict['allocations'] = [a.to_dict() for a in portfolio.allocations]
    
    return jsonify(portfolio_dict), 200

@portfolio_bp.route('/<int:portfolio_id>', methods=['PUT'])
@jwt_required()
def update_portfolio(portfolio_id):
    """Update a portfolio"""
    user_id = int(get_jwt_identity())
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=user_id).first()
    
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404
    
    data = request.get_json()
    if data.get('name'):
        portfolio.name = data['name']
    if data.get('description') is not None:
        portfolio.description = data['description']
    if data.get('total_value') is not None:
        portfolio.total_value = data['total_value']
    
    db.session.commit()
    
    return jsonify(portfolio.to_dict()), 200

@portfolio_bp.route('/<int:portfolio_id>', methods=['DELETE'])
@jwt_required()
def delete_portfolio(portfolio_id):
    """Delete a portfolio"""
    user_id = int(get_jwt_identity())
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=user_id).first()
    
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404
    
    db.session.delete(portfolio)
    db.session.commit()
    
    return jsonify({'message': 'Portfolio deleted'}), 200

@portfolio_bp.route('/<int:portfolio_id>/rebalance', methods=['GET'])
@jwt_required()
def get_rebalancing_recommendations(portfolio_id):
    """Get rebalancing recommendations for a portfolio"""
    user_id = int(get_jwt_identity())
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=user_id).first()
    
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404
    
    # Get current holdings
    current_holdings = [
        {'symbol': asset.symbol, 'value': asset.value}
        for asset in portfolio.assets
    ]
    
    # Get target allocations
    target_allocations = [
        {'symbol': alloc.symbol, 'target_percentage': alloc.target_percentage}
        for alloc in portfolio.allocations
    ]
    
    if not target_allocations:
        return jsonify({'error': 'No target allocations set'}), 400
    
    # Calculate rebalancing
    recommendations = calculate_rebalancing(
        current_holdings,
        target_allocations,
        portfolio.total_value
    )
    
    # Calculate metrics
    metrics = calculate_portfolio_metrics(current_holdings, portfolio.total_value)
    
    return jsonify({
        'recommendations': recommendations,
        'metrics': metrics
    }), 200
