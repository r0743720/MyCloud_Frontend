import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import UserService from "@/services/UserService";
import { StatusMessage } from "@/types";

type UserItem = {
  id: number;
  username: string;
  role: string;
  storageQuotaBytes: number;
};

const formatBytes = (bytes: number): string => {
  if (bytes >= 1_073_741_824) return (bytes / 1_073_741_824).toFixed(1) + " GB";
  if (bytes >= 1_048_576) return (bytes / 1_048_576).toFixed(1) + " MB";
  return (bytes / 1024).toFixed(1) + " KB";
};

const Users = () => {
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);

  // New user form
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("USER");
  const [newQuota, setNewQuota] = useState(10);
  const [creating, setCreating] = useState(false);

  // Quota editing
  const [editingQuotaId, setEditingQuotaId] = useState<number | null>(null);
  const [editingQuotaValue, setEditingQuotaValue] = useState(10);

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("loggedInUser") || "{}");
    if (!user.token || user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await UserService.getAll();
      if (res.ok) setUsers(await res.json());
    } catch {
      setStatusMessage({ message: "Failed to load users.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setStatusMessage(null);
    try {
      const res = await UserService.createUser(
        newUsername,
        newPassword,
        newRole,
        newQuota * 1_073_741_824
      );
      if (res.ok) {
        setStatusMessage({ message: `User ${newUsername} created.`, type: "success" });
        setNewUsername("");
        setNewPassword("");
        setNewRole("USER");
        setNewQuota(10);
        fetchUsers();
      } else {
        const err = await res.json();
        setStatusMessage({ message: err.message || "Failed to create user.", type: "error" });
      }
    } catch {
      setStatusMessage({ message: "Failed to create user.", type: "error" });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number, username: string) => {
    if (!confirm(`Delete user ${username}?`)) return;
    try {
      const res = await UserService.deleteUser(id);
      if (res.ok) {
        setStatusMessage({ message: `User ${username} deleted.`, type: "success" });
        fetchUsers();
      }
    } catch {
      setStatusMessage({ message: "Failed to delete user.", type: "error" });
    }
  };

  const handleUpdateQuota = async (id: number) => {
    try {
      const res = await UserService.updateQuota(id, editingQuotaValue * 1_073_741_824);
      if (res.ok) {
        setStatusMessage({ message: "Quota updated.", type: "success" });
        setEditingQuotaId(null);
        fetchUsers();
      }
    } catch {
      setStatusMessage({ message: "Failed to update quota.", type: "error" });
    }
  };

  return (
    <>
      <Navbar />
      <div className="container py-4">
        <h1 className="h4 fw-bold text-primary mb-4">User Management</h1>

        {statusMessage && (
          <div className={`alert alert-${statusMessage.type === "success" ? "success" : "danger"} alert-dismissible`}>
            {statusMessage.message}
            <button className="btn-close" onClick={() => setStatusMessage(null)} />
          </div>
        )}

        {/* Create user form */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-light">
            <h5 className="mb-0 text-primary">Create New User</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreate}>
              <div className="row g-2">
                <div className="col-12 col-md-3">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="col-12 col-md-3">
                  <input
                    type="password"
                    className="form-control form-control-sm"
                    placeholder="Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="col-12 col-md-2">
                  <select
                    className="form-select form-select-sm"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className="col-12 col-md-2">
                  <div className="input-group input-group-sm">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Quota"
                      value={newQuota}
                      min={1}
                      onChange={(e) => setNewQuota(Number(e.target.value))}
                    />
                    <span className="input-group-text">GB</span>
                  </div>
                </div>
                <div className="col-12 col-md-2">
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm w-100"
                    disabled={creating}
                  >
                    {creating ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      "Create User"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Users table */}
        <div className="card shadow-sm">
          <div className="card-header bg-light">
            <h5 className="mb-0 text-primary">All Users</h5>
          </div>
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-4">
                <span className="spinner-border text-primary" />
              </div>
            ) : (
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Storage Quota</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="align-middle">{user.username}</td>
                      <td className="align-middle">
                        <span className={`badge ${user.role === "ADMIN" ? "bg-primary" : "bg-secondary"}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="align-middle">
                        {editingQuotaId === user.id ? (
                          <div className="input-group input-group-sm" style={{ width: "160px" }}>
                            <input
                              type="number"
                              className="form-control"
                              value={editingQuotaValue}
                              min={1}
                              onChange={(e) => setEditingQuotaValue(Number(e.target.value))}
                            />
                            <span className="input-group-text">GB</span>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleUpdateQuota(user.id)}
                            >✓</button>
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => setEditingQuotaId(null)}
                            >✕</button>
                          </div>
                        ) : (
                          <span
                            className="text-muted small"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setEditingQuotaId(user.id);
                              setEditingQuotaValue(
                                Math.round(user.storageQuotaBytes / 1_073_741_824)
                              );
                            }}
                            title="Click to edit"
                          >
                            {formatBytes(user.storageQuotaBytes)} ✏️
                          </span>
                        )}
                      </td>
                      <td className="align-middle">
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(user.id, user.username)}
                        >
                          🗑 Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Users;