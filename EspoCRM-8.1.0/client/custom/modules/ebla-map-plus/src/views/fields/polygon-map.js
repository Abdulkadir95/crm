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

define('ebla-map-plus:views/fields/polygon-map', ['views/fields/map'], function (Dep) {
    return Dep.extend({

        type: 'polygon-map',

        detailTemplate: 'fields/map/detail',

        editTemplate: 'fields/map/detail',

        listTemplate: 'fields/map/detail',

        defaultMapCenter: {
            lat: 0,
            lng: 0
        },

        zoomForPolygon: 8,

        zoomForPlace: 14,

        focusOnPoint: false,

        SEPARATOR: '|',

        hasAddress: function () {
            return true;
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.populateDefaultsData();

            this.searchIsEnabled = this.model.getFieldParam(this.name, 'enableSearch');

            if (this.searchIsEnabled) {
                this.wait(true);
                Espo.require('res!client/custom/modules/ebla-map-plus/res/templates/fields/address/coordinates.tpl', (coordinatesTmpl) => {
                    this.coordinatesTmpl = coordinatesTmpl;
                    this.wait(false);
                });

                this.events['click [data-action="locateAddress"]'] = this.actionLocateAddress;
            }
        },

        populateDefaultsData: function () {
            const defaultMapCenter = this.model.getFieldParam(this.name, 'mapCenter');

            if ((defaultMapCenter || '').length > 2 && defaultMapCenter.indexOf(this.SEPARATOR) > -1) { // at least x|y
                this.defaultMapCenter = {
                    lat: parseFloat(defaultMapCenter.split(this.SEPARATOR)[0]),
                    lng: parseFloat(defaultMapCenter.split(this.SEPARATOR)[1])
                };
            }

            if (this.model.isNew()) {
                this.model.set(this.name, {
                    polygons: [],
                });
            }
        },

        afterRender: function () {
            this.$map = this.$el.find('.map');

            this.processSetHeight(true);
            this.afterRenderGoogle();
            if (this.isEditMode()) {
                this.initGooglePlaces();
            }
        },

        // locate current location
        actionLocateAddress: function (e) {
            $(e.currentTarget).prop('disabled', true);

            if ('geolocation' in navigator) {
                Espo.Ui.notify(' ... ');

                navigator.geolocation.getCurrentPosition(position => {
                    this.mapCenter = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    } || this.defaultMapCenter;

                    this.focusOnPoint = true;

                    this.initMapGoogle();

                    Espo.Ui.success(this.translate('Done'));
                    $(e.currentTarget).prop('disabled', false);
                }, error => {
                    Espo.Ui.error(this.translate('errorGettingLocation', 'messages'));
                });
            } else {
                Espo.Ui.error(this.translate('geoLocationNotSupported', 'messages'));
            }
        },

        initGooglePlaces: function () {
            const cacheKey = 'modules/ebla-map-plus/res/templates/fields/address/coordinates';
            let html = this._templator._getCachedTemplate(cacheKey);
            if (!html) {
                html = this._templator.compileTemplate(this.coordinatesTmpl);
                this._templator._templates[cacheKey] = html;
            }

            html = this._renderer.render(html, this.data());

            this.$el.prepend(html);
            this.$search = this.$el.find('[data-name="' + this.name + 'Search"]')
            this.$el.find('[data-name="' + this.name + 'Latitude"]').hide();
            this.$el.find('[data-name="' + this.name + 'Longitude"]').hide();
        },

        initGoogleAutocomplete: function () {
            if (!google.maps.places) {
                return;
            }

            this.autocomplete = new google.maps.places.Autocomplete(this.$search.get(0), {
                types: ['geocode', 'establishment']
            });

            this.autocomplete.addListener('place_changed', (e) => {
                const place = this.autocomplete.getPlace();

                if (place?.geometry?.location) {
                    this.mapCenter = {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    };
                }
                this.focusOnPoint = true;

                this.initMapGoogle();
            });
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

        addDeleteNodeEvent: function (polygon) {
            var deleteNode = (mev) => {
                if (mev.vertex != null) {
                    polygon.getPath().removeAt(mev.vertex);
                    this.trigger('change');
                }
            }

            if (this.isEditMode()) {
                google.maps.event.addListener(polygon, 'rightclick', deleteNode);
            }
        },

        initMapGoogle: function () {
            if (!google.maps.drawing || !google.maps.places) {
                // load libraries
                Promise.all([
                    google.maps.importLibrary('drawing'),
                    google.maps.importLibrary('places'),
                ]).then(() => {
                    this.initMapGoogle();
                });

                return;
            }

            const center = this.mapCenter || this.defaultMapCenter;

            const map = new google.maps.Map(this.$map.get(0), {
                center,
                zoom: this.focusOnPoint ? this.zoomForPlace : this.zoomForPolygon,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
            });

            const polygonOptions = {
                strokeOpacity: this.model.getFieldParam(this.name, 'strokeOpacity') || 0.8,
                strokeWeight: this.model.getFieldParam(this.name, 'strokeWeight') || 2,
                strokeColor: this.model.getFieldParam(this.name, 'strokeColor') || '#000000',
                fillColor: this.model.getFieldParam(this.name, 'fillColor') || '#000000',
                fillOpacity: this.model.getFieldParam(this.name, 'fillOpacity') || 0.35,
                editable: this.isEditMode(),
            };

            const bounds = new google.maps.LatLngBounds(); // for centering the map
            const modelData = this.model.get(this.name) || {};
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
                        var point = new google.maps.LatLng(element.lat, element.lng);
                        bounds.extend(point);
                    }
                }
            });

            if (hasPolygon) { // check if not came from place search
                map.fitBounds(bounds);
            } else {
                this.focusOnPoint = false;
                google.maps.importLibrary("marker").then(() => {
                    new google.maps.Marker({
                        map: map,
                        position: this.mapCenter || this.defaultMapCenter,
                        title: "A",
                    });
                });
            }

            if (!this.isEditMode()) {
                return;
            }

            if (this.searchIsEnabled) {
                this.initGoogleAutocomplete();
            }

            polygonOptions.draggable = true;
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

                    this.addDeleteNodeEvent(polygon);
                }
            });
        },

        fetch: function () {
            const polygons = [];

            (this.polygons || []).forEach((polygon) => {
                polygons.push(polygon.getPath().getArray());
            });

            const data = {};
            data[this.name] = {
                polygons
            }

            return data;
        }
    });
});
