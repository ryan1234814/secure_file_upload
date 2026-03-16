"""
database.py
-----------
JSON-based metadata storage for uploaded files.
Stores filename, SHA-256 hash, file size, and upload timestamp.
No SQL database is used — all data persists in a single JSON file.
"""

import json
import os
from datetime import datetime, timezone
from typing import Optional

# Path to the JSON metadata file
DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "metadata.json")


def _load_db() -> dict:
    """Load the metadata database from disk."""
    if not os.path.exists(DB_FILE):
        return {}
    with open(DB_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {}


def _save_db(data: dict) -> None:
    """Persist the metadata database to disk."""
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=2)


def store_metadata(filename: str, sha256_hash: str, file_size: int) -> dict:
    """
    Store metadata for an uploaded file.

    Args:
        filename: Original filename.
        sha256_hash: SHA-256 hash of the original (plaintext) file.
        file_size: Size of the original file in bytes.

    Returns:
        The metadata record that was stored.
    """
    db = _load_db()

    record = {
        "filename": filename,
        "hash": sha256_hash,
        "file_size": file_size,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
    }

    db[filename] = record
    _save_db(db)
    return record


def get_metadata(filename: str) -> Optional[dict]:
    """
    Retrieve metadata for a specific file.

    Args:
        filename: Name of the file to look up.

    Returns:
        Metadata dict if found, None otherwise.
    """
    db = _load_db()
    return db.get(filename)


def get_all_metadata() -> list:
    """
    Retrieve metadata for all uploaded files.

    Returns:
        List of all metadata records.
    """
    db = _load_db()
    return list(db.values())


def delete_metadata(filename: str) -> bool:
    """
    Delete metadata for a specific file.

    Args:
        filename: Name of the file whose metadata to delete.

    Returns:
        True if deleted, False if not found.
    """
    db = _load_db()
    if filename in db:
        del db[filename]
        _save_db(db)
        return True
    return False
