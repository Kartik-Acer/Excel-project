import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="logo">📊 DataCanvas</div>
      <div className="nav-links">
        {token ? (
          <div>
            <span>Welcome, 👤 {name}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
