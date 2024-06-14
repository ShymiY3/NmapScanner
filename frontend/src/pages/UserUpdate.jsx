import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../services/api";
import {
  getFlags,
  getUserPermissions,
  getUserFlagPermission,
} from "../services/flags";
import { updateUserDetails, deleteUser } from "../services/user";
import { toast } from "react-toastify";
import CustomSelect from "../components/CustomSelect";
import "../styles.css";

const UserUpdate = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [editedUser, setEditedUser] = useState({});
  const [allFlags, setAllFlags] = useState([]);
  const [flags, setFlags] = useState({ allowed: [], banned: [] });
  const [editedFlags, setEditedFlags] = useState({ allowed: [], banned: [] });
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const userResponse = await fetchWithAuth(`users/${id}/`);
      const userData = await userResponse.json();
      setUser(userData);
      setEditedUser(userData);

      const flagsResponse = await getFlags();
      setAllFlags(
        flagsResponse.map((flag) => ({
          value: flag.id,
          label: flag.flag,
          tooltip: flag.description || "",
        }))
      );
      const permissionsData = await getUserPermissions(id);

      const allowed = permissionsData
        .filter((permission) => permission.is_allowed)
        .map((permission, index) => ({
          id: index + 1,
          value: permission.flag.id,
        }));

      const banned = permissionsData
        .filter((permission) => !permission.is_allowed)
        .map((permission, index) => ({
          id: index + 1,
          value: permission.flag.id,
        }));

      setFlags({ allowed, banned });
      setEditedFlags({ allowed, banned });
      setLoading(false);
    };

    fetchUserData();
  }, [id]);

  const updatePermission = async (permission) => {
    const response = await fetchWithAuth(`flag-permissions/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(permission),
    });
    if (response.ok) {
      return await response.json();
    }
    return {};
  };

  const deletePermission = async (permission) => {
    const response = await fetchWithAuth(`flag-permissions/${permission.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    if (response.ok) {
      return true;
    }
    return false;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedUser({
      ...editedUser,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSaveUserChanges = async () => {
    await updateUserDetails(id, editedUser);
    setUser(editedUser);
    setIsEditingUser(false);
  };

  const handleCancelUserChanges = () => {
    setEditedUser(user);
    setIsEditingUser(false);
  };

  const handleSavePermissions = async () => {
    const flagSet = new Set();
    const updatedFlags = { allowed: [], banned: [] };

    const promises = [];

    editedFlags.banned.forEach((flag) => {
      if (flag.value && !flagSet.has(flag.value)) {
        flagSet.add(flag.value);
        if (
          !flags.banned.some(
            (originalFlag) => originalFlag.value === flag.value
          )
        ) {
          promises.push(
            updatePermission({
              user: id,
              flag_id: flag.value,
              is_allowed: false,
            }).then((data) => {
              if (data) {
                updatedFlags.banned.push({
                  id: updatedFlags.banned.length + 1,
                  value: data.flag.id,
                });
              } else {
                toast.error(`Can't update permission for flag`);
              }
            })
          );
        } else {
          updatedFlags.banned.push(flag);
        }
      }
    });

    editedFlags.allowed.forEach((flag) => {
      if (flag.value && !flagSet.has(flag.value)) {
        flagSet.add(flag.value);
        if (
          !flags.allowed.some(
            (originalFlag) => originalFlag.value === flag.value
          )
        ) {
          promises.push(
            updatePermission({
              user: id,
              flag_id: flag.value,
              is_allowed: true,
            }).then((data) => {
              if (data) {
                updatedFlags.allowed.push({
                  id: updatedFlags.allowed.length + 1,
                  value: data.flag.id,
                });
              } else {
                toast.error(`Can't update permission for flag`);
              }
            })
          );
        } else {
          updatedFlags.allowed.push(flag);
        }
      }
    });

    flags.banned.forEach((flag) => {
      if (flag.value && !flagSet.has(flag.value)) {
        flagSet.add(flag.value);
        promises.push(
          getUserFlagPermission(id, flag.value).then((perm) => {
            if (perm) {
              return deletePermission(perm).then((confirm) => {
                if (!confirm) {
                  toast.error(`Can't delete permission for flag ${flag.label}`);
                }
              });
            }
          })
        );
      }
    });

    flags.allowed.forEach((flag) => {
      if (flag.value && !flagSet.has(flag.value)) {
        flagSet.add(flag.value);
        promises.push(
          getUserFlagPermission(id, flag.value).then((perm) => {
            if (perm) {
              return deletePermission(perm).then((confirm) => {
                if (!confirm) {
                  toast.error(`Can't delete permission for flag ${flag.label}`);
                }
              });
            }
          })
        );
      }
    });

    await Promise.all(promises);

    setFlags(updatedFlags);
    setEditedFlags(updatedFlags);
    setIsEditingPermissions(false);
  };

  const handleCancelPermissions = () => {
    setEditedFlags(flags);
    setIsEditingPermissions(false);
  };

  const addAllowedFlag = () => {
    setEditedFlags({
      ...editedFlags,
      allowed: [
        ...editedFlags.allowed,
        { id: editedFlags.allowed.length + 1, value: "" },
      ],
    });
  };

  const removeAllowedFlag = (id) => {
    setEditedFlags({
      ...editedFlags,
      allowed: editedFlags.allowed.filter((flag) => flag.id !== id),
    });
  };

  const addBannedFlag = () => {
    setEditedFlags({
      ...editedFlags,
      banned: [
        ...editedFlags.banned,
        { id: editedFlags.banned.length + 1, value: "" },
      ],
    });
  };

  const removeBannedFlag = (id) => {
    setEditedFlags({
      ...editedFlags,
      banned: editedFlags.banned.filter((flag) => flag.id !== id),
    });
  };

  const handleResetPassword = async () => {
    const response = await fetchWithAuth(`users/reset-password/`, {
      method: "POST",
      body: JSON.stringify({ user: id }),
    });
    if (response.ok) {
      const data = await response.json();
      setOtp(data.OTP);
      toast.success("Password reseted successfully");
    } else {
      console.log(response);
      toast.error("Couldn't reset the password");
    }
  };

  const handleDeleteUser = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (confirmDelete) {
      const response = await deleteUser(id);
      if (response.ok) {
        toast.success("User deleted successfully");
        navigate("/user-management");
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
      <h2>Update User</h2>
      {otp ? (
        <div className="otp-display">
          <h3>User created successfully!</h3>
          <p>
            <strong>OTP:</strong> {otp}
          </p>
          <button className="goto-button" onClick={() => setOtp(null)}>
            Go back to User Details
          </button>
        </div>
      ) : (
        <>
          <div className="user-section">
            <div className="section-header">
              <h3>User Details</h3>

              {isEditingUser ? (
                <div>
                  <button
                    className="save-button"
                    onClick={handleSaveUserChanges}
                  >
                    Save
                  </button>
                  <button
                    className="cancel-button"
                    onClick={handleCancelUserChanges}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="edit-items">
                  <button
                    onClick={handleDeleteUser}
                    className="delete-button"
                  >
                    Delete user
                  </button>
                  <button
                    onClick={handleResetPassword}
                    className="reset-password-button"
                  >
                    Reset password
                  </button>
                  <button
                    onClick={() => setIsEditingUser(true)}
                    className="edit-button"
                  >
                    Edit <span className="gg-pen"></span>
                  </button>
                </div>
              )}
            </div>
            <div className="user-content">
              <div className="user-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={editedUser.username}
                  onChange={handleInputChange}
                  readOnly={!isEditingUser}
                />
              </div>
              <div className="user-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editedUser.email}
                  onChange={handleInputChange}
                  readOnly={!isEditingUser}
                />
              </div>
              <div className="user-group">
                <label>Allow All</label>
                <input
                  type="checkbox"
                  name="allow_all"
                  checked={editedUser.allow_all}
                  onChange={handleInputChange}
                  disabled={!isEditingUser}
                />
              </div>
              <div className="user-group">
                <label>Allow Sudo</label>
                <input
                  type="checkbox"
                  name="allow_sudo"
                  checked={editedUser.allow_sudo}
                  onChange={handleInputChange}
                  disabled={!isEditingUser}
                />
              </div>
              <div className="user-group">
                <label>Must Change Password</label>
                <input
                  type="checkbox"
                  name="must_change_password"
                  checked={editedUser.must_change_password}
                  onChange={handleInputChange}
                  disabled={!isEditingUser}
                />
              </div>
            </div>
          </div>
          <div className="permissions-section">
            <div className="section-header">
              <h3>Permissions</h3>
              {isEditingPermissions ? (
                <div>
                  <button
                    className="save-button"
                    onClick={handleSavePermissions}
                  >
                    Save
                  </button>
                  <button
                    className="cancel-button"
                    onClick={handleCancelPermissions}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingPermissions(true)}
                  className="edit-button"
                >
                  Edit <span className="gg-pen"></span>
                </button>
              )}
            </div>
            <div className="permissions-list">
              <div className="permissions-allowed">
                <h4>Allowed Flags</h4>

                <div className="flags-content">
                  {editedFlags.allowed.map((flag, index) => (
                    <div key={flag.id} className="flag-input">
                      {isEditingPermissions && (
                        <button
                          className="delete-button"
                          onClick={() => removeAllowedFlag(flag.id)}
                        >
                          X
                        </button>
                      )}
                      <CustomSelect
                        value={allFlags.find(
                          (option) => option.value === flag.value
                        )}
                        onChange={(selectedOption) => {
                          const newFlags = [...editedFlags.allowed];
                          newFlags[index].value = selectedOption.value;
                          setEditedFlags({ ...editedFlags, allowed: newFlags });
                        }}
                        options={allFlags}
                        isDisabled={!isEditingPermissions}
                      />
                    </div>
                  ))}
                  <button
                    onClick={addAllowedFlag}
                    disabled={!isEditingPermissions}
                  >
                    + Add
                  </button>
                </div>
              </div>
              <div className="permissions-banned">
                <h4>Banned Flags</h4>
                <div className="flags-content">
                  {editedFlags.banned.map((flag, index) => (
                    <div key={flag.id} className="flag-input">
                      {isEditingPermissions && (
                        <button
                          className="delete-button"
                          onClick={() => removeBannedFlag(flag.id)}
                        >
                          X
                        </button>
                      )}
                      <CustomSelect
                        value={allFlags.find(
                          (option) => option.value === flag.value
                        )}
                        onChange={(selectedOption) => {
                          const newFlags = [...editedFlags.banned];
                          newFlags[index].value = selectedOption.value;
                          setEditedFlags({ ...editedFlags, banned: newFlags });
                        }}
                        options={allFlags}
                        isDisabled={!isEditingPermissions}
                      />
                    </div>
                  ))}
                  <button
                    onClick={addBannedFlag}
                    disabled={!isEditingPermissions}
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default UserUpdate;
