import React, { useState } from "react";
import Swal from "sweetalert2";

const ForgotPassword = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <form className="auth-form">
          <div className="form-group">
            <input
              name="email"
              placeholder="Enter Your Email"
              //onChange={handleChange}
              required
            />
          </div>
          <button className="auth-button" type="submit">
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
