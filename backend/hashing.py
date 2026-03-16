"""
hashing.py
----------
Provides SHA-256 hashing utilities for file integrity verification.
Uses Python's built-in hashlib for cryptographic hashing.
"""

import hashlib


def generate_sha256(file_bytes: bytes) -> str:
    """
    Generate a SHA-256 hash for the given file bytes.

    Args:
        file_bytes: Raw bytes of the file to hash.

    Returns:
        Hexadecimal string representation of the SHA-256 hash.
    """
    sha256_hash = hashlib.sha256()
    sha256_hash.update(file_bytes)
    return sha256_hash.hexdigest()
