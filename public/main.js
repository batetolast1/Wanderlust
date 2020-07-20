// Foursquare API Info
const clientId = 'FOURSQUARE_CLIENT_ID';
const clientSecret = 'FOURSQUARE_CLIENT_SECRET';
const url = 'https://api.foursquare.com/v2/venues/explore?near=';

// OpenWeather Info
const openWeatherKey = 'OPEN_WEATHER_KEY';
const weatherUrl = 'https://api.openweathermap.org/data/2.5/weather?q=';

// Page Elements
const $input = $('#city');
const $submit = $('#button');
const $destination = $('#destination');
const $container = $('.container');
const $venueDivs = [$("#venue1"), $("#venue2"), $("#venue3"), $("#venue4")];
const $weatherDiv = $("#weather1");
const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// helper functions
const currentDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String((today.getMonth() + 1)).padStart(2, '0');
  const year = today.getFullYear()
  return `${year}${month}${day}`;
}

const randomNumbers = () => {
  let randomSet = new Set();
  while (randomSet.size !== 4) {
    randomSet.add(Math.floor(Math.random() * 10));
  }
  return Array.from(randomSet);
}

// AJAX functions
const getVenues = async () => {
  const city = $input.val();
  const urlToFetch = `${url}${city}&limit=10&client_id=${clientId}&client_secret=${clientSecret}&v=${currentDate()}`;

  try {
    const response = await fetch(urlToFetch);
    if (response.ok) {
      const jsonResponse = await response.json();
      return jsonResponse.response.groups[0].items.map(item => item.venue);
    }
  } catch (error) {
    console.log(error);
  }
};

const getVenuePhoto = async venueId => {
  const urlToFetch = `https://api.foursquare.com/v2/venues/${venueId}/photos?limit=1&client_id=${clientId}&client_secret=${clientSecret}&v=${currentDate()}`;

  try {
    const response = await fetch(urlToFetch);
    if (response.ok) {
      const jsonResponse = await response.json();
      return jsonResponse.response.photos.items;
    }
  } catch (error) {
    console.log(error);
  }
};

const getForecast = async () => {
  const city = $input.val();
  const urlToFetch = `${weatherUrl}${city}&appid=${openWeatherKey}`;

  try {
    const response = await fetch(urlToFetch);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log(error);
  }
};

const createVenueHTML = (name, iconUrl, location) => {
  return `<h2>${name}</h2>
  <img class="venueimage" src="${iconUrl}" alt="sample venue image"/>
  <h3>Address:</h3>
  <p>${location.address}</p>
  <p>${location.city}</p>
  <p>${location.country}</p>`
};

const createPhotoHTML = (photo, $venue) => {
  const photoUrl = `${photo[0].prefix}300x300${photo[0].suffix}`;
  $venue.append(`<img src="${photoUrl}" alt="sample venue photo"/>`);
}

const renderVenues = venues => {
  //creates array of HTML formatted venue divs
  const venuesToRender = randomNumbers();

  $destination.append(`<h2>${$input.val()}</h2>`);

  $venueDivs.forEach(($venue, index) => {
    const venue = venues[venuesToRender[index]];
    const venueId = venue.id;
    const venueIcon = venue.categories[0].icon;
    const venueImgSrc = `${venueIcon.prefix}bg_64${venueIcon.suffix}`;
    const venueContent = createVenueHTML(venue.name, venueImgSrc, venue.location);
    $venue.append(venueContent);
    
    getVenuePhoto(venueId).then(photo => createPhotoHTML(photo, $venue));
  });
}

const createWeatherHTML = (currentDay) => {
  return `<h2>${weekDays[new Date(currentDay.dt).getDay()]}</h2>
  <h2> Temperature: ${(currentDay.main.temp - 273.15).toFixed(0)}&deg; C</h2>
  <h2> Feels like: ${(currentDay.main.feels_like - 273.15).toFixed(0)}&deg; C</h2>
  <h2> Weather: ${currentDay.weather[0].description}</h2>
  <img src="http://openweathermap.org/img/wn/${currentDay.weather[0].icon}@2x.png" alt="weather icon">`
}

const renderForecast = (day) => {
	const weatherContent = createWeatherHTML(day);
  $weatherDiv.append(weatherContent);
}

const executeSearch = () => {
  $venueDivs.forEach(venue => venue.empty());
  $weatherDiv.empty();
  $destination.empty();
  $container.css("visibility", "visible");
  getVenues().then(venues => renderVenues(venues));
  getForecast().then(forecast => renderForecast(forecast));
  return false;
}

$submit.click(executeSearch);
