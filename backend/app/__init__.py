"""
MoneyLab Flask Application Factory
"""
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
import os

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Load configuration from environment variables
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', app.config['SECRET_KEY'])
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  # For development
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
    
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
