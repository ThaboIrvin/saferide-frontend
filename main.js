import React, { useState, useEffect } from "https://esm.sh/react";
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

  // ✅ AUTO-LOAD USER (NEW)
  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, []);

  async function fetchUser() {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: SUPABASE_KEY
        }
      });

      const data = await res.json();

      if (data && data.email) {
        setUserEmail(data.email);
      }

      console.log("USER:", data);

    } catch (err) {
      console.error(err);
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

    console.log("LOGIN:", data);

    if (!data.access_token) {
      alert("Login failed ❌");
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
      alert("Login first ❌");
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
  return React.createElement("div", { style: styles.container }, [

    // HEADER
    React.createElement("div", { style: styles.header }, [
      React.createElement("h1", {}, "SafeRideSA 🚖"),

      token && React.createElement("div", {}, [
        React.createElement("span", {}, "Logged in: " + userEmail),
        React.createElement("button", { onClick: logout, style: styles.logout }, "Logout")
      ])
    ]),

    // LOGIN
    !token && React.createElement("div", { style: styles.card }, [
      React.createElement("h2", {}, "Login / Sign Up"),
      React.createElement("input", {
        placeholder: "Email",
        onChange: e => setEmail(e.target.value)
      }),
      React.createElement("input", {
        placeholder: "Password",
        type: "password",
        onChange: e => setPassword(e.target.value)
      }),
      React.createElement("button", { onClick: signup }, "Sign Up"),
      React.createElement("button", { onClick: login }, "Login")
    ]),

    // DASHBOARD
    token && React.createElement("div", { style: styles.card }, [
      React.createElement("h2", {}, "Book Ride"),

      React.createElement("input", {
        placeholder: "Pickup",
        onChange: e => setPickup(e.target.value)
      }),

      React.createElement("input", {
        placeholder: "Dropoff",
        onChange: e => setDropoff(e.target.value)
      }),

      React.createElement("button", { onClick: bookRide }, "Book Ride"),

      React.createElement("h3", {}, "My Trips"),
      React.createElement("button", { onClick: loadTrips }, "Load Trips"),

      React.createElement(
        "ul",
        {},
        trips.map((trip, i) =>
          React.createElement("li", { key: i },
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
    padding: "20px",
    fontFamily: "Arial",
    background: "#f5f5f5",
    minHeight: "100vh"
  },
  header: {
    display: "flex",
    justifyContent: "space-between"
  },
  card: {
    background: "white",
    padding: "20px",
    marginTop: "20px",
    borderRadius: "10px"
  },
  logout: {
    marginLeft: "10px",
    background: "red",
    color: "white"
  }
};

createRoot(document.getElementById("app")).render(
  React.createElement(App)
);
