import React, { useState, useEffect } from "react";
import axios from "axios";
import FileUpload from "./FileUpload";
import Visualize from "./Visualize";
import History from "./History";
import "../styles/UserDashboard.css";

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);
  const token = localStorage.getItem("token");
  const fetchFiles = async () => {
    console.log("history call");
    try {
      const response = await axios.get("http://localhost:5000/api/history", {
        headers: {
          Authorization: `${token}`, //sent token for auth
        },
      });
      console.log(response.data);
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

  const handleFileUploadSuccess = (fileId) => {
    fetchFiles(); // Refresh files list
    setSelectedFileId(fileId);
    setActiveTab("visualize");
  };

  const handleSelectFileForVisualization = (fileId) => {
    setSelectedFileId(fileId);
    setActiveTab("visualize");
  };

  // Updated to use the new preview endpoint
  const fetchFilePreview = async (fileId) => {
    console.log(token);
    setLoadingPreview(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/${fileId}/preview`,
        {
          headers: {
            Authorization: `${token}`, //sent token for auth
          },
        }
      );
      setPreviewData(response.data);
    } catch (error) {
      console.error("Failed to fetch file preview:", error);
      setPreviewData(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleFilePreview = (fileId) => {
    setSelectedFileId(fileId);
    fetchFilePreview(fileId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="overview-content">
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon">📁</div>
                <div className="stat-content">
                  <h3>Total Files</h3>
                  <p className="stat-number">{files.length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>Total Analyses</h3>
                  <p className="stat-number">
                    {files.reduce(
                      (total, file) => total + file.analyses.length,
                      0
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-left">
                {files.length > 0 && (
                  <div className="recent-files">
                    <h3>Recent Files</h3>
                    <div className="recent-files-scroll">
                      {files.map((file) => (
                        <div key={file._id} className="recent-file-item">
                          <div className="file-info">
                            <h4>{file.originalName}</h4>
                            <p>{formatDate(file.createdAt)}</p>
                          </div>
                          <div className="file-stats">
                            <span className="file-size">
                              {formatFileSize(file.fileSize)}
                            </span>
                            <span className="analyses-count">
                              {file.analyses.length} analyses
                            </span>
                          </div>
                          <button
                            className="preview-btn"
                            onClick={() => handleFilePreview(file._id)}
                          >
                            Preview Data
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="dashboard-right">
                <div className="data-preview-section">
                  <div className="preview-header">
                    <h3>Excel Data Preview</h3>
                    {selectedFileId && (
                      <button
                        className="clear-preview-btn"
                        onClick={() => {
                          setSelectedFileId(null);
                          setPreviewData(null);
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {!selectedFileId ? (
                    <div className="preview-placeholder">
                      <div className="placeholder-icon">📊</div>
                      <h4>No File Selected</h4>
                      <p>
                        Click "Preview Data" on any file to see its contents
                        here
                      </p>
                    </div>
                  ) : loadingPreview ? (
                    <div className="preview-loading">
                      <div className="loading-spinner"></div>
                      <p>Loading file data...</p>
                    </div>
                  ) : previewData ? (
                    <div className="excel-preview">
                      <div className="preview-info">
                        <div className="file-details">
                          <h4>{previewData.filename}</h4>
                          <div className="preview-stats">
                            <span className="stat-badge">
                              <span className="stat-icon">📋</span>
                              {previewData.columns.length} columns
                            </span>
                            <span className="stat-badge">
                              <span className="stat-icon">📊</span>
                              {previewData.totalRows} rows
                            </span>
                          </div>
                        </div>
                        <button
                          className="create-chart-btn"
                          onClick={() =>
                            handleSelectFileForVisualization(selectedFileId)
                          }
                        >
                          Create Chart
                        </button>
                      </div>

                      <div className="data-table-container">
                        <table className="preview-table">
                          <thead>
                            <tr>
                              {previewData.columns.map((column) => (
                                <th key={column.name}>{column.name}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {previewData.data.map((row, index) => (
                              <tr key={index}>
                                {previewData.columns.map((column) => (
                                  <td key={column.name}>
                                    {row[column.name] !== null &&
                                    row[column.name] !== undefined
                                      ? String(row[column.name])
                                      : "-"}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="preview-footer">
                        <p>
                          Showing first 10 rows of {previewData.totalRows} total
                          rows
                          {previewData.totalRows > 10 && (
                            <span className="more-data-indicator">
                              ({previewData.totalRows - 10} more rows available)
                            </span>
                          )}
                        </p>
                        <button
                          className="view-all-btn"
                          onClick={() => setActiveTab("history")}
                        >
                          View Full History
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="preview-error">
                      <div className="error-icon">⚠️</div>
                      <h4>Failed to Load Data</h4>
                      <p>Unable to preview this file. Please try again.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "upload":
        return (
          <div className="upload-content">
            <FileUpload onUploadSuccess={handleFileUploadSuccess} />
          </div>
        );

      case "visualize":
        return (
          <div className="visualize-content">
            <Visualize
              selectedFileId={selectedFileId}
              onSelectFile={setSelectedFileId}
            />
          </div>
        );

      case "history":
        return (
          <div className="history-content">
            <History onSelectFile={handleSelectFileForVisualization} />
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <div className="loading">Loading your dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Manage your Excel files and create beautiful visualizations</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <span className="tab-icon">🏠</span>
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === "upload" ? "active" : ""}`}
          onClick={() => setActiveTab("upload")}
        >
          <span className="tab-icon">📤</span>
          Upload
        </button>
        <button
          className={`tab-button ${activeTab === "visualize" ? "active" : ""}`}
          onClick={() => setActiveTab("visualize")}
        >
          <span className="tab-icon">📊</span>
          Visualize
        </button>
        <button
          className={`tab-button ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <span className="tab-icon">📋</span>
          History
        </button>
      </div>

      <div className="dashboard-content">{renderTabContent()}</div>
    </div>
  );
};

export default Dashboard;
