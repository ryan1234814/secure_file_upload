"""
storage.py
----------
Handles reading and writing encrypted files to the uploads/ directory.
Files are stored with their original name inside the uploads/ folder.
"""

import os

# Directory where encrypted files are stored
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")

# Ensure the uploads directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)


def save_encrypted_file(filename: str, encrypted_bytes: bytes) -> str:
    """
    Save encrypted file bytes to disk.

    Args:
        filename: Original filename (used as the storage key).
        encrypted_bytes: AES-encrypted file content.

    Returns:
        The full path where the file was saved.

    Raises:
        FileExistsError: If a file with the same name already exists.
    """
    filepath = os.path.join(UPLOAD_DIR, filename)

    if os.path.exists(filepath):
        raise FileExistsError(f"File '{filename}' already exists. Cannot overwrite.")

    with open(filepath, "wb") as f:
        f.write(encrypted_bytes)

    return filepath


def load_encrypted_file(filename: str) -> bytes:
    """
    Load encrypted file bytes from disk.

    Args:
        filename: Name of the file to load.

    Returns:
        Raw encrypted bytes read from the file.

    Raises:
        FileNotFoundError: If the file does not exist.
    """
    filepath = os.path.join(UPLOAD_DIR, filename)

    if not os.path.exists(filepath):
        raise FileNotFoundError(f"File '{filename}' not found.")

    with open(filepath, "rb") as f:
        return f.read()


def file_exists(filename: str) -> bool:
    """Check if a file exists in the uploads directory."""
    return os.path.exists(os.path.join(UPLOAD_DIR, filename))
