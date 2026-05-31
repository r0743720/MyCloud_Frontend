import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import FileService from "@/services/FileService";
import { DuplicateGroup, StatusMessage } from "@/types";

const formatBytes = (bytes: number): string => {
  if (bytes >= 1_073_741_824) return (bytes / 1_073_741_824).toFixed(1) + " GB";
  if (bytes >= 1_048_576) return (bytes / 1_048_576).toFixed(1) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
  return bytes + " B";
};

const Duplicates = () => {
  const router = useRouter();
  const [groups, setGroups] = useState<DuplicateGroup[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);

  useEffect(() => {
    const user = sessionStorage.getItem("loggedInUser");
    if (!user) {
      router.push("/login");
      return;
    }
    fetchDuplicates();
  }, []);

  const fetchDuplicates = async () => {
    setLoading(true);
    try {
      const res = await FileService.getDuplicates();
      if (res.ok) {
        const data: DuplicateGroup[] = await res.json();
        setGroups(data);

        // Auto-select all copies except the first in each group
        const autoSelected = new Set<number>();
        data.forEach((group) => {
          group.files.slice(1).forEach((f) => autoSelected.add(f.id));
        });
        setSelected(autoSelected);
      }
    } catch {
      setStatusMessage({ message: "Failed to load duplicates.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const totalWasted = groups.reduce((sum, g) => sum + g.wastedBytes, 0);
  const selectedCount = selected.size;

  const handleClean = async () => {
    if (selected.size === 0) return;
    setDeleting(true);
    setStatusMessage(null);

    let successCount = 0;
    let failCount = 0;

    for (const id of selected) {
      try {
        const res = await FileService.remove(id);
        if (res.ok) successCount++;
        else failCount++;
      } catch {
        failCount++;
      }
    }

    if (failCount === 0) {
      setStatusMessage({
        message: `Cleaned ${successCount} duplicate${successCount !== 1 ? "s" : ""} successfully.`,
        type: "success",
      });
    } else {
      setStatusMessage({
        message: `Deleted ${successCount}, failed ${failCount}.`,
        type: "error",
      });
    }

    setDeleting(false);
    fetchDuplicates();
  };

  return (
    <>
      <Navbar />
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h4 fw-bold text-primary mb-0">Duplicate Detection</h1>
            {!loading && groups.length > 0 && (
              <p className="text-muted small mb-0">
                {groups.length} group{groups.length !== 1 ? "s" : ""} found —{" "}
                <strong>{formatBytes(totalWasted)}</strong> can be freed
              </p>
            )}
          </div>
          {groups.length > 0 && (
            <button
              className="btn btn-danger btn-sm"
              onClick={handleClean}
              disabled={deleting || selectedCount === 0}
            >
              {deleting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Cleaning...
                </>
              ) : (
                `🗑 Delete selected (${selectedCount})`
              )}
            </button>
          )}
        </div>

        {statusMessage && (
          <div
            className={`alert alert-${
              statusMessage.type === "success" ? "success" : "danger"
            } alert-dismissible`}
          >
            {statusMessage.message}
            <button
              className="btn-close"
              onClick={() => setStatusMessage(null)}
            />
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <span className="spinner-border text-primary" />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <p style={{ fontSize: "3rem" }}>✅</p>
            <p className="fw-bold">No duplicates found.</p>
            <p className="small">Your storage is clean.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {groups.map((group) => (
              <div className="card shadow-sm" key={group.baseName}>
                <div className="card-header d-flex justify-content-between align-items-center bg-light">
                  <div>
                    <span className="fw-bold">{group.baseName}</span>
                    <span className="badge bg-warning text-dark ms-2">
                      {group.count} copies
                    </span>
                  </div>
                  <span className="text-muted small">
                    {formatBytes(group.wastedBytes)} wasted
                  </span>
                </div>
                <div className="card-body p-0">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "40px" }}></th>
                        <th>Filename</th>
                        <th>Type</th>
                        <th>Size</th>
                        <th>Keep/Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.files.map((file, index) => (
                        <tr
                          key={file.id}
                          className={selected.has(file.id) ? "table-danger" : "table-success"}
                        >
                          <td>
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selected.has(file.id)}
                              onChange={() => toggleSelect(file.id)}
                            />
                          </td>
                          <td className="small">{file.fileName}</td>
                          <td>
                            <span className="badge bg-secondary">
                              {file.fileType?.toUpperCase()}
                            </span>
                          </td>
                          <td className="small">{formatBytes(file.sizeBytes)}</td>
                          <td>
                            {selected.has(file.id) ? (
                              <span className="badge bg-danger">Delete</span>
                            ) : (
                              <span className="badge bg-success">Keep</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Duplicates;