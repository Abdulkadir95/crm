/*
 * This file is part of  the extension: {{EXTENSION_NAME}}
 * Copyright (c) Eblasoft Bilişim Ltd.
 *
 * This Software is the property of Eblasoft Bilişim Ltd. and is protected
 * by copyright law - it is NOT Freeware and can be used only in one project
 * under a proprietary license, which is delivered along with this program.
 * If not, see <http://eblasoft.com.tr/eula>.
 *
 * This Software is distributed as is, with LIMITED WARRANTY AND LIABILITY.
 * Any unauthorised use of this Software without a valid license is
 * a violation of the License Agreement.
 *
 * According to the terms of the license you shall not resell, sublicense,
 * rent, lease, distribute or otherwise transfer rights or usage of this
 * Software or its derivatives. You may modify the code of this Software
 * for your own needs, if source code is provided.
 */

define('ebla-map-plus:views/record/map-list', ['views/record/list'], function (Dep) {

    return Dep.extend({

        template: 'ebla-map-plus:record/map-list',

        // type: 'map',

        // name: 'map',

        buttonList: [],

        markers: [],

        // layoutName: 'map',

        // rowActionsView: 'views/record/row-actions/default-kanban',

        setup: function () {
            Dep.prototype.setup.call(this);


            const clientDefs = this.getMetadata().get(['clientDefs', this.scope]);
            const mapViewMode = clientDefs && clientDefs['listMapViewEnabled'] || false;

            if (mapViewMode) {
                this.addressField = clientDefs['listMapAddressField'];
                this.layoutName = clientDefs['listMapLayout'] || this.layoutName;
            }

            const googleMapsOptions = this.googleMapsOptions = this.getConfig().get('googleMapsOptions') || {};

            this.scrollWheel = this.options.scrollWheel || this.getMetadata().get(['clientDefs', this.scope, 'googleMapsScrollWheel']) ||
                googleMapsOptions['scrollWheel'] || false;
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
                city: '*',
                street: '*',
                postalCode: '*',
                country: '*',
                state: '*'
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
            this.map = new google.maps.Map(this.$map.get(0), {
                scrollwheel: this.scrollWheel,
                zoomControl: !this.scrollWheel,
                zoom: 3,
                center: {lat: -28.024, lng: 140.887},
            });

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

                const addMarker = (latitude, longitude) => {
                    var ltLng = new google.maps.LatLng(latitude, longitude);
                    var marker = new google.maps.Marker({
                        map: this.map,
                        position: ltLng,
                        title: item.get('name'),
                        label: item.get('name'),
                    });
                    marker.addListener('click', () => {
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
                    });

                    this.markers.push(marker);
                    bounds.extend(ltLng);
                    this.map.fitBounds(bounds, 1);
                };

                if (addressData.latitude && addressData.longitude) {
                    addMarker.call(this, addressData.latitude, addressData.longitude);
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

            // Add a marker clusterer to manage the markers.
            this.clusterer = new MarkerClusterer(this.map, this.markers, {
                imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
            });

        },

    });
});
