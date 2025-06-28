import { useState, useEffect } from "react";
import "../styles/Visualize.css";
import ChartGenerator from "./ChartGenerator";
import { getHistory } from "../services/api";

const Visualize = ({ selectedFileId: propSelectedFileId, onSelectFile }) => {
  const [files, setFiles] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState(
    propSelectedFileId || null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    if (propSelectedFileId) {
      setSelectedFileId(propSelectedFileId);
    }
  }, [propSelectedFileId]);

  const token = localStorage.getItem("token");
  const fetchFiles = async () => {
    try {
      const response = await getHistory({
        headers: {
          Authorization: `${token}`, //sent token for auth
        },
      });
      setFiles(response.data);
    } catch (error) {
      setError("Failed to fetch files");
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

  if (loading) {
    return <div className="loading">Loading files...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }
  console.log(selectedFileId);
  console.log(files);
  return (
    <div className="visualize-container">
      {selectedFileId ? (
        <div className="chart-generator-wrapper">
          <div className="visualize-header">
            <h2>Create Visualization</h2>
            <button
              onClick={() => setSelectedFileId(null)}
              className="back-to-files-btn"
            >
              ← Back to File Selection
            </button>
          </div>
          <ChartGenerator fileId={selectedFileId} />
        </div>
      ) : (
        <div className="file-selector">
          <div className="visualize-header">
            <h2>Select a File to Visualize</h2>
            <p>
              Choose from your uploaded Excel files to create charts and
              visualizations
            </p>
          </div>

          {files.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>No Files Available</h3>
              <p>
                You haven't uploaded any Excel files yet. Upload a file first to
                start creating visualizations.
              </p>
              <div className="empty-actions">
                <button
                  onClick={() => (window.location.href = "#upload")}
                  className="btn btn-primary"
                >
                  Go to Upload Tab
                </button>
              </div>
            </div>
          ) : (
            <div className="files-grid">
              {files.map((file) => (
                <div key={file.id} className="file-card">
                  <div className="file-card-header">
                    <div className="file-icon">📄</div>
                    <div className="file-info">
                      <h3 className="file-name">{file.originalName}</h3>
                      <span className="file-size">
                        {formatFileSize(file.fileSize)}
                      </span>
                    </div>
                  </div>

                  <div className="file-details">
                    <div className="detail-item">
                      <span className="detail-label">Columns:</span>
                      <span className="detail-value">
                        {file.columns.length}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Analyses:</span>
                      <span className="detail-value">
                        {file.analyses.length}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Uploaded:</span>
                      <span className="detail-value">
                        {formatDate(file.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="file-columns">
                    <h4>Available Columns:</h4>
                    <div className="columns-list">
                      {file.columns.slice(0, 4).map((column, index) => (
                        <span key={index} className="column-tag">
                          {column.name}
                        </span>
                      ))}
                      {file.columns.length > 4 && (
                        <span className="column-tag more">
                          +{file.columns.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="file-actions">
                    <button
                      className="select-file-btn"
                      onClick={() => setSelectedFileId(file._id)}
                    >
                      <span className="btn-icon">📊</span>
                      Create Visualization
                    </button>
                  </div>

                  {file.analyses.length > 0 && (
                    <div className="recent-analyses">
                      <h5>Recent Charts:</h5>
                      <div className="analyses-preview">
                        {file.analyses.slice(-2).map((analysis, index) => (
                          <div key={index} className="analysis-preview">
                            <span className="chart-type-badge">
                              {analysis.chartType}
                            </span>
                            <span className="chart-axes-text">
                              {analysis.xAxis} vs {analysis.yAxis}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Visualize;
