mapboxgl.accessToken =
	"pk.eyJ1Ijoienp6YmlhIiwiYSI6ImNsM3ZubXB0djJuc2UzZGw4NHBscnltb3IifQ.DW29ynZDDnPeH6hmtl8O8g"; // set the access token

const initLng = -79.347015;
const initLat = 43.65107;
const map = new mapboxgl.Map({
	container: "map", // The container ID
	style: "mapbox://styles/zzzbia/cl3yk4t1e000h15s3i77cogqd", // The map style to use
	center: [initLng, initLat], // Starting position [lng, lat]
	zoom: 12, // Starting zoom level
});
map.on("load", async () => {
	const tileset = "zzzbia.ahqydxq2"; // replace this with the ID of the tileset you created (this is my tile data set from mapbox)
	const radius = 1609; // 1609 meters is roughly equal to one mile
	const limit = 50; // The maximum amount of results to return

	const geocoder = new MapboxGeocoder({
		// Initialize the geocoder
		accessToken: mapboxgl.accessToken, // Set the access token
		mapboxgl: mapboxgl, // Set the mapbox-gl instance
		zoom: 13, // Set the zoom level for geocoding results
		placeholder: "Enter an address or place name", // This placeholder text will display in the search bar
		bbox: [-180, -90, 180, 90], // Set a bounding box (for Toronto, this is still be way too big/broad)
		country: "CA", //Set the country for geocoding results
	});
	// Add the geocoder to the map
	map.addControl(geocoder, "top-left"); // Add the search box to the top left

	const marker = new mapboxgl.Marker({ color: "#008000" }); // Create a new green marke

	// marker.setLngLat(point).addTo(map); // Add the marker to the map at the result coordinates

	map.addSource("tilequery", {
		// Add a new source to the map style: https://docs.mapbox.com/mapbox-gl-js/api/#map#addsource
		type: "geojson",
		data: {
			type: "FeatureCollection",
			features: [],
		},
	});

	const query = await fetch(
		`https://api.mapbox.com/v4/${tileset}/tilequery/-79.347015,43.65107.json?radius=${
			radius * 500
		}&limit=${50}&access_token=${mapboxgl.accessToken}`,
		{ method: "GET" }
	);

	const json = await query.json();
	map.getSource("tilequery").setData(json);

	geocoder.on("result", async (event) => {
		// When the geocoder returns a result
		const point = event.result.center; // Capture the result coordinates

		const query = await fetch(
			`https://api.mapbox.com/v4/${tileset}/tilequery/${point[0]},${
				point[1]
			}.json?radius=${radius * 20}&limit=${50}&access_token=${
				mapboxgl.accessToken
			}`,
			{ method: "GET" }
		);

		const json = await query.json();
		map.getSource("tilequery").setData(json);

		marker.setLngLat(point).addTo(map); // Add the marker to the map at the result coordinates
	});

	map.addLayer({
		// Add a new layer to the map style: https://docs.mapbox.com/mapbox-gl-js/api/#map#addlayer
		id: "tilequery-points",
		type: "circle",
		source: "tilequery", // Set the layer source
		paint: {
			"circle-stroke-color": "white",
			"circle-stroke-width": {
				// Set the stroke width of each circle: https://docs.mapbox.com/mapbox-gl-js/style-spec/#paint-circle-circle-stroke-width
				stops: [
					[0, 0.1],
					[18, 3],
				],
				base: 5,
			},
			"circle-radius": {
				// Set the radius of each circle, as well as its size at each zoom level: https://docs.mapbox.com/mapbox-gl-js/style-spec/#paint-circle-circle-radius
				stops: [
					[12, 5],
					[22, 180],
				],
				base: 5,
			},
			"circle-color": [
				// Specify the color each circle should be
				"match", // Use the 'match' expression: https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-match
				["get", "Park Name"], // Use the result 'STORE_TYPE' property
				"Building Name",
				"#93C572",
				"#E49B0F", // any other store type
			],
		},
	});
});
