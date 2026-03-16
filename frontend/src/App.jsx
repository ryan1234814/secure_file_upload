import { useState, useEffect, useCallback } from "react";
import Upload from "./components/Upload";
import FileList from "./components/FileList";
import Verify from "./components/Verify";
import { getFiles } from "./api";

/**
 * App – Root Component
 * --------------------
 * Composes the Upload, FileList, and Verify components into a
 * single-page secure file upload dashboard.
 */
export default function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getFiles();
      setFiles(res.data.files || []);
    } catch {
      console.error("Failed to fetch files");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return (
    <div className="app">
      {/* Animated background particles */}
      <div className="bg-particles">
        <div className="particle p1"></div>
        <div className="particle p2"></div>
        <div className="particle p3"></div>
        <div className="particle p4"></div>
        <div className="particle p5"></div>
      </div>

      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <h1>Secure File Vault</h1>
              <p className="subtitle">
                AES-256 Encryption • SHA-256 Integrity Verification
              </p>
            </div>
          </div>
          <div className="header-badge">
            <span className="pulse-dot"></span>
            Secured
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="grid">
          <div className="grid-left">
            <Upload onUploadSuccess={fetchFiles} />
            <Verify />
          </div>
          <div className="grid-right">
            {loading ? (
              <section className="card">
                <div className="loading-state">
                  <span className="spinner large"></span>
                  <p>Loading files…</p>
                </div>
              </section>
            ) : (
              <FileList files={files} onRefresh={fetchFiles} />
            )}
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Secure File Upload System • AES-256-GCM Encryption • SHA-256
          Integrity Hashing
        </p>
      </footer>
    </div>
  );
}
