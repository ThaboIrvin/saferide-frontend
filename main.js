import React, { useState, useEffect } from "https://esm.sh/react";
import { createRoot } from "https://esm.sh/react-dom/client";

function App() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [coords, setCoords] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  // ✅ Convert location → coordinates
  async function getCoords(place) {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${place}`
    );
    const data = await res.json();

    if (!data[0]) {
      alert("Location not found ❌");
      return null;
    }

    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  }

  // ✅ Distance formula
  function calculateDistance(p1, p2) {
    const R = 6371;
    const dLat = (p2[0] - p1[0]) * Math.PI/180;
    const dLon = (p2[1] - p1[1]) * Math.PI/180;

    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(p1[0] * Math.PI/180) *
      Math.cos(p2[0] * Math.PI/180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  // ✅ Button click
  async function handleRoute() {
    const p = await getCoords(pickup);
    const d = await getCoords(dropoff);

    if (!p || !d) return;

    setCoords({ p, d });

    const distance = calculateDistance(p, d);
    const eta = (distance / 40) * 60; // 40 km/h

    setRouteInfo({
      distance: distance.toFixed(2),
      eta: eta.toFixed(0)
    });
  }

  // ✅ Render map AFTER DOM exists
  useEffect(() => {
    if (!coords) return;

    const { p, d } = coords;

    const mapDiv = document.getElementById("map");
    if (!mapDiv) return;

    if (window.map) window.map.remove();

    const map = L.map("map").setView(p, 12);
    window.map = map;

    // ✅ Dark-style map tiles
    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution: ""
    }).addTo(map);

    // ✅ Markers
    L.marker(p).addTo(map).bindPopup("Pickup").openPopup();
    L.marker(d).addTo(map).bindPopup("Dropoff");

    // ✅ Route line
    const line = L.polyline([p, d], {
      color: "#2d8cff",
      weight: 5
    }).addTo(map);

    map.fitBounds(line.getBounds());

  }, [coords]);

  return React.createElement("div", { className: "container" }, [

    React.createElement("h1", {}, "SafeRideSA 🚖"),

    React.createElement("div", { className: "card" }, [

      React.createElement("h2", {}, "Plan Your Ride"),

      React.createElement("input", {
        placeholder: "Pickup location",
        onChange: e => setPickup(e.target.value)
      }),

      React.createElement("input", {
        placeholder: "Dropoff location",
        onChange: e => setDropoff(e.target.value)
      }),

      React.createElement("button", { onClick: handleRoute }, "Get Route"),

      // ✅ Map always renders AFTER click
      coords && React.createElement("div", { id: "map" }),

      // ✅ Info (distance + ETA)
      routeInfo && React.createElement("div", { className: "info" }, [
        React.createElement("p", {}, `Distance: ${routeInfo.distance} km`),
        React.createElement("p", {}, `ETA: ${routeInfo.eta} mins`)
      ])
    ])
  ]);
}

// ✅ DARK UBER STYLE
const style = document.createElement("style");
style.innerHTML = `
.container {
  max-width: 420px;
  margin: auto;
  padding: 20px;
  color: white;
}

h1 {
  text-align: center;
}

.card {
  background: #0f172a;
  padding: 20px;
  margin-top: 20px;
  border-radius: 14px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.6);
}

input {
  width: 100%;
  padding: 12px;
  margin-top: 10px;
  border-radius: 8px;
  border: none;
  background: #020617;
  color: white;
}

button {
  width: 100%;
  margin-top: 12px;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: #2d8cff;
  color: white;
  font-weight: bold;
}

#map {
  height: 300px;
  margin-top: 15px;
  border-radius: 10px;
}

.info {
  margin-top: 15px;
  background: #020617;
  padding: 15px;
  border-radius: 10px;
}
`;
document.head.appendChild(style);

// ✅ Render
createRoot(document.getElementById("app")).render(
  React.createElement(App)
);
