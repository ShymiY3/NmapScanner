import React, { useState, useEffect, useCallback } from "react";
import { fetchWithAuth } from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchUsername, setSearchUsername] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetchWithAuth("users/");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        toast.error("Can't retrieve flags");
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = useCallback(() => {
    let filtered = users;

    if (searchUsername) {
      filtered = filtered.filter((user) =>
        user.username.toLowerCase().includes(searchUsername.toLowerCase())
      );
    }

    if (searchEmail) {
      filtered = filtered.filter((user) =>
        user.email.toLowerCase().includes(searchEmail.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchUsername, searchEmail]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const handleUserClick = (id) => {
    navigate(`/user/${id}`);
  };

  const handleReset = () => {
    setSearchUsername("");
    setSearchEmail("");
    setFilteredUsers(users);
  };

  return (
    <div className="user-management-container">
      <h2>User Management</h2>
      <div className="search-bars">
        <input
          type="text"
          placeholder="Search by Username"
          value={searchUsername}
          onChange={(e) => setSearchUsername(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by Email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          rows="1"
        />
        <button onClick={handleReset}>Reset</button>
      </div>
      <div className="user-header">
        <div>Username</div>
        <div>Email</div>
        <div>Admin</div>
      </div>
      <div className="user-list">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="user-bar"
            onClick={() => handleUserClick(user.id)}
          >
            <div>{user.username}</div>
            <div>{user.email}</div>
            <div>{user.is_superuser ? "Yes" : "No"}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
