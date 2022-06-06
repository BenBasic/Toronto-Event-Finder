// Assigning searchList variable to the previous-searches id within the html, this is where the list items will populate
let searchList = $("#previous-searches");
// // Assigning recommendedList variable to the recommended-areas id within the html, this is where the pre-defined list items will populate
let recommendedList = $("#recommended-areas");
// Assigning searchStorage the value of whats currently stored in pastSearches local storage if it currently exists
searchStorage = JSON.parse(localStorage.getItem("pastSearches"));

// If statement checking if local storage = null, if it is then it assigns a null value to the pastSearches localStorage
if ((localStorage = null)) {
	localStorage.setItem("pastSearches", null);
}

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

const map = new mapboxgl.Map({
	container: "map", // The container ID
	style: "mapbox://styles/zzzbia/cl3yk4t1e000h15s3i77cogqd", // The map style to use
	center: [initLng, initLat], // Starting position [lng, lat]
	zoom: 12, // Starting zoom level
});

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
			// console.log(data);
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
				if (dateCheck && cancelledCheck === "onsale") {
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
					// Assigning  featureImage to the value of events data image from the url of where the user can buy a ticket
					let featureImage = eventData[i].images[0].url;
					// Starting day of the event
					let eventStartDay = eventData[i].dates.start.localDate;
					// Starting Time of the event
					let eventStartTime = eventData[i].dates.start.localTime;

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
							venueNameData: venueNameData,
							featureImage: featureImage,
							eventStartDay: eventStartDay,
							eventStartTime: eventStartTime,
						});
						// console.log(events);
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
	// console.log("startmapbox", events);
	const map = new mapboxgl.Map({
		container: "map", // The container ID
		style: "mapbox://styles/zzzbia/cl3yk4t1e000h15s3i77cogqd", // The map style to use
		center: [initLng, initLat], // Starting position [lng, lat]
		zoom: 12, // Starting zoom level
	});

	recommendedAreas = [
		{
			address: "Scotiabank Arena",
			lon: -79.3791035,
			lat: 43.6433895,
		},
		{
			address: "Ontario Place",
			lon: -79.41511374999999,
			lat: 43.62939075,
		},
		{
			address: "Danforth Music Hall",
			lon: -79.357071,
			lat: 43.676338,
		},
	];
	// Function which displays recommended areas in a list for the user to click on and center the map to that location
	function recommendedSearches() {
		// If statement checking if recommendedAreas already has any value
		if (recommendedAreas !== null) {
			// For loop which will increment through the recommendedAreas array to find each item
			for (let i = 0; i < recommendedAreas.length; i++) {
				// Assigning recommendedListItem a JQuery with a data value object with the properties for address, longitude, and latitude for each item in the recommendedAreas array
				let recommendedListItem = $("<h2>").data({
					address: recommendedAreas[i].address,
					lon: recommendedAreas[i].lon,
					lat: recommendedAreas[i].lat,
				});

				recommendedListItem.addClass(
					"text-xl cursor-pointer hover:text-cyan-700"
				);

				// Assigning the text which will display on the list for the populated list item
				recommendedListItem.text(recommendedAreas[i].address);

				// Appending recommendedListItem to the recommendedList (#recommended-areas) in the index.html
				recommendedList.append(recommendedListItem);

				// Assigning each recommendedListItem the ability to be clicked on to re-center the map based on its longitude and latitude
				recommendedListItem.on("click", (e) => {
					// Makes the map re-center on a location
					map.flyTo({
						// Assigning the center value to the longitude and latitude of the data within recommendedListItem
						center: [
							recommendedListItem.data("lon"),
							recommendedListItem.data("lat"),
						],
						// Assigning zoom level of the map once it re-centers to the recommendedListItem location
						zoom: 15,
					});
				});
			}
			// Exits the for loop
			return;
		}
	}
	// Calls recommendedSearches function to display the recommended areas
	recommendedSearches();

	// Function which loads the past searches to display when loading the page
	function pastSearches() {
		// If statement checking if searchStorage already has any value from the localStorage
		if (searchStorage !== null) {
			document.getElementById("past-search-container").style.display = "block";

			if (!document.getElementById("clear-btn")) {
				const clearLocalStorageBtn = document.createElement("span");
				clearLocalStorageBtn.id = "clear-btn";
				clearLocalStorageBtn.className = "mx-auto my-auto cursor-pointer group";
				clearLocalStorageBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24"
							class="fill-[#3A485F] group-hover:fill-red-400" fill="none"
							xmlns="http://www.w3.org/2000/svg">
							<rect x="15.7427" y="6.55029" width="1" height="13"
								transform="rotate(45 15.7427 6.55029)" />
							<rect x="16.4497" y="15.7427" width="1" height="13"
								transform="rotate(135 16.4497 15.7427)" />
						</svg>`;

				clearLocalStorageBtn.addEventListener("click", () => {
					window.localStorage.clear();
					document.getElementById("past-search-container").style.display =
						"none";
				});

				document
					.getElementById("clear-past-searches")
					.appendChild(clearLocalStorageBtn);
			}
			// Removes all <h3> tags from the html document so that the past search list clears before being loaded in this function
			$("h3").remove();
			// For loop which will increment through the search storage array to find each item inside of local storage
			for (let i = 0; i < searchStorage.length; i++) {
				// Assigning searchListItem a JQuery with a data value object with the properties for address, longitude, and latitude for each item in the localStorage
				let searchListItem = $("<h3>").data({
					address: searchStorage[i].address,
					lon: searchStorage[i].lon,
					lat: searchStorage[i].lat,
				});
				// Assigning the text which will display on the list for the populated list item
				searchListItem.text(searchStorage[i].address);
				// Appending searchListItem to the searchList (#previous-searches) in the index.html
				searchList.append(searchListItem);
				searchListItem.addClass("text-xl cursor-pointer hover:text-cyan-700");
				// Assigning each searchListItem the ability to be clicked on to re-center the map based on its longitude and latitude
				searchListItem.on("click", (e) => {
					// Makes the map re-center on a location
					map.flyTo({
						// Assigning the center value to the longitude and latitude of the data within searchListItem
						center: [searchListItem.data("lon"), searchListItem.data("lat")],
					});
				});
			}
			// Exits the for loop
			return;
		}
		// Assigning searchStorage to an empty array to avoid breaking the program if it detects a null value
		searchStorage = [];
	}
	// Calls pastSearches function to load past searches and append them to the searchList
	pastSearches();

	map.on("load", async () => {
		const tileset = "zzzbia.ahqydxq2"; // replace this with the ID of the tileset you created (this is my tile data set from mapbox)
		const radius = 1609; // 1609 meters is roughly equal to one mile
		const limit = 50; // The maximum amount of results to return

		const geocoder = new MapboxGeocoder({
			// Initialize the geocoder
			accessToken: mapboxgl.accessToken, // Set the access token
			mapboxgl: mapboxgl, // Set the mapbox-gl instance
			zoom: 13, // Set the zoom level for geocoding results
			placeholder: "   Enter an address or place name", // This placeholder text will display in the search bar (extra space in the start to prevent search icon and text from overlapping)
			bbox: [-180, -90, 180, 90], // Set a bounding box (for Toronto, this is still be way too big/broad)
			country: "CA", //Set the country for geocoding results
		});

		// Add the geocoder to the map
		map.addControl(geocoder, "top-left"); // Add the search box to the top left

		// Once the map loads a search result, it will assign values to local storage
		geocoder.on("result", function (results) {
			// Assigning variables to data within the mapbox api dataset
			let locationTitle = results.result.text;
			let lonLocation = results.result.geometry.coordinates[0];
			let latLocation = results.result.geometry.coordinates[1];
			let locationAddress = results.result.place_name;

			//DONT REMOVE THIS!!! Honestly not sure why, but without this line, the program will not add anything to localStorage
			searchListItem = $("<h3>")
				.html(locationAddress)
				.data({ lon: lonLocation, lat: latLocation });

			// Pushes search location data to the searchStorage array in localStorage
			searchStorage.push({
				address: locationAddress,
				lon: lonLocation,
				lat: latLocation,
			});
			// Stringifies the data pushed to local storage, required for program to properly parse the data when running pastSearches function
			localStorage.setItem("pastSearches", JSON.stringify(searchStorage));
			// Calls pastSearches function to reload the past search listItems so that the new search can be added to the past searches list
			pastSearches();
		});

		const marker = new mapboxgl.Marker({ color: "#da373d" }); // Create a red marker

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
			// console.log(events[i].featureImage);
			const maboxMarker = new mapboxgl.Marker({});

			maboxMarker.setLngLat([events[i].lon, events[i].lat]);

			maboxMarker.setPopup(
				new mapboxgl.Popup({ offset: 25 }) // add popups
					.setHTML(
						`<h3  id="headingPopup" class="text-sky-500 font-bold ;hover:text-sky-600 font-bold ">${
							events[i].title
						}</h3>
						<img class="rounded drop-shadow-md" src="${events[i].featureImage}">
						<p class="text-cyan-900 font-medium"> Location: ${events[i].venueNameData} </p>
						<p class="text-cyan-900 font-medium"> Playing on: ${events[i].eventStartDay}</p>
						<p class="text-cyan-900 font-medium" Start Time: ${
							events[i].eventStartTime || ""
						}</p>
						<a class=" border border-sky-600  text-l rounded-lg bg-sky-500 p-1 font-bold shadow-lg shadow-blue-500/40 hover:opacity-90 hover:text-white" href="${
							events[i].url
						}" target="_blank"> Book Now</a>`
					)
			);

			maboxMarker.addTo(map);

			// console.log(maboxMarker);
		}
		// function showEventList takes a paramater called events
		function showEventList() {
			// slicing events array to only showing top 5 events from array
			const topEvents = events.slice(0, 5);
			//getting the element id event=list
			const eventList = document.getElementById("event-list");
			// for each top event then create element div
			topEvents.forEach((event) => {
				const eventListItem = document.createElement("div");
				// Creating event list items with styling
				eventListItem.innerHTML = `                  
					<div class="w-full py-3 border-t border-b border-black border-opacity-10 flex flex-nowrap cursor-pointer hover:opacity-80">
					<div class="w-1/4">
						<img class="object-contain w-full rounded-xl overflow-hidden"
							src="${event.featureImage}">
					</div>
					<div class="w-3/4 px-2">
						<h1 class="text-xl font-bold font-pop text-2xl font-bold text-cyan-600">${
							event.title
						}</h1>
						<h2>${event.venueNameData}</h2>
						<p>${event.eventStartDay}</p>
						<p>${event.eventStartTime || ""}</p>
					</div>
				</div>`;

				eventListItem.addEventListener("click", () => {
					map.flyTo({
						// Assigning the center value to the longitude and latitude of the data within recommendedListItem
						center: [event.lon, event.lat],
						// Assigning zoom level of the map once it re-centers to the recommendedListItem location
						zoom: 15,
					});
				});
				eventList.appendChild(eventListItem);
			});
		}
		showEventList();
	});
};

// Calling the getData function

$(document).ready(function () {
	getData();
});
