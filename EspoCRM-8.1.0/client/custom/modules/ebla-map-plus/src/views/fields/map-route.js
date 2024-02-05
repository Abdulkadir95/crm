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

define('ebla-map-plus:views/fields/map-route', ['views/fields/map'], function (Dep) {

    return Dep.extend({

        type: 'map-route',

        detailTemplate: 'fields/map/detail',

        listTemplate: 'fields/map/detail',

        height: 300,

        readOnly: true,

        pickListField: null,

        data: function () {
            const data = Dep.prototype.data.call(this);

            data.hasAddress = this.hasAddress();

            return data;
        },

        setup: function () {
            this.pickListField = this.name + 'PickList';
            this.height = this.options.height || this.params.height || this.height;
            this.points = this.model.get(this.pickListField) || [];
            this.listenTo(this.model, 'after:save', function () {
                if (this.isRendered()) {
                    this.reRender();
                }
            }, this);

            this.listenTo(this.model, 'change:' + this.pickListField, function () {
                this.points = this.model.get(this.pickListField) || [];

                this.calculateAndDisplayRoute();
            }, this);

            const googleMapsOptions = this.googleMapsOptions = this.getConfig().get('googleMapsOptions') || {};

            this.scrollWheel = this.options.scrollWheel || this.getMetadata().get(['clientDefs', this.scope, 'googleMapsScrollWheel']) ||
                googleMapsOptions['scrollWheel'] || false;
        },

        onRemove: function () {
            $(window).off('resize.' + this.cid);
        },

        hasAddress: function () {
            return this.model.get(this.pickListField) !== null;
        },

        afterRender: function () {
            this.$map = this.$el.find('.map');

            if (this.hasAddress()) {
                this.processSetHeight(true);

                if (this.height === 'auto') {
                    $(window).off('resize.' + this.cid);
                    $(window).on('resize.' + this.cid, this.processSetHeight.bind(this));
                }

                this.afterRenderGoogle();
            }
        },

        afterRenderGoogle: function () {
            if (window.google && window.google.maps) {
                this.initMapGoogle();
            } else if (typeof window.mapapiloaded === 'function') {
                const mapapiloaded = window.mapapiloaded;
                window.mapapiloaded = function () {
                    this.initMapGoogle();
                    mapapiloaded();
                }.bind(this);
            } else {
                window.mapapiloaded = function () {
                    this.initMapGoogle();
                }.bind(this);
                let src = 'https://maps.googleapis.com/maps/api/js?callback=mapapiloaded';
                const apiKey = this.getConfig().get('googleMapsApiKey');
                if (apiKey) {
                    src += '&key=' + apiKey;
                }

                const s = document.createElement('script');
                s.setAttribute('async', 'async');
                s.src = src;
                document.head.appendChild(s);
            }
        },

        processSetHeight: function (init) {
            let height = this.height;
            if (this.height === 'auto') {
                height = this.$el.parent().height();

                if (init && height <= 0) {
                    setTimeout(function () {
                        this.processSetHeight(true);
                    }.bind(this), 50);
                    return;
                }
            }

            this.$map.css('height', height + 'px');
        },

        initMapGoogle: function () {
            const map = new google.maps.Map(this.$el.find('.map').get(0), {
                zoom: 7,
                center: {lat: 41.85, lng: -87.65},
                scrollwheel: this.scrollWheel,
                zoomControl: !this.scrollWheel
            });
            this.directionsService = new google.maps.DirectionsService();
            this.directionsRenderer = new google.maps.DirectionsRenderer();

            try {
            } catch (e) {
                console.error(e.message);
                return;
            }


            this.directionsRenderer.setMap(map);

            this.calculateAndDisplayRoute();
        },

        calculateAndDisplayRoute: function () {
            // https://developers.google.com/maps/documentation/javascript/directions

            const xy = [];
            this.points.forEach(function (point) {
                const latitude = parseFloat(point.latitude);
                const longitude = parseFloat(point.longitude);
                if (!isNaN(latitude) && !isNaN(longitude) && Math.abs(latitude) > 0 && Math.abs(longitude) > 0) {
                    xy.push({
                        lat: latitude,
                        lng: longitude
                    });
                }
            }.bind(this));

            if (xy.length < 2) return;

            try {
                this.directionsService.route(
                    {
                        origin: xy.shift(),
                        destination: xy.pop(),
                        waypoints: xy.map(function (point) {
                            return {
                                location: {
                                    lat: point.lat,
                                    lng: point.lng
                                },
                                stopover: true
                            }
                        }),
                        travelMode: 'DRIVING'
                    },
                    function (response, status) {
                        if (status === 'OK') {
                            this.directionsRenderer.setDirections(response);

                            this.distance = this.duration = 0;
                            response.routes[0].legs.forEach(function (leg) {
                                this.distance += leg.distance.value;
                                this.duration += leg.duration.value;
                            }.bind(this));

                            this.model.set(this.name + 'Duration', this.duration);
                            this.model.set(this.name + 'Distance', this.distance);
                        } else {
                            window.alert('Directions request failed due to ' + status);
                        }
                    }.bind(this));
            } catch (e) {
                console.log(e);
            }
        }
    });
});
