// Earthquakes URL
var earthquakesURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Initialize Earthquake Layer
var earthquakes = new L.LayerGroup();

// Create Earthquake overlay
var overlayMaps = {
    "Earthquakes": earthquakes,
};

// Add Basemap
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
});

// Create Map
var myMap = L.map("map", {
    center: [38.57033210844313, -119.57880387139932],
    zoom: 5,
    layers: [osm, earthquakes]
});

// Create a Layer Control
L.control.layers(overlayMaps).addTo(myMap);

// Use D3 to retrieve earthquake data 
d3.json(earthquakesURL, function(earthquakeData) {
    // Marker size based on magnitude
    function markerSize(magnitude) {
        if (magnitude === 0) {
          return 1;
        }
        return magnitude * 3;
    }
    // Marker Style
    function styleInfo(feature) {
        return {
          opacity: 1,
          fillOpacity: 1,
          fillColor: chooseColor(feature.properties.mag),
          color: "#000000",
          radius: markerSize(feature.properties.mag),
          stroke: true,
          weight: 0.5
        };
    }
    // Set color based on size and depth
    function chooseColor(magnitude) {
        switch (true) {
        case magnitude > 5:
            return "#7953A9";
        case magnitude > 4:
            return "#8B74BD";
        case magnitude > 3:
            return "#B9BFFF";
        case magnitude > 2:
            return "#4066E0";
        case magnitude > 1:
            return "#22277A";
        default:
            return "#DAF7A6";
        }
    }
    // Create a GeoJSON Layer
    L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        // Popup
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h4>Location: " + feature.properties.place + 
            "</h4><hr><p>Date & Time: " + new Date(feature.properties.time) + 
            "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
        }
    // Add earthquakeData to earthquakes LayerGroups 
    }).addTo(earthquakes);
    // Add earthquakes Layer to the Map
    earthquakes.addTo(myMap);

    // Legend
    var legend = L.control({ position: "bottomleft" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend"), 
        magnitudeLevels = [0, 1, 2, 3, 4, 5];

        div.innerHTML += "<h3>Magnitude</h3>"

        for (var i = 0; i < magnitudeLevels.length; i++) {
            div.innerHTML +=
                '<i style="background: ' + chooseColor(magnitudeLevels[i] + 1) + '"></i> ' +
                magnitudeLevels[i] + (magnitudeLevels[i + 1] ? '&ndash;' + magnitudeLevels[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap);
});