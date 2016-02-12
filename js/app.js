var Markers = ko.observableArray([]);

function ViewModel() {
    var self = this;
    var lastInfoWindow;
    this.currentMarker = ko.observable();
    this.menuItems = ko.observableArray(['Home', 'See Friends Maps', 'Back to Portfolio']);

    this.listTemplate = ko.observable('listItem');

    this.addMarker = function(marker) {
        Markers.push(marker);
        self.listItems.push(marker);
    };

    this.hideMarker = function() {
        currentMarker.setMap(null);
    };

    this.getMarkers = function() {
        return Markers();
    };

    this.editListItem = function(markerData) {
        self.listTemplate('listItemEditMode');
        // Update the current marker
        self.currentMarker = markerData;
        var id = '#' + Markers.indexOf(markerData);
        var elem = $(id);
        elem.toggleClass('edit');

        var confirmEditButton = $('#confirmEditButton');
        confirmEditButton.click(function() { self.editSubmit(markerData) });
    };

    this.editSubmit = function(markerData) {
        var newName = $('#liNameEdit').val();
        var newDesc = $('#liDescEdit').val();
        // console.log('trying to confirm edit to ' + newName);
        if(newName !== ('' || undefined)) {
            markerData.nameInfo = newName;
        };
        if(newDesc !== ('' || undefined)) {
            markerData.descriptionInfo = newDesc;
        };

        $('#' + Markers.indexOf(markerData)).toggleClass('edit');
        self.listTemplate('listItem');
    };

    this.deleteListItem = function(markerData) {
        var id = '#' + Markers.indexOf(markerData);
        // If the marker is already visible, make it invisible
        if(markerData.getVisible()) {
            markerData.setVisible(false);
            $(id).remove();
        };
    };

    // Makes all of our markers invisible and depopulates our list.
    this.resetList = function() {
        $('#list').empty();
        for(i = 0; i < Markers().length; i++) {
            Markers()[i].setVisible(false);
        };
    };

    // This doesn't work yet. One of a few sort functions, perhaps.
    this.alphaSort = function() {
        var tempArr = ko.observableArray([]);
        for(var i = 0; i < self.listItems.length; i++) {
            tempArr.push(listItems[i].nameInfo);
        };
        tempArr.sort();
        return tempArr;
    };

    this.addMarkerToMap = function(map, place, query) {
        // Center our map.
        map.panTo(place.geometry.location);
        // Create our marker.
        var marker = new google.maps.Marker({
            // Default marker setup properties
            map: map,
            position: place.geometry.location,
            draggable: true,
            animation: google.maps.Animation.DROP,
            // Custom properties for listing and editing purposes
            nameInfo: place.name,
            descriptionInfo: place.vicinity,
            infoWindowPointer: null
        });
        self.currentMarker = marker;

        // Setting up content for infoWindows
        var contentTemplate = $('#infoWindowContent').html();
        var contentEditTemplate = $('#infoWindowEditMode').html();

        console.log(contentTemplate);

        // Construct a new InfoWindow.
        var infoWindow = new google.maps.InfoWindow({});
        infoWindow.setContent(contentTemplate);

        // Hooking the infoWindow into the marker.
        marker.infoWindowPointer = infoWindow;

        //Adds this marker to the model.
        debugger;
        self.addMarker(marker);

        //Update our lastInfoWindow.
        lastInfoWindow = infoWindow;

        // Opens the InfoWindow when marker is clicked.
        marker.addListener('click', function() {
            self.currentMarker = marker;
            lastInfoWindow.close();
            infoWindow.open(map, marker);
            infoWindow.setContent(contentTemplate);
            if(marker.getAnimation() !== null) {
                marker.setAnimation(null);
            } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(marker.setAnimation(null), 700);
            };
            lastInfoWindow = infoWindow;

        });

        // Enables the editing mode when the marker is double clicked.
        marker.addListener('dblclick', function() {
            self.currentMarker = marker;
            lastInfoWindow.close();
            infoWindow.open(map, marker);
            infoWindow.setContent(contentEditTemplate);
            var editForm = $('#editForm');
            // On submitting the edit form, we update the marker.
            editForm.submit(function(event) {
                Markers.remove(marker);
                // self.listItems.remove(marker);
                var newName = $('#infoWindowEditName').val();
                var newDesc = $('#infoWindowEditDesc').val();

                if(newName !== '') {
                    marker.nameInfo = newName;
                };
                if(newDesc !== '') {
                    marker.descriptionInfo = newDesc;
                };

                infoWindow.setContent(contentTemplate);
                lastInfoWindow = infoWindow;

                self.addMarker(marker);

                event.preventDefault();
            });

            lastInfoWindow = infoWindow;
        });

    };

    // When you add a marker using a Place instead of a location, the Maps API will
    // automatically add a 'Save to Google Maps' link to any info window associated
    // with that marker.

    // This example requires the Places library. Include the libraries=places
    // parameter when you first load the API. For example:
    // <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

    // Includes an initial location based on user's IP address, using HTML5 geolocation
    this.initMap = function() {
            // Sets up the initial map.
            var latLng = {lat: 38.8673, lng: -104.7607};;
            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 17,
                center: latLng
            });

            var place;

            // Change the center to be the user's location or default to some value.
            // Note: This example requires that you consent to location sharing when
            // prompted by your browser. If you see the error "The Geolocation service
            // failed.", it means you probably did not give permission for the browser to
            // locate you.

            // Try HTML5 geolocation
            if(navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    latLng = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    console.log(position);
                }, function() {
                    handleLocationError(true);
                });
            } else {
                // Browser doesn't support Geolocation
                handleLocationError(false);
            };

            function handleLocationError(browserHasGeolocation) {
                if(browserHasGeolocation) {
                    // console.log('Your browser supports geolocation');
                } else {
                    // console.log('Your browser does not support geolocation');
                    latLng = {lat: 38.8673, lng: -104.7607};
                };
            };

            var requestInit = {
                location: map.getCenter(),
                radius: '50',
                types: ['establishment']
            };

            // Creates a service and runs and initialization point via radarSearch()
            var service = new google.maps.places.PlacesService(map);
            service.radarSearch(requestInit, callback);

            // Checks that the PlacesServiceStatus is OK, and adds a marker
            // using the place ID and location from the PlacesService.
            function callback(results, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    place = results[0];
                    self.addMarkerToMap(map, place, place.name);
                };
            };

            // When we click the map, do a nearbySearch of the area and mark the nearest thing.
            map.addListener('click', function(e) {
                var request = {location: e.latLng, radius: '100', types: ['establishment']};
                service.nearbySearch(request, callback);
            });

            self.initAutocomplete(map);
    };

    this.initAutocomplete = function(map) {
        // Get our search field.
        var input = document.getElementById('searchTextField');
        // Set up a Google Autocomplete
        var autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.setTypes([]);
        autocomplete.bindTo('bounds', map);

        autocomplete.addListener('place_changed', function() {
            var place = autocomplete.getPlace();
            if (!place.geometry) {
                window.alert("Autocomplete's returned place contains no geometry");
                return;
            };

            // If the place has a geometry, then present it on a map.
            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17);  // Why 17? Because it looks good.
            };
            self.addMarkerToMap(map, place, input);

        });
    };

};

var viewModel = new ViewModel();

ko.applyBindings(viewModel);
