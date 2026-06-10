import React, { useState } from "https://esm.sh/react";
import { createRoot } from "https://esm.sh/react-dom/client";

const API = "https://saferide-backend-yqxz.onrender.com";

const SUPABASE_URL = "https://elzqihigxkravlpxsaqo.supabase.co";
const SUPABASE_KEY = "sb_publishable_Kqgqr2VHU9jXf24L-sU9Ew_MVOIZQc7";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [trips, setTrips] = useState([]);

  async function signup() {
    await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY
      },
      body: JSON.stringify({ email, password })
    });

    alert("Signup ✅");
  }

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
    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);

    alert("Login ✅");
  }

  async function bookRide() {
    if (!token) return alert("Login first ❌");

    await fetch(`${API}/trips`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ pickup, dropoff })
    });

    alert("Ride booked ✅");
  }

  async function loadTrips() {
    const res = await fetch(`${API}/my-trips`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    setTrips(data);
  }

  return (
    React.createElement("div", { style: { padding: "20px" } }, [
      React.createElement("h1", {}, "SafeRideSA 🚖"),

      React.createElement("h2", {}, "Auth"),
      React.createElement("input", {
        placeholder: "Email",
        onChange: e => setEmail(e.target.value)
      }),
      React.createElement("input", {
        placeholder: "Password",
        type: "password",
        onChange: e => setPassword(e.target.value)
      }),

      React.createElement("br"),
      React.createElement("button", { onClick: signup }, "Signup"),
      React.createElement("button", { onClick: login }, "Login"),

      React.createElement("h2", {}, "Book Ride"),
      React.createElement("input", {
        placeholder: "Pickup",
        onChange: e => setPickup(e.target.value)
      }),
      React.createElement("input", {
        placeholder: "Dropoff",
        onChange: e => setDropoff(e.target.value)
      }),
      React.createElement("button", { onClick: bookRide }, "Book"),

      React.createElement("h2", {}, "My Trips"),
      React.createElement("button", { onClick: loadTrips }, "Load Trips"),

      React.createElement(
        "ul",
        {},
        trips.map((trip, i) =>
          React.createElement(
            "li",
            { key: i },
            `${trip.pickup} → ${trip.dropoff}`
          )
        )
      )
    ])
  );
}

createRoot(document.getElementById("app")).render(React.createElement(App));
``