import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../services/api";
import { toast } from "react-toastify";
import "../styles.css";

const ScanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scanDetail, setScanDetail] = useState({});
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editedNote, setEditedNote] = useState("");
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [editedTags, setEditedTags] = useState([]);

  useEffect(() => {
    const fetchScanDetail = async () => {
      const response = await fetchWithAuth(`scan/${id}/`);
      if (response.ok) {
        const data = await response.json();
        setScanDetail(data);
        setEditedNote(data.note || "");
        setEditedTags(data.tags || []);
      } else {
        toast.error("Can't retrieve scan detail");
      }
    };

    fetchScanDetail();
  }, [id]);

  const disableLinksScript = `
        document.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', event => {
                event.preventDefault();
            });
        });
    `;

  const injectScript = (htmlContent) => {
    if (!htmlContent) {
      return null;
    }
    const scriptTag = `<script>${disableLinksScript}</script>`;
    return htmlContent.replace("</body>", `${scriptTag}</body>`);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this scan?")) {
      const response = await fetchWithAuth(`scan/${id}/`, { method: "DELETE" });
      if (response.ok) {
        toast.success("Scan deleted successfully")
        navigate("/scan-results");
      } else {
        toast.error("Can't delete the scan")
      }
    }
  };

  const handleSaveNote = async () => {
    const response = await fetchWithAuth(`scan/${id}/`, {
      method: "PATCH",
      body: JSON.stringify({ note: editedNote }),
    });
    if (response.ok) {
      const data = await response.json();
      setIsEditingNote(false);
      setScanDetail({ ...scanDetail, note: data.note });
      toast.success("Note updated successfully");
    } else {
      toast.error("Couldn't update the note");
    }
  };

  const handleCancelNote = () => {
    setIsEditingNote(false);
    setEditedNote(scanDetail.note || "");
  };

  const handleSaveTags = async () => {
    const response = await fetchWithAuth(`scan/${id}/`, {
      method: "PATCH",
      body: JSON.stringify({ tags: editedTags }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data);
      setIsEditingTags(false);
      setScanDetail({ ...scanDetail, tags: data.tags });
      toast.success("Tags updated successfully");
    } else {
      toast.error("Couldn't update tags");
    }
  };

  const handleCancelTags = () => {
    setIsEditingTags(false);
    setEditedTags(scanDetail.tags || []);
  };

  const addTag = () => {
    setEditedTags([...editedTags, { id: Date.now(), tag: "" }]);
  };

  const removeTag = (id) => {
    setEditedTags(editedTags.filter((tag) => tag.id !== id));
  };

  const renderTags = () => {
    return (
      <div className="tags-section">
        <div className="section-header">
          <h2>Tags</h2>
          {isEditingTags ? (
            <div>
              <button className="save-button" onClick={handleSaveTags}>
                Save
              </button>
              <button className="cancel-button" onClick={handleCancelTags}>
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingTags(true)}
              className="edit-button"
            >
              Edit <span className="gg-pen"></span>
            </button>
          )}
        </div>
        <div className="tags-content">
          {editedTags.map((tag, index) => (
            <div key={tag.id} className="tag-input">
              {isEditingTags && (
                <button
                  className="delete-button"
                  onClick={() => removeTag(tag.id)}
                >
                  X
                </button>
              )}
              <input
                type="text"
                value={tag.tag}
                onChange={(e) => {
                  const newTags = [...editedTags];
                  newTags[index].tag = e.target.value;
                  setEditedTags(newTags);
                }}
                disabled={!isEditingTags}
              />
            </div>
          ))}
          {isEditingTags && <button onClick={addTag}>+ Add</button>}
        </div>
      </div>
    );
  };

  const renderNote = () => {
    return (
      <div className="note-section">
        <div className="section-header">
          <h2>Note</h2>
          {isEditingNote ? (
            <div>
              <button className="save-button" onClick={handleSaveNote}>
                Save
              </button>
              <button className="cancel-button" onClick={handleCancelNote}>
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingNote(true)}
              className="edit-button"
            >
              Edit <span className="gg-pen"></span>
            </button>
          )}
        </div>
        {isEditingNote ? (
          <textarea
            value={editedNote}
            onChange={(e) => setEditedNote(e.target.value)}
          />
        ) : (
          <textarea value={scanDetail?.note} disabled />
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (!scanDetail) {
      return <div>Loading...</div>;
    }

    const { status, result_html, error } = scanDetail;

    if (status === "SUCCESS" && result_html) {
      return (
        <iframe
          srcDoc={injectScript(result_html)}
          title="Scan Result"
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      );
    } else if (status === "FAILURE") {
      return (
        <div className="error-box">
          {error || "An error occurred during the scan."}
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <div className="scan-detail-container">
      <div className="scan-detail-info">
        <div className="section">
          <h2>Target</h2>
          <div>{scanDetail?.target}</div>
          <hr className="section-divider" />
        </div>
        <div className="section">
          <h2>Flags</h2>
          <div>{scanDetail?.flags}</div>
          <hr className="section-divider" />
        </div>
        <div className="section">
          <h2>Status</h2>
          <div>{scanDetail?.status}</div>
          <hr className="section-divider" />
        </div>
        {renderTags()}
        {renderNote()}
        <button onClick={handleDelete} className="delete-button">
          Delete Scan
        </button>
      </div>
      <div className="scan-detail-content">{renderContent()}</div>
    </div>
  );
};

export default ScanDetail;
