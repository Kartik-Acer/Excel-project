"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);
  const token = localStorage.getItem("token");
  const fetchStats = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/stats", {
        headers: {
          Authorization: `${token}`, //sent token for auth
        },
      });
      setStats(response.data);
    } catch (error) {
      setError("Failed to fetch statistics");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/users", {
        headers: {
          Authorization: `${token}`, //sent token for auth
        },
      });
      setUsers(response.data);
    } catch (error) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/users/${userId}`,
        {},
        {
          headers: {
            Authorization: `${token}`, //sent token for auth
          },
        }
      );
      fetchUsers(); // Refresh users list
    } catch (error) {
      console.log(error);
      alert("Failed to update user status");
    }
  };

  const deleteUser = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${userId}`, {
          headers: {
            Authorization: `${token}`, //sent token for auth
          },
        });
        fetchUsers(); // Refresh users list
      } catch (error) {
        alert("Failed to delete user");
      }
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

  const getUploadChartData = () => {
    if (!stats?.uploadStats) return null;

    const labels = stats.uploadStats
      .map(
        (stat) => `${stat._id.year}-${String(stat._id.month).padStart(2, "0")}`
      )
      .reverse();

    const data = stats.uploadStats.map((stat) => stat.count).reverse();
    console.log(`stat data-${data}-${labels}`);
    return {
      labels,
      datasets: [
        {
          label: "File Uploads",
          data,
          borderColor: "rgba(102, 126, 234, 1)",
          backgroundColor: "rgba(102, 126, 234, 0.1)",
          borderWidth: 2,
          fill: true,
        },
      ],
    };
  };

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  console.log(stats);
  console.log(users);
  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-tabs">
          <button
            className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`tab-button ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            User Management
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {activeTab === "overview" && stats && (
        <div className="overview-tab">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Total Users</h3>
                <p className="stat-number">{stats.totalUsers}</p>
                <small>{stats.activeUsers} active</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>Total Uploads</h3>
                <p className="stat-number">{stats.totalUploads}</p>
                <small>Files processed</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <h3>Active Users</h3>
                <p className="stat-number">{stats.activeUsers}</p>
                <small>Currently enabled</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🔄</div>
              <div className="stat-content">
                <h3>Recent Activity</h3>
                <p className="stat-number">{stats.recentUploads.length}</p>
                <small>Recent uploads</small>
              </div>
            </div>
          </div>

          <div className="charts-section">
            <div className="chart-card">
              <h3>Upload Trends</h3>
              {getUploadChartData() && (
                <Line
                  data={getUploadChartData()}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                      title: {
                        display: true,
                        text: "Monthly Upload Statistics",
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>

          <div className="recent-activity">
            <h3>Recent Uploads</h3>
            <div className="activity-list">
              {stats.recentUploads.map((upload) => (
                <div key={upload._id} className="activity-item">
                  <div className="activity-info">
                    <strong>{upload.originalName}</strong>
                    <span className="activity-user">
                      by {upload.userId.name}
                    </span>
                  </div>
                  <div className="activity-date">
                    {formatDate(upload.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="users-tab">
          <div className="users-header">
            <h3>User Management</h3>
            <p>Manage user accounts and permissions</p>
          </div>

          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className={!user.isActive ? "inactive-user" : ""}
                  >
                    <td>
                      <div className="user-info">
                        <strong>{user.name}</strong>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          user.isActive ? "active" : "inactive"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <div className="user-actions">
                        <button
                          onClick={() => toggleUserStatus(user._id)}
                          className={`action-btn ${
                            user.isActive ? "deactivate" : "activate"
                          }`}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => deleteUser(user._id)}
                          className="action-btn delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="empty-state">
              <p>No users found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
