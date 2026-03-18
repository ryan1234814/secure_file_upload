# Secure Web File Upload System - Technical Explanation

This document provides a detailed explanation of the project's backend execution, the implementation of cryptographic algorithms (AES-256 and SHA-256), and how these security features are demonstrated in the user interface.

## 1. Project Execution Flow (Backend)

The backend is built using **FastAPI**, a modern, fast (high-performance) web framework for building APIs with Python. The execution flow for the primary operations is as follows:

### A. File Upload & Encryption (`POST /upload`)
1.  **Reception**: The server receives a multipart file upload.
2.  **Hashing**: Before any encryption occurs, the system computes the **SHA-256 hash** of the original plaintext file bytes. This hash serves as the "gold standard" for integrity verification later.
3.  **Encryption**: The plaintext bytes are passed to the encryption module, where they are encrypted using **AES-256-GCM**.
4.  **Storage**:
    *   The **encrypted ciphertext** (plus a 12-byte nonce) is saved to the disk in the `backend/uploads/` directory.
    *   The **metadata** (filename, SHA-256 hash, and file size) is stored in a JSON-based "database" (`backend/metadata.json`).

### B. Integrity Verification (`GET /verify/{filename}`)
1.  **Metadata Retrieval**: The system fetches the previously stored SHA-256 hash for the given filename.
2.  **Decryption**: The encrypted file is read from disk. The system attempts to decrypt it using the stored AES key.
    *   **AES-GCM Authentication**: Since we use GCM (Galois/Counter Mode), if even a single bit of the ciphertext has been modified, the decryption will fail with an `InvalidTag` exception. This is a built-in integrity check for the encryption itself.
3.  **Re-Hashing**: If decryption succeeds, the system computes the SHA-256 hash of the *decrypted* bytes.
4.  **Comparison**: The re-computed hash is compared against the stored hash.
    *   If they match, the file is confirmed to be **Verified**.
    *   If they don't match (or if decryption failed), the file is marked as **Tampered**.

---

## 2. Algorithm Implementation

### AES-256-GCM (Encryption)
Located in `backend/encryption.py`, we use the `cryptography` library.
*   **Key Size**: 256-bit (32 bytes), generated using `AESGCM.generate_key(bit_length=256)`.
*   **Mode**: **GCM (Galois/Counter Mode)**, which provides both confidentiality and authenticity.
*   **Implementation Detail**:
    *   For every encryption, a unique **12-byte nonce** is generated using `os.urandom(12)`.
    *   The stored file format is: `[12-byte Nonce] + [Ciphertext] + [16-byte Auth Tag]`. (Note: The `cryptography` library's `encrypt` method returns the ciphertext with the tag appended).

### SHA-256 (Hashing)
Located in `backend/hashing.py`, we use the standard `hashlib` library.
*   **Purpose**: To ensure the file content exactly matches what was originally uploaded.
*   **Implementation Detail**: `hashlib.sha256().update(file_bytes)`. The result is stored as a hexadecimal string.

---

## 3. UI Demonstration

The React frontend provides a transparent way to see these cryptographic operations in action via the `FileList.jsx` component.

### Real-world Demonstration Steps:
1.  **Secure Upload**: When you upload a file, the UI shows a success message. Behind the scenes, the backend has already hashed and encrypted it.
2.  **Integrity Verification**: Clicking the **"Verify"** button triggers an API call that performs the decryption and hash comparison described above. The UI then displays a green "Integrity Verified" badge.
3.  **Simulated Tampering**: To demonstrate security, we added a **"Tamper"** button.
    *   This button calls `POST /tamper/{filename}`, which intentionally **flips random bits** in the encrypted file on the server's disk.
    *   Crucially, this modification happens *after* the file was encrypted, simulating an attacker modifying the raw data on a server.
4.  **Detection**: If you click "Verify" after tampering, the UI will display a red **"File Tampered"** badge. This occurs because either:
    *   The AES-GCM tag check failed (decryption error).
    *   The re-computed SHA-256 hash did not match the original.

This end-to-end flow proves that the system can reliably detect any unauthorized changes to stored files.
