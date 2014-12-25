$(document).ready(function(){
//Starts loading once the DOM is ready
var countryList=[];
var webserviceFile="http://api.geonames.org/postalCodeCountryInfo?&username=traineecgvak&style=full";
var defaultLatLng = new google.maps.LatLng(34.0983425, -118.3267434);
var mapHeight =$(window).height() - 44;
var geocoder=new google.maps.Geocoder();
var map;
var currentPlace;



//Function Definitions

function readCountries(){
	//Read the CountryNames from Webservice using AJAX Call	
	$.ajax({
		type:"GET",
		url:webserviceFile,
		dataType:"xml",
		success:function(loadedData){
			$(loadedData).find('country').each(function(){
				countryList.push($(this).find('countryName').text());
			});
		},
		error:function(){
			alert("Couldn't Read XML File");
		}
	//End of AJAX Call
});	
	}


function listCountries(){
	//Populates the Listview with the CountryName's read from Webservice 	
	for (var i = 0; i < countryList.length; i++) {
		$("#countries").append("<li><a href='#'>"+countryList[i]+"</a></li>");//Read & Print CountryNames
	};
	$("#countries").listview("refresh");//Refresh the Listview to make it look neat
}

function drawMap(latlng) {
	//Displays the map in the page	 
        var myOptions = {
            zoom: 2,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
        // Add an overlay to the map of current lat/lng
        var marker = new google.maps.Marker({
            position: latlng,
            map: map,
            title: "Initial Place"
        });
        
    }

function geoSuccess(pos){
	//Success function of getting current location

	currentPlace=new google.maps.LatLng(pos.coords.latitude,pos.coords.longitude);
	//alert(currentPlace);

	var myOptions = {
            zoom: 2,
            center: currentPlace,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };        
	geocoder.geocode({'latLng':currentPlace},function(results,status){
		var infowindow = new google.maps.InfoWindow({content:"Your Location"});		
		if(status==google.maps.GeocoderStatus.OK){
			var marker=new google.maps.Marker({
				position:currentPlace,
				map:map
			});
			google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map,marker);
  });
		}
	});
	
}

function geoFail(error){
	alert("Couldn't get CurrentPosition")
	//drawMap(defaultLatLng);
}

function plotCountries(){
	//Invokes markCountries for the Countries from Webservice
	//alert("I am going to plot countries");	
	for (var i = 0; i < countryList.length; i++) {
		markCountries(countryList[i]);
	};
}

function markCountries(cn){
	//Adds an Marker & Infowindow to all the places in Webservice
	//alert("I am going to plot in Map");
	geocoder.geocode( { 'address': cn}, function(results, status) {
	var infowindow = new google.maps.InfoWindow({content:cn});
    if (status == google.maps.GeocoderStatus.OK) {
      map.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location,
          title:cn
      });
      
      google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map,marker);
  });

    } else {
      //alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}




//Function Calls 

readCountries();

$("#lctme").click(function(){
	if(navigator.geolocation){		
	navigator.geolocation.getCurrentPosition(geoSuccess, geoFail, {maximumAge: 500000, enableHighAccuracy:true, timeout: 6000});	
	}
	
});
$("#listbtn").click(function(){
	//Executed when Listview button is clicked
	$(":mobile-pagecontainer").pagecontainer("change","#listpage");//Display the Listview Page
	listCountries();
});

$("#mapbtn").click(function(){
	//Executed when Mapview button is clicked	
	$(":mobile-pagecontainer").pagecontainer("change","#map-page");	
	plotCountries();

});

$(document).on("pageinit","#map-page",function(){
	$("#map-canvas").css("height",mapHeight+"px");
	drawMap(defaultLatLng);
});

$(document).on("pageshow","#map-page",function(){
	google.maps.event.trigger(map, 'resize');
});

//Loaded all the DOM and the document is ready
});