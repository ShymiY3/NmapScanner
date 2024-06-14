import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import CustomSelect from "../components/CustomSelect";
import "../styles.css";
import { fetchWithAuth } from "../services/api";
import { getUserStatus } from "../services/user";
import {
  getFlags,
  getLoggedUserPermissions,
  filterFlagsBasedOnPermissions,
} from "../services/flags";

const Home = () => {
  const [target, setTarget] = useState("");
  const [flags, setFlags] = useState([{ id: 1, value: "", args: "" }]);
  const [note, setNote] = useState("");
  const [tags, setTags] = useState([{ id: 1, value: "" }]);
  const [withSudo, setWithSudo] = useState(false);
  const [availableFlags, setAvailableFlags] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserAndFlags = async () => {
      try {
        const response = await getUserStatus();
        const userData = response.data;
        setUser(userData);
        console.log(userData);

        const [allFlags, userPermissions] = await Promise.all([
          getFlags(),
          getLoggedUserPermissions(),
        ]);

        const filteredFlags = filterFlagsBasedOnPermissions(
          allFlags,
          userPermissions,
          userData.allow_all
        );

        setAvailableFlags(
          filteredFlags.map((flag) => ({
            value: flag.flag,
            label: flag.flag,
            tooltip: flag.description || "",
          }))
        );
      } catch (error) {
        console.error("Error fetching flags or permissions:", error);
        toast.error("Error fetching flags or permissions");
      }
    };

    fetchUserAndFlags();
  }, []);

  const addFlag = () => {
    setFlags([...flags, { id: flags.length + 1, value: "", args: "" }]);
  };

  const removeFlag = (id) => {
    setFlags(flags.filter((flag) => flag.id !== id));
  };

  const addTag = () => {
    setTags([...tags, { id: tags.length + 1, value: "" }]);
  };

  const removeTag = (id) => {
    setTags(tags.filter((tag) => tag.id !== id));
  };

  const toggleArgumentField = (id) => {
    const newFlags = flags.map((flag) =>
      flag.id === id ? { ...flag, args: flag.args ? "" : " " } : flag
    );
    setFlags(newFlags);
  };

  const handleRun = async () => {
    const formattedFlags = [];
    flags.forEach((flag) => {
      if (flag.value) {
        formattedFlags.push(String(flag.value).trim());
        if (flag.args) {
          formattedFlags.push(String(flag.args).trim());
        }
      }
    });

    const requestBody = {
      target,
      flags: formattedFlags,
      with_sudo: withSudo,
      note,
      tags: tags
        .filter((tag) => tag.value)
        .map((tag) => ({ tag: String(tag.value).trim() })),
    };

    try {
      const response = await fetchWithAuth("scan/", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to run scan");
      }

      const data = await response.json();
      console.log("Scan successful:", data);
      toast.success("Scan created successfully");
    } catch (error) {
      console.error("Error running scan:", error);
      toast.error(error.message);
    }
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Run Scan</h1>
      </div>
      <div className="home-content">
        <div className="run-buttons">
          <button className="run-button" onClick={handleRun}>
            Run
          </button>
          {user && user.allow_sudo && (
            <label>
              <input
                type="checkbox"
                checked={withSudo}
                onChange={(e) => setWithSudo(e.target.checked)}
              />
              Run with Sudo
            </label>
          )}
        </div>
        <div className="target-group">
          <h2>Target</h2>
          <input
            type="text"
            id="target"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            required
          />
        </div>
        <div className="flags-annotation-section">
          <div className="flags-wrapper">
            <div className="flags-section">
              <h2>Flags</h2>
              <div className="flags-content">
                {flags.map((flag, index) => (
                  <div key={flag.id} className="flag-input">
                    <button
                      className="delete-button"
                      onClick={() => removeFlag(flag.id)}
                    >
                      X
                    </button>
                    <CustomSelect
                      value={availableFlags.find(
                        (option) => option.value === flag.value
                      )}
                      onChange={(selectedOption) => {
                        const newFlags = [...flags];
                        newFlags[index].value = selectedOption.value;
                        setFlags(newFlags);
                      }}
                      options={availableFlags}
                    />
                    {flag.args && (
                      <input
                        type="text"
                        value={flag.args}
                        onChange={(e) => {
                          const newFlags = [...flags];
                          newFlags[index].args = e.target.value;
                          setFlags(newFlags);
                        }}
                      />
                    )}
                    <button
                      className="arg-button"
                      onClick={() => toggleArgumentField(flag.id)}
                    >
                      {flag.args ? "Remove Arg" : "Add Arg"}
                    </button>
                  </div>
                ))}
                <button onClick={addFlag}>+ Add</button>
              </div>
            </div>
          </div>
          <div className="annotations-section">
            <div className="note-section">
              <h2>Note</h2>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              ></textarea>
            </div>
            <div className="tags-section">
              <h2>Tags</h2>
              <div className="tags-content">
                {tags.map((tag, index) => (
                  <div key={tag.id} className="tag-input">
                    <button
                      className="delete-button"
                      onClick={() => removeTag(tag.id)}
                    >
                      X
                    </button>
                    <input
                      type="text"
                      value={tag.value}
                      onChange={(e) => {
                        const newTags = [...tags];
                        newTags[index].value = e.target.value;
                        setTags(newTags);
                      }}
                    />
                  </div>
                ))}
                <button onClick={addTag}>+ Add</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
