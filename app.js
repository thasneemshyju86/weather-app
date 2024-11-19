 // Fetches coordinates based on city name using OpenStreetMap's Nominatim API
 async function getCoordinates(city) {
    const url = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city)}&format=json&limit=1`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.length > 0) {
            return {
                latitude: data[0].lat,
                longitude: data[0].lon
            };
        } else {
            throw new Error("City not found");
        }
    } catch (error) {
        console.error("Error fetching coordinates:", error);
        return null;
    }
}

// Fetches current weather and daily forecast 
async function getWeather() {
    document.getElementById('weeklyData').style.display='none'  //hide the weekly forecast container
    const city = document.getElementById("cityInput").value;
    if (!city) {
        alert("Please enter a city name");
        return;
    }

    // Get coordinates for the entered city
    const coords = await getCoordinates(city);
    if (!coords) {
        alert("City not found");
        return;
    }

    // Define URLs for the current and daily weather endpoints
    const currentWeatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current_weather=true&timezone=auto`;
    const dailyWeatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;

    // Fetch current weather data
    fetch(currentWeatherUrl)
        .then(response => response.json())
        .then(data => displayCurrentWeather(data))
        .catch(error => console.error("Error fetching current weather:", error));

    // Fetch daily weather forecast data
    fetch(dailyWeatherUrl)
        .then(response => response.json())
        .then(data => displayDailyWeather(data))
        .catch(error => console.error("Error fetching daily forecast:", error));
}

// Displays the current weather data
function displayCurrentWeather(data) {
    const currentTemp = data.current_weather.temperature;
    // console.log(data)
    document.getElementById('weatherData').style.display='block'
    document.getElementById("currentTemperature").textContent = `Temperature: ${currentTemp}°C`;
}

//format date
function formatDate(dateString){
    const date=new Date(dateString)
    const formattedDate=date.toLocaleDateString("en-US",{
        month:'short',
        day:'numeric',
        weekday:'short'
    })
    return formattedDate
}

// Displays the daily weather forecast
function displayDailyWeather(data) {
    const daily = data.daily;
    console.log(daily)
    const formattedDate=formatDate(daily.time[0])
    console.log(daily.time[0])

    document.getElementById('dailyData').style.display='block'
    document.getElementById("day").textContent = ` ${formattedDate}`;
    document.getElementById("dailyMaxTemp").textContent = `Max Temp: ${daily.temperature_2m_max[0]}°C`;
    document.getElementById("dailyMinTemp").textContent = `Min Temp: ${daily.temperature_2m_min[0]}°C`;
}

// Fetches weekly weather forecast 
async function getWeeklyWeather() {
    document.getElementById('weeklyData').style.display='block'
    const city = document.getElementById("cityInput").value;
    if (!city) {
        alert("Please enter a city name");
        return;
    }

    // Step 1: Get coordinates for the entered city
    const coords = await getCoordinates(city);
    if (!coords) {
        alert("City not found");
        return;
    }

    //  URL for the weekly forecast
    const weeklyWeatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;

    // Fetch weekly weather data
    fetch(weeklyWeatherUrl)
        .then(response => response.json())
        .then(data => displayWeeklyWeather(data))
        .catch(error => console.error("Error fetching weekly weather:", error));
}

// Displays the weekly weather forecast
function displayWeeklyWeather(data) {
    const weeklyForecastContainer = document.getElementById("weeklyForecast");
    weeklyForecastContainer.innerHTML = ""; // Clear previous data
    document.getElementById('weeklyData').style.display='block'

    // Loop through each day's forecast and display
    data.daily.time.forEach((date, index) => {
        const maxTemp = data.daily.temperature_2m_max[index];
        const minTemp = data.daily.temperature_2m_min[index];

        const dayForecast = document.createElement("div");
        dayForecast.className='forecast-item'
        dayForecast.innerHTML = `<strong>${formatDate(date)}</strong>
        <div class='forecast-temp'> 
         <span> Max ${maxTemp}°C </span>
         <span> Min ${minTemp}°C </span>
          </div>`;
        weeklyForecastContainer.appendChild(dayForecast);
    });
}