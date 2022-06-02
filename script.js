const proxyurl = "https://cors-anywhere.herokuapp.com/";
const url = "http://data.streetfoodapp.com/1.1/locations/vancouver/vijs"; // site that doesn’t send Access-Control-*
fetch(proxyurl + url) // https://cors-anywhere.herokuapp.com/https://example.com
.then(response => response.json())
.then(contents => console.log(contents))
.catch(() => console.log("Can’t access " + url + " response. Blocked by browser?"))


apiKey = "ae6d8ad7-7180-4d04-9a45-cdcf2e70eeff";

function getUVIndex() {
    let UVIndexURL = "https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action/package_show?id=" + apiKey;
    let testURL = "https://cors-anywhere.herokuapp.com/";
    fetch(testURL + UVIndexURL, {
        method: "get",
    })
    .then( UVResponse => {
        return UVResponse.json();
    })
    .then( UVData => {
        console.log(UVData);

    })
}

getUVIndex();


// function getUVIndex() {
//     UVIndexURL = "http://data.streetfoodapp.com/1.1/locations/vancouver/vijs"
//     fetch(UVIndexURL, {
//         method: "get",
//     })
//     .then( UVResponse => {
//         return UVResponse.json();
//     })
//     .then( UVData => {
//         console.log(UVData);

//     })
// }

// getUVIndex();