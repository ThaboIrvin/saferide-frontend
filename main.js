import React, { useState } from "https://esm.sh/react";
import { createRoot } from "https://esm.sh/react-dom/client";

const API = "https://saferide-backend-yqxz.onrender.com";

function App() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [trips, setTrips] = useState([]);

  const token = localStorage.getItem("token");

  // ✅ Fake distance (temporary)
  function calculateDistance() {
    if (!pickup || !dropoff) {
      setError("Enter both locations ❌");
      return;
    }

    const distance = (Math.random() * 15 + 5).toFixed(2);
    const eta = (distance / 40 * 60).toFixed(0);

    const trip = { pickup, dropoff, distance, eta };

    setResult(trip);
    setError("");

    saveTrip(trip); // ✅ SAVE TO DB
  }

  // ✅ SAVE TRIP TO BACKEND
  async function saveTrip(trip) {
    await fetch(`${API}/trips`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(trip)
    });
  }

  // ✅ LOAD TRIPS
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

    React.createElement("h1", {}, "SafeRideSA 🚖"),

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

    // ✅ BUTTON
    React.createElement("button", {
      className: "main-btn",
      onClick: calculateDistance
    }, "Calculate Trip"),

    error && React.createElement("p", { className: "error" }, error),

    // ✅ RESULT
    result && React.createElement("div", { className: "result" }, [
      React.createElement("h3", {}, "Trip Summary"),
      React.createElement("p", {}, `Distance: ${result.distance} km`),
      React.createElement("p", {}, `ETA: ${result.eta} mins`)
    ]),

    // ✅ LOAD HISTORY
    React.createElement("button", {
      className: "secondary-btn",
      onClick: loadTrips
    }, "Load My Trips"),

    // ✅ HISTORY LIST
    React.createElement("div", {},
      trips.map((t, i) =>
        React.createElement("div", { key: i, className: "trip" },
          `${t.pickup} → ${t.dropoff} (${t.distance}km)`
        )
      )
    )
  ]);
}

/* ✅ UI FIXED */
const style = document.createElement("style");
style.innerHTML = `
.container {
  max-width: 420px;
  margin: auto;
  padding: 20px;
  color: white;
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

.arrow {
  text-align: center;
  font-size: 22px;
  margin-top: 10px;
  color: #2d8cff;
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
