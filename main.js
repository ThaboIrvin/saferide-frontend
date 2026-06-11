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

  // ✅ BIG LOGOUT BUTTON
  function logout() {
    localStorage.removeItem("token");
    location.reload();
  }

  async function getCoords(place) {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}&limit=1`
    );
    const data = await res.json();

    if (!data.length) throw new Error("Location not found");

    return [data[0].lon, data[0].lat];
  }

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

  function getPrice(distance, eta) {
    return (25 + distance * 12 + eta * 1.5).toFixed(2);
  }

  async function handleTrip() {
    try {
      const route = await getRoute(pickup, dropoff);

      const newTrip = {
        pickup,
        dropoff,
        distance: route.distance,
        eta: route.eta,
        price: getPrice(route.distance, route.eta),
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

  // ✅ FIXED LOAD
  async function loadTrips() {
    setError("");

    try {
      const res = await fetch(`${API}/my-trips`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      console.log("TRIPS:", data);

      setTrips(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error(err);
      setTrips([]);
      setError("Failed to load trips ❌");
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
    React.createElement("div", { className: "card" },
      React.createElement("input", {
        placeholder: "Pickup",
        value: pickup,
        onChange: e => setPickup(e.target.value)
      })
    ),

    // DROPOFF
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

    // ✅ SAFE LIST
    trips.map((t, i) =>
      React.createElement("div", { key: i, className: "trip" },
        `${t.rideType || "UberX"} | ${t.pickup} → ${t.dropoff} | R${t.price || "0.00"}`
      )
    )
  ]);
}

// ✅ STYLES (BIG LOGOUT)
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
  padding: 12px;
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

.logout {
  background: red;
  padding: 12px 20px;
  font-size: 18px;
  border-radius: 8px;
  color: white;
}

.result {
  background: #020617;
  padding: 10px;
  margin-top: 10px;
}

.trip {
  background: #111827;
  margin-top: 10px;
  padding: 10px;
}

.error {
  color: red;
}
`;

document.head.appendChild(style);

createRoot(document.getElementById("app")).render(
  React.createElement(App)
);