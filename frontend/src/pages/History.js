"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/History.css";

const History = ({ onSelectFile }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");

  useEffect(() => {
    fetchFiles();
  }, []);
  const token = localStorage.getItem("token");
  const fetchFiles = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/history", {
        headers: {
          Authorization: `${token}`, //sent token for auth
        },
      });
      setFiles(response.data);
    } catch (error) {
      setError("Failed to fetch file history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  const getSortedAndFilteredFiles = () => {
    let filteredFiles = [...files];

    // Apply filters
    if (filterBy === "with-analyses") {
      filteredFiles = filteredFiles.filter((file) => file.analyses.length > 0);
    } else if (filterBy === "recent") {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      filteredFiles = filteredFiles.filter(
        (file) => new Date(file.createdAt) > oneWeekAgo
      );
    }

    // Apply sorting
    filteredFiles.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "name":
          return a.originalName.localeCompare(b.originalName);
        case "size":
          return b.fileSize - a.fileSize;
        case "analyses":
          return b.analyses.length - a.analyses.length;
        default:
          return 0;
      }
    });

    return filteredFiles;
  };

  const handleCreateChart = (fileId) => {
    if (onSelectFile) {
      onSelectFile(fileId);
    }
  };

  if (loading) {
    return <div className="loading">Loading your history...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const sortedFiles = getSortedAndFilteredFiles();

  return (
    <div className="history-container">
      <div className="history-header">
        <div className="header-content">
          <h2>Upload & Analysis History</h2>
          <p>View and manage all your uploaded files and generated analyses</p>
        </div>

        <div className="history-stats">
          <div className="stat-item">
            <span className="stat-number">{files.length}</span>
            <span className="stat-label">Total Files</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {files.reduce((total, file) => total + file.analyses.length, 0)}
            </span>
            <span className="stat-label">Total Analyses</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {
                files.filter(
                  (file) =>
                    new Date(file.createdAt) >
                    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length
              }
            </span>
            <span className="stat-label">This Week</span>
          </div>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>No Upload History</h3>
          <p>
            You haven't uploaded any Excel files yet. Start by uploading your
            first file to see your history here.
          </p>
          <div className="empty-actions">
            <button
              onClick={() => (window.location.href = "#upload")}
              className="btn btn-primary"
            >
              Upload Your First File
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="history-controls">
            <div className="controls-group">
              <div className="control-item">
                <label htmlFor="sort-select">Sort by:</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">File Name</option>
                  <option value="size">File Size</option>
                  <option value="analyses">Most Analyses</option>
                </select>
              </div>

              <div className="control-item">
                <label htmlFor="filter-select">Filter:</label>
                <select
                  id="filter-select"
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                >
                  <option value="all">All Files</option>
                  <option value="with-analyses">With Analyses</option>
                  <option value="recent">Recent (7 days)</option>
                </select>
              </div>
            </div>

            <div className="results-count">
              Showing {sortedFiles.length} of {files.length} files
            </div>
          </div>

          <div className="history-list">
            {sortedFiles.map((file) => (
              <div key={file._id} className="history-item">
                <div className="file-main-info">
                  <div className="file-header">
                    <div className="file-icon-wrapper">
                      <div className="file-icon">📄</div>
                      <div className="file-type-badge">Excel</div>
                    </div>

                    <div className="file-details">
                      <h3 className="file-name">{file.originalName}</h3>
                      <div className="file-meta">
                        <span className="file-size">
                          {formatFileSize(file.fileSize)}
                        </span>
                        <span className="separator">•</span>
                        <span className="upload-date">
                          {formatDate(file.createdAt)}
                        </span>
                        <span className="separator">•</span>
                        <span className="time-ago">
                          {getTimeAgo(file.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="file-actions">
                      <button
                        onClick={() => handleCreateChart(file._id)}
                        className="action-btn primary"
                      >
                        <span className="btn-icon">📊</span>
                        Create Chart
                      </button>
                    </div>
                  </div>

                  <div className="file-stats-row">
                    <div className="stat-badge">
                      <span className="stat-icon">📋</span>
                      <span className="stat-text">
                        {file.columns.length} columns
                      </span>
                    </div>
                    <div className="stat-badge">
                      <span className="stat-icon">📈</span>
                      <span className="stat-text">
                        {file.analyses.length} analyses
                      </span>
                    </div>
                    {file.analyses.length > 0 && (
                      <div className="stat-badge success">
                        <span className="stat-icon">✅</span>
                        <span className="stat-text">Analyzed</span>
                      </div>
                    )}
                  </div>
                </div>

                {file.columns.length > 0 && (
                  <div className="columns-section">
                    <h4>Available Columns:</h4>
                    <div className="columns-grid">
                      {file.columns.map((column, index) => (
                        <span key={index} className="column-chip">
                          {column.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {file.analyses.length > 0 && (
                  <div className="analyses-section">
                    <div className="analyses-header">
                      <h4>Analysis History ({file.analyses.length})</h4>
                      <button className="toggle-analyses">View All</button>
                    </div>

                    <div className="analyses-grid">
                      {file.analyses.slice(0, 3).map((analysis, index) => (
                        <div key={index} className="analysis-card">
                          <div className="analysis-header">
                            <span className="chart-type-badge">
                              {analysis.chartType}
                            </span>
                            <span className="analysis-date">
                              {formatDate(analysis.createdAt)}
                            </span>
                          </div>
                          <div className="analysis-details">
                            <div className="axis-info">
                              <span className="axis-label">X-Axis:</span>
                              <span className="axis-value">
                                {analysis.xAxis}
                              </span>
                            </div>
                            <div className="axis-info">
                              <span className="axis-label">Y-Axis:</span>
                              <span className="axis-value">
                                {analysis.yAxis}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {file.analyses.length > 3 && (
                        <div className="more-analyses">
                          <span>+{file.analyses.length - 3} more analyses</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default History;
