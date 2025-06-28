import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fileUpload } from "../services/api";
import "../styles/FileUpload.css";

const FileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const navigate = useNavigate();

  const handleFileSelect = (selectedFile) => {
    if (selectedFile) {
      const fileExtension = selectedFile.name.split(".").pop().toLowerCase();
      if (!["xlsx", "xls"].includes(fileExtension)) {
        setError("Please select a valid Excel file (.xlsx or .xls)");
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        // 10MB limit
        setError("File size must be less than 10MB");
        return;
      }

      setFile(selectedFile);
      setError("");
    }
  };

  const handleFileChange = (e) => {
    handleFileSelect(e.target.files[0]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setError("");

    const token = localStorage.getItem("token"); // get token  for auth

    const formData = new FormData();
    formData.append("excelFile", file);

    try {
      const response = await fileUpload(formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `${token}`, //sent token for auth
        },
      });
      console.log(onUploadSuccess);
      // Call onUploadSuccess if provided, otherwise navigate
      if (onUploadSuccess) {
        onUploadSuccess(response.data.fileId);
      } else {
        navigate(`/chart/${response.data.fileId}`);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
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

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h2>Upload Excel File</h2>
        <p className="upload-description">
          Upload your Excel file (.xlsx or .xls) to start analyzing and creating
          charts
        </p>

        {error && <div className="error-message">{error}</div>}

        <div
          className={`upload-zone ${dragActive ? "drag-active" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="upload-icon">📊</div>

          {!file ? (
            <>
              <p>Drag and drop your Excel file here, or</p>
              <label htmlFor="file-input" className="file-select-button">
                Choose File
              </label>
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <p className="upload-note">
                Supported formats: .xlsx, .xls (Max size: 10MB)
              </p>
            </>
          ) : (
            <div className="file-selected">
              <div className="file-info">
                <div className="file-icon">📄</div>
                <div className="file-details">
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{formatFileSize(file.size)}</p>
                </div>
              </div>

              <div className="file-actions">
                <button
                  onClick={() => setFile(null)}
                  className="remove-button"
                  disabled={uploading}
                >
                  Remove
                </button>
                <button
                  onClick={handleUpload}
                  className="upload-button"
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Upload & Analyze"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="upload-features">
          <h3>What you can do:</h3>
          <ul>
            <li>📈 Create interactive 2D and 3D charts</li>
            <li>📊 Choose custom X and Y axes from your data</li>
            <li>💾 Download charts as PNG or PDF</li>
            <li>📝 Keep track of your analysis history</li>
            <li>🔄 Reuse uploaded files for multiple analyses</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
