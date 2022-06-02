let apiKey = "gPYdcAZ3x7dA2mYoq34XovsV4rz8IFvd"
let querySize = "50"

// Function which grabs data from the ticket master api
function getData() {
    // Accessing data from the api with the dmaID of the Toronto area, using the apiKey, the page size of the querySize, and sorting by ascending date
    let ticketMasterURL = "https://app.ticketmaster.com/discovery/v2/events.json?dmaId=527&apikey=" + apiKey + "&size=" + querySize + "&sort=date,asc";
    fetch(ticketMasterURL, {
    method: 'GET',
})
.then( response => { 
    // Returns json object for reference
    return response.json();
}).then( data => {
    console.log(data);

    // Variable for the current date
    let currentDate = moment().format("YYYY-MM-DD");
    // Variable for the start date for the dateCheck, days is subtracted by 1 so that the starting range can be checked for the current date
    let startWeekDate = moment().subtract(1, 'days').format("YYYY-MM-DD")
    // Variable for the end date for the dateCheck, days is added by 8 so that the end of the range checked is for a full week
    let endWeekDate = moment().add(8, 'days').format("YYYY-MM-DD")

    console.log(currentDate)

    // Assigning eventData to the value of the events data set
    let eventData = data._embedded.events;
    console.log(eventData);


    // For loop to increment through the events data array
    for (i = 0; i < data._embedded.events.length; i++) {

        // Assigning dateData to the value of the localDate data set so that it can grab the starting date of the event
        let dateData = data._embedded.events[i].dates.start.localDate;
        console.log(dateData);

        // Function to check if the events in the data set are within 7 days of the current date
        function checkBetween(date1, date2, date3) {
            return moment(date1).isBetween(date2, date3);
        }
           
        // Assigning dateCheck to have a value of either true or false depending on if the event is within a 7 day range of the current date
        let dateCheck = checkBetween(dateData, 
            startWeekDate, endWeekDate);
        console.log(dateCheck);

        // Assigning cancelledCheck to the value of the status in the data set, this is used in the following if statement to see if tickets are on sale for the event
        let cancelledCheck = eventData[i].dates.status.code;
        console.log(cancelledCheck);

        // If statement to check if dateCheck is true, and if cancelledCheck is equal to onsale
        if (dateCheck, cancelledCheck === "onsale") {

            // Assigning latData to the value of the events data set latitude
            let latData = eventData[i]._embedded.venues[0].location.latitude;
            // Assigning lonData to the value of the events data set longitude
            let lonData = eventData[i]._embedded.venues[0].location.longitude;
            // Assigning eventTitleData to the value of the events data set of the events title
            let eventTitleData = eventData[i].name;
            // Assigning eventURL to the value of the events data set url so that it gets the url where the user can buy a ticket
            let eventURL = eventData[i].url;
            // Assigning venueNameData to the value of the events data set venue name
            let vanueNameData = eventData[i]._embedded.venues[0].name;


            // Console logs to log the desired data of the data set for things such as the event title, the geo location of the event, etc
            console.log("Title: " + eventTitleData);
            console.log("Venue: " + vanueNameData);
            console.log(latData + ":" + lonData);
            console.log("URL: " + eventURL);
        };
    }
})
}

getData();


