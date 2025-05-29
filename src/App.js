import React, { useState } from "react";
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

// Register Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

// ✅ Use your own API key from OpenWeatherMap
const API_KEY = "a0f930566647008036d42a5099cd2884";

function App() {
  const [city, setCity] = useState("");
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setCurrentWeather(null);
    setForecastData([]);

    try {
      // 1. Get coordinates from city name
      const geoRes = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
      );

      if (geoRes.data.length === 0) {
        alert("City not found!");
        setLoading(false);
        return;
      }

      const { lat, lon } = geoRes.data[0];

      // 2. Get current weather
      const weatherRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      setCurrentWeather(weatherRes.data);

      // 3. Get 5-day forecast (every 3 hours)
      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );

      // 4. Filter daily forecasts at 12:00 PM only
      const dailyForecasts = forecastRes.data.list
        .filter((item) => item.dt_txt.includes("12:00:00"))
        .slice(0, 5);

      const tempData = dailyForecasts.map((entry) => ({
        date: new Date(entry.dt * 1000).toLocaleDateString(),
        temp: entry.main.temp,
      }));

      setForecastData(tempData);
    } catch (error) {
      console.error("Error fetching data:", error);
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

      {forecastData.length > 0 && (
        <div style={{ maxWidth: "600px", marginTop: "30px" }}>
          <h2>5-Day Forecast</h2>
          <Line
            data={{
              labels: forecastData.map((item) => item.date),
              datasets: [
                {
                  label: "Temperature (°C)",
                  data: forecastData.map((item) => item.temp),
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