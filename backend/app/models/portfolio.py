"""
Portfolio and asset models
"""
from app import db
from app.utils.encryption import encrypt_data, decrypt_data
from datetime import datetime

class Portfolio(db.Model):
    """Portfolio model"""
    __tablename__ = 'portfolios'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    
    # Encrypted total value
    _total_value_encrypted = db.Column(db.Text, name='total_value_encrypted')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    assets = db.relationship('Asset', backref='portfolio', lazy=True, cascade='all, delete-orphan')
    allocations = db.relationship('AssetAllocation', backref='portfolio', lazy=True, cascade='all, delete-orphan')
    
    @property
    def total_value(self):
        """Get decrypted total value"""
        if self._total_value_encrypted:
            try:
                return float(decrypt_data(self._total_value_encrypted))
            except:
                return 0.0
        return 0.0
    
    @total_value.setter
    def total_value(self, value):
        """Set encrypted total value"""
        if value is not None:
            self._total_value_encrypted = encrypt_data(str(value))
        else:
            self._total_value_encrypted = None
    
    def to_dict(self):
        """Convert portfolio to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'description': self.description,
            'total_value': self.total_value,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
    
    def __repr__(self):
        return f'<Portfolio {self.name}>'


class Asset(db.Model):
    """Asset holding model"""
    __tablename__ = 'assets'
    
    id = db.Column(db.Integer, primary_key=True)
    portfolio_id = db.Column(db.Integer, db.ForeignKey('portfolios.id'), nullable=False)
    symbol = db.Column(db.String(20), nullable=False)
    name = db.Column(db.String(255))
    asset_type = db.Column(db.String(50))  # e.g., 'stock', 'bond', 'crypto', 'etf'
    
    # Encrypted values
    _quantity_encrypted = db.Column(db.Text, name='quantity_encrypted')
    _price_encrypted = db.Column(db.Text, name='price_encrypted')
    _value_encrypted = db.Column(db.Text, name='value_encrypted')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    @property
    def quantity(self):
        """Get decrypted quantity"""
        if self._quantity_encrypted:
            try:
                return float(decrypt_data(self._quantity_encrypted))
            except:
                return 0.0
        return 0.0
    
    @quantity.setter
    def quantity(self, value):
        """Set encrypted quantity"""
        if value is not None:
            self._quantity_encrypted = encrypt_data(str(value))
        else:
            self._quantity_encrypted = None
    
    @property
    def price(self):
        """Get decrypted price"""
        if self._price_encrypted:
            try:
                return float(decrypt_data(self._price_encrypted))
            except:
                return 0.0
        return 0.0
    
    @price.setter
    def price(self, value):
        """Set encrypted price"""
        if value is not None:
            self._price_encrypted = encrypt_data(str(value))
        else:
            self._price_encrypted = None
    
    @property
    def value(self):
        """Get decrypted value"""
        if self._value_encrypted:
            try:
                return float(decrypt_data(self._value_encrypted))
            except:
                return 0.0
        return 0.0
    
    @value.setter
    def value(self, val):
        """Set encrypted value"""
        if val is not None:
            self._value_encrypted = encrypt_data(str(val))
        else:
            self._value_encrypted = None
    
    def to_dict(self):
        """Convert asset to dictionary"""
        return {
            'id': self.id,
            'portfolio_id': self.portfolio_id,
            'symbol': self.symbol,
            'name': self.name,
            'asset_type': self.asset_type,
            'quantity': self.quantity,
            'price': self.price,
            'value': self.value,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
    
    def __repr__(self):
        return f'<Asset {self.symbol}>'


class AssetAllocation(db.Model):
    """Target asset allocation model"""
    __tablename__ = 'asset_allocations'
    
    id = db.Column(db.Integer, primary_key=True)
    portfolio_id = db.Column(db.Integer, db.ForeignKey('portfolios.id'), nullable=False)
    symbol = db.Column(db.String(20), nullable=False)
    target_percentage = db.Column(db.Float, nullable=False)  # 0-100
    asset_type = db.Column(db.String(50))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert allocation to dictionary"""
        return {
            'id': self.id,
            'portfolio_id': self.portfolio_id,
            'symbol': self.symbol,
            'target_percentage': self.target_percentage,
            'asset_type': self.asset_type,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
    
    def __repr__(self):
        return f'<AssetAllocation {self.symbol}: {self.target_percentage}%>'
