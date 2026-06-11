import React, { useState } from "https://esm.sh/react";
import { createRoot } from "https://esm.sh/react-dom/client";

const API = "https://saferide-backend-yqxz.onrender.com";

function App() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState("");
  const [trips, setTrips] = useState([]);

  const [rideType, setRideType] = useState("UberX");

  const token = localStorage.getItem("token");

  // ✅ LOGOUT
  function logout() {
    localStorage.removeItem("token");
    location.reload();
  }

  // ✅ GEOCODE
  async function getCoords(place) {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}&limit=1`
    );
    const data = await res.json();

    if (!data.length) throw new Error("Location not found");

    return [data[0].lon, data[0].lat];
  }

  // ✅ GET ROUTE
  async function getRoute(pickup, dropoff) {
    const start = await getCoords(pickup);
    const end = await getCoords(dropoff);

    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start.join(",")};${end.join(",")}?overview=false`
    );

    const data = await res.json();

    if (!data.routes || !data.routes.length) {
      throw new Error("Route not found");
    }

    const route = data.routes[0];

    return {
      distance: (route.distance / 1000).toFixed(2),
      eta: (route.duration / 60).toFixed(0)
    };
  }

  // ✅ PRICING PER RIDE TYPE
  function calculateFare(distance, eta) {
    const pricing = {
      UberX: { base: 25, perKm: 12, perMin: 1.5 },
      XL: { base: 35, perKm: 15, perMin: 2 },
      Premium: { base: 50, perKm: 20, perMin: 3 }
    };

    const selected = pricing[rideType];

    return (
      selected.base +
      distance * selected.perKm +
      eta * selected.perMin
    ).toFixed(2);
  }

  // ✅ MAIN
  async function handleTrip() {
    if (!pickup || !dropoff) {
      setError("Enter both locations ❌");
      return;
    }

    setError("");

    try {
      const route = await getRoute(pickup, dropoff);

      const distance = parseFloat(route.distance);
      const eta = parseFloat(route.eta);

      const price = calculateFare(distance, eta);

      const newTrip = {
        pickup,
        dropoff,
        distance: route.distance,
        eta: route.eta,
        price,
        rideType
      };

      setTrip(newTrip);

      // ✅ SAVE
      await fetch(`${API}/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newTrip)
      });

    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  // ✅ LOAD HISTORY
 async function loadTrips() {
  try {
    const res = await fetch(`${API}/my-trips`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    console.log("TRIPS:", data);

    // ✅ Ensure it is always an array
    if (!Array.isArray(data)) {
      setTrips([]);
      setError("Failed to load trips ❌");
      return;
    }

    setTrips(data);

  } catch (err) {
    console.error(err);
    setTrips([]);
    setError("Error loading trips ❌");
  }
}

  return React.createElement("div", { className: "container" }, [

    // HEADER
    React.createElement("div", { className: "header" }, [
      React.createElement("h1", {}, "SafeRideSA 🚖"),
      React.createElement("button", {
        className: "logout",
        onClick: logout
      }, "Logout")
    ]),

    // PICKUP
    React.createElement("div", { className: "card" }, [
      React.createElement("label", {}, "Pickup"),
      React.createElement("input", {
        value: pickup,
        onChange: e => setPickup(e.target.value)
      })
    ]),

    // ARROW
    React.createElement("div", { className: "arrow" }, "↓"),

    // DROPOFF
    React.createElement("div", { className: "card" }, [
      React.createElement("label", {}, "Dropoff"),
      React.createElement("input", {
        value: dropoff,
        onChange: e => setDropoff(e.target.value)
      })
    ]),

    // ✅ RIDE TYPES
    React.createElement("div", { className: "ride-types" },
      ["UberX", "XL", "Premium"].map(type =>
        React.createElement(
          "div",
          {
            key: type,
            className: `ride-card ${rideType === type ? "active" : ""}`,
            onClick: () => setRideType(type)
          },
          type
        )
      )
    ),

    // BUTTON
    React.createElement("button", {
      className: "btn",
      onClick: handleTrip
    }, "Get Trip"),

    error && React.createElement("p", { className: "error" }, error),

    // RESULT
    trip && React.createElement("div", { className: "result" }, [
      React.createElement("p", {}, `Distance: ${trip.distance} km`),
      React.createElement("p", {}, `ETA: ${trip.eta} mins`),
      React.createElement("p", {}, `Ride: ${trip.rideType}`),
      React.createElement("p", { className: "price" }, `Fare: R${trip.price}`)
    ]),

    React.createElement("button", {
      className: "btn",
      onClick: loadTrips
    }, "Load My Trips"),

    trips.map((t, i) =>
    React.createElement("div", { key: i, className: "trip" },

        `${t.rideType || "UberX"} | 
        ${t.pickup} → ${t.dropoff} | 
        R${t.price || "0.00"}`
    )
    )
  ]);
}

/* ✅ STYLES */
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

.card {
  background: #0f172a;
  padding: 16px;
  margin-top: 15px;
  border-radius: 12px;
}

input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  margin-top: 10px;
  border-radius: 8px;
  border: none;
}

.btn {
  width: 100%;
  margin-top: 15px;
  padding: 14px;
  background: #2d8cff;
  border-radius: 12px;
  border: none;
  color: white;
  font-weight: bold;
}

.logout {
  background: red;
  border: none;
  padding: 8px;
  border-radius: 6px;
  color: white;
}

.arrow {
  text-align: center;
  margin-top: 10px;
  font-size: 22px;
  color: #2d8cff;
}

/* ✅ RIDE TYPES */
.ride-types {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.ride-card {
  flex: 1;
  background: #111827;
  padding: 10px;
  text-align: center;
  border-radius: 10px;
  cursor: pointer;
}

.ride-card.active {
  background: #2d8cff;
}

/* ✅ RESULT */
.result {
  background: #020617;
  padding: 15px;
  margin-top: 20px;
  border-radius: 10px;
}

.price {
  color: #22c55e;
  font-weight: bold;
  margin-top: 10px;
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