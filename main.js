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

  // ✅ Signup
  async function signup() {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY
      },
      body: JSON.stringify({ email, password })
    });

    alert("Signup successful ✅");
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

    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);

    alert("Logged in ✅");
  }

  // ✅ Book Ride
  async function bookRide() {
    const res = await fetch(`${API}/trips`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ pickup, dropoff })
    });

    const data = await res.json();
    alert("Ride booked ✅");
  }

  // ✅ Load Trips
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
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>SafeRideSA 🚖</h1>

      <h2>🔐 Auth</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />

      <br/><br/>
      <button onClick={signup}>Sign Up</button>
      <button onClick={login}>Login</button>

      <h2>🚕 Book Ride</h2>
      <input placeholder="Pickup" onChange={e => setPickup(e.target.value)} />
      <input placeholder="Dropoff" onChange={e => setDropoff(e.target.value)} />

      <br/><br/>
      <button onClick={bookRide}>Book Ride</button>

      <h2>📋 My Trips</h2>
      <button onClick={loadTrips}>Load My Trips</button>

      <ul>
        {trips.map((trip, i) => (
          <li key={i}>
            {trip.pickup} → {trip.dropoff}
          </li>
        ))}
      </ul>
    </div>
  );
}

createRoot(document.getElementById("app")).render(<App />);
`