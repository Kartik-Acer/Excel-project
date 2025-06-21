import React, { useState } from "react";
import { login } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Form.css";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(form);
      console.log(res);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);

      navigate(
        res.data.role === "admin" ? "/adminDashboard" : "/userDashboard"
      );
    } catch (err) {
      if (!err.response) {
        alert("server is currently unavailable.");
      } else {
        alert(err.response.data.error);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />
          </div>
          <button className="auth-button" type="submit">
            Login
          </button>
        </form>
        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
