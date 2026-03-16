"""
encryption.py
-------------
Provides AES-256-GCM encryption and decryption utilities for secure file storage.
Uses the `cryptography` library for all cryptographic operations.

File format for encrypted data:
  [16 bytes IV/nonce] + [16 bytes GCM auth tag] + [encrypted ciphertext]
"""

import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# AES-256 key length in bytes
AES_KEY_SIZE = 32

# Path to the key file (stored alongside this module)
KEY_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "secret.key")


def generate_key() -> bytes:
    """
    Generate a new AES-256 key and persist it to disk.
    If a key already exists, load and return it instead.

    Returns:
        32-byte AES-256 key.
    """
    if os.path.exists(KEY_FILE):
        with open(KEY_FILE, "rb") as f:
            return f.read()

    key = AESGCM.generate_key(bit_length=256)
    with open(KEY_FILE, "wb") as f:
        f.write(key)
    return key


def encrypt_file(file_bytes: bytes) -> bytes:
    """
    Encrypt file bytes using AES-256-GCM.

    Args:
        file_bytes: Raw plaintext file bytes.

    Returns:
        Encrypted payload: nonce (12 bytes) + tag (16 bytes) + ciphertext.
    """
    key = generate_key()
    aesgcm = AESGCM(key)

    # 12-byte nonce recommended for AES-GCM
    nonce = os.urandom(12)
    # encrypt returns ciphertext + 16-byte tag appended
    encrypted = aesgcm.encrypt(nonce, file_bytes, None)

    # Store as: nonce + encrypted (which includes the tag)
    return nonce + encrypted


def decrypt_file(encrypted_bytes: bytes) -> bytes:
    """
    Decrypt file bytes that were encrypted with encrypt_file().

    Args:
        encrypted_bytes: The full encrypted payload (nonce + ciphertext + tag).

    Returns:
        Decrypted plaintext file bytes.

    Raises:
        cryptography.exceptions.InvalidTag: If the data has been tampered with.
    """
    key = generate_key()
    aesgcm = AESGCM(key)

    # Extract the 12-byte nonce
    nonce = encrypted_bytes[:12]
    # The rest is ciphertext + tag
    ciphertext_with_tag = encrypted_bytes[12:]

    return aesgcm.decrypt(nonce, ciphertext_with_tag, None)
