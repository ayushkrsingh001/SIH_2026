const query = `[out:json][timeout:25];
(
  node["amenity"~"police|hospital|clinic|courthouse"](around:25000,23.0225,72.5714);
);
out center;`;
fetch('https://overpass-api.de/api/interpreter', { 
  method: 'POST', 
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'RightsQuest/1.0'
  },
  body: 'data=' + encodeURIComponent(query) 
})
  .then(r => r.text())
  .then(console.log)
  .catch(console.error);
