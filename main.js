import React, { useState } from "https://esm.sh/react";
import { createRoot } from "https://esm.sh/react-dom/client";

function App() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // ✅ Calculate distance (basic estimate)
  function calculateDistance() {
    if (!pickup || !dropoff) {
      setError("Please enter both locations ❌");
      return;
    }

    setError("");

    // Fake estimate (until maps added back)
    const randomDistance = (Math.random() * 15 + 5).toFixed(2);
    const eta = (randomDistance / 40 * 60).toFixed(0);

    setResult({
      pickup,
      dropoff,
      distance: randomDistance,
      eta
    });
  }

  return React.createElement("div", { className: "container" }, [

    // ✅ TITLE
    React.createElement("h1", {}, "SafeRideSA 🚖"),

    // ✅ PICKUP CARD
    React.createElement("div", { className: "card" }, [
      React.createElement("label", {}, "Pickup Location"),
      React.createElement("input", {
        placeholder: "Enter pickup",
        value: pickup,
        onChange: e => setPickup(e.target.value)
      })
    ]),

    // ✅ ARROW
    React.createElement("div", { className: "arrow" }, "↓"),

    // ✅ DROPOFF CARD
    React.createElement("div", { className: "card" }, [
      React.createElement("label", {}, "Dropoff Location"),
      React.createElement("input", {
        placeholder: "Enter dropoff",
        value: dropoff,
        onChange: e => setDropoff(e.target.value)
      })
    ]),

    // ✅ BUTTON
    React.createElement("button", {
      className: "main-button",
      onClick: calculateDistance
    }, "Get Trip Estimate"),

    error && React.createElement("p", { className: "error" }, error),

    // ✅ RESULT CARD
    result && React.createElement("div", { className: "result-card" }, [
      React.createElement("h3", {}, "Trip Summary"),

      React.createElement("p", {}, `From: ${result.pickup}`),
      React.createElement("p", {}, `To: ${result.dropoff}`),
      React.createElement("p", {}, `Distance: ${result.distance} km`),
      React.createElement("p", {}, `ETA: ${result.eta} mins`)
    ])
  ]);
}

/* ✅ CLEAN DARK UI STYLES */
const style = document.createElement("style");
style.innerHTML = `
.container {
  max-width: 420px;
  margin: auto;
  padding: 20px;
  color: white;
}

/* ✅ CARD BASE */
.card {
  background: #0f172a;
  padding: 16px;
  border-radius: 12px;
  margin-top: 15px;
}

/* ✅ INPUT FIX (NO OVERFLOW) */
input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  margin-top: 10px;
  border-radius: 8px;
  border: none;
  background: #020617;
  color: white;
}

/* ✅ BUTTON */
.main-button {
  width: 100%;
  margin-top: 20px;
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: #2d8cff;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

/* ✅ ARROW */
.arrow {
  text-align: center;
  font-size: 24px;
  margin-top: 10px;
  color: #2d8cff;
}

/* ✅ RESULT */
.result-card {
  background: #020617;
  padding: 16px;
  margin-top: 20px;
  border-radius: 12px;
}

/* ✅ ERROR */
.error {
  color: red;
  margin-top: 10px;
}
`;
document.head.appendChild(style);

createRoot(document.getElementById("app")).render(
  React.createElement(App)
);