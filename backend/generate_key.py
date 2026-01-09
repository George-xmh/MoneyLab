"""
Generate AES encryption key for .env file
"""
from Crypto.Random import get_random_bytes
import base64

if __name__ == '__main__':
    key = base64.b64encode(get_random_bytes(32)).decode()
    print("=" * 60)
    print("Generated AES Encryption Key:")
    print("=" * 60)
    print(key)
    print("=" * 60)
    print("\nAdd this to your .env file as:")
    print(f"AES_ENCRYPTION_KEY={key}")
    print("\nKeep this key secure and never commit it to version control!")
