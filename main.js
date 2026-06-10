import React, { useState, useEffect } from "https://esm.sh/react";
import { createRoot } from "https://esm.sh/react-dom/client";

// ✅ CONFIG
const API = "https://saferide-backend-yqxz.onrender.com";
const SUPABASE_URL = "https://elzqihigxkravlpxsaqo.supabase.co";
const SUPABASE_KEY = "sb_publishable_Kqgqr2VHU9jXf24L-sU9Ew_MVOIZQc7";

function App() {

  // ✅ STATE
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userEmail, setUserEmail] = useState("");

  // ✅ INIT MAP AFTER LOAD
  useEffect(() => {
    if (token) loadUser();
    setTimeout(initMap, 500);
  }, []);

  // ✅ INITIALIZE MAP
  function initMap() {
    if (window.map) return;

    window.map = L.map("map").setView([-26.2041, 28.0473], 10); // Johannesburg

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap"
    }).addTo(window.map);
  }

  // ✅ LOAD USER EMAIL
  async function loadUser() {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_KEY
      }
    });

    const data = await res.json();
    if (data.email) setUserEmail(data.email);
  }

  // ✅ LOGIN
  async function login() {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!data.access_token) {
      alert("Login failed ❌");
      return;
    }

    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);

    alert("Login successful ✅");
  }

  // ✅ LOGOUT
  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUserEmail("");
  }

  // ✅ CONVERT ADDRESS → COORDINATES
  async function getCoordinates(place) {
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

  // ✅ SHOW MAP MARKERS
  async function showLocations() {
    if (!pickup || !dropoff) {
      alert("Enter both locations ❌");
      return;
    }

    const p = await getCoordinates(pickup);
    const d = await getCoordinates(dropoff);

    if (!p || !d) return;

    window.map.setView(p, 12);

    L.marker(p).addTo(window.map).bindPopup("Pickup").openPopup();
    L.marker(d).addTo(window.map).bindPopup("Dropoff");
  }

  // ✅ UI
  return React.createElement("div", { style: { padding: "20px" } }, [

    React.createElement("h1", {}, "SafeRideSA 🚖"),

    token
      ? React.createElement("div", {}, [

          // ✅ USER PANEL
          React.createElement("div", {}, [
            React.createElement("span", {}, "Logged in: " + userEmail),
            React.createElement("button", {
              onClick: logout,
              style: { marginLeft: "10px" }
            }, "Logout")
          ]),

          React.createElement("h2", {}, "Enter Trip"),

          React.createElement("input", {
            placeholder: "Pickup location",
            onChange: e => setPickup(e.target.value)
          }),

          React.createElement("input", {
            placeholder: "Dropoff location",
            onChange: e => setDropoff(e.target.value)
          }),

          React.createElement("button", { onClick: showLocations }, "Show on Map"),

          // ✅ MAP
          React.createElement("div", { id: "map" })
        ])

      : React.createElement("div", {}, [

          React.createElement("input", {
            placeholder: "Email",
            onChange: e => setEmail(e.target.value)
          }),

          React.createElement("input", {
            placeholder: "Password",
            type: "password",
            onChange: e => setPassword(e.target.value)
          }),

          React.createElement("button", { onClick: login }, "Login")
        ])
  ]);
}

createRoot(document.getElementById("app")).render(
  React.createElement(App)
);