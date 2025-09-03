/* eslint-disable */
const displayMap = (locations) => {
  if (!locations || locations.length === 0) return;

  const map = L.map('map', { zoomControl: false });
  // const map = L.map('map');

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const points = [];

  locations.forEach((loc) => {
    const [lng, lat] = loc.coordinates;
    points.push([lat, lng]);

    const customIcon = L.icon({
      iconUrl: '/img/pin.png',
      iconSize: [32, 40],
      iconAnchor: [16, 40],
      popupAnchor: [0, -30],
    });

    L.marker([lat, lng], { icon: customIcon })
      .addTo(map)
      .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, {
        autoClose: false,
      });
  });

  const bounds = L.latLngBounds(points).pad(0.5);
  map.fitBounds(bounds);
  map.scrollWheelZoom.disable();
};

window.displayMap = displayMap;

const mapEl = document.getElementById('map');
if (mapEl) {
  const locations = JSON.parse(mapEl.dataset.locations);
  displayMap(locations);
}
