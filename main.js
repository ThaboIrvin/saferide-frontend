import React, { useState } from "https://esm.sh/react";
import { createRoot } from "https://esm.sh/react-dom/client";

function App() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");

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

  async function showMap() {
    const p = await getCoords(pickup);
    const d = await getCoords(dropoff);

    if (!p || !d) return;

    // ✅ CLEAR previous map
    if (window.map) {
      window.map.remove();
    }

    // ✅ CREATE map
    const map = L.map("map").setView(p, 12);
    window.map = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap"
    }).addTo(map);

    L.marker(p).addTo(map).bindPopup("Pickup").openPopup();
    L.marker(d).addTo(map).bindPopup("Dropoff");
  }

  return React.createElement("div", { style: { padding: "20px" } }, [
    React.createElement("h1", {}, "Map Test 🚖"),

    React.createElement("input", {
      placeholder: "Pickup",
      onChange: e => setPickup(e.target.value)
    }),

    React.createElement("input", {
      placeholder: "Dropoff",
      onChange: e => setDropoff(e.target.value)
    }),

    React.createElement("button", { onClick: showMap }, "Show Map"),

    // ✅ ALWAYS RENDER MAP DIV
    React.createElement("div", {
      id: "map",
      style: { height: "300px", marginTop: "20px" }
    })
  ]);
}

createRoot(document.getElementById("app")).render(
  React.createElement(App)
);