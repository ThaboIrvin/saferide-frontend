import React, { useState, useEffect } from "https://esm.sh/react";
import { createRoot } from "https://esm.sh/react-dom/client";

const SUPABASE_URL = "https://elzqihigxkravlpxsaqo.supabase.co";
const SUPABASE_KEY = "sb_publishable_Kqgqr2VHU9jXf24L-sU9Ew_MVOIZQc7";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userEmail, setUserEmail] = useState("");

  // ✅ Load user on login
  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token]);

  async function fetchUser() {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_KEY
      }
    });

    const data = await res.json();
    if (data.email) setUserEmail(data.email);
  }

  // ✅ Login
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
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUserEmail("");
  }

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

  // ✅ Show map correctly
  async function showMap() {
    if (!pickup || !dropoff) {
      alert("Enter both locations");
      return;
    }

    const p = await getCoords(pickup);
    const d = await getCoords(dropoff);

    if (!p || !d) return;

    // ✅ Recreate map fresh each time
    if (window.map) {
      window.map.remove();
    }

    const map = L.map("map").setView(p, 12);
    window.map = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap"
    }).addTo(map);

    L.marker(p).addTo(map).bindPopup("Pickup").openPopup();
    L.marker(d).addTo(map).bindPopup("Dropoff");
  }

  return React.createElement("div", { className: "container" }, [

    // ✅ Header
    React.createElement("div", { className: "header" }, [
      React.createElement("h1", {}, "SafeRideSA 🚖"),

      token && React.createElement("div", {}, [
        React.createElement("span", {}, userEmail),
        React.createElement("button", { onClick: logout }, "Logout")
      ])
    ]),

    // ✅ Login
    !token && React.createElement("div", { className: "card" }, [
      React.createElement("input", {
        placeholder: "Email",
        onChange: e => setEmail(e.target.value)
      }),

      React.createElement("input", {
        type: "password",
        placeholder: "Password",
        onChange: e => setPassword(e.target.value)
      }),

      React.createElement("button", { onClick: login }, "Login")
    ]),

    // ✅ Dashboard
    token && React.createElement("div", { className: "card" }, [
      React.createElement("h2", {}, "Plan Trip"),

      React.createElement("input", {
        placeholder: "Pickup location",
        onChange: e => setPickup(e.target.value)
      }),

      React.createElement("input", {
        placeholder: "Dropoff location",
        onChange: e => setDropoff(e.target.value)
      }),

      React.createElement("button", { onClick: showMap }, "Show Map"),

      React.createElement("div", { id: "map" })
    ])
  ]);
}

// ✅ Styles (keeps polished UI)
const style = document.createElement("style");
style.innerHTML = `
.container {
  max-width: 500px;
  margin: auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
}

.card {
  background: white;
  padding: 20px;
  margin-top: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

input {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
}

button {
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  background: #2d8cff;
  color: white;
  border: none;
  border-radius: 6px;
}
`;
document.head.appendChild(style);

// ✅ Render app
createRoot(document.getElementById("app")).render(
  React.createElement(App)
);
