"""
MoneyLab Flask Application Factory
"""
from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
import os

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Configure logging
    import logging
    logging.basicConfig(level=logging.INFO)
    
    # Load configuration from environment variables
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # JWT Configuration
    jwt_secret = os.environ.get('JWT_SECRET_KEY', app.config['SECRET_KEY'])
    app.config['JWT_SECRET_KEY'] = jwt_secret
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  # For development
    app.config['JWT_ALGORITHM'] = 'HS256'
    
    # Log JWT config (without exposing the actual secret)
    logging.info(f"JWT_SECRET_KEY is set: {bool(jwt_secret)}")
    logging.info(f"JWT_SECRET_KEY length: {len(jwt_secret) if jwt_secret else 0}")
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
    
    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'error': 'Token has expired'}), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        from flask import request
        import logging
        import traceback
        logging.error(f"Invalid token error: {str(error)}")
        logging.error(f"Traceback: {traceback.format_exc()}")
        # Log the Authorization header if available
        auth_header = request.headers.get('Authorization', 'Not provided')
        logging.error(f"Authorization header present: {auth_header != 'Not provided'}")
        if auth_header != 'Not provided':
            logging.error(f"Authorization header prefix: {auth_header[:20]}")
            logging.error(f"Authorization header length: {len(auth_header)}")
        return jsonify({
            'error': 'Invalid token', 
            'details': str(error),
            'message': 'The JWT token is invalid. Please log in again.'
        }), 422
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        import logging
        logging.error(f"Missing token error: {str(error)}")
        auth_header = request.headers.get('Authorization', 'Not provided')
        logging.error(f"Authorization header: {auth_header[:50] if auth_header != 'Not provided' else 'Not provided'}")
        return jsonify({
            'error': 'Authorization token is missing', 
            'details': str(error),
            'message': 'Please log in to access this resource.'
        }), 401
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.portfolio import portfolio_bp
    from app.routes.assets import assets_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(portfolio_bp, url_prefix='/api/portfolio')
    app.register_blueprint(assets_bp, url_prefix='/api/assets')
    
    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'message': 'MoneyLab API is running'}, 200
    
    return app
