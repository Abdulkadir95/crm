define('ebla-map-plus:views/fields/address/map', 'views/fields/map', function (Dep) {

    return Dep.extend({

        markers: [],

        editTemplate: 'fields/map/detail',

        latitudeField: null,

        longitudeField: null,

        addressDrawData: {},

        defaultMapCenter: {
            lat: 0,
            lng: 0
        },

        zoomForPolygon: 8,

        zoomForPlace: 14,

        focusOnPoint: false,

        enablePolygon: false,

        setup: function () {
            Dep.prototype.setup.call(this);

            const googleMapsOptions = this.googleMapsOptions = this.getConfig().get('googleMapsOptions') || {};

            this.scrollWheel = this.options.scrollWheel || this.model.getFieldParam(this.name, 'scrollWheel') ||
                googleMapsOptions['scrollWheel'] || false;

            this.latitudeField = this.addressField + 'Latitude';
            this.longitudeField = this.addressField + 'Longitude';
            this.addressDrawData = this.addressField + 'DrawData';
            this.enablePolygon = this.model.getFieldParam(this.name, 'enablePolygon') || false;

            if (!this.enablePolygon) {
                return;
            }

            this.readOnly = false;

            this.listenTo(this.model, 'change:' + this.latitudeField, () => {
                this.mapCenter = {
                    lat: this.model.get(this.latitudeField),
                    lng: this.model.get(this.longitudeField)
                } || this.defaultMapCenter;
                this.focusOnPoint = true;

                this.initMapGoogleDrawing();
            });

            this.populateDefaultsData();
        },

        populateDefaultsData: function () {
            this.defaultMapCenter = {
                lat: this.model.get(this.latitudeField) || 0,
                lng: this.model.get(this.longitudeField) || 0
            };
        },

        hasAddress: function () {
            return (
                (
                    !!this.model.get(this.latitudeField) &&
                    !!this.model.get(this.longitudeField)
                ) ||
                !!this.model.get(this.addressField + 'City') ||
                !!this.model.get(this.addressField + 'PostalCode')
            );
        },

        afterRenderGoogle() {
            if (window.google && window.google.maps) {
                this.initMapGoogle();
                this.initMapGoogleDrawing();

                return;
            }

            // noinspection SpellCheckingInspection
            if (typeof window.mapapiloaded === 'function') {
                // noinspection SpellCheckingInspection
                const mapapiloaded = window.mapapiloaded;

                // noinspection SpellCheckingInspection
                window.mapapiloaded = () => {
                    this.initMapGoogle();
                    this.initMapGoogleDrawing();

                    mapapiloaded();
                };

                return;
            }

            // noinspection SpellCheckingInspection
            window.mapapiloaded = () => {
                this.initMapGoogle();
                this.initMapGoogleDrawing();
            };

            let src = 'https://maps.googleapis.com/maps/api/js?callback=mapapiloaded';
            const apiKey = this.getConfig().get('googleMapsApiKey');

            if (apiKey) {
                src += '&key=' + apiKey;
            }

            const scriptElement = document.createElement('script');

            scriptElement.setAttribute('async', 'async');
            scriptElement.src = src;

            document.head.appendChild(scriptElement);
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            if (!this.model.isNew()) {
                this.afterRenderGoogle();
            }
        },

        initMapGoogle: function () {
            const latitude = this.model.get(this.latitudeField);
            const longitude = this.model.get(this.longitudeField);

            if (latitude && longitude) {
                const position = {
                    lat: parseFloat(latitude),
                    lng: parseFloat(longitude)
                };

                try {
                    const map = this.getMap({
                        zoom: this.zoomForPlace,
                        center: position,
                        scrollwheel: this.scrollWheel,
                        zoomControl: !this.scrollWheel
                    });

                    const marker = this.getMarker(map, {position});
                    this.markers.push(marker);

                    this.initUserLocation(map);
                    this.initGoToButton(map, marker);
                } catch (e) {
                    console.error(e.message);
                    return;
                }
            } else {
                if (this.scrollWheel) {
                    const geocoder = new google.maps.Geocoder();

                    try {
                        var map = this.getMap({
                            zoom: this.zoomForPlace,
                            center: this.defaultMapCenter,
                            scrollwheel: this.scrollWheel,
                            zoomControl: !this.scrollWheel
                        });
                    } catch (e) {
                        console.error(e.message);

                        return;
                    }

                    let address = '';

                    if (this.addressData.street) {
                        address += this.addressData.street;
                    }

                    if (this.addressData.city) {
                        if (address !== '') {
                            address += ', ';
                        }

                        address += this.addressData.city;
                    }

                    if (this.addressData.state) {
                        if (address !== '') {
                            address += ', ';
                        }

                        address += this.addressData.state;
                    }

                    if (this.addressData.postalCode) {
                        if (this.addressData.state || this.addressData.city) {
                            address += ' ';
                        } else {
                            if (address) {
                                address += ', ';
                            }
                        }

                        address += this.addressData.postalCode;
                    }

                    if (this.addressData.country) {
                        if (address !== '') {
                            address += ', ';
                        }

                        address += this.addressData.country;
                    }

                    geocoder.geocode({'address': address}, (results, status) => {
                        if (status === google.maps.GeocoderStatus.OK) {
                            map.setCenter(results[0].geometry.location);

                            const marker = this.getMarker(map, {
                                position: results[0].geometry.location,
                            });

                            this.markers.push(marker);

                            this.initUserLocation(map);
                            this.initGoToButton(map, marker);
                        }
                    });
                    return;
                }

                Dep.prototype.initMapGoogle.call(this);
            }
        },

        initMapGoogleDrawing: function () {
            if (
                this.model.isNew() ||
                !window.google ||
                this.$map.get(0) === undefined ||
                this.enablePolygon === false
            ) {
                return;
            }

            //google is not defined
            if (!window.google.maps || !google.maps.drawing) {
                // load libraries
                Promise.all([
                    google.maps.importLibrary('drawing'),
                ]).then(() => {
                    this.initMapGoogleDrawing();
                });

                return;
            }

            const center = {
                lat: this.model.get(this.latitudeField) || this.defaultMapCenter.lat,
                lng: this.model.get(this.longitudeField) || this.defaultMapCenter.lng
            };

            const map = this.getMap({
                center,
                zoom: this.focusOnPoint ? this.zoomForPlace : this.zoomForPolygon,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                scrollwheel: this.scrollWheel,
                zoomControl: !this.scrollWheel
            });

            const polygonOptions = {
                strokeOpacity: this.model.getFieldParam(this.name, 'strokeOpacity') || 0.8,
                strokeWeight: this.model.getFieldParam(this.name, 'strokeWeight') || 2,
                strokeColor: this.model.getFieldParam(this.name, 'strokeColor') || '#000000',
                fillColor: this.model.getFieldParam(this.name, 'fillColor') || '#000000',
                fillOpacity: this.model.getFieldParam(this.name, 'fillOpacity') || 0.35,
                editable: this.isEditMode(),
                draggable: this.isEditMode(),
            };

            const bounds = new google.maps.LatLngBounds(); // for centering the map
            const modelData = this.model.get(this.addressDrawData) || {};
            const coordinates = (modelData && modelData['polygons']) || [];

            this.polygons = [];

            let hasPolygon = false;
            coordinates.forEach((coordinate) => {
                if (coordinate.length > 0) {
                    hasPolygon = true;

                    polygonOptions.paths = coordinate;
                    const polygon = new google.maps.Polygon(polygonOptions);

                    this.polygons.push(polygon);

                    polygon.setMap(map);
                    this.addDeleteNodeEvent(polygon);

                    // make sure the map contains the polygon
                    for (const element of coordinate) {
                        const point = new google.maps.LatLng(element.lat, element.lng);
                        bounds.extend(point);
                    }
                }
            });

            if (hasPolygon && !this.focusOnPoint) { // check if not came from place search
                map.fitBounds(bounds);
            } else {
                this.focusOnPoint = false;
            }

            const latitude = this.model.get(this.latitudeField);
            const longitude = this.model.get(this.longitudeField);
            const position = {
                lat: parseFloat(latitude),
                lng: parseFloat(longitude)
            };

            const marker = this.getMarker(map, {position});
            this.initUserLocation(map);
            this.initGoToButton(map, marker);

            if (!this.isEditMode()) {
                return;
            }

            const drawingManager = new google.maps.drawing.DrawingManager({
                drawingMode: google.maps.drawing.OverlayType.POLYGON,
                drawingControl: true,
                drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: [google.maps.drawing.OverlayType.POLYGON],
                },
                polygonOptions: polygonOptions,
            });

            drawingManager.setMap(map);

            google.maps.event.addListener(drawingManager, 'overlaycomplete', (event) => {
                if (event.type === 'polygon') {
                    const polygon = event.overlay;

                    this.polygons.push(polygon);
                    this.trigger('change');
                    this.setPolygons();
                    this.addDeleteNodeEvent(polygon);
                }
            });
        },

        addDeleteNodeEvent: function (polygon) {
            const deleteNode = (mev) => {
                if (mev.vertex != null) {
                    polygon.getPath().removeAt(mev.vertex);
                    this.trigger('change');
                    this.setPolygons();
                }
            }

            google.maps.event.addListener(polygon, 'rightclick', deleteNode);
        },

        getMap: function (options) {
            return new google.maps.Map(this.$map.get(0), {
                center: options.center,
                zoom: options.zoom,
                mapTypeId: options.mapTypeId,
                scrollwheel: options.scrollwheel || false,
                zoomControl: options.zoomControl || false,
            });
        },

        getMarker: function (map, options) {
            return new google.maps.Marker({
                animation: google.maps.Animation.DROP,
                title: options.title || this.model.get('name'),
                position: options.position,
                icon: options.icon || null,
                map
            });
        },

        setPolygons: function () {
            const polygons = [];
            const addressDrawData = {};

            (this.polygons || []).forEach((polygon) => {
                polygons.push(polygon.getPath().getArray());
            });

            addressDrawData.polygons = polygons;
            this.model.set(this.addressDrawData, addressDrawData);
            return addressDrawData;
        },

        fetch: function () {
            return {};
        },

        initGoToButton: function (map, marker) {
            const controlDiv = document.createElement('div');

            const goToButton = document.createElement('button');
            goToButton.style.backgroundColor = '#fff';
            goToButton.style.border = 'none';
            goToButton.style.outline = 'none';
            goToButton.style.width = '40px';
            goToButton.style.height = '33px';
            goToButton.style.color = '#5590f4';
            goToButton.style.borderRadius = '2px';
            goToButton.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
            goToButton.style.cursor = 'pointer';
            goToButton.style.marginRight = '10px';
            goToButton.title = 'Go to';
            goToButton.innerHTML = '<i class="fas fa-directions"></i>';

            controlDiv.appendChild(goToButton);

            goToButton.addEventListener('click', () => {
                var url = 'https://www.google.com/maps/dir/?api=1&origin=My%20Location&destination=' + encodeURIComponent(marker.getPosition().toUrlValue());
                window.open(url);
            });

            controlDiv.index = 1;
            map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
        },

        initUserLocation: function (map) {
            var controlDiv = document.createElement('div');

            var firstChild = document.createElement('button');
            firstChild.style.backgroundColor = '#fff';
            firstChild.style.border = 'none';
            firstChild.style.outline = 'none';
            firstChild.style.width = '40px';
            firstChild.style.height = '33px';
            firstChild.style.borderRadius = '2px';
            firstChild.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
            firstChild.style.cursor = 'pointer';
            firstChild.style.marginRight = '10px';
            firstChild.title = 'Your Location';
            controlDiv.appendChild(firstChild);

            var secondChild = document.createElement('div');
            secondChild.style.margin = '5px';
            secondChild.style.width = '18px';
            secondChild.style.height = '18px';
            secondChild.style.backgroundImage = 'url(https://maps.gstatic.com/tactile/mylocation/mylocation-sprite-1x.png)';
            secondChild.style.backgroundSize = '180px 18px';
            secondChild.style.backgroundPosition = '0px 0px';
            secondChild.style.backgroundRepeat = 'no-repeat';
            secondChild.id = this.name + 'you_location_img';
            firstChild.appendChild(secondChild);

            google.maps.event.addListener(map, 'dragend', () => {
                $('#' + this.name + 'you_location_img').css('background-position', '0px 0px');
            });

            firstChild.addEventListener('click', () => {
                var imgX = '0';
                var animationInterval = setInterval(() => {
                    if (imgX == '-18') imgX = '0';
                    else imgX = '-18';
                    $('#' + this.name + 'you_location_img').css('background-position', imgX + 'px 0px');
                }, 500);
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(position => {
                        var userLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                        const markerOptions = {
                            position: userLatLng,
                            title: 'Your Location',
                            icon: {
                                path: "m 12 8 c -2.21 0 -4 1.79 -4 4 c 0 2.21 1.79 4 4 4 c 2.21 0 4 -1.79 4 -4 c 0 -2.21 -1.79 -4 -4 -4 z m 8.94 3 c -0.46 -4.17 -3.77 -7.48 -7.94 -7.94 l 0 -1.06 c 0 -0.55 -0.45 -1 -1 -1 c -0.55 0 -1 0.45 -1 1 l 0 1.06 c -4.17 0.46 -7.48 3.77 -7.94 7.94 l -1.06 0 c -0.55 0 -1 0.45 -1 1 c 0 0.55 0.45 1 1 1 l 1.06 0 c 0.46 4.17 3.77 7.48 7.94 7.94 l 0 1.06 c 0 0.55 0.45 1 1 1 c 0.55 0 1 -0.45 1 -1 l 0 -1.06 c 4.17 -0.46 7.48 -3.77 7.94 -7.94 l 1.06 0 c 0.55 0 1 -0.45 1 -1 c 0 -0.55 -0.45 -1 -1 -1 l -1.06 0 z m -8.94 8 c -3.87 0 -7 -3.13 -7 -7 c 0 -3.87 3.13 -7 7 -7 c 3.87 0 7 3.13 7 7 c 0 3.87 -3.13 7 -7 7 z",
                                fillColor: "#5590f4",
                                fillOpacity: 1,
                                strokeWeight: 0,
                                scale: 1.5,
                                anchor: new google.maps.Point(10, 10),
                            },
                        };

                        const marker = this.getMarker(map, markerOptions);
                        this.markers.push(marker);

                        var bounds = new google.maps.LatLngBounds();
                        for (var i = 0; i < this.markers.length; i++) {
                            bounds.extend(this.markers[i].getPosition());
                        }

                        // Set best map view for markers.
                        map.fitBounds(bounds);

                        // map.setCenter(userLatLng); // enable it to show user location map as center

                        clearInterval(animationInterval);
                        $('#' + this.name + 'you_location_img').css('background-position', '-144px 0px');
                    }, null, {
                        enableHighAccuracy: false,
                        maximumAge: 60000,
                        timeout: 27000
                    });
                } else {
                    clearInterval(animationInterval);
                    $('#' + this.name + 'you_location_img').css('background-position', '0px 0px');
                }
            });

            controlDiv.index = 1;
            map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
        }
    })
});
