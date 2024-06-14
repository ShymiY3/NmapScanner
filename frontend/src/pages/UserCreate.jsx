import React, { useState } from "react";
import { fetchWithAuth } from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles.css";

const UserCreate = () => {
  const navigate = useNavigate();
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    allow_all: false,
    allow_sudo: false,
  });
  const [otp, setOtp] = useState(null);

  const createUser = async (userDetails) => {
    const response = await fetchWithAuth("users/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userDetails),
    });
    if (response.ok) {
      toast.success("User created successfully");
      return await response.json();
    } else {
      try {
        const errors = await response.json();
        console.log(Object.values(errors));
        Object.keys(errors).forEach((key) => {
          errors[key].forEach((error) => toast.error(`Field ${key}: ${error}`));
        });
      } catch (error) {
        console.error(error);
        toast.error("Can't create an user");
      }
      return {};
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewUser({
      ...newUser,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSaveUser = async () => {
    const createdUser = await createUser(newUser);
    setOtp(createdUser.OTP);
  };

  const handleGoToUserManagement = () => {
    navigate("/user-management");
  };

  return (
    <div className="user-create-container">
      <h2>Create User</h2>
      {otp ? (
        <div className="otp-display">
          <h3>User created successfully!</h3>
          <p>
            <strong>OTP:</strong> {otp}
          </p>
          <button className="goto-button" onClick={handleGoToUserManagement}>
            Go to User Management
          </button>
        </div>
      ) : (
        <div className="user-section">
          <div className="section-header">
            <h3>User Details</h3>
            <div>
              <button className="save-button" onClick={handleSaveUser}>
                Save
              </button>
              <button
                className="cancel-button"
                onClick={handleGoToUserManagement}
              >
                Cancel
              </button>
            </div>
          </div>
          <div className="user-content">
            <div className="user-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={newUser.username}
                onChange={handleInputChange}
              />
            </div>
            <div className="user-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="user-group">
              <label>Allow All</label>
              <input
                type="checkbox"
                name="allow_all"
                checked={newUser.allow_all}
                onChange={handleInputChange}
              />
            </div>
            <div className="user-group">
              <label>Allow Sudo</label>
              <input
                type="checkbox"
                name="allow_sudo"
                checked={newUser.allow_sudo}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCreate;
