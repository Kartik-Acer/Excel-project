import React, { useState } from "react";
import { register } from "../services/api";
import { Link } from "react-router-dom";
import "../styles/Form.css";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      alert("Registered successfully!");
    } catch (err) {
      alert(err.response.data.error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              name="name"
              placeholder="Name"
              onChange={handleChange}
              required
            />
          </div>
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
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select name="role" onChange={handleChange}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button className="auth-button" type="submit">
            Register
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
