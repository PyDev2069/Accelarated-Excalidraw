import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_LABEL,
  THEME,
  UploadCloudIcon,
  FileIcon,
  CloseIcon,
  DownloadIcon,
  readFileWithProgress,
  formatSize,
} from "./themeAndIcons";

/**
 * UploadFileModal
 * ────────────────
 * Full-screen upload experience, rendered via a portal directly into
 * document.body — so it always covers the entire viewport regardless of
 * where ShapeFileBox sits in the DOM (sidebar column, canvas overlay,
 * whatever). All file selection (drag-and-drop or Browse) and validation
 * happens here; nothing upload-related lives in the small floating box.
 */
export function UploadFileModal({ dark, mode, onClose, onUpload }) {
  const t = dark ? THEME.dark : THEME.light;
  const [pendingFile, setPendingFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape" && !isUploading) onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, isUploading]);

  function validateAndSetFile(file) {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large (${formatSize(file.size)}). Max ${MAX_FILE_SIZE_LABEL}.`);
      setPendingFile(null);
      return;
    }
    setError(null);
    setPendingFile(file);
  }

  function handleBrowseChange(e) {
    validateAndSetFile(e.target.files?.[0]);
    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    if (isUploading) return;
    validateAndSetFile(e.dataTransfer.files?.[0]);
  }

  async function handleUploadClick() {
    if (!pendingFile) return;
    setIsUploading(true);
    setProgress(0);
    try {
      const dataURL = await readFileWithProgress(pendingFile, setProgress);
      await onUpload({
        name: pendingFile.name,
        type: pendingFile.type,
        size: pendingFile.size,
        dataURL,
        uploadedAt: Date.now(),
      });
      // onUpload closes the modal on success.
    } catch (err) {
      setIsUploading(false);
      setError(err.message || "Upload failed. Try again.");
    }
  }

  const modal = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(10, 9, 15, 0.72)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={() => !isUploading && onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          background: t.modalBg,
          borderRadius: 20,
          boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
          border: `1px solid ${t.lavenderBorder}`,
          padding: 28,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: t.heading }}>
              {mode === "replace" ? "Replace file" : "Upload a file"}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: t.textMuted }}>
              Attach a file to this shape
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            style={{
              width: 32, height: 32, borderRadius: 9,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "transparent", color: t.textMuted, border: "none",
              cursor: isUploading ? "not-allowed" : "pointer", opacity: isUploading ? 0.4 : 1,
              flexShrink: 0,
            }}
          >
            <CloseIcon width={18} height={18} />
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); if (!isUploading) setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && !pendingFile && fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragActive ? t.lavender : t.lavenderBorder}`,
            background: dragActive ? t.dropZoneBgActive : t.dropZoneBg,
            borderRadius: 16,
            padding: pendingFile ? 20 : "44px 20px",
            textAlign: "center",
            transition: "border-color 0.15s ease, background 0.15s ease",
            cursor: !pendingFile && !isUploading ? "pointer" : "default",
          }}
        >
          {!pendingFile ? (
            <>
              <UploadCloudIcon width={40} height={40} style={{ margin: "0 auto 14px", color: t.lavender }} />
              <p style={{ margin: "0 0 4px", fontSize: 14.5, fontWeight: 600, color: t.heading }}>
                Drag & drop a file here
              </p>
              <p style={{ margin: "0 0 16px", fontSize: 12.5, color: t.textMuted }}>or</p>
              <button
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                style={{
                  background: t.lavender, color: "#fff",
                  border: "none", borderRadius: 10, padding: "9px 20px",
                  fontSize: 13.5, fontWeight: 600, cursor: "pointer",
                }}
              >
                Browse Files
              </button>
              <p style={{ margin: "16px 0 0", fontSize: 11.5, color: t.textMuted }}>
                Any file type, up to {MAX_FILE_SIZE_LABEL}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleBrowseChange}
                style={{ display: "none" }}
              />
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                background: t.lavenderBg, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <FileIcon width={20} height={20} style={{ color: t.lavender }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: t.heading, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {pendingFile.name}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: t.textMuted }}>
                  {formatSize(pendingFile.size)}
                </p>
              </div>
              {!isUploading && (
                <button
                  onClick={(e) => { e.stopPropagation(); setPendingFile(null); setError(null); }}
                  title="Choose a different file"
                  style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "transparent", color: t.textMuted, border: "none", cursor: "pointer",
                  }}
                >
                  <CloseIcon width={15} height={15} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Progress bar */}
        {isUploading && (
          <div style={{ marginTop: 16 }}>
            <div style={{ height: 6, borderRadius: 999, background: t.progressTrack, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: t.lavender,
                  borderRadius: 999,
                  transition: "width 0.15s ease",
                }}
              />
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 12, color: t.textMuted, textAlign: "right" }}>
              {progress < 100 ? `Uploading… ${progress}%` : "Finishing up…"}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <p style={{ margin: "14px 0 0", fontSize: 12.5, color: t.danger, fontWeight: 500 }}>
            {error}
          </p>
        )}

        {/* Footer buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button
            onClick={onClose}
            disabled={isUploading}
            style={{
              flex: 1, background: t.surface, color: t.heading,
              border: `1px solid ${t.lavenderBorder}`, borderRadius: 11,
              padding: "11px 14px", fontSize: 13.5, fontWeight: 600,
              cursor: isUploading ? "not-allowed" : "pointer", opacity: isUploading ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleUploadClick}
            disabled={!pendingFile || isUploading}
            style={{
              flex: 1, background: t.lavender, color: "#fff",
              border: "none", borderRadius: 11, padding: "11px 14px",
              fontSize: 13.5, fontWeight: 600,
              cursor: !pendingFile || isUploading ? "not-allowed" : "pointer",
              opacity: !pendingFile || isUploading ? 0.5 : 1,
            }}
          >
            {isUploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

/**
 * FileViewerOverlay — fullscreen, no sidebar, no toolbar. Just the file
 * content filling the screen with a close button. Images render inline,
 * PDFs render in an iframe, everything else shows a "can't preview" card
 * with a Download button. Also rendered via portal for the same reason
 * as UploadFileModal.
 */
export function FileViewerOverlay({ file, onClose, onDownload }) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const isImage = file.type?.startsWith("image/");
  const isPdf = file.type === "application/pdf";

  const overlay = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2100,
        background: "rgba(10, 9, 15, 0.96)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        title="Close (Esc)"
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
          color: "#fff",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 2101,
        }}
      >
        <CloseIcon width={20} height={20} />
      </button>

      {isImage ? (
        <img
          src={file.dataURL}
          alt={file.name}
          style={{ maxWidth: "92vw", maxHeight: "92vh", objectFit: "contain" }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : isPdf ? (
        <iframe
          src={file.dataURL}
          title={file.name}
          style={{ width: "92vw", height: "92vh", border: "none", borderRadius: 8, background: "#fff" }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#1B1A27",
            border: "1px solid #3A3655",
            borderRadius: 16,
            padding: "40px 48px",
            textAlign: "center",
            color: "#EDEBFB",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
        >
          <FileIcon width={40} height={40} style={{ margin: "0 auto 16px", color: "#8A85B8" }} />
          <p style={{ fontSize: 16, fontWeight: 600, margin: "0 0 6px" }}>{file.name}</p>
          <p style={{ fontSize: 13, color: "#8A85B8", margin: "0 0 20px" }}>
            {formatSize(file.size)} — preview isn't available for this file type
          </p>
          <button
            onClick={onDownload}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#6965DB", color: "#fff",
              border: "none", borderRadius: 10, padding: "10px 20px",
              fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}
          >
            <DownloadIcon /> Download
          </button>
        </div>
      )}
    </div>
  );

  return createPortal(overlay, document.body);
}