import React, { useState, useEffect, useCallback } from "react";
import { fetchWithAuth } from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles.css";

const AllScanResults = () => {
  const [scans, setScans] = useState([]);
  const [filteredScans, setFilteredScans] = useState([]);
  const [searchTarget, setSearchTarget] = useState("");
  const [searchFlags, setSearchFlags] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchTags, setSearchTags] = useState("");
  const [searchOwner, setSearchOwner] = useState("");
  const [searchStartDate, setSearchStartDate] = useState("");
  const [searchEndDate, setSearchEndDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetchWithAuth("scan/");
      if (response.ok) {
        const data = await response.json();
        setScans(data);
        setFilteredScans(data);
      } else {
        toast.error("Can't retrieve scans");
      }
    };

    fetchData();
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

    if (searchOwner) {
      filtered = filtered.filter((scan) =>
        scan.owner_name.toLowerCase().includes(searchOwner.toLowerCase())
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
    searchOwner,
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
    setSearchOwner("");
    setSearchStartDate("");
    setSearchEndDate("");
    setFilteredScans(scans);
  };

  const handleScanClick = (id) => {
    navigate(`/scan/${id}`);
  };

  return (
    <div className="scan-results-container">
      <h2>All scans</h2>
      <div className="search-bars">
        <input
          type="text"
          placeholder="Search by target"
          value={searchTarget}
          onChange={(e) => setSearchTarget(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by flags"
          value={searchFlags}
          onChange={(e) => setSearchFlags(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by status"
          value={searchStatus}
          onChange={(e) => setSearchStatus(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by tags"
          value={searchTags}
          onChange={(e) => setSearchTags(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by owner"
          value={searchOwner}
          onChange={(e) => setSearchOwner(e.target.value)}
        />
        <input
          type="date"
          placeholder="Start date"
          value={searchStartDate}
          onChange={(e) => setSearchStartDate(e.target.value)}
        />
        <input
          type="date"
          placeholder="End date"
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
          <div>Owner</div>
          <div>Start Date</div>
        </div>
        <div className="scan-list">
          {filteredScans.map((scan) => (
            <div
              key={scan.id}
              className="scan-bar"
              onClick={() => handleScanClick(scan.id)}
            >
              <div>{scan.target}</div>
              <div>{scan.flags}</div>
              <div>{scan.status}</div>
              <div>{scan.tags.map((tag) => tag.tag).join(", ")}</div>
              <div>{scan.owner_name}</div>
              <div>{new Date(scan.start_date).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllScanResults;
