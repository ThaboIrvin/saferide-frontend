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
  const [trips, setTrips] = useState([]);

  // ✅ LOAD USER ON REFRESH
  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, []);

  async function fetchUser() {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_KEY
      }
    });

    const data = await res.json();

    if (data.email) {
      setUserEmail(data.email);
    }
  }

  // ✅ SIGNUP
  async function signup() {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.error) {
      alert("Signup failed ❌: " + data.error.message);
    } else {
      alert("Signup successful ✅");
    }
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
      alert("Invalid email or password ❌");
      return;
    }

    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);
    setUserEmail(email);

    alert("Login successful ✅");
  }

  // ✅ LOGOUT
  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUserEmail("");
    setTrips([]);
  }

  // ✅ BOOK RIDE
  async function bookRide() {
    if (!token) {
      alert("Please login first ❌");
      return;
    }

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

  // ✅ UI
  return (
    React.createElement("div", { className: "container" }, [

      // ✅ HEADER
      React.createElement("div", { className: "header" }, [
        React.createElement("h1", {}, "SafeRideSA 🚖"),

        token && React.createElement("div", { className: "user" }, [
          React.createElement("span", {}, userEmail),
          React.createElement("button", { onClick: logout }, "Logout")
        ])
      ]),

      // ✅ LOGIN / SIGNUP
      !token && React.createElement("div", { className: "card" }, [
        React.createElement("h2", {}, "Login or Sign Up"),

        React.createElement("input", {
          placeholder: "Email",
          onChange: e => setEmail(e.target.value)
        }),

        React.createElement("input", {
          placeholder: "Password",
          type: "password",
          onChange: e => setPassword(e.target.value)
        }),

        React.createElement("button", { onClick: login }, "Login"),
        React.createElement("button", { onClick: signup }, "Sign Up")
      ]),

      // ✅ DASHBOARD (when logged in)
      token && React.createElement("div", { className: "card" }, [
        React.createElement("h2", {}, "Book a Ride"),

        React.createElement("input", {
          placeholder: "Pickup location",
          onChange: e => setPickup(e.target.value)
        }),

        React.createElement("input", {
          placeholder: "Dropoff location",
          onChange: e => setDropoff(e.target.value)
        }),

        React.createElement("button", { onClick: bookRide }, "Book Ride"),

        React.createElement("h3", {}, "My Trips"),
        React.createElement("button", { onClick: loadTrips }, "Refresh Trips"),

        React.createElement(
          "div",
          {},
          trips.map((trip, index) =>
            React.createElement(
              "div",
              { key: index, className: "trip" },
              `${trip.pickup} → ${trip.dropoff}`
            )
          )
        )
      ])
    ])
  );
}

// ✅ MODERN STYLING
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
  align-items: center;
}

.user {
  display: flex;
  gap: 10px;
}

.card {
  background: white;
  padding: 20px;
  margin-top: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

input {
  width: 100%;
  padding: 12px;
  margin-top: 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
}

button {
  width: 100%;
  padding: 12px;
  margin-top: 10px;
  border: none;
  border-radius: 8px;
  background: #2d8cff;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

button:hover {
  background: #1f6fe0;
}

.trip {
  background: #f0f4ff;
  padding: 10px;
  margin-top: 10px;
  border-radius: 6px;
}
`;
document.head.appendChild(style);

// ✅ RENDER APP
createRoot(document.getElementById("app")).render(
  React.createElement(App)
);
