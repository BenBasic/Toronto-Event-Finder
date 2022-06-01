apiKey = "ae6d8ad7-7180-4d04-9a45-cdcf2e70eeff";

async function getUVIndex() {
    UVIndexURL = "https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action/package_show?id=" + apiKey;
    fetch(UVIndexURL, {
        mode:'no-cors',
        method: "get",
        headers:{
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true
        }

    })
    .then( UVResponse => {
        return UVResponse.json();
    })
    .then( UVData => {
        console.log(UVData);

    })
}

getUVIndex();


// const
//     https = require("https"),
//     packageId = "ae6d8ad7-7180-4d04-9a45-cdcf2e70eeff";
 
// // promise to retrieve the package
// const getPackage = new Promise((resolve, reject) => {
//     https.get(`https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action/package_show?id=${packageId}`, (response) => {
//         let dataChunks = [];
//         response
//             .on("data", (chunk) => {
//                 dataChunks.push(chunk)
//             })
//             .on("end", () => {
//                 let data = Buffer.concat(dataChunks)
//                 resolve(JSON.parse(data.toString())["result"])
//             })
//             .on("error", (error) => {
//                 reject(error)
//             })
//     });
// });
 
// getPackage.then(pkg => {
//     // this is the metadata of the package
//     //console.log(pkg);
// }).catch(error => {
//     console.error(error);
// })