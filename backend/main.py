"""
main.py
-------
FastAPI application providing secure file upload, AES-256-GCM encryption,
SHA-256 integrity verification, and a tamper-demonstration endpoint.

Endpoints:
    POST /upload          — Upload & encrypt a file
    GET  /files           — List all uploaded files
    GET  /verify/{name}   — Verify file integrity
    POST /tamper/{name}   — Intentionally corrupt a file (demo)
"""

import os
import random

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from hashing import generate_sha256
from encryption import encrypt_file, decrypt_file
from storage import save_encrypted_file, load_encrypted_file, file_exists, UPLOAD_DIR
from database import store_metadata, get_metadata, get_all_metadata

# ──────────────────────────────────────────────
# App initialisation
# ──────────────────────────────────────────────

app = FastAPI(
    title="Secure File Upload System",
    description="Upload, encrypt, and verify file integrity.",
    version="1.0.0",
)

# Allow the React dev server to communicate with the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────
# POST /upload
# ──────────────────────────────────────────────

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Receive a file, hash it, encrypt it, and store both the
    encrypted file and its metadata.
    """
    # Validate file
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    # Prevent overwriting existing files
    if file_exists(file.filename):
        raise HTTPException(
            status_code=409,
            detail=f"File '{file.filename}' already exists. Cannot overwrite.",
        )

    # Read raw bytes
    file_bytes = await file.read()

    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Generate SHA-256 hash of the original plaintext
    sha256_hash = generate_sha256(file_bytes)

    # Encrypt the file
    encrypted_bytes = encrypt_file(file_bytes)

    # Save encrypted file to disk
    try:
        save_encrypted_file(file.filename, encrypted_bytes)
    except FileExistsError as e:
        raise HTTPException(status_code=409, detail=str(e))

    # Store metadata
    store_metadata(file.filename, sha256_hash, len(file_bytes))

    return {
        "filename": file.filename,
        "hash": sha256_hash,
        "file_size": len(file_bytes),
        "status": "uploaded securely",
    }


# ──────────────────────────────────────────────
# GET /files
# ──────────────────────────────────────────────

@app.get("/files")
async def list_files():
    """Return metadata for every uploaded file."""
    files = get_all_metadata()
    return {"files": files}


# ──────────────────────────────────────────────
# GET /verify/{filename}
# ──────────────────────────────────────────────

@app.get("/verify/{filename}")
async def verify_file(filename: str):
    """
    Decrypt the stored file, recompute its SHA-256 hash,
    and compare with the stored hash to verify integrity.
    """
    # Check metadata exists
    metadata = get_metadata(filename)
    if metadata is None:
        raise HTTPException(status_code=404, detail=f"No metadata for '{filename}'.")

    # Check encrypted file exists
    if not file_exists(filename):
        raise HTTPException(
            status_code=404, detail=f"Encrypted file '{filename}' not found on disk."
        )

    # Load and decrypt
    try:
        encrypted_bytes = load_encrypted_file(filename)
        decrypted_bytes = decrypt_file(encrypted_bytes)
    except Exception as e:
        # If decryption fails (e.g. InvalidTag due to tampering), the file
        # has definitely been modified at the ciphertext level.
        return {
            "filename": filename,
            "stored_hash": metadata["hash"],
            "current_hash": None,
            "integrity": "tampered",
            "detail": f"Decryption failed — file has been modified. ({type(e).__name__})",
        }

    # Recompute hash
    current_hash = generate_sha256(decrypted_bytes)
    stored_hash = metadata["hash"]

    if current_hash == stored_hash:
        return {
            "filename": filename,
            "stored_hash": stored_hash,
            "current_hash": current_hash,
            "integrity": "verified",
        }
    else:
        return {
            "filename": filename,
            "stored_hash": stored_hash,
            "current_hash": current_hash,
            "integrity": "tampered",
            "detail": "SHA-256 hash mismatch — file content has been altered.",
        }


# ──────────────────────────────────────────────
# POST /tamper/{filename}
# ──────────────────────────────────────────────

@app.post("/tamper/{filename}")
async def tamper_file(filename: str):
    """
    Intentionally modify a few bytes of the encrypted file on disk.
    This simulates file tampering so the integrity check can detect it.
    """
    if not file_exists(filename):
        raise HTTPException(
            status_code=404, detail=f"File '{filename}' not found."
        )

    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "rb") as f:
        data = bytearray(f.read())

    if len(data) < 20:
        raise HTTPException(
            status_code=400,
            detail="File too small to tamper safely.",
        )

    # Flip random bytes in the ciphertext region (after the 12-byte nonce)
    num_bytes_to_flip = min(10, len(data) - 12)
    for _ in range(num_bytes_to_flip):
        pos = random.randint(12, len(data) - 1)
        data[pos] = (data[pos] + random.randint(1, 255)) % 256

    with open(filepath, "wb") as f:
        f.write(data)

    return {
        "filename": filename,
        "status": "tampered",
        "detail": f"{num_bytes_to_flip} bytes modified in encrypted file.",
    }


# ──────────────────────────────────────────────
# Health check
# ──────────────────────────────────────────────

@app.get("/")
async def root():
    return {"message": "Secure File Upload System API is running."}
