import React, { useState, useEffect } from "https://esm.sh/react";
import { createRoot } from "https://esm.sh/react-dom/client";

function App() {

  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [coords, setCoords] = useState(null);
  const [info, setInfo] = useState(null);

  // ✅ Convert address → coordinates
  async function getCoords(place) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${place}`
      );

      const data = await res.json();

      if (!data[0]) throw new Error("Not found");

      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    } catch {
      alert("Invalid location ❌");
      return null;
    }
  }

  // ✅ Calculate distance
  function calculateDistance(p1, p2) {
    const R = 6371;
    const dLat = (p2[0] - p1[0]) * Math.PI / 180;
    const dLon = (p2[1] - p1[1]) * Math.PI / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(p1[0] * Math.PI / 180) *
      Math.cos(p2[0] * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // ✅ Handle button click
  async function handleRoute() {
    if (!window.L) {
      alert("Map not loaded ❌");
      return;
    }

    const p = await getCoords(pickup);
    const d = await getCoords(dropoff);

    if (!p || !d) return;

    setCoords({ p, d });

    const dist = calculateDistance(p, d);
    const eta = (dist / 40) * 60;

    setInfo({
      distance: dist.toFixed(2),
      eta: eta.toFixed(0)
    });
  }

  // ✅ Render map after React renders DOM
  useEffect(() => {
    if (!coords || !window.L) return;

    const { p, d } = coords;

    if (window.map) {
      window.map.remove();
    }

    const map = window.L.map("map").setView(p, 12);
    window.map = map;

    window.L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    ).addTo(map);

    window.L.marker(p).addTo(map).bindPopup("Pickup").openPopup();
    window.L.marker(d).addTo(map).bindPopup("Dropoff");

    const line = window.L.polyline([p, d], {
      color: "#2d8cff",
      weight: 5
    }).addTo(map);

    map.fitBounds(line.getBounds());

  }, [coords]);

  return React.createElement("div", { className: "container" }, [

    React.createElement("h1", {}, "SafeRideSA 🚖"),

    React.createElement("div", { className: "card" }, [

      React.createElement("input", {
        placeholder: "Pickup location",
        value: pickup,
        onChange: e => setPickup(e.target.value)
      }),

      React.createElement("input", {
        placeholder: "Dropoff location",
        value: dropoff,
        onChange: e => setDropoff(e.target.value)
      }),

      React.createElement("button", {
        onClick: handleRoute
      }, "Get Route"),

      coords && React.createElement("div", { id: "map" }),

      info && React.createElement("div", { className: "info" }, [
        React.createElement("p", {}, `Distance: ${info.distance} km`),
        React.createElement("p", {}, `ETA: ${info.eta} mins`)
      ])
    ])
  ]);
}

// ✅ FULL STYLE FIX (NO OVERFLOW ISSUES)
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

/* ✅ Card */
.card {
  background: #0f172a;
  padding: 20px;
  border-radius: 12px;
}

/* ✅ IMPORTANT FIX */
input, button {
  width: 100%;
  box-sizing: border-box;
}

/* ✅ Inputs */
input {
  padding: 12px;
  margin-top: 12px;
  border-radius: 8px;
  border: none;
  background: #020617;
  color: white;
}

/* ✅ Button */
button {
  margin-top: 12px;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: #2d8cff;
  color: white;
  font-weight: bold;
}

/* ✅ Map */
#map {
  height: 300px;
  margin-top: 15px;
  border-radius: 10px;
}

/* ✅ Info panel */
.info {
  margin-top: 15px;
  background: #020617;
  padding: 12px;
  border-radius: 10px;
}

`;
document.head.appendChild(style);

// ✅ Render app
createRoot(document.getElementById("app")).render(
  React.createElement(App)
);
