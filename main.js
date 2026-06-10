import React, { useState } from "https://esm.sh/react";
import { createRoot } from "https://esm.sh/react-dom/client";

const API = "https://saferide-backend-yqxz.onrender.com";

function App() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [trip, setTrip] = useState(null);
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // ✅ LOGOUT
  function logout() {
    localStorage.removeItem("token");
    location.reload();
  }

  // ✅ CREATE TRIP
  async function handleTrip() {
    if (!pickup || !dropoff) {
      setError("Enter both locations ❌");
      return;
    }

    setError("");

    try {
      const res = await fetch(`${API}/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ pickup, dropoff })
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      if (!data[0]) {
        setError("No trip returned ❌");
        return;
      }

      setTrip(data[0]);

    } catch (err) {
      console.error(err);
      setError("Request failed ❌");
    }
  }

  // ✅ LOAD HISTORY
  async function loadTrips() {
    const res = await fetch(`${API}/my-trips`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    setTrips(data);
  }

  return React.createElement("div", { className: "container" }, [

    // ✅ HEADER
    React.createElement("div", { className: "header" }, [
      React.createElement("h1", {}, "SafeRideSA 🚖"),
      token && React.createElement("button", {
        className: "logout-btn",
        onClick: logout
      }, "Logout")
    ]),

    // ✅ PICKUP CARD
    React.createElement("div", { className: "card" }, [
      React.createElement("label", {}, "Pickup"),
      React.createElement("input", {
        value: pickup,
        onChange: e => setPickup(e.target.value)
      })
    ]),

    // ✅ ARROW
    React.createElement("div", { className: "arrow" }, "↓"),

    // ✅ DROPOFF CARD
    React.createElement("div", { className: "card" }, [
      React.createElement("label", {}, "Dropoff"),
      React.createElement("input", {
        value: dropoff,
        onChange: e => setDropoff(e.target.value)
      })
    ]),

    // ✅ GET TRIP BUTTON
    React.createElement("button", {
      className: "main-btn",
      onClick: handleTrip
    }, "Get Trip"),

    error && React.createElement("p", { className: "error" }, error),

    // ✅ RESULT
    trip && React.createElement("div", { className: "result" }, [
      React.createElement("h3", {}, "Trip Summary"),
      React.createElement("p", {}, `Distance: ${trip.distance} km`),
      React.createElement("p", {}, `ETA: ${trip.eta} mins`)
    ]),

    // ✅ LOAD HISTORY
    React.createElement("button", {
      className: "secondary-btn",
      onClick: loadTrips
    }, "Load My Trips"),

    // ✅ HISTORY LIST
    React.createElement("div", {},
      trips.map((t, i) =>
        React.createElement("div", { className: "trip", key: i },
          `${t.pickup} → ${t.dropoff} (${t.distance} km)`
        )
      )
    )
  ]);
}

// ✅ STYLES (FIXED LAYOUT + DARK UI)
const style = document.createElement("style");
style.innerHTML = `
.container {
  max-width: 420px;
  margin: auto;
  padding: 20px;
  color: white;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card {
  background: #0f172a;
  padding: 16px;
  margin-top: 15px;
  border-radius: 12px;
}

input {
  width: 100%;
  box-sizing: border-box;
  margin-top: 10px;
  padding: 12px;
  border-radius: 8px;
  border: none;
}

.main-btn {
  width: 100%;
  margin-top: 20px;
  padding: 14px;
  background: #2d8cff;
  border: none;
  border-radius: 12px;
  color: white;
}

.secondary-btn {
  width: 100%;
  margin-top: 10px;
  padding: 10px;
}

.logout-btn {
  background: red;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 6px;
}

.arrow {
  text-align: center;
  margin-top: 10px;
  color: #2d8cff;
  font-size: 22px;
}

.result {
  background: #020617;
  padding: 15px;
  margin-top: 20px;
  border-radius: 10px;
}

.trip {
  background: #111827;
  padding: 10px;
  margin-top: 10px;
  border-radius: 8px;
}

.error {
  color: red;
}
`;
document.head.appendChild(style);

createRoot(document.getElementById("app")).render(
  React.createElement(App)
);