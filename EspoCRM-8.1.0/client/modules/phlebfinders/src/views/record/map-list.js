define('phlebfinders:views/record/map-list', 'ebla-map-plus:views/record/map-list', function (Dep) {

    return Dep.extend({

        template: 'ebla-map-plus:record/map-list',

        // type: 'map',

        // name: 'map',

        buttonList: [],

        markers: [],

        center: null,

        // layoutName: 'map',

        // rowActionsView: 'views/record/row-actions/default-kanban',

        setup: function () {
            Dep.prototype.setup.call(this);

            var fields = this.getMetadata().get(['entityDefs', this.scope, 'fields']);
            for (var fieldName in fields) {
                if (
                    fields.hasOwnProperty(fieldName) &&
                    // fields[fieldName]['enableForMapListView']&&
                    fields[fieldName].type === 'address'
                ) {
                    this.addressField = fieldName;
                }

            }
        },

        fetchAttributeListFromLayout: function () {
            var list = Dep.prototype.fetchAttributeListFromLayout.call(this);

            this.getFieldManager().getEntityTypeFieldAttributeList(this.scope, this.addressField).forEach(function (attribute) {
                list.push(attribute);
            }, this);

            return list;
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            this.$container = this.$el.find('.map-record-list-wrapper');
            this.height = this.getHelper().calculateContentContainerHeight(this.$container);
            this.$container.height(this.height);

            this.addressData = {
                city: 'Kahramanmaraş',
                street: 'Cahit zafir oğlu Cad.',
                postalCode: '90046',
                country: 'Turkey',
                state: 'Kahramanmaraş'
            };

            this.$map = this.$el.find('.map-record-list-map');

            this.afterRenderGoogle();
        },

        afterRenderGoogle: function () {
            if (window.google && window.google.maps) {
                this.initMapGoogle();
            } else if (typeof window.mapapiloaded === 'function') {
                var mapapiloaded = window.mapapiloaded;
                window.mapapiloaded = function () {
                    this.initMapGoogle();
                    mapapiloaded();
                }.bind(this);
            } else {
                window.mapapiloaded = function () {
                    this.initMapGoogle();
                }.bind(this);
                var src = 'https://maps.googleapis.com/maps/api/js?callback=mapapiloaded';
                var apiKey = this.getConfig().get('googleMapsApiKey');
                if (apiKey) {
                    src += '&key=' + apiKey;
                }

                var s = document.createElement('script');
                s.setAttribute('async', 'async');
                s.src = src;
                document.head.appendChild(s);
            }
        },

        initMapGoogle: function () {
            var geocoder = new google.maps.Geocoder();
            // var directionsService = new google.maps.DirectionsService();
            // var directionsRenderer = new google.maps.DirectionsRenderer();

            var latBase = this.options.assignment.get('assignmentsAddressLatitude');
            var lngBase = this.options.assignment.get('assignmentsAddressLongitude');
            this.center = {lat: latBase, lng: lngBase};

            try {
                this.map = new google.maps.Map(this.$map.get(0), {
                    zoom: 7,
                    center: this.center,
                    scrollwheel: false
                });
            } catch (e) {
                console.error(e.message);
                return;
            }

            // directionsRenderer.setMap(map);
            // this.calculateAndDisplayRoute(directionsService, directionsRenderer);

            this.renderMarkers();
            this.collection.on('sync', function () {
                this.renderMarkers();
            }.bind(this))
        },

        renderMarkers: function () {
            var geocoder = new google.maps.Geocoder();

            this.markers.forEach(function (marker) {
                marker.setMap(null);
            });

            this.markers = [];
            var bounds = new google.maps.LatLngBounds();

            function addMarker(latitude, longitude, item) {
                var ltLng = new google.maps.LatLng(latitude, longitude);
                var marker = new google.maps.Marker({
                    map: this.map,
                    position: ltLng,
                    title: item.get('name'),
                    label: 'C',
                });
                marker.addListener('click', function () {
                    if (this.selectable) {
                        var model = item;
                        if (this.checkboxes) {
                            var list = [];
                            list.push(model);
                            this.trigger('select', list);
                        } else {
                            this.trigger('select', model);
                        }
                    } else {
                        this.actionQuickView({id: item.id});
                    }
                }.bind(this));
                this.markers.push(marker);
                bounds.extend(ltLng);
                //this.map.fitBounds(bounds, 1);
            }

            this.collection.forEach(function (item) {
                var addressData = {
                    latitude: item.get(this.addressField + 'Latitude'),
                    longitude: item.get(this.addressField + 'Longitude'),
                    city: item.get(this.addressField + 'City'),
                    street: item.get(this.addressField + 'Street'),
                    postalCode: item.get(this.addressField + 'PostalCode'),
                    country: item.get(this.addressField + 'Country'),
                    state: item.get(this.addressField + 'State')
                };

                if (addressData.latitude && addressData.longitude) {
                    addMarker.call(this, addressData.latitude, addressData.longitude, item);
                } else if (!!addressData.city || !!addressData.postalCode) {
                    var address = '';

                    if (addressData.street) {
                        address += addressData.street;
                    }

                    if (addressData.city) {
                        if (address !== '') {
                            address += ', ';
                        }
                        address += addressData.city;
                    }

                    if (addressData.state) {
                        if (address !== '') {
                            address += ', ';
                        }
                        address += addressData.state;
                    }

                    if (addressData.postalCode) {
                        if (addressData.state || addressData.city) {
                            address += ' ';
                        } else {
                            if (address) {
                                address += ', ';
                            }
                        }
                        address += addressData.postalCode;
                    }

                    if (addressData.country) {
                        if (address !== '') {
                            address += ', ';
                        }
                        address += addressData.country;
                    }

                    geocoder.geocode({'address': address}, function (results, status) {
                        if (status === google.maps.GeocoderStatus.OK) {
                            addMarker.call(this, results[0].geometry.location.lat(), results[0].geometry.location.lng());
                        }
                    }.bind(this));
                }
            }, this);

            // add the assignment marker:
            var ltLng = new google.maps.LatLng(this.center);
            var marker = new google.maps.Marker({
                map: this.map,
                position: ltLng,
                icon: 'http://maps.google.com/mapfiles/kml/shapes/ranger_station.png',
                title: this.options.assignment.get('name'),
                label: 'A',
            });

            this.markers.push(marker);
            bounds.extend(ltLng);
            this.map.fitBounds(bounds, 1);
            this.map.setCenter(ltLng);
        },

    });
});
