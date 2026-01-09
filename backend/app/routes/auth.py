"""
Authentication routes
"""
from flask import Blueprint, request, jsonify
from app import db
from app.models.user import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/verify', methods=['POST'])
def verify_firebase_token():
    """
    Verify Firebase token and create/get user
    Expects: { "firebase_uid": "...", "email": "...", "display_name": "..." }
    """
    data = request.get_json()
    
    if not data or not data.get('firebase_uid') or not data.get('email'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    firebase_uid = data['firebase_uid']
    email = data['email']
    display_name = data.get('display_name', '')
    
    # Find or create user
    user = User.query.filter_by(firebase_uid=firebase_uid).first()
    
    if not user:
        user = User(
            firebase_uid=firebase_uid,
            email=email,
            display_name=display_name
        )
        db.session.add(user)
        db.session.commit()
    else:
        # Update user info if changed
        user.email = email
        if display_name:
            user.display_name = display_name
        db.session.commit()
    
    # Create JWT token
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'access_token': access_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current authenticated user"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200
