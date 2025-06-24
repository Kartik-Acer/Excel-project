import React, { useState } from "react";
import { register } from "../services/api";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import "../styles/Form.css";

const Register = () => {
  const initialForm = {
    name: "",
    email: "",
    password: "",
    role: "user",
  };
  const [form, setForm] = useState(initialForm);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const clearData = () => {
    setForm(initialForm);
    // Clear to an empty object
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      clearData();
      Swal.fire("Registered successfully!");
    } catch (err) {
      Swal.fire(err.response.data.error);
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
              value={form.name}
              placeholder="Name"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              placeholder="Email"
              onChange={handleChange}
              pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              name="password"
              value={form.password}
              type="password"
              placeholder="Password"
              onChange={handleChange}
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
              title="Must contain at least one  number and one uppercase and lowercase letter, and at least 8 or more characters"
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
