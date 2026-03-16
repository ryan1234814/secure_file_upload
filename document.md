# Secure File Upload System - Technical Document

## 2. Abstract
The Secure Web File Upload System is a full-stack application designed to demonstrate the reliable and secure handling, storage, and retrieval of sensitive files over the web. Its primary focus is on robust cryptographic protection for user-uploaded data, ensuring that files remain confidential and tamper-evident during their lifecycle. By combining a modern React frontend with a performant FastAPI backend, the system offers an intuitive dashboard for users while enforcing strict security rules behind the scenes. It employs the AES-256-GCM authenticated encryption mode to secure file contents at rest, guaranteeing both privacy and origin authenticity. Additionally, it computes SHA-256 cryptographic hashes for every uploaded file, providing a mathematical fingerprint used to verify data integrity upon retrieval. The main security goal forms a reliable foundation against data breaches and unauthorized modifications, demonstrating how modern cryptographic techniques can effectively mitigate critical cloud storage vulnerabilities.

## 3. Introduction
The purpose of this project is to create a secure, end-to-end encrypted file storage solution that guards against both data exposure and silent data corruption. In modern web environments, where users continually upload sensitive personal, financial, or proprietary documents to cloud platforms, the importance of security in the selected system cannot be overstated. Standard file upload mechanisms often store files in plaintext or rely solely on overarching volume encryption, which fails to protect individual files if the application layer or storage instances are compromised. This project solves this problem by enforcing application-level cryptographic controls. Files are transparently encrypted and hashed before they are ever written to the server's local disk, meaning that even a full external breach of the storage directory will only yield useless encrypted ciphertext and random checksums, effectively neutralizing unauthorized data access and tampering threats.

## 4. Objectives
- Implement a secure file upload pipeline that encrypts user data upon receipt before writing to disk.
- Utilize industry-standard cryptographic primitives (AES-256-GCM) to ensure both file confidentiality and authenticity.
- Provide a robust integrity-checking mechanism using SHA-256 hashing to verify files remain completely unmodified over time.
- Develop a built-in tamper demonstration tool to simulate and verify the system's ability to detect unauthorized unauthorized ciphertext modifications.
- Create an intuitive, animated web application dashboard (React) that provides real-time feedback on upload statuses and file integrity.
- Build a performant, asynchronous RESTful backend API (FastAPI) capable of securely processing multipart file uploads.

## 6. Implementation
The project was implemented as a modular full-stack application utilizing Python for the backend and JavaScript for the frontend. 
- **Frontend**: The user interface was built using **React** and explicitly bootstrapped with **Vite** for rapid development and optimized builds. It utilizes **Axios** to manage asynchronous REST API requests and features a glassmorphism-inspired UI with pure CSS animations carefully avoiding heavy external UI libraries. 
- **Backend**: The server environment operates on **FastAPI**, an asynchronous Python web framework running on the **Uvicorn** ASGI server. 
- **Security Libraries**: Cryptographic functionality relies heavily on the standard Python **hashlib** library for producing SHA-256 digests and the respected **cryptography** package for executing AES-256-GCM encryption and decryption.
- **Major Modules**:
  - `main.py`: The core FastAPI application handling CORS, routing, and HTTP lifecycle.
  - `encryption.py`: Responsible for symmetric key generation, loading, and AES-GCM encryption/decryption routines.
  - `hashing.py`: Contains utility functions specifically for computing the SHA-256 hashes of raw file bytestreams.
  - `storage.py`: Manages the secure reading and writing of encrypted binary ciphertext to the host filesystem.
  - `database.py`: Handles persistent tracking of file metadata, such as relationships between filenames, sizes, and their verified hash fingerprints within a JSON store.

## 7. Cryptographic Techniques Used
The platform utilizes two primary cryptographic techniques:
- **AES-256-GCM (Advanced Encryption Standard in Galois/Counter Mode)**: This algorithm provides Authenticated Encryption with Associated Data (AEAD). It utilizes a 256-bit symmetric key to encrypt the raw file bytes, guaranteeing **Confidentiality** (unauthorized parties cannot read the data). Uniquely, the GCM mode also appends an authentication tag to the ciphertext. During decryption, if the ciphertext (or the tag itself) has been altered by even a single bit, the tag validation fails, thereby ensuring **Authentication and Integrity** at the encryption layer.
- **SHA-256 (Secure Hash Algorithm 256-bit)**: Alongside encryption, the system computes a one-way cryptographic hash of the plaintext file bytes. This generates a fixed-size 256-bit signature unique to the exact file contents. By securely storing this hash, the system can later decrypt a file, recompute its hash, and compare the two. This strict matching process ensures the definitive **Integrity** of the data, proving it has not been modified, corrupted, or replaced since the moment it was initially hashed.

## 8. OWASP Top 10 Security Analysis
This project actively demonstrates defenses against several critical OWASP Top 10 web application security risks:
- **A02:2021 – Cryptographic Failures**: The project directly prevents cryptographic failures by utilizing a strong, modern algorithm (AES-256) instead of obsolete or weak ciphers (like DES or early block cipher modes). By keeping encryption keys out of the source code and securely utilizing GCM for authenticated encryption, it correctly implements cryptography at rest, ensuring that compromised storage data remains indecipherable to attackers.
- **A08:2021 – Software and Data Integrity Failures**: The project inherently defends against data integrity failures through its SHA-256 hashing and AES-GCM tag verification. It guarantees that the artifacts retrieved from storage are precisely what was originally uploaded. The tampering demonstration endpoint specifically proves the system's resilience by rejecting data that has been modified outside the application's trusted procedures.

By explicitly encrypting files at the application level rather than relying solely on the database or cloud provider for generic volume encryption, the system drastically improves security by adhering to a defense-in-depth approach.

## 11. Conclusion
The Secure File Upload System successfully implemented an end-to-end secure storage solution featuring a modern React frontend and a FastAPI backend. By combining AES-256-GCM encryption and SHA-256 hashing, the project expertly demonstrates the critical security concepts of data confidentiality, origin authenticity, and strict data integrity. The system benefits organizations by offering a foolproof mechanism to ensure that sensitive uploaded files cannot be accessed or stealthily modified by unauthorized users, hackers, or malicious server administrators. The immediate feedback loop provided by the integrity verification dashboard makes it effortless to detect anomalies and guarantees trust in data permanence.

## 12. Future Improvements
1. **Dynamic Key Management Service (KMS)**: Instead of utilizing a single static symmetric key loaded from the filesystem, the system could integrate with a cloud KMS (like AWS KMS or HashiCorp Vault) to perform envelope encryption, where every file receives a unique data key secured by a master rotation key.
2. **Rate Limiting & Anti-Malware Integration**: Implement robust API rate-limiting to prevent denial-of-service or storage exhaustion attacks. Additionally, the backend could pipe the decrypted file byte stream through an antivirus or malware scanning engine prior to authorizing download access.
3. **Secure Authentication & Authorization**: Add a comprehensive user authentication system using OAuth2 or JWTs, restricting file uploads and decryption requests solely to the authenticated user who originally uploaded the artifact.
