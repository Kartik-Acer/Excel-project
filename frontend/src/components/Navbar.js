import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <nav className="navbar">
      <div className="logo">
        📊 <span className="logo-text">DataCanvas</span>
      </div>
      <div className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
        {token ? (
          <>
            <span className="dashboard-name">Dashboard</span>
            <div className="navbar-user">
              <div className="user-info">
                <span className="user-name">{name}</span>
              </div>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="login-button">
              Login
            </Link>
            <Link to="/register" className="signup-button">
              Sign Up
            </Link>
          </div>
        )}
      </div>
      <button
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <span className={`menu-icon ${mobileMenuOpen ? "active" : ""}`}></span>
      </button>
    </nav>
  );
};

export default Navbar;
