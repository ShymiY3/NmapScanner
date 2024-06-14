import React, { useState, useEffect, useCallback } from "react";
import { fetchWithAuth } from "../services/api";
import { toast } from "react-toastify";
import "../styles.css";

const FlagsManagement = () => {
  const [flags, setFlags] = useState([]);
  const [filteredFlags, setFilteredFlags] = useState([]);
  const [searchFlag, setSearchFlag] = useState("");
  const [searchDescription, setSearchDescription] = useState("");
  const [editedFlag, setEditedFlag] = useState(null);
  const [newFlag, setNewFlag] = useState({ flag: "", description: "" });

  useEffect(() => {
    const fetchFlags = async () => {
      const response = await fetchWithAuth("flag/");
      if (response.ok) {
        const data = await response.json();
        setFlags(data);
        setFilteredFlags(data);
      } else {
        toast.error("Can't retrieve flags");
      }
    };

    fetchFlags();
  }, []);

  const handleSearch = useCallback(() => {
    let filtered = flags;

    if (searchFlag) {
      filtered = filtered.filter((flag) =>
        flag.flag.toLowerCase().includes(searchFlag.toLowerCase())
      );
    }

    if (searchDescription) {
      filtered = filtered.filter((flag) =>
        flag.description.toLowerCase().includes(searchDescription.toLowerCase())
      );
    }

    setFilteredFlags(filtered);
  }, [flags, searchFlag, searchDescription]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const handleReset = () => {
    setSearchFlag("");
    setSearchDescription("");
    setFilteredFlags(flags);
  };

  const handleEditFlag = (flag) => {
    setEditedFlag(flag);
  };

  const handleCancelEdit = () => {
    setEditedFlag(null);
  };

  const handleSaveFlag = async (id) => {
    const response = await fetchWithAuth(`flag/${id}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editedFlag),
    });
    if (response.ok) {
      setFlags(flags.map((flag) => (flag.id === id ? editedFlag : flag)));
      setFilteredFlags(
        filteredFlags.map((flag) => (flag.id === id ? editedFlag : flag))
      );
      toast.success("Flag edited successfully");
    } else {
      toast.error("Can't edit the flag");
    }
    setEditedFlag(null);
  };

  const handleDeleteFlag = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this flag?"
    );
    if (confirmDelete) {
      const response = await fetchWithAuth(`flag/${id}/`, { method: "DELETE" });
      if (response.ok) {
        setFlags(flags.filter((flag) => flag.id !== id));
        setFilteredFlags(filteredFlags.filter((flag) => flag.id !== id));
        toast.success("Flag deleted successfully");
      } else {
        toast.error("Can't delete the flag");
      }
    }
  };

  const handleNewFlagChange = (e) => {
    const { name, value } = e.target;
    setNewFlag({ ...newFlag, [name]: value });
  };

  const handleAddNewFlag = async () => {
    const response = await fetchWithAuth("flag/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newFlag),
    });
    if (response.ok) {
      const createdFlag = await response.json();
      setFlags([...flags, createdFlag]);
      setFilteredFlags([...filteredFlags, createdFlag]);
      setNewFlag({ flag: "", description: "" });
      toast.success("Flag created successfully");
    } else {
      toast.error("Can't create the flag");
    }
  };

  return (
    <div className="flags-management-container">
      <h2>Flags Management</h2>
      <div className="search-bars">
        <input
          type="text"
          placeholder="Search by Flag"
          value={searchFlag}
          onChange={(e) => setSearchFlag(e.target.value)}
        />
        <input
          placeholder="Search by Description"
          value={searchDescription}
          onChange={(e) => setSearchDescription(e.target.value)}
          rows="1"
        />
        <button onClick={handleReset}>Reset</button>
      </div>
      <h3>Create flag</h3>
      <div className="search-bars">
        <input
          type="text"
          name="flag"
          placeholder="New Flag"
          value={newFlag.flag}
          onChange={handleNewFlagChange}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={newFlag.description}
          onChange={handleNewFlagChange}
          rows="1"
          style={{ resize: "vertical", maxHeight: "100px" }}
        />
        <button onClick={handleAddNewFlag}>Add Flag</button>
      </div>
      <div className="flags-table">
        <div className="flags-header">
          <div className="flag-delete"></div>
          <div className="flag-name">Flag</div>
          <div className="flag-description">Description</div>
          <div className="flag-edit"></div>
        </div>
        <div className="flags-list">
          {filteredFlags.map((flag) => (
            <div key={flag.id} className="flag-row">
              <div className="flag-delete">
                <button
                  className="cancel-button"
                  onClick={() => handleDeleteFlag(flag.id)}
                >
                  Delete
                </button>
              </div>
              <div className="flag-name">{flag.flag}</div>
              <div className="flag-description">
                {editedFlag && editedFlag.id === flag.id ? (
                  <textarea
                    value={editedFlag.description}
                    onChange={(e) =>
                      setEditedFlag({
                        ...editedFlag,
                        description: e.target.value,
                      })
                    }
                    rows="1"
                    style={{ resize: "vertical", maxHeight: "100px" }}
                  />
                ) : (
                  flag.description
                )}
              </div>
              <div className="flag-edit">
                {editedFlag && editedFlag.id === flag.id ? (
                  <>
                    <button
                      onClick={() => handleSaveFlag(flag.id)}
                      className="save-button"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="cancel-button"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleEditFlag(flag)}
                    className="edit-button"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlagsManagement;
