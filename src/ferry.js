"use strict";

const L = require("leaflet");

(function () {
	var map = null;
	var cartodbBasemap = "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png";
	var cartoAttribution = "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>, &copy; <a href=\"https://carto.com/attribution\">CARTO</a>";
	var vessels = []; // A list of the markers created for the vessels
	var refreshTimer = null;

	window.onload = function () {
		loadMap();
		getFerryLocations();
		setRefreshTimer();
	};

	// Only stop the timer when the page is unloaded.
	window.onunload = function () {
		window.clearInterval(refreshTimer);
	};

	// Initializes the map and the controls for the application. It
	// also initializes the data that appears on the map
	function loadMap() {
		map = L.map("map").setView([47.59, -122.44], 11);
		var basemap = L.tileLayer(cartodbBasemap, {
			attribution: cartoAttribution,
			maxZoom: 20,
			detectRetina: true
		}).addTo(map);

		var legend = L.control({ position: "bottomright" });

		legend.onAdd = function (map) {
			var legendContent = document.createElement("div");
			legendContent.classList.add("info");
			legendContent.classList.add("legend");
			var ferryStates = ["on-time", "docked", "late"];
			var legendItems = document.createElement("ul");
			legendItems.classList.add("legendItems");

			for (var i = 0; i < ferryStates.length; i++) {
				var legendItem = document.createElement("li");
				legendItem.classList.add("legendItem")
				var legendIcon = document.createElement("i");
				legendIcon.classList.add("legendIcon");
				var legendLabel = document.createElement("p");
				legendIcon.style.backgroundColor =
					getColorFromState(ferryStates[i]);
				legendLabel.innerHTML = ferryStates[i];

				legendItem.appendChild(legendIcon);
				legendItem.appendChild(legendLabel)
				legendItems.appendChild(legendItem);
			}
			legendContent.appendChild(legendItems);
			return legendContent;
		};

		legend.addTo(map);
	}

	// Sends an AJAX request to the proxy script that brockers the
	// communication with the app and WSDOT's REST API
	function getFerryLocations() {
		var ajaxRequest = new XMLHttpRequest();
		ajaxRequest.onload = getData;
		ajaxRequest.onerror = ajaxFailure;
		ajaxRequest.open("GET", "ferryinfo", true);
		ajaxRequest.send();
	}

	// Gets and processes the JSON data that is returned from the
	// proxy script. It also creates the markers that will be placed
	// on the map representing the location and heading of a ferry.
	// The position of these markers are then updated every 5 seconds. 
	function getData() {
		var responseData = JSON.parse(this.responseText);
		responseData.forEach(function (vessel) {
			if (vessel && vessel.InService) {
				var position = [vessel.Latitude, vessel.Longitude];
				var markerStyle = getStyle(vessel.ScheduledDeparture, vessel.LeftDock);
				var marker = getVessel(vessel.VesselID);
				var result = creatMarkerSVG(markerStyle.fillColor, vessel.Heading);
				var ferryIcon = L.divIcon({html:result, className: "vesselMarker"});
				if (marker) {
					marker.setLatLng(position);
					marker.setIcon(ferryIcon);
					marker.setPopupContent(getPopupContent(vessel));
				} else {
					marker = L.marker(position, {icon: ferryIcon});
					marker.addTo(map);
					marker.bindPopup(getPopupContent(vessel));
					vessels.push({
						id: vessel.VesselID,
						mapMarker: marker,
					});
				}
			}
		}, this);
	}

	function setRefreshTimer() {
		var refreshTimer = window.setInterval(function () {
			getFerryLocations();
		}, 10000);
	}

	// Gets a map marker style that represents a ferry that has either
	// left a dock on-time, is still at the dock, or is running late.
	function getStyle(scheduledDepart, actualDepart) {
		var onTime = isOnTime(scheduledDepart, actualDepart);
		// TODO: Make the marker style an elongated triangle or compass
		var style = {
			fillColor: "#455a64"
		};
		if (scheduledDepart && actualDepart) {
			style.fillColor = getColor(onTime);
		}
		return style;
	}

	// Checks if the ferry has left on time.
	function isOnTime(scheduledDepart, actualDepart) {
		scheduledDepart = convertDate(scheduledDepart);
		actualDepart = convertDate(actualDepart);
		var statusTime = actualDepart - scheduledDepart;
		statusTime = Math.round(((statusTime / 1000) / 60));
		return statusTime <= 5;
	}

	// Gets the color of a ferry marker based on if it's on-time,
	// late, or docked.
	function getColor(onTime) {
		if (onTime) {
			return "#00838f";
		} else {
			return "#d32f2f";
		}
	}

	// A helper function that sets the marker color based on the given
	// state string
	// TODO: make this more robust by not using strings
	function getColorFromState(ferryState) {
		if (ferryState == "on-time") {
			return "#00838f";
		} else if (ferryState == "late") {
			return "#d32f2f";
		} else if (ferryState == "docked") {
			return "#455a64";
		}
	}

	// Gets the marker of the vessel represented by the given VesselId
	function getVessel(vesselId) {
		var result = null;
		for (var i = 0; i < vessels.length; i++) {
			if (vessels[i].id == vesselId) {
				result = vessels[i].mapMarker;
			}
		}
		return result;
	}

	// Gets the content for a popup for the given vessel
	function getPopupContent(vessel) {
		var popupContent = document.createElement("div");
		// var ferryChart = document.createElement("div");
		var ferryName = document.createElement("h1");
		var route = document.createElement("h2");
		var eta = document.createElement("h3");
		var status = document.createElement("p");

		popupContent.classList.add("vesselPopup");
		ferryName.innerHTML = vessel.VesselName;
		route.innerHTML = vessel.OpRouteAbbrev
		var vesselEta = convertDate(vessel.Eta);
		if (vessel.LeftDock) {
			var statusTime = convertDate(vessel.LeftDock) - convertDate(vessel.ScheduledDeparture);
			var timeDiff = Date.now() - convertDate(vessel.LeftDock);
			statusTime = Math.round(((statusTime / 1000) / 60));
			timeDiff = Math.round(((timeDiff / 1000) / 60));
			var earlyLate = "- On-Time";
			if (statusTime > 5) {
				earlyLate = "- Late";
			} else if (statusTime < -5) {
				earlyLate = "- Early";
			}
			status.innerHTML = "Left " + timeDiff + " min ago " +
				earlyLate + " by " + statusTime + " min";
		} else {
			if (vessel.ScheduledDeparture) {
				status.innerHTML = "Leaving at " + convertDate(vessel.ScheduledDeparture).toLocaleTimeString();
			} else {
				status.innerHTML = "No more sailings scheduled today.";
			}
		}

		if (vesselEta) {
			eta.innerHTML = "ETA: " + vesselEta.toLocaleTimeString();
		} else {
			eta.innerHTML = "Currently Docked";
		}

		popupContent.appendChild(eta);
		popupContent.appendChild(ferryName);
		popupContent.appendChild(route);
		popupContent.appendChild(status);

		return popupContent;
	}

	// Called when the request to the proxy script fails.
	function ajaxFailure() {
		console.log("Something went wrong loading the data");
	}

	// Converts the given date from the form "/Date(1335205592410-0500)/"
	// to a Javascript date object. If the input date is null, returns null.
	function convertDate(inputDate) {
		var re = RegExp('(\\d+)-(\\d+)', 'g');
		var str = inputDate;
		var arr = re.exec(str);

		if (arr != null) {
			var milis = parseInt(arr[1]);
			var ferryDate = new Date(milis);
			return ferryDate;
		} else {
			return null;
		}
	}

	function creatMarkerSVG(color, rotation) {
		var xmlns = "http://www.w3.org/2000/svg";
		var boxWidth = 24;
		var boxHeight = 24;
	
		var svgElem = document.createElementNS(xmlns, "svg");
		svgElem.setAttributeNS(null, "viewBox", "0 0 " + boxWidth + " " + boxHeight);
		svgElem.setAttributeNS(null, "width", boxWidth);
		svgElem.setAttributeNS(null, "height", boxHeight);
		svgElem.setAttributeNS(null, "transform", "rotate(" + rotation + ")");
		svgElem.setAttributeNS(null, "fill", color);
	
		var borderCoords = "M0 ";
		borderCoords += "0h";
		borderCoords += "24v";
		borderCoords += "24h";
		borderCoords += "0z";
	
		var borderPath = document.createElementNS(xmlns, "path");
		borderPath.setAttributeNS(null, 'd', borderCoords);
		borderPath.setAttributeNS(null, "fill", "none");
		svgElem.appendChild(borderPath);

		var fillCoords = "M12 ";
		fillCoords += "2L4.5 ";
		fillCoords += "20.29l.71.71L12 ";
		fillCoords += "18l6.79 3 ";
		fillCoords += ".71-.71z";
	
		var fillPath = document.createElementNS(xmlns, "path");
		fillPath.setAttributeNS(null, 'd', fillCoords);
		fillPath.setAttributeNS(null, "fill-opacity", "0.7");
		
		svgElem.appendChild(fillPath);

		return svgElem.outerHTML;
	}
})();