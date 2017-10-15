var map;
var myLat;
var myLng;
var myLogin = "CzDLNpQw";

var landmark_distance;

var request = new XMLHttpRequest();
var url = "https://defense-in-derpth.herokuapp.com/sendLocation";


var my_position;
var myOptions = {
	zoom: 13, // The larger the zoom number, the bigger the zoom
	center: my_position,
	mapTypeId: google.maps.MapTypeId.ROADMAP
};
var my_marker;
var infowindow = new google.maps.InfoWindow();

function init() {
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	getMyLocation();
}

function getMyLocation() {
	if (navigator.geolocation) { // the navigator.geolocation object is supported on your browser
		navigator.geolocation.getCurrentPosition(function(position) { // set my position
			myLat = position.coords.latitude;
			myLng = position.coords.longitude;
			my_position = new google.maps.LatLng(myLat, myLng);

			request.open("POST", url, true);
			request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			request.send("login=" + myLogin + "&lat=" + myLat + "&lng=" + myLng); // send my info to JSON datastore 
			request.onreadystatechange = function() {
   				if (request.readyState == 4 && request.status == 200){
      				populateMap(JSON.parse(request.responseText));
      				renderMap();
    			}
			}
		});
	}
	else { // the navigator.geolocation object is not supported on your browser
		alert("Geolocation is not supported by your web browser.  Sorry!");
	}
}

function renderMap() {
	my_position = new google.maps.LatLng(myLat, myLng);

	// Update map and go there...
	map.panTo(my_position);
	
	// Create a marker
	my_marker = new google.maps.Marker({
		position: my_position,
		icon: 'me_icon.png',
		title: "Here I Am! My login name is: " + myLogin
	});
	my_marker.setMap(map);
		
	// Open info window on click of marker
	google.maps.event.addListener(my_marker, 'click', function() {
		infowindow.setContent(this.title);
		infowindow.open(map, this);
	});
}

function populateMap(responseData) {
	// populate map with people
	for (var i = 0; i < responseData.people.length; i++) {
		var person_position = new google.maps.LatLng(responseData.people[i].lat, responseData.people[i].lng);
		// compute person's distance from me, in miles
		var person_distance = (google.maps.geometry.spherical.computeDistanceBetween(person_position, my_position)) * 0.000621371;
		var person_marker = new google.maps.Marker({
			position: person_position,
			icon: 'person_icon.png',
			title: "Login: " + responseData.people[i].login + ", Distance from me: " + person_distance.toFixed(2) + " mi."
		});
		person_marker.setMap(map);

		// Open info window on click of marker
		google.maps.event.addListener(person_marker, 'click', function() {
			infowindow.setContent(this.title);
			infowindow.open(map, this);
		});
	}

	// populate map with landmarks 
	for (var i = 0; i < responseData.landmarks.length; i++) {
		var landmark_position = new google.maps.LatLng(responseData.landmarks[i].geometry.coordinates[1], 
													   responseData.landmarks[i].geometry.coordinates[0]);
		landmark_distance = (google.maps.geometry.spherical.computeDistanceBetween(landmark_position, my_position)) * 0.000621371;
		// only show landmarks within one mile 
		if (landmark_distance <= 1) {
			var landmark_marker = new google.maps.Marker({
				position: landmark_position,
				icon: 'landmark_icon.png',
				title: responseData.landmarks[i].properties.Location_Name
			});
			landmark_marker.setMap(map);	

			// Open info window on click of marker
			google.maps.event.addListener(landmark_marker, 'click', function() {
				infowindow.setContent(this.title);
				infowindow.open(map, this);
			});
		}
	}
}

