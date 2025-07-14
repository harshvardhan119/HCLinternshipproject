// src/App.js
import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import './App.css';

function App() {
  const [inputData, setInputData] = useState('');
  const [forecast, setForecast] = useState([]);

  const handleChange = (e) => setInputData(e.target.value);

  const handlePredict = async () => {
    const prices = inputData.split(',').map(num => parseFloat(num.trim()));
    if (prices.length !== 60) {
      alert('Please enter exactly 60 closing prices.');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ last_60_days: prices }),
      });

      const data = await response.json();

      if (data.forecast) {
        const formatted = data.forecast.map((price, i) => ({
          day: `Day ${i + 1}`,
          price: parseFloat(price.toFixed(2)),
        }));
        setForecast(formatted);
      } else {
        alert("Backend error: " + data.error || "Unknown error");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to backend.");
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>📈 LSTM Stock Price Predictor</h1>
        <p>Enter the last 60 daily closing prices to forecast the next 30 days.</p>
      </div>

      <div className="input-section">
        <textarea
          rows={6}
          placeholder="Enter 60 closing prices separated by commas"
          value={inputData}
          onChange={handleChange}
        />
        <button onClick={handlePredict}>🚀 Predict</button>
      </div>

      {forecast.length > 0 && (
        <div className="chart-section">
          <h2>📊 Forecasted Prices (Next 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Line type="monotone" dataKey="price" stroke="#00b894" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default App;
