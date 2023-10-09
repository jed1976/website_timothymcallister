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
const $performancesMap = document.getElementById("performances-map");
const $siteHeader = document.getElementById("site-header");
const $yearSelector = document.getElementById("year-selector");

// Constants
const activeClass = "active";
const defaultLatitude = 23.0414243;
const defaultLongitude = -83.8188083;
const featureOptions = [{
  featureType: 'water',
  stylers: [{ color: '#81d4fa' }]
}];
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

    if (typeof markers[title] !== 'undefined') {
      return;
    }

    const marker = new google.maps.Marker({
      animation: google.maps.Animation.DROP,
      icon: markerIcon,
      position: new google.maps.LatLng(el.getAttribute("data-latitude"), el.getAttribute("data-longitude")),
      map: googleMap,
      title
    });

    markers[title] = marker;
  });
}

function centerAndPanMap() {
  var infoWindow = document.querySelector(".gm-style-iw");

  if (!infoWindow) {
    return;
  }

  googleMap.setCenter(marker.position);
	googleMap.panBy(
    -($performanceList.offsetWidth / 2),
    -((infoWindow.offsetHeight / 2) + parseInt(getComputedStyle($siteHeader).height))
  );
}

function displayInfoWindow(performance) {
  const summary = performance.querySelector(performanceSummarySelector),
  maxWidth = (summary && summary.innerHTML.length > maxSummaryLength) ? Math.round(window.innerWidth / 2) : null;

  infoWindow.close();
  infoWindow.setContent(performance.outerHTML);
  infoWindow.setOptions({ maxWidth: maxWidth || maxInfoWindowWidth });
  infoWindow.open(googleMap, marker);
  centerAndPanMap();
}

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
  customMapType = new google.maps.StyledMapType(featureOptions, { name: "" });
  googleMap.mapTypes.set(mapTypeID, customMapType);

  addMarkers();
  selectFirstEvent();
}

function selectFirstEvent() {
  const $eventElement = $performanceList.querySelector(".h-event.today") ||
    $performanceList.querySelector(".h-event.future") ||
    $performanceList.querySelector(".h-event:first-child");

  if ($eventElement === null) {
    return;
  }

  $eventElement.scrollIntoView({ block: "start", inline: "center" });
  $eventElement.click();

  if (!location.hash) {
    window.scrollTo(0, 0);
  }
}

function updateYearSelectorValue(year = new Date.getFullYear()) {
  if (!$yearSelector) return;
  $yearSelector.value = year;
}

// Events
document.addEventListener("DOMContentLoaded", event => {
  URLQueryString = "?" + yearParam;

  let queryString = window.location.search.substring(1);
  year = queryString.replace("year=", "") || new Date().getFullYear();

  updateYearSelectorValue(URLQueryString + year);
});

$performanceList.addEventListener("click", event => {
  event.preventDefault();
  const target = event.target.closest("ARTICLE");
  const performance = target;
  const titleEl = performance.querySelector(performanceTitleSelector);
  const title = titleEl ? titleEl.innerHTML : "";

  marker = markers[title];

  if (currentRow) {
    currentRow.classList.toggle(activeClass);
  }

  currentRow = performance;
  currentRow.classList.toggle(activeClass);

  displayInfoWindow(performance);
});

window.addEventListener("scroll", event => {
  centerAndPanMap();
});

if ($yearSelector) {
  $yearSelector.addEventListener("change", event => {
    location.hash = $performancesMap.id;
    location.search = event.target.value;
  });
}