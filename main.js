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
  const [userEmail, setUserEmail] = useState("");
  const [trips, setTrips] = useState([]);

  // ✅ SIGN UP
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

    if (data.error) {
      alert("Login failed ❌: " + data.error.message);
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

    const res = await fetch(`${API}/trips`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ pickup, dropoff })
    });

    const data = await res.json();
    console.log("Trip:", data);

    alert("Ride booked ✅");
  }

  // ✅ LOAD TRIPS
  async function loadTrips() {
    if (!token) {
      alert("Please login first ❌");
      return;
    }

    const res = await fetch(`${API}/my-trips`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    setTrips(data);
  }

  // ✅ UI RENDER
  return React.createElement("div", { style: styles.container }, [

    // HEADER
    React.createElement("div", { style: styles.header }, [
      React.createElement("h1", {}, "SafeRideSA 🚖"),

      token && React.createElement("div", {}, [
        React.createElement("span", {}, "Logged in: " + userEmail),
        React.createElement("button", { onClick: logout, style: styles.logout }, "Logout")
      ])
    ]),

    // AUTH SECTION
    !token && React.createElement("div", { style: styles.card }, [
      React.createElement("h2", {}, "Login / Sign Up"),

      React.createElement("input", {
        placeholder: "Email",
        value: email,
        onChange: e => setEmail(e.target.value)
      }),

      React.createElement("input", {
        placeholder: "Password",
        type: "password",
        value: password,
        onChange: e => setPassword(e.target.value)
      }),

      React.createElement("div", {}, [
        React.createElement("button", { onClick: signup }, "Sign Up"),
        React.createElement("button", { onClick: login }, "Login")
      ])
    ]),

    // DASHBOARD
    token && React.createElement("div", { style: styles.card }, [
      React.createElement("h2", {}, "Book a Ride"),

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

      React.createElement("button", { onClick: bookRide }, "Book Ride"),

      React.createElement("h3", {}, "My Trips"),

      React.createElement("button", { onClick: loadTrips }, "Load Trips"),

      React.createElement("ul", {},
        trips.map((trip, index) =>
          React.createElement("li", { key: index },
            `${trip.pickup} → ${trip.dropoff}`
          )
        )
      )
    ])
  ]);
}

// ✅ STYLES
const styles = {
  container: {
    fontFamily: "Arial",
    padding: "20px",
    backgroundColor: "#f5f5f5",
    minHeight: "100vh"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  card: {
    backgroundColor: "white",
    padding: "20px",
    marginTop: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
  },
  logout: {
    marginLeft: "10px",
    backgroundColor: "red",
    color: "white"
  }
};

createRoot(document.getElementById("app")).render(
  React.createElement(App)
);
