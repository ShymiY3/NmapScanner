import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserData, removeTokens } from "../services/auth";
import { updateUserDetails, deleteUser } from "../services/user";
import { toast } from "react-toastify";
import "../styles.css";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [editedEmail, setEditedEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = () => {
      const userData = getUserData();
      setUser(userData);
      setEditedEmail(userData.email);
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleEmailChange = (e) => {
    setEditedEmail(e.target.value);
  };

  const handleSaveEmail = async () => {
    if (user.email !== editedEmail) {
      const response = await updateUserDetails(user.id, { email: editedEmail });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        toast.success("Email updated successfully");
        setIsEditing(false);
      } else {
        try {
          const errors = await response.json();
          console.log(Object.values(errors));
          Object.keys(errors).forEach((key) => {
            errors[key].forEach((error) =>
              toast.error(`Field ${key}: ${error}`)
            );
          });
        } catch (error) {
          console.error(error);
          toast.error("Can't update an email");
        }
      }
    }
  };

  const handleCancelEdit = () => {
    setEditedEmail(user.email);
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  const handleDeleteProfile = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account?"
    );
    if (confirmDelete) {
      const response = await deleteUser(user.id);
      if (response.ok) {
        toast.success("Profile deleted successfully");
        removeTokens();
        navigate("/login");
      } else {
        toast.error("Failed to delete user");
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="user-update-container">
      <h2>User Profile</h2>
      <div className="user-section">
        <div className="section-header">
          <h3>User Details</h3>
          {isEditing ? (
            <div>
              <button className="save-button" onClick={handleSaveEmail}>
                Save
              </button>
              <button className="cancel-button" onClick={handleCancelEdit}>
                Cancel
              </button>
            </div>
          ) : (
            <div className="edit-items">
              <button onClick={handleDeleteProfile} className="delete-button">
                Delete user
              </button>
              <button
                className="change-password-button"
                onClick={handleChangePassword}
              >
                Change Password
              </button>
              <button
                className="edit-button"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
            </div>
          )}
        </div>
        <div className="user-content">
          <div className="user-group">
            <label>Username</label>
            <input type="text" name="username" value={user.username} disabled />
          </div>
          <div className="user-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={editedEmail}
              onChange={handleEmailChange}
              readOnly={!isEditing}
              disabled={!isEditing}
            />
          </div>
          <div className="user-group">
            <label>Allow All</label>
            <input
              type="checkbox"
              name="allow_all"
              checked={user.allow_all}
              disabled
            />
          </div>
          <div className="user-group">
            <label>Allow Sudo</label>
            <input
              type="checkbox"
              name="allow_sudo"
              checked={user.allow_sudo}
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
