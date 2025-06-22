"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
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
      const response = await axios.get(
        `http://localhost:5000/api/${fileId}/data`,
        {
          headers: {
            Authorization: `${token}`, //sent token for auth
          },
        }
      );
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
      await axios.post(
        `http://localhost:5000/api/${fileId}/analysis`,
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

  const downloadChart = async (format) => {
    if (!chartRef.current) return;

    try {
      if (format === "png") {
        const canvas = await html2canvas(chartRef.current);
        const link = document.createElement("a");
        link.download = `${chartConfig.title}.png`;
        link.href = canvas.toDataURL();
        link.click();
      } else if (format === "pdf") {
        const canvas = await html2canvas(chartRef.current);
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF();
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`${chartConfig.title}.pdf`);
      }
    } catch (error) {
      alert("Failed to download chart");
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
        return <ThreeChart data={chartData} config={chartConfig} />;
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
                disabled={!chartData}
              >
                Download PNG
              </button>
              <button
                onClick={() => downloadChart("pdf")}
                className="action-button download"
                disabled={!chartData}
              >
                Download PDF
              </button>
            </div>
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
