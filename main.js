async function handleTrip() {
  if (!pickup || !dropoff) {
    setError("Enter both locations ❌");
    return;
  }

  setError("");

  try {
    const res = await fetch(`${API}/trips`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ pickup, dropoff })
    });

    const data = await res.json();

    // ✅ HANDLE BACKEND ERRORS
    if (data.error) {
      setError(data.error);
      return;
    }

    setTrip(data[0]);

  } catch (err) {
    console.error(err);
    setError("Failed to calculate trip ❌");
  }
}