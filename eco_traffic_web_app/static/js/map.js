// Layer views for the map to choose
var baselayers = {
    "OpenStreetMap Style": L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxNativeZoom:25,
            maxZoom:25
    }),
    "Google Maps Style": L.tileLayer(
        'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            attribution: '&copy; <a href="https://www.google.es/maps">Google Maps</a>',
            maxNativeZoom:25,
            maxZoom:25,
            subdomains:['mt0','mt1','mt2','mt3']
    }),
    "Satellite View - Google Maps": L.tileLayer(
        'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
            attribution: '&copy; <a href="https://www.google.es/maps">Google Maps</a>',
            maxNativeZoom:25,
            maxZoom:25,
            subdomains:['mt0','mt1','mt2','mt3']
    }),
    "Satellite View - Instituto Geográfico Nacional de España": L.tileLayer(
        "http://www.ign.es/wmts/pnoa-ma?&SERVICE=WMTS&REQUEST=GetTile&LAYER=OI.OrthoimageCoverage&FORMAT=image/jpeg&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}", {
			attribution: "© <a href='http://www.ign.es'>Instituto Geográfico Nacional de España</a>",
            maxNativeZoom:25,
            maxZoom:25
    }),
};

// This part loads the map
var map = L.map('map', {
	layers:[
		baselayers["OpenStreetMap Style"],
	],
	maxZoom:19,
	minZoom:7,}
).fitWorld();

// Adding layer control button to map
L.control.layers(baselayers, {}).addTo(map);

const markers = []; // Markers for origin and destination points
var checked; // Flag to know which input was clicked last time

var form = L.DomUtil.get('container'); // this enables writing for the form inputs
L.DomEvent.disableClickPropagation(form);
L.DomEvent.disableScrollPropagation(form);

// This changes the colors of the inputs depending of which one got clicked
const inputs = [];
inputs[1] = L.DomUtil.get('origin');
inputs[2] = L.DomUtil.get('destination');
L.DomEvent.on(inputs[1], 'click', function (e) {checked = 1; L.DomUtil.removeClass(inputs[2], 'destination'); L.DomUtil.addClass(inputs[1], 'origin');});
L.DomEvent.on(inputs[2], 'click', function (e) {checked = 2; L.DomUtil.addClass(inputs[2], 'destination'); L.DomUtil.removeClass(inputs[1], 'origin');});

// This button prevents adding markers by clicking and also removes input colors 
var stop = L.DomUtil.get('stop');
L.DomEvent.on(stop, 'click', function (e) {L.DomUtil.removeClass(inputs[1], 'origin'); L.DomUtil.removeClass(inputs[2], 'destination'); checked = 0;});

 // Add marker to map at click location
function addMarker(e){
    // Checks if marker can be placed
    if(checked){
        // If there was a marker for that input, it gets removed
        if(markers[checked]){
            map.removeLayer(markers[checked]);
        }
        markers[checked] = new L.marker(e.latlng).addTo(map);
        // Coordinates are written in the input value
        inputs[checked].value = String(markers[checked].getLatLng().lat) + ',' + String(markers[checked].getLatLng().lng);
        // The color of the icon is changed for destination
        if(checked == 2){
            markers[2]._icon.classList.add("dest_marker");
        }
    }
}