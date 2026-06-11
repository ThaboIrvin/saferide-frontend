import React, { useState, useEffect } from "https://esm.sh/react";
import { createRoot } from "https://esm.sh/react-dom/client";

const API = "https://saferide-backend-yqxz.onrender.com";

function App() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [trip, setTrip] = useState(null);
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  const token = localStorage.getItem("token");

  // ✅ LOGOUT (FIXED PROPERLY)
  function logout() {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setTrips([]);
    setTrip(null);
    alert("Logged out ✅");
  }

  // ✅ SIMPLE CHECK
  useEffect(() => {
    if (!token) {
      setError("You are not logged in ❌");
    }
  }, []);

  // ✅ GEOCODE
  async function getCoords(place) {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}&limit=1`
    );
    const data = await res.json();

    if (!data.length) throw new Error("Location not found");

    return [data[0].lon, data[0].lat];
  }

  // ✅ ROUTE
  async function getRoute(pickup, dropoff) {
    const start = await getCoords(pickup);
    const end = await getCoords(dropoff);

    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start.join(",")};${end.join(",")}?overview=false`
    );

    const data = await res.json();

    if (!data.routes?.length) {
      throw new Error("Route not found");
    }

    const route = data.routes[0];

    return {
      distance: (route.distance / 1000).toFixed(2),
      eta: (route.duration / 60).toFixed(0)
    };
  }

  // ✅ CREATE TRIP
  async function handleTrip() {
    try {
      const route = await getRoute(pickup, dropoff);

      const newTrip = {
        pickup,
        dropoff,
        distance: route.distance,
        eta: route.eta,
        price: (25 + route.distance * 12 + route.eta * 1.5).toFixed(2),
        rideType: "UberX"
      };

      setTrip(newTrip);

      await fetch(`${API}/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newTrip)
      });

    } catch (err) {
      setError(err.message);
    }
  }

  // ✅ LOAD TRIPS (FULL FIX)
  async function loadTrips() {
    if (!token) {
      setError("Login required ❌");
      return;
    }

    try {
      const res = await fetch(`${API}/my-trips`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Server error");
      }

      const data = await res.json();

      console.log("Trips:", data);

      setTrips(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error(err);
      setTrips([]);
      setError("Failed to load trips ❌");
    }
  }

  return React.createElement("div", { className: "container" }, [

    // ✅ HEADER
    React.createElement("div", { className: "header" }, [
      React.createElement("h1", {}, "SafeRideSA 🚖"),

      isLoggedIn &&
        React.createElement("button", {
          className: "logout",
          onClick: logout
        }, "Logout")
    ]),

    // INPUTS
    React.createElement("div", { className: "card" },
      React.createElement("input", {
        placeholder: "Pickup",
        value: pickup,
        onChange: e => setPickup(e.target.value)
      })
    ),

    React.createElement("div", { className: "card" },
      React.createElement("input", {
        placeholder: "Dropoff",
        value: dropoff,
        onChange: e => setDropoff(e.target.value)
      })
    ),

    React.createElement("button", {
      className: "btn",
      onClick: handleTrip
    }, "Get Trip"),

    trip && React.createElement("div", { className: "result" }, [
      React.createElement("p", {}, `Distance: ${trip.distance} km`),
      React.createElement("p", {}, `ETA: ${trip.eta} mins`),
      React.createElement("p", {}, `Fare: R${trip.price}`)
    ]),

    React.createElement("button", {
      className: "btn",
      onClick: loadTrips
    }, "Load My Trips"),

    error && React.createElement("p", { className: "error" }, error),

    trips.map((t, i) =>
      React.createElement("div", { key: i, className: "trip" },
        `${t.rideType || "UberX"} | ${t.pickup} → ${t.dropoff} | R${t.price || "0"}`
      )
    )
  ]);
}

// ✅ STYLES
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
}

/* ✅ BIGGER LOGOUT */
.logout {
  background: red;
  color: white;
  padding: 14px 20px;
  font-size: 16px;
  border-radius: 10px;
}

.card {
  background: #0f172a;
  padding: 10px;
  margin-top: 10px;
}

input {
  width: 100%;
  padding: 12px;
}

.btn {
  width: 100%;
  padding: 14px;
  margin-top: 10px;
  background: blue;
  color: white;
}

.result {
  background: #020617;
  padding: 10px;
  margin-top: 10px;
}

.trip {
  background: #111827;
  padding: 10px;
  margin-top: 10px;
}

.error {
  color: red;
}
`;

document.head.appendChild(style);

createRoot(document.getElementById("app")).render(
  React.createElement(App)
);
