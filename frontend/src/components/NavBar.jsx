import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { removeTokens } from "../services/auth";
import { getUserStatus } from "../services/user";

const NavBar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserStatus();
        setUser(userData.data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        // Optionally handle error (e.g., redirect to login)
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    removeTokens();
    navigate("/login");
  };

  return (
    <div className="navbar">
      <h2 className="nav-logo">NmapScanner</h2>
      <ul className="nav-list">
        <li className="nav-item">
          <a href="/">Run Scan</a>
        </li>
        <li className="nav-item">
          <a href="/scan-results">Scans</a>
        </li>
        
        {user && user.is_superuser && (
          <>
          <li className="nav-item">
              <a href="/user-create">Create User</a>
            </li>
            <li className="nav-item">
              <a href="/user-management">User Management</a>
            </li>
            <li className="nav-item">
              <a href="/flags-management">Flags Management</a>
            </li>
            <li className="nav-item">
              <a href="/all-scans">All Scans</a>
            </li>
          </>
        )}
        <li className="nav-item">
          <a href="/my-profile">My profile</a>
        </li>
      </ul>
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
    </div>
  );
};

export default NavBar;
