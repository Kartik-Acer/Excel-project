"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Pie, Scatter } from "react-chartjs-2";
import ThreeChart from "./ThreeChart";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../styles/ChartGenerator.css";
import { getFileData, storeAnalysis } from "../services/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ChartGenerator = ({ fileId: propFileId }) => {
  const { fileId: paramFileId } = useParams();
  const fileId = propFileId || paramFileId;
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const threeChartRef = useRef(null);

  const [fileData, setFileData] = useState(null);
  const [chartConfig, setChartConfig] = useState({
    type: "line",
    xAxis: "",
    yAxis: "",
    title: "My Chart",
  });
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchFileData();
  }, [fileId]);

  useEffect(() => {
    if (fileData && chartConfig.xAxis && chartConfig.yAxis) {
      generateChartData();
    }
  }, [fileData, chartConfig.xAxis, chartConfig.yAxis, chartConfig.type]);
  const token = localStorage.getItem("token");
  const fetchFileData = async () => {
    try {
      // Now fetching data from database instead of reading file
      const response = await getFileData(fileId, {
        headers: {
          Authorization: `${token}`, //sent token for auth
        },
      });
      setFileData(response.data);

      // Set default axes if available
      if (response.data.columns.length >= 2) {
        setChartConfig((prev) => ({
          ...prev,
          xAxis: response.data.columns[0].name,
          yAxis: response.data.columns[1].name,
        }));
      }
    } catch (error) {
      setError("Failed to load file data");
      setTimeout(() => navigate("/userDashboard"), 3000);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = () => {
    if (!fileData || !chartConfig.xAxis || !chartConfig.yAxis) return;

    const { data } = fileData;
    const labels = data.map((row) => row[chartConfig.xAxis]);
    const values = data.map((row) => {
      const value = row[chartConfig.yAxis];
      return typeof value === "number" ? value : Number.parseFloat(value) || 0;
    });

    const colors = [
      "rgba(102, 126, 234, 0.8)",
      "rgba(118, 75, 162, 0.8)",
      "rgba(255, 99, 132, 0.8)",
      "rgba(54, 162, 235, 0.8)",
      "rgba(255, 205, 86, 0.8)",
      "rgba(75, 192, 192, 0.8)",
      "rgba(153, 102, 255, 0.8)",
      "rgba(255, 159, 64, 0.8)",
    ];

    const chartDataConfig = {
      labels,
      datasets: [
        {
          label: chartConfig.yAxis,
          data: values,
          backgroundColor: chartConfig.type === "pie" ? colors : colors[0],
          borderColor:
            chartConfig.type === "pie" ? colors : colors[0].replace("0.8", "1"),
          borderWidth: 2,
          fill: chartConfig.type === "line" ? false : true,
        },
      ],
    };

    // Special handling for scatter plot
    if (chartConfig.type === "scatter") {
      chartDataConfig.datasets[0].data = data.map((row) => ({
        x: Number.parseFloat(row[chartConfig.xAxis]) || 0,
        y: Number.parseFloat(row[chartConfig.yAxis]) || 0,
      }));
    }

    setChartData(chartDataConfig);
  };

  const handleConfigChange = (field, value) => {
    setChartConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveAnalysis = async () => {
    setSaving(true);
    try {
      console.log(token);
      await storeAnalysis(
        fileId,
        {
          chartType: chartConfig.type,
          xAxis: chartConfig.xAxis,
          yAxis: chartConfig.yAxis,
          chartConfig,
        },
        {
          headers: {
            Authorization: `${token}`, //sent token for auth
          },
        }
      );
      Swal.fire("Analysis saved successfully!");
    } catch (error) {
      console.log(error);
      Swal.fire("Failed to save analysis");
    } finally {
      setSaving(false);
    }
  };

  // Enhanced download function with 3D chart support
  const downloadChart = async (format) => {
    if (!chartRef.current) return;

    setDownloading(true);
    try {
      let canvas = null;
      let imgData = null;

      if (chartConfig.type === "3d" && threeChartRef.current) {
        // Special handling for 3D charts
        const threeCanvas = threeChartRef.current.querySelector("canvas");
        if (threeCanvas) {
          // Create a new canvas to capture the 3D chart
          const captureCanvas = document.createElement("canvas");
          const ctx = captureCanvas.getContext("2d");

          // Set canvas size to match the 3D chart
          captureCanvas.width = threeCanvas.width;
          captureCanvas.height = threeCanvas.height;

          // For WebGL canvas, we need to preserve the drawing buffer
          const gl =
            threeCanvas.getContext("webgl") ||
            threeCanvas.getContext("experimental-webgl");
          if (gl) {
            // Read pixels from WebGL context
            const pixels = new Uint8Array(
              gl.drawingBufferWidth * gl.drawingBufferHeight * 4
            );
            gl.readPixels(
              0,
              0,
              gl.drawingBufferWidth,
              gl.drawingBufferHeight,
              gl.RGBA,
              gl.UNSIGNED_BYTE,
              pixels
            );

            // Create ImageData and put it on canvas
            const imageData = new ImageData(
              new Uint8ClampedArray(pixels),
              gl.drawingBufferWidth,
              gl.drawingBufferHeight
            );

            // Flip the image vertically (WebGL has inverted Y axis)
            const flippedCanvas = document.createElement("canvas");
            flippedCanvas.width = gl.drawingBufferWidth;
            flippedCanvas.height = gl.drawingBufferHeight;
            const flippedCtx = flippedCanvas.getContext("2d");

            flippedCtx.putImageData(imageData, 0, 0);
            flippedCtx.globalCompositeOperation = "copy";
            flippedCtx.scale(1, -1);
            flippedCtx.translate(0, -gl.drawingBufferHeight);
            flippedCtx.drawImage(flippedCanvas, 0, 0);

            canvas = flippedCanvas;
          } else {
            // Fallback: try to copy canvas directly
            ctx.drawImage(threeCanvas, 0, 0);
            canvas = captureCanvas;
          }
        } else {
          // Fallback to html2canvas for the entire 3D chart container
          canvas = await html2canvas(threeChartRef.current, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            scale: 2,
            logging: false,
            onclone: (clonedDoc) => {
              // Ensure the cloned canvas is visible
              const clonedCanvas = clonedDoc.querySelector("canvas");
              if (clonedCanvas) {
                clonedCanvas.style.display = "block";
                clonedCanvas.style.visibility = "visible";
              }
            },
          });
        }
      } else {
        // Regular 2D charts
        canvas = await html2canvas(chartRef.current, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          scale: 2,
          logging: false,
        });
      }

      if (!canvas) {
        throw new Error("Failed to capture chart");
      }

      imgData = canvas.toDataURL("image/png", 1.0);

      if (format === "png") {
        // Download PNG
        const link = document.createElement("a");
        link.download = `${chartConfig.title
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase()}.png`;
        link.href = imgData;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (format === "pdf") {
        // Download PDF
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? "landscape" : "portrait",
          unit: "px",
          format: [canvas.width, canvas.height],
        });

        // Calculate dimensions to fit the page
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        // Calculate scaling to fit the page while maintaining aspect ratio
        const scale = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;

        // Center the image on the page
        const x = (pdfWidth - scaledWidth) / 2;
        const y = (pdfHeight - scaledHeight) / 2;

        pdf.addImage(
          imgData,
          "PNG",
          x,
          y,
          scaledWidth,
          scaledHeight,
          undefined,
          "FAST"
        );
        pdf.save(
          `${chartConfig.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`
        );
      }

      // Show success message
      const formatName = format.toUpperCase();
      Swal.fire(`Chart downloaded successfully as ${formatName}!`);
    } catch (error) {
      console.error("Download error:", error);
      Swal.fire(
        `Failed to download chart as ${format.toUpperCase()}. Please try again.`
      );
    } finally {
      setDownloading(false);
    }
  };

  const renderChart = () => {
    if (!chartData) return null;

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: chartConfig.title,
        },
      },
      scales:
        chartConfig.type !== "pie"
          ? {
              x: {
                title: {
                  display: true,
                  text: chartConfig.xAxis,
                },
              },
              y: {
                title: {
                  display: true,
                  text: chartConfig.yAxis,
                },
              },
            }
          : {},
    };

    switch (chartConfig.type) {
      case "line":
        return <Line data={chartData} options={options} />;
      case "bar":
        return <Bar data={chartData} options={options} />;
      case "pie":
        return <Pie data={chartData} options={options} />;
      case "scatter":
        return <Scatter data={chartData} options={options} />;
      case "3d":
        return (
          <div ref={threeChartRef} style={{ width: "100%", height: "100%" }}>
            <ThreeChart data={chartData} config={chartConfig} />
          </div>
        );
      default:
        return <Line data={chartData} options={options} />;
    }
  };

  if (loading) {
    return <div className="loading">Loading file data...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <p>Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="chart-generator">
      <div className="chart-header">
        <h1>Chart Generator</h1>
        {/*<button
          onClick={() => navigate("/userDashboard")}
          className="back-button"
        >
          Back to Dashboard
        </button>*/}
      </div>

      <div className="chart-container">
        <div className="chart-controls">
          <div className="control-section">
            <h3>Chart Configuration</h3>

            <div className="form-group">
              <label>Chart Title</label>
              <input
                type="text"
                value={chartConfig.title}
                onChange={(e) => handleConfigChange("title", e.target.value)}
                placeholder="Enter chart title"
              />
            </div>

            <div className="form-group">
              <label>Chart Type</label>
              <select
                value={chartConfig.type}
                onChange={(e) => handleConfigChange("type", e.target.value)}
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="scatter">Scatter Plot</option>
                <option value="3d">3D Chart</option>
              </select>
            </div>

            <div className="form-group">
              <label>X-Axis</label>
              <select
                value={chartConfig.xAxis}
                onChange={(e) => handleConfigChange("xAxis", e.target.value)}
              >
                <option value="">Select X-Axis</option>
                {fileData?.columns.map((column) => (
                  <option key={column.name} value={column.name}>
                    {column.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Y-Axis</label>
              <select
                value={chartConfig.yAxis}
                onChange={(e) => handleConfigChange("yAxis", e.target.value)}
              >
                <option value="">Select Y-Axis</option>
                {fileData?.columns.map((column) => (
                  <option key={column.name} value={column.name}>
                    {column.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="control-section">
            <h3>Actions</h3>

            <button
              onClick={saveAnalysis}
              className="action-button save"
              disabled={saving || !chartData}
            >
              {saving ? "Saving..." : "Save Analysis"}
            </button>

            <div className="download-buttons">
              <button
                onClick={() => downloadChart("png")}
                className="action-button download"
                disabled={!chartData || downloading}
              >
                {downloading ? "Downloading..." : "Download PNG"}
              </button>
              <button
                onClick={() => downloadChart("pdf")}
                className="action-button download"
                disabled={!chartData || downloading}
              >
                {downloading ? "Downloading..." : "Download PDF"}
              </button>
            </div>
            {chartConfig.type === "3d" && (
              <div className="download-note">
                <small
                  style={{
                    color: "#666",
                    fontSize: "12px",
                    marginTop: "10px",
                    display: "block",
                  }}
                >
                  💡 3D charts use advanced rendering. Download may take a
                  moment.
                </small>
              </div>
            )}
          </div>
        </div>

        <div className="chart-display">
          <div ref={chartRef} className="chart-wrapper">
            {chartData ? (
              renderChart()
            ) : (
              <div className="no-chart">
                <p>Select X and Y axes to generate chart</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {fileData && (
        <div className="data-preview">
          <h3>Data Preview</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {fileData.columns.map((column) => (
                    <th key={column.name}>{column.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fileData.data.slice(0, 10).map((row, index) => (
                  <tr key={index}>
                    {fileData.columns.map((column) => (
                      <td key={column.name}>{row[column.name]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="data-info">
            Showing first 10 rows of {fileData.data.length} total rows
          </p>
        </div>
      )}
    </div>
  );
};

export default ChartGenerator;
