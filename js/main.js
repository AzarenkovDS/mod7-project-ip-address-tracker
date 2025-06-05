import { API_KEY } from "./../secrets.js";

const ipAddressEndpoint = `https://geo.ipify.org/api/v2/country,city?apiKey=${API_KEY}&ipAddress=`;
const domainsEndpoint = `https://geo.ipify.org/api/v2/country,city?apiKey=${API_KEY}&domain=`;

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");

// global variable for the map object
let map = null;

function displayInfo(locationData) {
  document.getElementById("ip_address").innerText = locationData.ip;
  document.getElementById(
    "location"
  ).innerText = `${locationData.location.city}, ${locationData.location.region} ${locationData.location.postalCode}`;
  document.getElementById("timezone").innerText =
    locationData.location.timezone;
  document.getElementById("isp").innerText =
    locationData.isp || locationData.as.name;
}

function updateMap(data) {
  const { lat, lng } = data.location;
  map.setView([lat, lng], 13);
  L.marker([lat, lng]).addTo(map, 13);
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // get the user ip address
    const ipResponse = await fetch("https://api.ipify.org?format=json");
    const ipData = await ipResponse.json();
    const ip = ipData.ip;

    // get location info
    const locationResponse = await fetch(`${ipAddressEndpoint}${ip}`);
    const locationData = await locationResponse.json();

    displayInfo(locationData);

    // Display map
    map = L.map("map").setView(
      [locationData.location.lat, locationData.location.lng],
      13
    );

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    L.marker([locationData.location.lat, locationData.location.lng]).addTo(map);
  } catch (error) {
    console.error("Error fetching IP address:", error);
  }

  searchButton.addEventListener("click", async () => {
    try {
      const searchTerm = searchInput.value;
      if (!searchTerm) return;

      // Test for a valid IPv4 IP or IPv6
      const ipReg =
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      console.log(ipReg.test(searchTerm));

      // Test for a valid domain name
      const domainReg =
        /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      console.log(domainReg.test(searchTerm));

      if (ipReg.test(searchTerm)) {
        const res = await fetch(ipAddressEndpoint + searchTerm);
        const data = await res.json();
        displayInfo(data);
        updateMap(data);
      } else if (domainReg.test(searchTerm)) {
        const res = await fetch(domainsEndpoint + searchTerm);
        const data = await res.json();
        displayInfo(data);
        updateMap(data);
      } else {
        alert("Please enter a valid IP address or domain name");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  });
});
