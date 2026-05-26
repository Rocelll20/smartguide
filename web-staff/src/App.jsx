import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://smartguide-sj1d.onrender.com";

const TEST_EMAIL = "admin@smartguide.local";
const TEST_PASSWORD = "admin123";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState(TEST_EMAIL);
  const [password, setPassword] = useState(TEST_PASSWORD);
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("Loading dashboard...");
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchDashboard = async () => {
    try {
      const dashboardResponse = await fetch(`${API_BASE_URL}/dashboard`);
      const dashboardData = await dashboardResponse.json();

      const usersResponse = await fetch(`${API_BASE_URL}/users`);
      const usersData = await usersResponse.json();

      setDashboard(dashboardData);
      setUsers(usersData);
      setStatus("Connected to SmartGuide backend.");
      setLastUpdated(new Date().toLocaleString());
    } catch (error) {
      console.error(error);
      setStatus("Cannot connect to backend. Please check Render URL.");
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchDashboard();
      const interval = setInterval(fetchDashboard, 5000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  const handleLogin = (event) => {
    event.preventDefault();

    if (email === TEST_EMAIL && password === TEST_PASSWORD) {
      setIsLoggedIn(true);
    } else {
      alert("Invalid demo login. Use the test account.");
    }
  };

  const latestLocation =
    dashboard?.recent_locations && dashboard.recent_locations.length > 0
      ? dashboard.recent_locations[0]
      : null;

  const mapUrl = latestLocation
    ? `https://www.google.com/maps?q=${latestLocation.latitude},${latestLocation.longitude}`
    : "";

  const embeddedMapUrl = latestLocation
    ? `https://maps.google.com/maps?q=${latestLocation.latitude},${latestLocation.longitude}&z=16&output=embed`
    : "";

  if (!isLoggedIn) {
    return (
      <main className="login-page">
        <section className="login-card">
          <div className="brand-circle">SG</div>
          <h1>SmartGuide Staff Portal</h1>
          <p>
            Demo dashboard for monitoring blind users, obstacle alerts, fall
            alerts, and last known location.
          </p>

          <form onSubmit={handleLogin}>
            <label>Email</label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@smartguide.local"
            />

            <label>Password</label>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="admin123"
              type="password"
            />

            <button type="submit">Login</button>
          </form>

          <div className="test-account">
            <strong>Test Account</strong>
            <span>Email: admin@smartguide.local</span>
            <span>Password: admin123</span>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <header className="topbar">
        <div>
          <h1>SmartGuide Staff Dashboard</h1>
          <p>{status}</p>
          <p className="small-text">API: {API_BASE_URL}</p>
        </div>

        <div className="topbar-actions">
          <button onClick={fetchDashboard}>Refresh</button>
          <button className="logout-btn" onClick={() => setIsLoggedIn(false)}>
            Logout
          </button>
        </div>
      </header>

      <section className="cards-grid">
        <article className="stat-card">
          <span>Total Blind Users</span>
          <strong>{dashboard?.total_users ?? 0}</strong>
        </article>

        <article className="stat-card">
          <span>Active Users</span>
          <strong>{dashboard?.active_users ?? 0}</strong>
        </article>

        <article className="stat-card warning">
          <span>Recent Obstacle Alerts</span>
          <strong>{dashboard?.recent_obstacle_events?.length ?? 0}</strong>
        </article>

        <article className="stat-card danger">
          <span>Recent Fall Alerts</span>
          <strong>{dashboard?.recent_fall_events?.length ?? 0}</strong>
        </article>
      </section>

      <section className="section-grid">
        <article className="panel">
          <div className="panel-header">
            <h2>Blind Users</h2>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Guardian</th>
                  <th>Status</th>
                  <th>Last Location</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.full_name}</td>
                    <td>
                      {user.guardian_name}
                      <br />
                      <span>{user.guardian_contact}</span>
                    </td>
                    <td>
                      <span className="badge success">{user.status}</span>
                    </td>
                    <td>
                      {user.last_latitude && user.last_longitude ? (
                        <>
                          {user.last_latitude}, {user.last_longitude}
                          <br />
                          <a
                            href={`https://www.google.com/maps?q=${user.last_latitude},${user.last_longitude}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open in Google Maps
                          </a>
                        </>
                      ) : (
                        "No location"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Last Known Location</h2>
            {mapUrl && (
              <a href={mapUrl} target="_blank" rel="noreferrer">
                Open Google Maps
              </a>
            )}
          </div>

          {latestLocation ? (
            <>
              <p className="location-text">
                Latitude: {latestLocation.latitude} | Longitude:{" "}
                {latestLocation.longitude}
              </p>
              <iframe
                title="SmartGuide Location Map"
                src={embeddedMapUrl}
                className="map-frame"
                loading="lazy"
              />
            </>
          ) : (
            <p>No location updates yet.</p>
          )}
        </article>
      </section>

      <section className="section-grid">
        <article className="panel">
          <div className="panel-header">
            <h2>Recent Obstacle Alerts</h2>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Distance</th>
                  <th>Message</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {dashboard?.recent_obstacle_events?.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <span className={`badge ${event.severity}`}>
                        {event.severity}
                      </span>
                    </td>
                    <td>{event.distance_cm} cm</td>
                    <td>{event.message}</td>
                    <td>{new Date(event.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Fall Alerts</h2>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Message</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {dashboard?.recent_fall_events?.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <span className="badge danger">{event.severity}</span>
                    </td>
                    <td>{event.status}</td>
                    <td>{event.message}</td>
                    <td>{new Date(event.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <footer>
        Last updated: {lastUpdated || "Not yet refreshed"} | Demo login only for
        PIT presentation.
      </footer>
    </main>
  );
}

export default App;