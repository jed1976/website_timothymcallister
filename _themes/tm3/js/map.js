// Variables
let currentRow = null;
let customMapType = null;
let googleMap = null;
let infoWindow = null;
let marker = null;
let markers = {};
let markerIcon = null;
let URLQueryString = null;
let year = null;

// Elements
const $mapContainer = document.getElementById("map");
const $mapCanvas = document.getElementById("map-canvas");
const $performanceList = document.getElementById("performance-list");
const $siteHeader = document.getElementById("site-header");
const $yearSelectorWrapper = document.getElementById("year-selector-wrapper");
const $yearSelector = null;

// Constants
const activeClass = "active";
const defaultLatitude = 23.0414243;
const defaultLongitude = -83.8188083;
const featureOptions = [{
  featureType: 'water',
  stylers: [{ color: '#81d4fa' }]
}];
const infoWindowDelay = 250;
const initializeCallback = 'mapCallback';
const mapConfig = {
  disableDefaultUI: true,
  draggable: false,
  scrollwheel: false,
  zoom: 3
};
const mapTypeID = 'custom_style';
const markerIconPath = '/_themes/tm3/img/marker.png';
const markerIconHeight = 45;
const markerIconWidth = 25;
const maxInfoWindowWidth = 320;
const maxSummaryLength = 250;
const performanceTitleSelector = ".p-location .p-name";
const performanceSummarySelector = ".p-summary";
const title = document.title + " - ";
const yearParam = "year=";

window[initializeCallback] = function() {
  initialize();
}

const script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDx7jdJynOTYIQ6tmBymyp_DsA2Futwlj4&callback=' + initializeCallback;
document.head.appendChild(script);

// Functions
function addMarkers() {
  Array.from($performanceList.querySelectorAll(".h-event")).forEach(el => {
    let title = el.querySelector(".p-location .p-name");
    title = title ? title.innerHTML : "";

    googleMap.addMarker(title, el.getAttribute("data-latitude"), el.getAttribute("data-longitude"));
  });
};

function initialize() {
  markerIcon = new google.maps.MarkerImage(markerIconPath, null, null, null, new google.maps.Size(markerIconWidth, markerIconHeight));
  infoWindow = new google.maps.InfoWindow();

  Object.assign(mapConfig, {
    center: new google.maps.LatLng(defaultLatitude, defaultLongitude),
    mapTypeControlOptions: {
      mapTypeIds: [google.maps.MapTypeId.ROADMAP, mapTypeID]
    },
    mapTypeId: mapTypeID
  });

  googleMap = new google.maps.Map($mapCanvas, mapConfig);
  customMapType = new google.maps.StyledMapType(featureOptions, { name: '' });
  googleMap.mapTypes.set(mapTypeID, customMapType);
};

function addMarker(title, latitude, longitude) {
  if (typeof markers[title] !== 'undefined') {
    return;
  }

	const marker = new google.maps.Marker({
    animation: google.maps.Animation.DROP,
    icon: markerIcon,
    position: new google.maps.LatLng(latitude, longitude),
    map: googleMap,
    title
  });

  markers[title] = marker;
};

function centerAndPanMap2(center, x, y) {
	googleMap.setCenter(center);
	googleMap.panBy(x, y);
};

function centerAndPanMap() {
  var infoWindow = document.querySelector(".gm-style-iw");

  if (!infoWindow) {
    return;
  }
  googleMap.centerAndPanMap(marker.position, -($performanceList.offsetWidth / 2), -((infoWindow.offsetHeight / 2) + parseInt(getComputedStyle($siteHeader).height)));
};

function clearMarkers() {
  setAllMap(null);
};

function deleteMarkers() {
	clearMarkers();
	markers = {};
};

function displayInfoWindow(content, marker, maxWidth) {
  infoWindow.close();
  infoWindow.setContent(content);
  infoWindow.setOptions({ maxWidth: maxWidth || maxInfoWindowWidth });
  infoWindow.open(googleMap, marker);
};

function displayInfoWindow2(performance) {
  const summary = performance.querySelector(performanceSummarySelector),
  maxWidth = (summary && summary.innerHTML.length > maxSummaryLength) ? Math.round(window.innerWidth / 2) : null;

  googleMap.displayInfoWindow(performance.outerHTML, marker, maxWidth);
  centerAndPanMap();
};

function refreshMap(event) {
  let url;
  const { target } = event;

  if (event) {
    year = target.options[target.selectedIndex].getAttribute("value");
  }

  url = URLQueryString + year;

  // const s = await fetch(url);
  // $performanceList.innerHTML = TM.util.queryHTML(response, "#performance-list").innerHTML;
  // googleMap.deleteMarkers();
  // addMarkers();
  // selectFirstEvent();
  // saveHistory(year);

  // if (target)
  //   target.blur();
  // }
};

function resizeMap() {
  $mapContainer.style.height = window.innerHeight - getComputedStyle($siteHeader).height;
};

function saveHistory(year) {
  if (window.location.pathname === "/") {
    return;
  }

  if (window.history.pushState) {
    window.history.pushState(year, title + year, URLQueryString + year);
  }
};

function selectFirstEvent() {
  const eventElement = $performanceList.querySelector(".h-event.today") ||
    $performanceList.querySelector(".h-event.future") ||
    $performanceList.querySelector(".h-event:first-child");

  if (eventElement === null) {
    return;
  }

  $performanceList.scrollTop = eventElement.getPosition()[1] - $performanceList.getPosition()[1];
  eventElement.click();
};

function setAllMap(map) {
	for (prop in markers)
		markers[prop].setMap(map);
};


function showMarkers() {
	setAllMap(googleMap);
};

function updateYearSelectorValue(year) {
  Array.from($yearSelector.options).forEach(option, index => {
    if (parseInt(option.label) === parseInt(year)) {
      $yearSelector.selectedIndex = index;
      $yearSelector.onchange({ target: $yearSelector });
      return;
    }
  });
}

// Events
document.addEventListener("DOMContentLoaded", event => {
  // document.documentElement.classList.add("map");

  // URLQueryString = "?" + yearParam;

  // // Set year selector value
  // let queryString = window.location.search.substring(1);
  // year = queryString.replace("year=", "") || new Date().getFullYear();

  // Create map
  // googleMap = new TM.Map({
  //   canvas: this.el.mapCanvas,
  //   callback: this.callbacks.onMapLoad,
  //   scope: this
  // });
});

$performanceList.addEventListener("click", event => {
  event.preventDefault();
  const target = event.target.findParentNodeWithName("ARTICLE");
  const performance = target;
  const titleEl = performance.querySelector(performanceTitleSelector);
  const title = titleEl ? titleEl.innerHTML : "";

  marker = this.googleMap.markers[title];

  if (currentRow) {
    currentRow.classList.toggle(activeClass);
  }

  currentRow = performance;
  currentRow.classList.toggle(activeClass);

  setTimeout(function() {
    displayInfoWindow(performance);
  }, infoWindowDelay);
});

window.addEventListener("popstate", event => {
  if (window.location.pathname === "/") {
    return;
  }
  updateYearSelectorValue(event.state);
});

window.addEventListener("scroll", event => {
  // resizeMap();
  // centerAndPanMap();
});
