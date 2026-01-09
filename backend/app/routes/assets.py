"""
Asset management routes
"""
from flask import Blueprint, request, jsonify
from app import db
from app.models.portfolio import Portfolio, Asset, AssetAllocation
from flask_jwt_extended import jwt_required, get_jwt_identity

assets_bp = Blueprint('assets', __name__)

@assets_bp.route('/portfolio/<int:portfolio_id>/assets', methods=['GET'])
@jwt_required()
def get_assets(portfolio_id):
    """Get all assets for a portfolio"""
    user_id = get_jwt_identity()
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=user_id).first()
    
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404
    
    assets = Asset.query.filter_by(portfolio_id=portfolio_id).all()
    return jsonify([a.to_dict() for a in assets]), 200

@assets_bp.route('/portfolio/<int:portfolio_id>/assets', methods=['POST'])
@jwt_required()
def create_asset(portfolio_id):
    """Add an asset to a portfolio"""
    user_id = get_jwt_identity()
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=user_id).first()
    
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404
    
    data = request.get_json()
    
    if not data or not data.get('symbol'):
        return jsonify({'error': 'Symbol is required'}), 400
    
    # Calculate value if quantity and price provided
    value = data.get('value')
    if value is None:
        quantity = data.get('quantity', 0)
        price = data.get('price', 0)
        value = quantity * price
    
    asset = Asset(
        portfolio_id=portfolio_id,
        symbol=data['symbol'],
        name=data.get('name', data['symbol']),
        asset_type=data.get('asset_type', 'stock'),
        quantity=data.get('quantity', 0),
        price=data.get('price', 0),
        value=value
    )
    
    db.session.add(asset)
    
    # Update portfolio total value
    portfolio.total_value = sum(a.value for a in portfolio.assets) + value
    
    db.session.commit()
    
    return jsonify(asset.to_dict()), 201

@assets_bp.route('/assets/<int:asset_id>', methods=['PUT'])
@jwt_required()
def update_asset(asset_id):
    """Update an asset"""
    user_id = get_jwt_identity()
    asset = Asset.query.get(asset_id)
    
    if not asset:
        return jsonify({'error': 'Asset not found'}), 404
    
    portfolio = Portfolio.query.filter_by(id=asset.portfolio_id, user_id=user_id).first()
    if not portfolio:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    if data.get('symbol'):
        asset.symbol = data['symbol']
    if data.get('name'):
        asset.name = data['name']
    if data.get('asset_type'):
        asset.asset_type = data['asset_type']
    if data.get('quantity') is not None:
        asset.quantity = data['quantity']
    if data.get('price') is not None:
        asset.price = data['price']
    if data.get('value') is not None:
        asset.value = data['value']
    elif data.get('quantity') is not None or data.get('price') is not None:
        # Recalculate value
        asset.value = asset.quantity * asset.price
    
    # Update portfolio total value
    portfolio.total_value = sum(a.value for a in portfolio.assets)
    
    db.session.commit()
    
    return jsonify(asset.to_dict()), 200

@assets_bp.route('/assets/<int:asset_id>', methods=['DELETE'])
@jwt_required()
def delete_asset(asset_id):
    """Delete an asset"""
    user_id = get_jwt_identity()
    asset = Asset.query.get(asset_id)
    
    if not asset:
        return jsonify({'error': 'Asset not found'}), 404
    
    portfolio = Portfolio.query.filter_by(id=asset.portfolio_id, user_id=user_id).first()
    if not portfolio:
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(asset)
    
    # Update portfolio total value
    portfolio.total_value = sum(a.value for a in portfolio.assets)
    
    db.session.commit()
    
    return jsonify({'message': 'Asset deleted'}), 200

@assets_bp.route('/portfolio/<int:portfolio_id>/allocations', methods=['GET'])
@jwt_required()
def get_allocations(portfolio_id):
    """Get target allocations for a portfolio"""
    user_id = get_jwt_identity()
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=user_id).first()
    
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404
    
    allocations = AssetAllocation.query.filter_by(portfolio_id=portfolio_id).all()
    return jsonify([a.to_dict() for a in allocations]), 200

@assets_bp.route('/portfolio/<int:portfolio_id>/allocations', methods=['POST'])
@jwt_required()
def create_allocation(portfolio_id):
    """Set target allocation for a portfolio"""
    user_id = get_jwt_identity()
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=user_id).first()
    
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404
    
    data = request.get_json()
    
    if not data or not data.get('symbol') or data.get('target_percentage') is None:
        return jsonify({'error': 'Symbol and target_percentage are required'}), 400
    
    # Check if allocation already exists
    existing = AssetAllocation.query.filter_by(
        portfolio_id=portfolio_id,
        symbol=data['symbol']
    ).first()
    
    if existing:
        existing.target_percentage = data['target_percentage']
        existing.asset_type = data.get('asset_type', existing.asset_type)
        db.session.commit()
        return jsonify(existing.to_dict()), 200
    
    allocation = AssetAllocation(
        portfolio_id=portfolio_id,
        symbol=data['symbol'],
        target_percentage=data['target_percentage'],
        asset_type=data.get('asset_type', 'stock')
    )
    
    db.session.add(allocation)
    db.session.commit()
    
    return jsonify(allocation.to_dict()), 201

@assets_bp.route('/allocations/<int:allocation_id>', methods=['DELETE'])
@jwt_required()
def delete_allocation(allocation_id):
    """Delete a target allocation"""
    user_id = get_jwt_identity()
    allocation = AssetAllocation.query.get(allocation_id)
    
    if not allocation:
        return jsonify({'error': 'Allocation not found'}), 404
    
    portfolio = Portfolio.query.filter_by(id=allocation.portfolio_id, user_id=user_id).first()
    if not portfolio:
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(allocation)
    db.session.commit()
    
    return jsonify({'message': 'Allocation deleted'}), 200
