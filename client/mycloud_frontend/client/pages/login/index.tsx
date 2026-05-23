import { useState } from "react";
import { useRouter } from "next/router";
import AuthService from "@/services/AuthService";
import { LoggedInUser, StatusMessage } from "@/types";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setLoading(true);

    try {
      const response = await AuthService.login(username, password);

      if (!response.ok) {
        setStatusMessage({ message: "Invalid username or password.", type: "error" });
        return;
      }

      const data: LoggedInUser = await response.json();
      sessionStorage.setItem("loggedInUser", JSON.stringify(data));
      router.push("/dashboard");

    } catch (error) {
      setStatusMessage({ message: "Could not connect to server.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-sm p-4" style={{ width: "100%", maxWidth: "400px" }}>

        <div className="text-center mb-4">
          <h1 className="h2 fw-bold text-primary">My-Cloud</h1>
          <p className="text-muted small">Private Cloud Storage</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              id="username"
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {statusMessage && (
            <div className={`alert alert-${statusMessage.type === "error" ? "danger" : "success"} py-2`}>
              {statusMessage.message}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100 mt-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"/>
                Signing in...
              </>
            ) : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}