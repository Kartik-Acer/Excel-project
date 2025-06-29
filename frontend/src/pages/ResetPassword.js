import { useState } from "react";
import { useParams } from "react-router-dom";
import { resetPassword } from "../services/api";
import Swal from "sweetalert2";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(token, { password });
      setPassword("");
      Swal.fire("Password Reset, Please log in");
    } catch (err) {
      Swal.fire("Failed to reset password");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              name="password"
              type="password"
              value={password}
              placeholder="Enter new password"
              onChange={(e) => setPassword(e.target.value)}
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
              title="Must contain at least one  number and one uppercase and lowercase letter, and at least 8 or more characters"
              required
            />
          </div>
          <button className="auth-button" type="submit">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
