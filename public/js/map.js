mapboxgl.accessToken =mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    center: listing.geometry.coordinates, // starting position [lng, lat]
    zoom: 10 // starting zoom
});

const marker=new mapboxgl.Marker({color:'red'})
.setLngLat(listing.geometry.coordinates)
.setPopup(new mapboxgl.Popup({offset:25}).setHTML(`<h4>${listing.title}</h4><p>Exact Location Provided After Booking</p>`))
.addTo(map);