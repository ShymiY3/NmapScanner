import React, { useState, useEffect, useCallback } from "react";
import { fetchWithAuth } from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles.css";

const ScanResults = () => {
  const [scans, setScans] = useState([]);
  const [searchTarget, setSearchTarget] = useState("");
  const [searchFlags, setSearchFlags] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchTags, setSearchTags] = useState("");
  const [searchStartDate, setSearchStartDate] = useState("");
  const [searchEndDate, setSearchEndDate] = useState("");
  const [filteredScans, setFilteredScans] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchScans = async () => {
      const response = await fetchWithAuth("scan/me/");
      if (response.ok) {
        const data = await response.json();
        setScans(data);
      } else {
        toast.error("Can't retrieve scans");
      }
    };

    fetchScans();
  }, []);

  const handleSearch = useCallback(() => {
    let filtered = scans;

    if (searchTarget) {
      filtered = filtered.filter((scan) =>
        scan.target.toLowerCase().includes(searchTarget.toLowerCase())
      );
    }

    if (searchFlags) {
      filtered = filtered.filter(
        (scan) =>
          scan.flags &&
          scan.flags.toLowerCase().includes(searchFlags.toLowerCase())
      );
    }

    if (searchStatus) {
      filtered = filtered.filter((scan) =>
        scan.status.toLowerCase().includes(searchStatus.toLowerCase())
      );
    }

    if (searchTags) {
      filtered = filtered.filter((scan) =>
        scan.tags.some((tag) =>
          tag.tag.toLowerCase().includes(searchTags.toLowerCase())
        )
      );
    }

    if (searchStartDate) {
      filtered = filtered.filter(
        (scan) => new Date(scan.start_date) >= new Date(searchStartDate)
      );
    }

    if (searchEndDate) {
      filtered = filtered.filter(
        (scan) => new Date(scan.start_date) <= new Date(searchEndDate)
      );
    }

    setFilteredScans(filtered);
  }, [
    scans,
    searchTarget,
    searchFlags,
    searchStatus,
    searchTags,
    searchStartDate,
    searchEndDate,
  ]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const handleReset = () => {
    setSearchTarget("");
    setSearchFlags("");
    setSearchStatus("");
    setSearchTags("");
    setSearchStartDate("");
    setSearchEndDate("");
    setFilteredScans(scans);
  };

  const handleDetailView = (id) => {
    navigate(`/scan/${id}`);
  };

  return (
    <div className="scan-results-container">
      <h2>Scans</h2>
      <div className="search-bars">
        <input
          type="text"
          placeholder="Search by Target"
          value={searchTarget}
          onChange={(e) => setSearchTarget(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by Flags"
          value={searchFlags}
          onChange={(e) => setSearchFlags(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by Status"
          value={searchStatus}
          onChange={(e) => setSearchStatus(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by Tags"
          value={searchTags}
          onChange={(e) => setSearchTags(e.target.value)}
        />
        <input
          type="date"
          placeholder="Start Date"
          value={searchStartDate}
          onChange={(e) => setSearchStartDate(e.target.value)}
        />
        <input
          type="date"
          placeholder="End Date"
          value={searchEndDate}
          onChange={(e) => setSearchEndDate(e.target.value)}
        />
        <button onClick={handleReset}>Reset</button>
      </div>
      <div className="scan-table">
        <div className="scan-header">
          <div>Target</div>
          <div>Flags</div>
          <div>Status</div>
          <div>Tags</div>
          <div>Date</div>
        </div>
        <div className="scan-list">
          {filteredScans.map((scan) => (
            <div
              key={scan.id}
              className="scan-bar"
              onClick={() => handleDetailView(scan.id)}
            >
              <div>{scan.target}</div>
              <div>{scan.flags}</div>
              <div>{scan.status}</div>
              <div>{scan.tags.map((tag) => tag.tag).join(", ")}</div>
              <div>{new Date(scan.start_date).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScanResults;
