import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  const features = [
    {
      icon: "📊",
      title: "Upload Excel Files",
      description:
        "Easily upload .xlsx and .xls files with drag-and-drop support",
    },
    {
      icon: "📈",
      title: "Interactive Charts",
      description: "Create stunning 2D and 3D visualizations from your data",
    },
    {
      icon: "🎯",
      title: "Custom Analysis",
      description:
        "Select any columns as X and Y axes for personalized insights",
    },
    {
      icon: "💾",
      title: "Export Charts",
      description: "Download your visualizations as PNG or PDF files",
    },
    {
      icon: "📝",
      title: "Analysis History",
      description: "Keep track of all your uploads and chart generations",
    },
    {
      icon: "🔐",
      title: "Secure Platform",
      description: "JWT-based authentication with role-based access control",
    },
  ];

  const stats = [
    { number: "10K+", label: "Files Processed" },
    { number: "50K+", label: "Charts Generated" },
    { number: "1K+", label: "Active Users" },
    { number: "99.9%", label: "Uptime" },
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Transform Your Excel Data into
              <span className="gradient-text"> Beautiful Visualizations</span>
            </h1>
            <p className="hero-description">
              Upload your Excel files and create interactive 2D/3D charts with
              just a few clicks. Analyze your data like never before with our
              powerful visualization platform.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary">
                Get Started Free
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Sign In
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="chart-preview">
              <div className="chart-bar" style={{ height: "60%" }}></div>
              <div className="chart-bar" style={{ height: "80%" }}></div>
              <div className="chart-bar" style={{ height: "45%" }}></div>
              <div className="chart-bar" style={{ height: "90%" }}></div>
              <div className="chart-bar" style={{ height: "70%" }}></div>
            </div>
            <div className="floating-elements">
              <div
                className="floating-element"
                style={{ top: "10%", left: "10%" }}
              >
                📊
              </div>
              <div
                className="floating-element"
                style={{ top: "20%", right: "15%" }}
              >
                📈
              </div>
              <div
                className="floating-element"
                style={{ bottom: "20%", left: "20%" }}
              >
                💹
              </div>
              <div
                className="floating-element"
                style={{ bottom: "10%", right: "10%" }}
              >
                📉
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Powerful Features for Data Analysis</h2>
            <p>
              Everything you need to transform your Excel data into actionable
              insights
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Get started in just three simple steps</p>
          </div>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Upload Your File</h3>
                <p>Drag and drop your Excel file or click to browse</p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Choose Your Data</h3>
                <p>Select which columns to use for X and Y axes</p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Generate Charts</h3>
                <p>Create beautiful 2D/3D visualizations instantly</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Visualize Your Data?</h2>
            <p>
              Join thousands of users who trust our platform for their data
              analysis needs
            </p>
            <Link to="/register" className="btn btn-primary btn-large">
              Start Analyzing Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
