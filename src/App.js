import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const API_KEY = "5bbc1ac4830de90703d20b0ec595ecbb"; // Replace with your OpenWeatherMap API key

function App() {
  const [city, setCity] = useState("");
  const [currentWeather, setCurrentWeather] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState({ lat: null, lon: null });

  const handleSearch = async () => {
    setLoading(true);
    setCurrentWeather(null);
    setHistoricalData([]);

    try {
      // Get coordinates from city name
      const geoRes = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
      );

      if (geoRes.data.length === 0) {
        alert("City not found!");
        setLoading(false);
        return;
      }

      const { lat, lon } = geoRes.data[0];
      setCoords({ lat, lon });

      // Fetch current weather
      const weatherRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      setCurrentWeather(weatherRes.data);

      // Fetch historical weather (past 5 days)
      const now = Math.floor(Date.now() / 1000);
      let tempData = [];

      for (let i = 1; i <= 5; i++) {
        const dt = now - i * 86400; // one day back per loop
        const histRes = await axios.get(
          `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${dt}&appid=${API_KEY}&units=metric`
        );
        tempData.push({
          date: new Date(dt * 1000).toLocaleDateString(),
          temp: histRes.data.current.temp,
        });
      }

      setHistoricalData(tempData.reverse());
    } catch (error) {
      console.error("Error fetching data", error);
      alert("Error fetching data. Please check your API key and city name.");
    }

    setLoading(false);
  };

  return (
    <div className="App" style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Weather Dashboard</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{ padding: "8px", fontSize: "16px", marginRight: "10px" }}
        />
        <button onClick={handleSearch} style={{ padding: "8px 16px", fontSize: "16px" }}>
          Search
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {currentWeather && (
        <div>
          <h2>Current Weather in {currentWeather.name}</h2>
          <p>Temperature: {currentWeather.main.temp}°C</p>
          <p>Condition: {currentWeather.weather[0].description}</p>
        </div>
      )}

      {historicalData.length > 0 && (
        <div style={{ maxWidth: "600px", marginTop: "30px" }}>
          <h2>Past 5 Days Temperature</h2>
          <Line
            data={{
              labels: historicalData.map((item) => item.date),
              datasets: [
                {
                  label: "Temperature (°C)",
                  data: historicalData.map((item) => item.temp),
                  fill: false,
                  borderColor: "blue",
                  tension: 0.3,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;

