import {fetchData} from './functions';
import { Restaurant } from './interfaces/Restaurant';
import { Menu, Weekly } from './interfaces/Menu';
import {apiUrl, positionOptions} from './variables';
import './main.css';
import 'leaflet.locatecontrol'
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css'
import * as L from 'leaflet';


const map = L.map('map').setView([60.1699, 24.9384], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const error = (err: GeolocationPositionError) => {
  console.warn(`ERROR(${err.code}): ${err.message}`);
};

const success = (position: GeolocationPosition) => {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
}

(async () => {
  const restaurants = await fetchData<Restaurant[]>(apiUrl + '/restaurants');

  restaurants.forEach(async (restaurant: Restaurant) => {
    const menu = await fetchData<Menu>(apiUrl + `/restaurants/daily/${restaurant._id}/fi`);
    const menu2 = await fetchData<Weekly>(apiUrl + `/restaurants/weekly/${restaurant._id}/fi`);

    const marker = L.marker([
      restaurant.location.coordinates[1],
      restaurant.location.coordinates[0],
    ]).addTo(map);

    const openDailyMenuDialog = () => {
      let infoHtml = `
      <h3>${restaurant.name} - Menu of the day</h3>
        <table class="table">
          <tr>
            <th>Course</th>
            <th>Diet</th>
            <th>Price</th>
          </tr>
      `;

      menu.courses.forEach((course) => {
        const { name, diets, price } = course;
        infoHtml += `
          <tr>
            <td>${name}</td>
            <td>${diets ?? ' - '}</td>
            <td>${price ?? ' - '}</td>
          </tr>
        `;
      });

      const infoPopup = L.popup()
        .setLatLng(marker.getLatLng())
        .setContent(infoHtml);

      map.openPopup(infoPopup);
    };

    const openWeeklyMenuDialog = () => {
      let infoHtml = `
        <h3>${restaurant.name} - Weekly Menu</h3>
      `;

      menu2.days.forEach(day => {
          infoHtml += `
            <h4>${day.date}</h4>
            <table>
              <tr>
                <th>Course</th>
                <th>Diet</th>
                <th>Price</th>
              </tr>
          `;

          day.courses.forEach(course => {
              const { name, diets, price } = course;
              infoHtml += `
                <tr>
                  <td>${name}</td>
                  <td>${diets ?? ' - '}</td>
                  <td>${price ?? ' - '}</td>
                </tr>
              `;
          });

          infoHtml += `</table>`;
      });

      const weeklyMenuDialog = L.popup()
          .setLatLng(marker.getLatLng())
          .setContent(infoHtml);

      map.openPopup(weeklyMenuDialog);
  };

    const openPopup = () => {
      const popupContent = document.createElement('div');

      const popupHtml = `
        <h3>${restaurant.name}</h3>
        <p>${restaurant.address}</p>
        <button class="info-button">Daily Menu</button>
        <button class="weekly-menu">Weekly Menu</button>
      `;

      popupContent.innerHTML = popupHtml;

      const dailyMenu = popupContent.querySelector('.info-button');
      dailyMenu?.addEventListener('click', openDailyMenuDialog);

      const weeklyMenu = popupContent.querySelector('.weekly-menu');
      weeklyMenu?.addEventListener('click', openWeeklyMenuDialog);

      const nearestRes = document.querySelector('#find-closest')
      nearestRes?.addEventListener('click', () => {
        navigator.geolocation.getCurrentPosition(success, error, positionOptions);
        map.locate({setView: true, watch: true})
      });

      const popup = L.popup()
        .setLatLng(marker.getLatLng())
        .setContent(popupContent);

      map.openPopup(popup);
    };

    marker.on('click', openPopup);
  });

})();

L.control.locate().addTo(map);
navigator.geolocation.getCurrentPosition(success, error, positionOptions);
