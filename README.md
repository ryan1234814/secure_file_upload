# 🔒 Secure File Vault

A secure web application for uploading, encrypting, and verifying file integrity. Built with **React + Vite** (frontend) and **FastAPI** (backend).

## Features

- **AES-256-GCM Encryption** — All uploaded files are encrypted before storage
- **SHA-256 Integrity Verification** — Detects if stored files have been tampered with
- **Tamper Demonstration** — Intentionally corrupt a file to see integrity detection in action
- **Drag & Drop Upload** — Modern file upload interface
- **No SQL Database** — Metadata stored in a simple JSON file

---

## Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | React 19, Vite 8, Axios            |
| Backend  | Python, FastAPI, Uvicorn            |
| Security | `cryptography` (AES-256-GCM), `hashlib` (SHA-256) |
| Storage  | Encrypted files on disk, JSON metadata |

---

## Project Structure

```
secure_web_file_upload_system/
├── backend/
│   ├── main.py            # FastAPI app & API endpoints
│   ├── encryption.py      # AES-256-GCM encrypt/decrypt
│   ├── hashing.py         # SHA-256 hash generation
│   ├── storage.py         # Encrypted file I/O
│   ├── database.py        # JSON metadata storage
│   ├── requirements.txt   # Python dependencies
│   └── uploads/           # Encrypted file storage
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Upload.jsx    # File upload UI
│   │   │   ├── FileList.jsx  # File list with actions
│   │   │   └── Verify.jsx    # Integrity check UI
│   │   ├── App.jsx           # Root component
│   │   ├── api.js            # Axios API layer
│   │   ├── index.css         # Global styles
│   │   └── main.jsx          # Entry point
│   ├── index.html
│   └── package.json
└── README.md
```

---

## Running the Project

### 1. Backend

```bash
cd backend
pip3 install -r requirements.txt --break-system-packages
uvicorn main:app --reload --port 8000
```

The API will be available at **http://localhost:8000**.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The UI will be available at **http://localhost:5173**.

---

## API Endpoints

| Method | Endpoint             | Description                           |
| ------ | -------------------- | ------------------------------------- |
| GET    | `/`                  | Health check                          |
| POST   | `/upload`            | Upload & encrypt a file               |
| GET    | `/files`             | List all uploaded files               |
| GET    | `/verify/{filename}` | Verify file integrity                 |
| POST   | `/tamper/{filename}` | Intentionally corrupt a file (demo)   |

---

## Workflow

1. **Upload** → User selects file → Backend hashes (SHA-256) → Encrypts (AES-256-GCM) → Stores encrypted file + metadata
2. **Verify** → Backend decrypts file → Recomputes SHA-256 → Compares with stored hash → Returns verified/tampered
3. **Tamper** → Modifies bytes in the encrypted file on disk → Next verify detects modification
