import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../services/api";
import { refreshToken } from "../services/auth";
import "../styles.css";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const response = await fetchWithAuth("users/change-password/", {
      method: "POST",
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      }),
    });

    if (response.ok) {
      await refreshToken();
      alert("Password changed successfully");
      console.log("Success");
      toast.success("Password change successfully");
      navigate("/", { replace: true });
    } else {
      try {
        const errors = await response.json();
        Object.keys(errors).forEach((key) => {
          errors[key].forEach((error) => toast.error(`Field ${key}: ${error}`));
        });
      } catch (error) {
        console.error(error);
        toast.error("Error changing password");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="logo">Change Password</h1>
        <form className="login-form" onSubmit={handleChangePassword}>
          <div className="login-form-group">
            <label htmlFor="old-password">Old Password</label>
            <input
              type="password"
              id="old-password"
              name="old-password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          <div className="login-form-group">
            <label htmlFor="new-password">New Password</label>
            <input
              type="password"
              id="new-password"
              name="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="login-form-group">
            <label htmlFor="confirm-password">Confirm New Password</label>
            <input
              type="password"
              id="confirm-password"
              name="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
