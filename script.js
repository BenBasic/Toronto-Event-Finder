let apiKey = "gPYdcAZ3x7dA2mYoq34XovsV4rz8IFvd"




let querySize = "50"

// fetch(ticketMasterURL) 
// .then(response => response.json())
// .then(data => console.log(data))
// let dateData = data._embedded.events;

// console.log(dateData)

// .catch(() => console.log("Can’t access " + url + " response. Blocked by browser?"))



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

    let currentDate = moment().format("YYYY-MM-DD");
    let startWeekDate = moment().subtract(1, 'days').format("YYYY-MM-DD")
    let endWeekDate = moment().add(7, 'days').format("YYYY-MM-DD")

    console.log(currentDate)

    let eventData = data._embedded.events;
    console.log(eventData);


    for (i = 0; i < data._embedded.events.length; i++) {
        let dateData = data._embedded.events[i].dates.start.localDate;
        console.log(dateData);

        function checkBetween(date1, date2, date3) {
            return moment(date1).isBetween(date2, date3);
        }
           
        let dateCheck = checkBetween(dateData, 
            startWeekDate, endWeekDate);
        console.log(dateCheck);

        let cancelledCheck = eventData[i].dates.status.code;

        if (dateCheck, cancelledCheck === "onsale") {
            let latData = eventData[i]._embedded.venues[0].location.latitude;
            let lonData = eventData[i]._embedded.venues[0].location.longitude;
            let eventTitleData = eventData[i].name;
            let eventURL = eventData[i].url;


            console.log(latData + ":" + lonData);
            console.log("Title: " + eventTitleData);
            console.log("URL: " + eventURL);
        };
    }
})
}

getData();


