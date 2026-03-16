import { useState } from "react";
import { verifyFile } from "../api";

/**
 * Verify Component
 * ----------------
 * Allows the user to manually enter a filename and verify its integrity.
 * Provides a standalone integrity check interface.
 */
export default function Verify() {
  const [filename, setFilename] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!filename.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await verifyFile(filename.trim());
      setResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || "Verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card verify-card">
      <div className="card-header">
        <div className="card-icon verify-icon-header">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <h2>Integrity Check</h2>
      </div>

      <form onSubmit={handleVerify} className="verify-form">
        <div className="input-group">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Enter filename to verify…"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="verify-input"
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!filename.trim() || loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span> Checking…
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Verify Integrity
            </>
          )}
        </button>
      </form>

      {result && (
        <div
          className={`verify-result fade-in ${
            result.integrity === "verified"
              ? "result-verified"
              : "result-tampered"
          }`}
        >
          <div className="result-icon">
            {result.integrity === "verified" ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )}
          </div>
          <div className="result-content">
            <h3>
              {result.integrity === "verified"
                ? "✓ Integrity Verified"
                : "⚠ File Has Been Modified"}
            </h3>
            <p className="result-filename">{result.filename}</p>
            {result.stored_hash && (
              <div className="hash-compare">
                <div>
                  <span className="hash-label">Stored Hash:</span>
                  <code>{result.stored_hash}</code>
                </div>
                {result.current_hash && (
                  <div>
                    <span className="hash-label">Current Hash:</span>
                    <code>{result.current_hash}</code>
                  </div>
                )}
              </div>
            )}
            {result.detail && <p className="result-detail">{result.detail}</p>}
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error fade-in">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </section>
  );
}
