"""
AES Encryption utilities for sensitive data
"""
import base64
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import os

def get_encryption_key():
    """Get the encryption key from environment variables"""
    key = os.environ.get('AES_ENCRYPTION_KEY')
    if not key:
        raise ValueError("AES_ENCRYPTION_KEY not found in environment variables")
    return base64.b64decode(key)

def encrypt_data(data: str) -> str:
    """
    Encrypt sensitive data using AES encryption
    
    Args:
        data: String data to encrypt
        
    Returns:
        Base64 encoded encrypted string
    """
    if not data:
        return data
    
    key = get_encryption_key()
    cipher = AES.new(key, AES.MODE_CBC)
    iv = cipher.iv
    
    # Pad the data to be a multiple of 16 bytes
    padded_data = pad(data.encode('utf-8'), AES.block_size)
    
    # Encrypt
    encrypted = cipher.encrypt(padded_data)
    
    # Combine IV and encrypted data, then encode to base64
    encrypted_with_iv = iv + encrypted
    return base64.b64encode(encrypted_with_iv).decode('utf-8')

def decrypt_data(encrypted_data: str) -> str:
    """
    Decrypt AES encrypted data
    
    Args:
        encrypted_data: Base64 encoded encrypted string
        
    Returns:
        Decrypted string
    """
    if not encrypted_data:
        return encrypted_data
    
    key = get_encryption_key()
    
    # Decode from base64
    encrypted_with_iv = base64.b64decode(encrypted_data)
    
    # Extract IV and encrypted data
    iv = encrypted_with_iv[:16]
    encrypted = encrypted_with_iv[16:]
    
    # Decrypt
    cipher = AES.new(key, AES.MODE_CBC, iv)
    decrypted = unpad(cipher.decrypt(encrypted), AES.block_size)
    
    return decrypted.decode('utf-8')
