const query = `[out:json][timeout:25];
(
  node["amenity"~"police|hospital|clinic|courthouse"](around:25000,23.0225,72.5714);
);
out center;`;
fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query))
  .then(r => r.json())
  .then(data => console.log('Elements found:', data.elements.length))
  .catch(console.error);
