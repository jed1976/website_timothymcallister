<?php
class Fieldtype_Google extends Fieldtype
{
    public function render_label()
    {
        return '';
    }

    public function render()
   {
        return '
        <div id="map-canvas" style="width: 100%; height: 300px;"></div>

        <script>
        var script = document.createElement("script");
        script.src = "https://maps.googleapis.com/maps/api/js?libraries=places&callback=initialize&key=AIzaSyDx7jdJynOTYIQ6tmBymyp_DsA2Futwlj4";
        document.body.appendChild(script);

        function initialize() {
            var input = document.querySelector("[name*=location]"),
                latitude = document.querySelector("[name*=latitude]"),
                longitude = document.querySelector("[name*=longitude]");

            var mapOptions = {
                center: new google.maps.LatLng(latitude.value, longitude.value),
                disableDefaultUI: true,
                draggable: false,
                scrollwheel: false,
                zoom: 17
            };

            var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

            var autocomplete = new google.maps.places.Autocomplete(input);
            autocomplete.bindTo("bounds", map);

            var infowindow = new google.maps.InfoWindow({
                maxWidth: 320
            });

            var marker = new google.maps.Marker({
                map: map,
                position: new google.maps.LatLng(latitude.value, longitude.value)
            });
            infowindow.setContent("<div><strong>" + input.value + "</strong>");
            infowindow.open(map, marker);

            google.maps.event.addListener(autocomplete, "place_changed", function() {
                infowindow.close();
                marker.setVisible(false);

                var place = autocomplete.getPlace();
                if (!place.geometry) {
                    return;
                }

                // If the place has a geometry, then present it on a map.
                if (place.geometry.viewport) {
                    map.fitBounds(place.geometry.viewport);
                } else {
                    map.setCenter(place.geometry.location);
                    map.setZoom(17);  // Why 17? Because it looks good.
                }

                marker.setIcon(/** @type {google.maps.Icon} */({
                    url: place.icon,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(35, 35)
                }));
                marker.setPosition(place.geometry.location);
                marker.setVisible(true);

                var address = "";
                if (place.address_components) {
                    address = [
                        (place.address_components[0] && place.address_components[0].short_name || ""),
                        (place.address_components[1] && place.address_components[1].short_name || ""),
                        (place.address_components[2] && place.address_components[2].short_name || "")
                    ].join(" ");
                }

                input.value = place.name;

                infowindow.setContent("<div><strong>" + place.name + "</strong><br>" + address);
                infowindow.open(map, marker);

                latitude.value = place.geometry.location.lat();
                longitude.value = place.geometry.location.lng();
            });
        };
        </script>
        ';
   }
}
