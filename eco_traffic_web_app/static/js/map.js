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
var routes = []; // Routes represented on the map
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


// Lists of options when the user searches using an address
const lists = [];
lists[1] = L.DomUtil.get('list1');
lists[2] = L.DomUtil.get('list2');

// Prevent forwarding the form by pressing enter to enable searching with an address
L.DomEvent.on(form, 'keypress', function (e) { if (e.key === "Enter" || e.keyCode === 13) { e.preventDefault(); } });

// Update options while searching with an address
function updateOptions(e) {
    // Check if enter was pressed
    if (e.key === "Enter" || e.keyCode === 13) {
        lists[checked].textContent = '';

        // The data of possible locations is retrieved
        fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&q="' + inputs[checked].value + '"')
            .then(function (response) {
                return response.json();
            }).then(function (response) {
                if (response) { // If the call was correct
                    for (let object of response) { // Each possible option is added to the list
                        let option = document.createElement('option');
                        option.value = String(object['lat'] + "," + object['lon']);
                        option.innerHTML = object['display_name'];
                        lists[checked].appendChild(option);
                    }
                }
            })
            .catch(function (err) {
                console.log('No options found for this query');
            });

        // Empty value to show all results
        inputs[checked].value = "";
    }
}

L.DomEvent.on(inputs[1], 'keyup', updateOptions);
L.DomEvent.on(inputs[2], 'keyup', updateOptions);


// Add marker to map while searching with an address
function searchLocation(e) {
    // Check the input comes from address selection
    if (e.inputType == "insertReplacementText" || e.inputType == null) {
        if (markers[checked]) {
            map.removeLayer(markers[checked]);
        }
        // Replace marker
        let coords = e.target.value.split(",").map(Number);
        markers[checked] = new L.marker(coords).addTo(map);
        if (checked == 2) {
            markers[2]._icon.classList.add("dest_marker");
        }
        map.panTo(coords); // Center map to the new marker
    }

    // Remove routes if marker is changed
    if (routes.length) {
        routes.forEach(function (item, index) {
            map.removeLayer(item);
        });

        routes = [];

        // Remove additional textboxes
        L.DomUtil.get('instructions').remove();
        L.DomUtil.get('details').remove();
    }
}

L.DomEvent.on(inputs[1], 'input', searchLocation);
L.DomEvent.on(inputs[2], 'input', searchLocation);


// List of instructions to show
const instructions_list = [];

// Show instructions from selected route
function showInstructions(index) {
    // Highlight route
    routes[index].bringToFront();

    // Show block with instructions
    let instructions = L.DomUtil.get('instructions');
    instructions.style.display = 'block';
    L.DomEvent.disableClickPropagation(instructions);
    L.DomEvent.disableScrollPropagation(instructions);

    instructions.innerHTML = "<h1>Instructions</h1>";

    // Add content to show
    instructions.appendChild(instructions_list[index]);
}