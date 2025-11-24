
const API_KEY = '726db9ef469ed953aed963e33240e221';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/';

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const unitToggle = document.getElementById('unit-toggle');
const weatherDisplay = document.getElementById('weather-display');
const currentTemp = document.getElementById('temp-value');
const currentDesc = document.getElementById('description');
const currentIcon = document.getElementById('weather-icon');
const cityName = document.getElementById('city-name');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const forecastContainer = document.getElementById('forecast');
const unitSymbol = document.querySelector('.unit-symbol');
const errorMessageDiv = document.getElementById('error-message');

let isCelsius = true;

/**
 * Handles API errors gracefully and displays a message.
 * @param {string} message - The error message to display.
 */
function handleApiError(message) {
    errorMessageDiv.textContent = `Error: ${message}`;
    errorMessageDiv.style.display = 'block';
    weatherDisplay.style.display = 'none';
}

function clearError() {
    errorMessageDiv.style.display = 'none';
    errorMessageDiv.textContent = '';
    weatherDisplay.style.display = 'block';
}

/**
 * Fetches weather data for a given city.
 * @param {string} city - The city name.
 */
async function getWeatherData(city) {
    clearError();
    if (!city) {
        handleApiError("Please enter a city name.");
        return;
    }

    const units = 'metric'; 

    const currentUrl = `${BASE_URL}weather?q=${city}&units=${units}&appid=${API_KEY}`;
    const forecastUrl = `${BASE_URL}forecast?q=${city}&units=${units}&appid=${API_KEY}`;

    try {
        const [currentRes, forecastRes] = await Promise.all([
            fetch(currentUrl),
            fetch(forecastUrl)
        ]);

        if (!currentRes.ok) {
            const errorData = await currentRes.json();
            handleApiError(`City not found or API error: ${errorData.message}`);
            return;
        }

        const currentData = await currentRes.json();
        const forecastData = await forecastRes.json();

        displayCurrentWeather(currentData);
        displayForecast(forecastData);

    } catch (error) {
        handleApiError("Failed to fetch weather data. Check your connection or API Key.");
        console.error("Fetch error:", error);
    }
}

/**
 * Displays the current weather data.
 * @param {object} data - The current weather data object.
 */
function displayCurrentWeather(data) {
    const tempInC = data.main.temp;
    const tempInF = (tempInC * 9/5) + 32;

    cityName.textContent = data.name;
    currentDesc.textContent = data.weather[0].description;
    humidity.textContent = data.main.humidity;
    windSpeed.textContent = data.wind.speed;
    currentIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    currentIcon.alt = data.weather[0].description;
    currentTemp.dataset.celsius = tempInC.toFixed(1);
    currentTemp.dataset.fahrenheit = tempInF.toFixed(1);
    updateTemperatureDisplay();
}

/**
 * Displays the 5-day forecast.
 * @param {object} data - The forecast data object.
 */
function displayForecast(data) {
    forecastContainer.innerHTML = '';
    const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));

    dailyData.slice(0, 5).forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const tempC = day.main.temp;
        const tempF = (tempC * 9/5) + 32;

        const forecastCard = document.createElement('div');
        forecastCard.className = 'card forecast-card';
        forecastCard.innerHTML = `
            <h4>${dayName}</h4>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}">
            <p><span class="temp-val" data-celsius="${tempC.toFixed(1)}" data-fahrenheit="${tempF.toFixed(1)}">${isCelsius ? tempC.toFixed(1) : tempF.toFixed(1)}</span><span class="unit-symbol">${isCelsius ? '°C' : '°F'}</span></p>
            <p>${day.weather[0].main}</p>
        `;
        forecastContainer.appendChild(forecastCard);
    });
}

function updateTemperatureDisplay() {
    const unitText = isCelsius ? '°C' : '°F';
    const tempAttr = isCelsius ? 'celsius' : 'fahrenheit';

    currentTemp.textContent = currentTemp.dataset[tempAttr];
    unitSymbol.textContent = unitText;

    document.querySelectorAll('.forecast-card .temp-val').forEach(tempSpan => {
        tempSpan.textContent = tempSpan.dataset[tempAttr];
        tempSpan.nextElementSibling.textContent = unitText;
    });
    unitToggle.textContent = isCelsius ? '°C / °F' : '°F / °C';
}

unitToggle.addEventListener('click', () => {
    isCelsius = !isCelsius; // Toggle state
    updateTemperatureDisplay();
});


searchBtn.addEventListener('click', () => {
    getWeatherData(cityInput.value.trim());
});


cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeatherData(cityInput.value.trim());
    }
});

getWeatherData('London'); 
