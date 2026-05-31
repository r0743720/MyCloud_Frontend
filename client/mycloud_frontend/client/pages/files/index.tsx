import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import FileService from "@/services/FileService";
import { FileItem, StatusMessage } from "@/types";

const getFileIcon = (fileType: string): string => {
  const type = fileType?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(type)) return "🖼️";
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(type)) return "🎬";
  if (["mp3", "wav", "flac", "aac"].includes(type)) return "🎵";
  if (["pdf"].includes(type)) return "📄";
  if (["doc", "docx"].includes(type)) return "📝";
  if (["xls", "xlsx", "csv"].includes(type)) return "📊";
  if (["zip", "rar", "tar", "gz"].includes(type)) return "🗜️";
  if (["ppt", "pptx"].includes(type)) return "📋";
  if (["js", "ts", "py", "java", "html", "css", "json"].includes(type)) return "💻";
  return "📁";
};

const formatBytes = (bytes: number): string => {
  if (bytes >= 1_073_741_824) return (bytes / 1_073_741_824).toFixed(1) + " GB";
  if (bytes >= 1_048_576) return (bytes / 1_048_576).toFixed(1) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
  return bytes + " B";
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const Files = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [filtered, setFiltered] = useState<FileItem[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  useEffect(() => {
    const user = sessionStorage.getItem("loggedInUser");
    if (!user) {
      router.push("/login");
      return;
    }
    fetchFiles();
  }, []);

  useEffect(() => {
    let result = files;
    if (search) {
      result = result.filter((f) =>
        f.fileName.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (typeFilter !== "all") {
      result = result.filter((f) => f.fileType?.toLowerCase() === typeFilter);
    }
    setFiltered(result);
  }, [search, typeFilter, files]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await FileService.getAll();
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch {
      setStatusMessage({ message: "Failed to load files.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setStatusMessage(null);
    try {
      const res = await FileService.upload(file);
      if (res.ok) {
        setStatusMessage({ message: `${file.name} uploaded successfully.`, type: "success" });
        fetchFiles();
      } else {
        setStatusMessage({ message: "Upload failed.", type: "error" });
      }
    } catch {
      setStatusMessage({ message: "Upload failed.", type: "error" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = (file: FileItem) => {
    FileService.download(file.id, file.fileName);
  };

  const startRename = (file: FileItem) => {
    setRenamingId(file.id);
    setRenameValue(file.fileName);
  };

  const confirmRename = async (id: number) => {
    if (!renameValue.trim()) return;
    try {
      const res = await FileService.rename(id, renameValue.trim());
      if (res.ok) {
        setStatusMessage({ message: "File renamed.", type: "success" });
        fetchFiles();
      } else {
        setStatusMessage({ message: "Rename failed.", type: "error" });
      }
    } catch {
      setStatusMessage({ message: "Rename failed.", type: "error" });
    } finally {
      setRenamingId(null);
      setRenameValue("");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await FileService.remove(id);
      if (res.ok) {
        setStatusMessage({ message: "File deleted.", type: "success" });
        setFiles((prev) => prev.filter((f) => f.id !== id));
      } else {
        setStatusMessage({ message: "Delete failed.", type: "error" });
      }
    } catch {
      setStatusMessage({ message: "Delete failed.", type: "error" });
    } finally {
      setConfirmDeleteId(null);
    }
  };

  // Unique file types for filter dropdown
  const fileTypes = ["all", ...Array.from(new Set(files.map((f) => f.fileType?.toLowerCase()).filter(Boolean)))];

  return (
    <>
      <Navbar />
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h4 fw-bold text-primary mb-0">Files</h1>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              className="d-none"
              onChange={handleUpload}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Uploading...
                </>
              ) : (
                "⬆ Upload File"
              )}
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className={`alert alert-${statusMessage.type === "success" ? "success" : "danger"} alert-dismissible`}>
            {statusMessage.message}
            <button className="btn-close" onClick={() => setStatusMessage(null)} />
          </div>
        )}

        {/* Filters */}
        <div className="row g-2 mb-3">
          <div className="col-12 col-md-6">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-3">
            <select
              className="form-select form-select-sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {fileTypes.map((t) => (
                <option key={t} value={t}>
                  {t === "all" ? "All types" : t.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-3 text-muted small d-flex align-items-center">
            {filtered.length} file{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* File grid */}
        {loading ? (
          <div className="text-center py-5">
            <span className="spinner-border text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <p style={{ fontSize: "3rem" }}>📁</p>
            <p>No files found.</p>
          </div>
        ) : (
          <div className="row g-3">
            {filtered.map((file) => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={file.id}>
                <div className="card h-100 shadow-sm">
                  {/* File icon area */}
                  <div
                    className="card-img-top d-flex align-items-center justify-content-center bg-light"
                    style={{ height: "100px", fontSize: "3rem" }}
                  >
                    {getFileIcon(file.fileType)}
                  </div>

                  <div className="card-body p-2">
                    {/* Filename — editable when renaming */}
                    {renamingId === file.id ? (
                      <div className="input-group input-group-sm mb-2">
                        <input
                          type="text"
                          className="form-control"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") confirmRename(file.id);
                            if (e.key === "Escape") setRenamingId(null);
                          }}
                          autoFocus
                        />
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => confirmRename(file.id)}
                        >
                          ✓
                        </button>
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => setRenamingId(null)}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <p
                        className="card-title small fw-bold mb-1 text-truncate"
                        title={file.fileName}
                      >
                        {file.fileName}
                      </p>
                    )}

                    <p className="text-muted mb-1" style={{ fontSize: "0.75rem" }}>
                      {formatBytes(file.fileSize)} · {file.fileType?.toUpperCase()}
                    </p>
                    <p className="text-muted mb-2" style={{ fontSize: "0.75rem" }}>
                      {formatDate(file.createdAt)}
                    </p>

                    {/* Action buttons */}
                    {confirmDeleteId === file.id ? (
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-danger btn-sm flex-grow-1"
                          onClick={() => handleDelete(file.id)}
                        >
                          Confirm
                        </button>
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-outline-primary btn-sm flex-grow-1"
                          onClick={() => handleDownload(file)}
                          title="Download"
                        >
                          ⬇
                        </button>
                        <button
                          className="btn btn-outline-secondary btn-sm flex-grow-1"
                          onClick={() => startRename(file)}
                          title="Rename"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm flex-grow-1"
                          onClick={() => setConfirmDeleteId(file.id)}
                          title="Delete"
                        >
                          🗑
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Files;