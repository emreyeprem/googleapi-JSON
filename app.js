const express = require('express')
const app = express()
const PORT = 3002
const bodyParser = require('body-parser')
var fs = require('fs');
app.listen(PORT,function(req,res){
  console.log("Server has started...")
})

const https = require("https");
const url = "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyDtVbli-DqEY984NnMwLOyl2zh0ZaQZBRQ&address=SW%20SCHOLLS%20FERRY%20RD,#%20102,%2097007";

let latlong_list = []
// send a get request to the google api.
https.get(url, res => {
    res.setEncoding("utf8");
    let body = "";
    res.on("data", data => {
      body += data;
    })
  // return response from res.on('end' section. It is because api call is asynchronous and we have to wait for response to come.
  //The whole response (the whole body of object data)has been received.
    res.on("end", () => {
      body = JSON.parse(body);
      body.results.forEach((each)=>{
    // Implemented loop with forEach to get longitude & latitude of every address from the google api body,
    // then store them in latlong_list array as an object
        latlong_list.push({latlng: [each.geometry.bounds.northeast.lat, each.geometry.bounds.northeast.lng]});
        latlong_list.push({latlng: [each.geometry.bounds.southwest.lat,each.geometry.bounds.southwest.lng]});
        latlong_list.push({latlng: [each.geometry.location.lat,each.geometry.location.lng]});
        latlong_list.push({latlng: [each.geometry.viewport.northeast.lat,each.geometry.viewport.northeast.lng]});
        latlong_list.push({latlng: [each.geometry.viewport.southwest.lat,each.geometry.viewport.southwest.lng]});
      })
      get_address_by_latlng(latlong_list)
    })
  })
  console.log(latlong_list)

  const googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyBhE6xtXXFSM2uN9sVfjZOTQv7vFTACNiw'
  });
  function get_address_by_latlng(array){
    for(let i =0 ; i< array.length ; i++){
      googleMapsClient.reverseGeocode(array[i], function(err, response) {
        if (!err) {
          array[i]['address'] = response.json.results[0].formatted_address;
         if( i == array.length-1){
           array[i]['message'] = 'Process completed successfully';
         }
        }
        write_data_to_json(latlong_list);
      });
    }
}
// write in JSON file.
function write_data_to_json(data){
fs.writeFile("address.json", JSON.stringify(data), (err) => {
    if (err) {
        console.error(err);
        return;
    };
  })
}
