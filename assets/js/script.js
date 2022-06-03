// Assigning the apiKey variable to the API Key needed to access the data set
let apiKey = "gPYdcAZ3x7dA2mYoq34XovsV4rz8IFvd";
// Assigning querySize to the amount of events we want to pull from a page in the data set (currently the maximum value for the api is 1000 per page)
let querySize = "50";

const mapBoxKey =
	"pk.eyJ1Ijoienp6YmlhIiwiYSI6ImNsM3ZubXB0djJuc2UzZGw4NHBscnltb3IifQ.DW29ynZDDnPeH6hmtl8O8g"; // set the access token
mapboxgl.accessToken = mapBoxKey;
// the Init Lang & Lat are the Starting GIS coordinates for Toronto
const initLng = -79.347015;
const initLat = 43.65107;

// Function which grabs data from the ticket master api
function getData() {
	// Accessing data from the api with the dmaID of the Toronto area, using the apiKey, the page size of the querySize, and sorting by ascending date
	let ticketMasterURL =
		"https://app.ticketmaster.com/discovery/v2/events.json?dmaId=527&apikey=" +
		apiKey +
		"&size=" +
		querySize +
		"&sort=date,asc";
	fetch(ticketMasterURL, {
		method: "GET",
	})
		.then((response) => {
			// Returns json object for reference
			return response.json();
		})
		.then((data) => {
			let events = [];

			// Variable for the current date
			let currentDate = moment().format("YYYY-MM-DD");
			// Variable for the start date for the dateCheck, days is subtracted by 1 so that the starting range can be checked for the current date
			let startWeekDate = moment().subtract(1, "days").format("YYYY-MM-DD");
			// Variable for the end date for the dateCheck, days is added by 8 so that the end of the range checked is for a full week
			let endWeekDate = moment().add(8, "days").format("YYYY-MM-DD");

			// Assigning eventData to the value of the events data set
			let eventData = data._embedded.events;

			// For loop to increment through the events data array
			for (i = 0; i < data._embedded.events.length; i++) {
				// Assigning dateData to the value of the localDate data set so that it can grab the starting date of the event
				let dateData = data._embedded.events[i].dates.start.localDate;

				// Function to check if the events in the data set are within 7 days of the current date
				function checkBetween(date1, date2, date3) {
					return moment(date1).isBetween(date2, date3);
				}

				// Assigning dateCheck to have a value of either true or false depending on if the event is within a 7 day range of the current date
				let dateCheck = checkBetween(dateData, startWeekDate, endWeekDate);

				// Assigning cancelledCheck to the value of the status in the data set, this is used in the following if statement to see if tickets are on sale for the event
				let cancelledCheck = eventData[i].dates.status.code;

				// If statement to check if dateCheck is true, and if cancelledCheck is equal to onsale
				if ((dateCheck, cancelledCheck === "onsale")) {
					// Assigning latData to the value of the events data set latitude
					let latData = eventData[i]._embedded.venues[0].location.latitude;
					// Assigning lonData to the value of the events data set longitude
					let lonData = eventData[i]._embedded.venues[0].location.longitude;
					// Assigning eventTitleData to the value of the events data set of the events title
					let eventTitleData = eventData[i].name;
					// Assigning eventURL to the value of the events data set url so that it gets the url where the user can buy a ticket
					let eventURL = eventData[i].url;
					// Assigning venueNameData to the value of the events data set venue name
					let venueNameData = eventData[i]._embedded.venues[0].name;

					// Console logs to log the desired data of the data set for things such as the event title, the geo location of the event, etc

					if (
						latData &&
						lonData &&
						eventTitleData &&
						eventURL &&
						venueNameData
					) {
						events.push({
							lat: latData,
							lon: lonData,
							title: eventTitleData,
							url: eventURL,
						});
					}
				}
			}
			if (events.length) {
				startMapBox(events);
			} else {
				alert("No events found in your area");
			}
		})
		.catch((e) => {
			console.error(e);
		});
}

const startMapBox = async (events) => {
	console.log("startmapbox", events);
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

		// Washroom Location Tilequery points
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
		for (let i = 0; i < events.length; i++) {
			const el = document.createElement("div");
			el.className = "marker";

			const maboxMarker = new mapboxgl.Marker({});

			maboxMarker.setLngLat([events[i].lon, events[i].lat]);

			maboxMarker.setPopup(
				new mapboxgl.Popup({ offset: 25 }) // add popups
					.setHTML(`<h3>${events[i].title}</h3><p>${events[i].url}</p>`)
			);

			maboxMarker.addTo(map);

			console.log(maboxMarker);
		}
	});
};

// Calling the getData function
getData();
