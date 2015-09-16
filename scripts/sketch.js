
var map = L.map('map',{ zoomControl:false}).setView([40.7236922,-73.9889142], 10);

var dot = L.icon({
  iconUrl: '../assets/dot.png',
  iconSize: [8,8],
  iconAnchor: [0,0],
  popupAnchor: [5,5]
});

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'your.mapbox.project.id',
    accessToken: 'your.mapbox.public.access.token'
}).addTo(map);



var dataUrl = 'https://raw.githubusercontent.com/UselessPress/decapitated-animals-data/master/animals.json'
var pointList = [];
var locations=[];


// Initial button click - hide and run
$("#okbutton").click(function(){
  $(".fadetext1").fadeOut(1000, function(){
    var data = $.getJSON(dataUrl).done(function(response){  
      locatePush(response);
    });
  $("#goat").removeClass("blurclass", "slow");
  $("#goat, .fadetext").fadeOut(3000);
  });
});


// Locate user, fill locations object
function locatePush(myObject) {
  for (f = 0; f < myObject.length; f++){
    locations.push({"animal":myObject[f].animal,"lat":myObject[f].lat,"lng":myObject[f].lng});
  }
  navigator.geolocation.getCurrentPosition(UserLocation);
}



// Marker for user, find nearest animal report
function UserLocation(position){
  userLat = position.coords.latitude;
  userLon = position.coords.longitude;
  
  var userPoints = new L.LatLng(userLat,userLon);
  pointList.push(userPoints);

  var marker = L.marker([userLat,userLon]).addTo(map);
  NearestAnimal(userLat,userLon);
}



// Math stuff easy peasy
function Deg2Rad(deg){
  return deg*Math.PI/180;
}

function PythagorasEquirectangular(lat1,lon1,lat2,lon2){
  lat1 = Deg2Rad(lat1);
  lat2 = Deg2Rad(lat2);
  lon1 = Deg2Rad(lon1);
  lon2 = Deg2Rad(lon2);
  var R = 3959;
  var x = (lon2-lon1)*Math.cos((lat1+lat2)/2);
  var y = (lat2-lat1);
  var d = Math.sqrt(x*x + y*y) * R;
  return d;
}

// Calculate distance between user and nearest animal
function NearestAnimal(latitude,longitude){
  var mindif=99999;
  var closest;
  for (index=0;index<locations.length;index++){
    var dif = PythagorasEquirectangular(latitude,longitude,locations[index].lat,locations[index].lng);
    if (dif < mindif){
      closest=index;
      closelat = locations[index].lat;
      closelon = locations[index].lng;
      closeAnimal = locations[index].animal;
      mindif=dif;
    } 
  }
  console.log("distance: " + mindif + "lat/lon: " + closelat + " " + closelon + ", animal: " + closeAnimal);


  // Function to draw line, reframe map 
  mapFunctions(closelat,closelon);
  textResult(mindif,closeAnimal);
}

function mapFunctions(animalLat,animalLon){
  var animalMarker = L.marker([animalLat,animalLon], {icon:dot}).addTo(map);
  var animalPoints = new L.LatLng(animalLat,animalLon);
  pointList.push(animalPoints);
  var polyline = new L.polyline(pointList,{
    color:'red',
    weight:5
  });
  polyline.addTo(map);
  map.fitBounds(polyline.getBounds());

  // Call some text shit here?

}



function textResult(distance,animal){
  var searchTerm = animalParse(animal);
  
  var soClose = "It seems you're only about "+Math.round(distance*10)/10+" miles from the nearest reported animal decapitation.  ";
  var whatWasIt = "That animal was a " + searchTerm.toLowerCase()+".  ";
  var yum = searchTerm + " sounds pretty good right now huh?  Yeahhhh it does...";
  // $("#textHolder").append(soClose);
  // $("#textHolder").append(whatWasIt);
  // $("#textTransition").append(yum);
  $('<p/>', { html: "It seems you're only about" +Math.round(distance*10)/10+" miles from the nearest reported animal decapitation.  <br /> That animal was a " + searchTerm.toLowerCase()+"."}).appendTo("#textHolder");
  createFrame(closelat,closelon,searchTerm); 
}

function createFrame(lat,lon,search){
  search = search.replace(/ /g,'%20');
  var searchURL = "https://www.seamless.com/search?orderMethod=delivery&locationMode=DELIVERY&facetSet=umami&pageSize=20&queryText="+search+"&latitude="+lat+"&longitude="+lon+"&facet=open_now:true&countOmittingTimes";
  //window.location.replace(searchURL);
}


animalObj={
'Lamb':'Lamb',
'Goat & Chicken':'Goat and Chicken',
'Not specified':'MYSTERY ANIMAL',
'Pigeon':'Pigeon',
'Turkey or Chicken':'Turkey and Chicken',
'Goat (Unsure)':'Goat',
'Pig':'Pig',
'Goat':'Goat',
'Pigeon & Rooster':'Pigeon or Chicken',
'Dove & Chicken':'Dove & Chicken',
'Goat, Rooster and Other animals':'Goat and Chicken',
'Bird':'Bird',
'Birds (Eagle, Hawk, Pigeon)':'MYSTERY BIRD',
'Squirrels':'Squirrel',
'Roosters':'Chicken',
'Cow':'Cow',
'Pigeon & Pig':'Pigeon and Pig',
'Dog':'Dog',
'Cat':'Cat',
'Hens & Pigeons':'Chicken and Pigeon',
'Turtle':'Turtle',
'Rooster':'Chicken',
'Goose':'Goose',
'Duck':'Duck',
'Chicken':'Chicken',
'Birds':'Bird'
}

function animalParse(animal){
  if (animal in animalObj){
    return animalObj[animal];
  }
}





/////  I DON'T THINK I NEED THESE ANYMORE   /////
//
///// map function, plots locations, runs 
//
// function mapper(newObject){
//   for (var i=0;i<newObject.length;i++){
//     var lat = newObject[i].lat;
//     var lon = newObject[i].lng;
//     var desc = newObject[i].descriptor_1;
//     var type = newObject[i].animal;
//     var marker = L.marker([lat,lon], {icon: dot}).addTo(map).bindPopup(desc + ": " + type);
//   }
//   locatePush(newObject);
// }
//
//
///// count how many occurrences of each animal in array
//
// function animalCount(animalArray) {
//   animalobj = new Object;
//   for (var j=0;j<animalArray.length;j++){
//     var block = animalArray[j];
//     if(animalobj.hasOwnProperty(block)){
//       animalobj[block]++;
//     } else {
//       animalobj[block]=1;
//     }
//   }
//   var str=""
//   for (var x in animalobj ) {
//     str+=x+":"+animalobj[x]+"\n" ;
//   } 
//   console.log(str);
// }
////////////////////////////////////////////////
