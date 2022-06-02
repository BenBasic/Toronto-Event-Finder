let apiKey = "gPYdcAZ3x7dA2mYoq34XovsV4rz8IFvd"
let ticketMasterURL = "https://app.ticketmaster.com/discovery/v2/events.json?dmaId=527&apikey=" + apiKey + "&size=100";
fetch(ticketMasterURL) 
.then(response => response.json())
.then(contents => console.log(contents))
.catch(() => console.log("Can’t access " + url + " response. Blocked by browser?"))


