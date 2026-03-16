import { useState } from "react";
import { verifyFile, tamperFile } from "../api";

/**
 * FileList Component
 * ------------------
 * Displays all uploaded files in a table with Verify and Tamper actions.
 * Shows real-time integrity status with colour-coded indicators.
 */
export default function FileList({ files, onRefresh }) {
  // Map of filename → { status, loading, detail }
  const [statuses, setStatuses] = useState({});

  const setFileStatus = (filename, data) => {
    setStatuses((prev) => ({ ...prev, [filename]: data }));
  };

  const handleVerify = async (filename) => {
    setFileStatus(filename, { status: "loading", detail: "Verifying…" });
    try {
      const res = await verifyFile(filename);
      setFileStatus(filename, {
        status: res.data.integrity,
        detail: res.data.detail || null,
      });
    } catch (err) {
      setFileStatus(filename, {
        status: "error",
        detail: err.response?.data?.detail || "Verification failed.",
      });
    }
  };

  const handleTamper = async (filename) => {
    setFileStatus(filename, { status: "loading", detail: "Tampering…" });
    try {
      await tamperFile(filename);
      setFileStatus(filename, {
        status: "tampered-action",
        detail: "File bytes modified. Run Verify to detect.",
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      setFileStatus(filename, {
        status: "error",
        detail: err.response?.data?.detail || "Tamper request failed.",
      });
    }
  };

  const getStatusBadge = (filename) => {
    const s = statuses[filename];
    if (!s) return null;

    if (s.status === "loading") {
      return (
        <span className="badge badge-loading">
          <span className="spinner small"></span> {s.detail}
        </span>
      );
    }
    if (s.status === "verified") {
      return (
        <span className="badge badge-verified">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Integrity Verified
        </span>
      );
    }
    if (s.status === "tampered") {
      return (
        <span className="badge badge-tampered">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          File Tampered
        </span>
      );
    }
    if (s.status === "tampered-action") {
      return (
        <span className="badge badge-warning">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {s.detail}
        </span>
      );
    }
    if (s.status === "error") {
      return <span className="badge badge-error">{s.detail}</span>;
    }
    return null;
  };

  if (!files || files.length === 0) {
    return (
      <section className="card">
        <div className="card-header">
          <div className="card-icon files-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2>Uploaded Files</h2>
        </div>
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="empty-icon">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <p>No files uploaded yet</p>
          <span>Upload a file to get started</span>
        </div>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="card-header">
        <div className="card-icon files-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h2>Uploaded Files</h2>
        <span className="file-count">{files.length} file{files.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="file-list">
        {files.map((f) => (
          <div key={f.filename} className="file-row">
            <div className="file-info">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="file-icon-small">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <div>
                <span className="file-row-name">{f.filename}</span>
                <span className="file-row-meta">
                  {(f.file_size / 1024).toFixed(1)} KB •{" "}
                  {new Date(f.uploaded_at).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="file-actions">
              <button
                className="btn btn-sm btn-verify"
                onClick={() => handleVerify(f.filename)}
                disabled={statuses[f.filename]?.status === "loading"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Verify
              </button>
              <button
                className="btn btn-sm btn-tamper"
                onClick={() => handleTamper(f.filename)}
                disabled={statuses[f.filename]?.status === "loading"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Tamper
              </button>
            </div>

            {getStatusBadge(f.filename) && (
              <div className="file-status fade-in">
                {getStatusBadge(f.filename)}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
