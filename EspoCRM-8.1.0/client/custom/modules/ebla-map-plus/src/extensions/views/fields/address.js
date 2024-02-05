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

Espo.require('views/fields/address', function (Dep) {
    const _setupFn = Dep.prototype.setup;
    const _dataFn = Dep.prototype.data;
    const _fetchFn = Dep.prototype.fetch;
    const _afterRenderFn = Dep.prototype.afterRender;

    _.extend(Dep.prototype, {
        setup: function () {
            this.latitudeField = null;
            this.longitudeField = null;
            this.dataField = null;
            this.place = null;
            this.placesApiDisabled = false;

            _setupFn.call(this);

            this.apiKey = this.getConfig().get('googleMapsApiKey') || '';

            this.placesApiDisabled = this.placesApiDisabled || this.params.placesApiDisabled;

            if (this.placesApiDisabled) return;

            const googleMapsOptions = this.googleMapsOptions = this.getConfig().get('googleMapsOptions') || {};
            this.countryIsShort = googleMapsOptions['countryIsShort'];
            this.countryIsShort = googleMapsOptions['countryIsShort'];
            this.stateIsShort = googleMapsOptions['stateIsShort'];
            this.cityIsShort = googleMapsOptions['cityIsShort'];
            this.autocompleteRestrictedCountries = googleMapsOptions['autocompleteRestrictedCountries'] || [];

            this.wait(true);
            Espo.require('res!client/custom/modules/ebla-map-plus/res/templates/fields/address/coordinates.tpl', (coordinatesTmpl) => {
                this.coordinatesTmpl = coordinatesTmpl;
                this.wait(false);
            });

            this.events['click [data-action="locateAddress"]'] = this.actionLocateAddress;
        },

        data: function () {
            if (!this.placesApiDisabled) {
                this.params.viewMap = this.params.viewMap || (this.params.viewMap === null);
            }

            return _dataFn.call(this);
        },

        fetch: function () {
            const data = _fetchFn.call(this);

            if (this.placesApiDisabled) return data;

            if (this.$latitude.val().toString().trim()) {
                data[this.latitudeField] = parseFloat(this.$latitude.val().toString().trim());
            } else {
                data[this.latitudeField] = null;
            }

            if (this.$longitude.val().toString().trim()) {
                data[this.longitudeField] = parseFloat(this.$longitude.val().toString().trim());
            } else {
                data[this.longitudeField] = null;
            }

            if (this.fetchPlaceData()) {
                data[this.dataField] = this.fetchPlaceData();
            }

            return data;
        },

        fetchPlaceData: function () {
            if (!_.isObject(this.place)) return null;

            const keys = [
                "address_components",
                "adr_address",
                "business_status",
                "formatted_phone_number",
                "international_phone_number",
                "name",
                "place_id",
                "plus_code",
                "rating",
                "scope",
                "url",
                "website",
                "utc_offset_minutes"
            ];

            const mapData = {};
            keys.forEach(function (key) {
                mapData[key] = this.place[key];
            }.bind(this));

            return JSON.stringify(mapData);
        },

        canBeDisplayedOnMap: function () {
            return (
                (
                    !!this.model.get(this.name + 'Latitude') &&
                    !!this.model.get(this.name + 'Longitude')
                ) ||
                !!this.model.get(this.name + 'City') ||
                !!this.model.get(this.name + 'PostalCode')
            );
        },

        initGoogleAutocomplete: function () {
            // import google places api
            if (!google.maps.places) {
                google.maps.importLibrary('places').then(() => {
                    this.initGoogleAutocomplete();
                });
                return;
            }

            const defaultBounds = new google.maps.LatLngBounds(
                new google.maps.LatLng(-33.8902, 151.1759),
                new google.maps.LatLng(-33.8474, 151.2631));

            const options = {
                bounds: defaultBounds,
                language: this.googleMapsOptions.language || this.getConfig().get('language').substr(0, 2),
                types: ['geocode', 'establishment']
            };

            this.autocomplete = new google.maps.places.Autocomplete(this.$search.get(0), options);

            if (this.autocompleteRestrictedCountries.length > 0) {
                this.autocomplete.setComponentRestrictions({
                    country: this.autocompleteRestrictedCountries,
                });
            }

            this.autocomplete.addListener('place_changed', (e) => {
                let city = false;
                const place = this.place = this.autocomplete.getPlace();
                // todo: pull formatted address if that is empty.
                let street = $('<div>').append(place.adr_address).find('.street-address').text();
                street = place?.adr_address.substring(0, place.adr_address.indexOf('<span')) + (street || '');

                if (!street || street === '') {
                    street = place.formatted_address;
                }

                this.$latitude.val(place.geometry.location.lat());
                this.$longitude.val(place.geometry.location.lng());

                place.address_components.forEach(function (addressComponent) {
                    if (addressComponent.types.indexOf('postal_code') !== -1) {
                        this.$postalCode.val(addressComponent.short_name);
                    } else if (addressComponent.types.indexOf('country') !== -1) {
                        this.$country.val(addressComponent[this.countryIsShort ? 'short_name' : 'long_name']);
                    } else if (addressComponent.types.indexOf('administrative_area_level_1') !== -1) {
                        this.$state.val(addressComponent[this.stateIsShort ? 'short_name' : 'long_name']);
                    } else if (
                        !city &&
                        street.indexOf(addressComponent.long_name) === -1 &&
                        addressComponent.types.indexOf('political') !== -1
                    ) {
                        this.$city.val(addressComponent[this.cityIsShort ? 'short_name' : 'long_name']);
                        city = true;
                    }
                }.bind(this));

                this.$street.val(street);
                this.model.set(this.fetch());
            })
        },

        afterRender: function () {
            _afterRenderFn.call(this);

            if (this.mode === 'edit' && !this.placesApiDisabled) {
                const cacheKey = 'modules/ebla-map-plus/res/templates/fields/address/coordinates';
                let html = this._templator._getCachedTemplate(cacheKey);
                if (!html) {
                    html = this._templator.compileTemplate(this.coordinatesTmpl);
                    this._templator._templates[cacheKey] = html;
                }

                html = this._renderer.render(html, this.data());

                this.$el.prepend(html);

                const self = this;

                this.$latitude = this.$el.find('[data-name="' + this.latitudeField + '"]');
                this.$longitude = this.$el.find('[data-name="' + this.longitudeField + '"]');
                this.$search = this.$el.find('[data-name="' + this.name + 'Search"]');

                if (this.params.showCoordinates !== true) {
                    this.$latitude.hide();
                    this.$longitude.hide();
                }

                this.$latitude.on('change', function () {
                    self.trigger('change');
                });
                this.$longitude.on('change', function () {
                    self.trigger('change');
                });

                if (window.google && window.google.maps) {
                    this.initGoogleAutocomplete();
                } else if (typeof window.mapapiloaded === 'function') {
                    const mapapiloaded = window.mapapiloaded;
                    window.mapapiloaded = function () {
                        this.initGoogleAutocomplete();
                        mapapiloaded();
                    }.bind(this);
                } else {
                    window.mapapiloaded = function () {
                        this.initGoogleAutocomplete();
                    }.bind(this);
                    let src = 'https://maps.googleapis.com/maps/api/js?callback=mapapiloaded';
                    if (this.apiKey) {
                        src += '&key=' + this.apiKey;
                    }

                    const s = document.createElement('script');
                    s.setAttribute('async', 'async');
                    s.src = src;
                    document.head.appendChild(s);
                }
            } else {
                if (
                    this.params.showCoordinates === true &&
                    !!this.model.get(this.latitudeField) &&
                    !!this.model.get(this.longitudeField) &&
                    !this.placesApiDisabled
                ) {
                    this.$el.append(
                        '<span class="no-badge">LAT: ' + this.model.get(this.latitudeField) +
                        ', LONG: ' + this.model.get(this.longitudeField) + '</span>'
                    );
                }
            }
        },

        actionLocateAddress: function (e) {
            $(e.currentTarget).prop('disabled', true);

            Espo.Ui.notify(' ... ');

            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(position => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;

                    this.model.set(this.latitudeField, latitude);
                    this.model.set(this.longitudeField, longitude);

                    this.getAddressInfo(latitude, longitude);

                    $(e.currentTarget).prop('disabled', false);
                }, error => {
                    Espo.Ui.error(this.translate('errorGettingLocation', 'messages'));
                });
            } else {
                Espo.Ui.error(this.translate('geoLocationNotSupported', 'messages'));
            }
        },

        getAddressInfo: function (latitude, longitude) {
            const geocoder = new google.maps.Geocoder();
            const latlng = new google.maps.LatLng(latitude, longitude);

            geocoder.geocode({'latLng': latlng}, (results, status) => {
                Espo.Ui.notify(false);

                if (status === google.maps.GeocoderStatus.OK) {
                    if (results[0]) {
                        let city = false;

                        var place = results[0];

                        let street = place.formatted_address.split(',')[1];

                        this.$latitude.val(place.geometry.location.lat());
                        this.$longitude.val(place.geometry.location.lng());

                        place.address_components.forEach(addressComponent => {
                            if (addressComponent.types.indexOf('postal_code') !== -1) {
                                this.$postalCode.val(addressComponent.short_name);
                            } else if (addressComponent.types.indexOf('country') !== -1) {
                                this.$country.val(addressComponent[this.countryIsShort ? 'short_name' : 'long_name']);
                            } else if (addressComponent.types.indexOf('administrative_area_level_1') !== -1) {
                                this.$state.val(addressComponent[this.stateIsShort ? 'short_name' : 'long_name']);
                            } else if (addressComponent.types.indexOf('administrative_area_level_1') && (!street || street === '' || street === 'undefined')) {
                                street = addressComponent['long_name'];
                            } else if (
                                !city &&
                                addressComponent.types.indexOf('political') !== -1
                            ) {
                                this.$city.val(addressComponent[this.cityIsShort ? 'short_name' : 'long_name']);
                                city = true;
                            }
                        });

                        this.$street.val(street);
                        this.model.set(this.fetch());
                    } else {
                        Espo.Ui.error(this.translate('noAddressFound', 'messages'));
                    }
                } else {
                    Espo.Ui.error(this.translate('noAddressFound', 'messages'));
                }
            });
        },
    });
});
