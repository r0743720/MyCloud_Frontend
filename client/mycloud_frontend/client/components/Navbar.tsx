import Link from "next/link";
import { useRouter } from "next/router";

const Navbar = () => {
  const router = useRouter();

  const handleLogout = () => {
    sessionStorage.removeItem("loggedInUser");
    router.push("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4">
      <Link className="navbar-brand fw-bold" href="/dashboard">
        My-Cloud
      </Link>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <Link
              className={`nav-link ${
                router.pathname.startsWith("/dashboard") ? "active" : ""
              }`}
              href="/dashboard"
            >
              Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link
              className={`nav-link ${
                router.pathname.startsWith("/files") ? "active" : ""
              }`}
              href="/files"
            >
              Files
            </Link>
          </li>
        </ul>
        <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;