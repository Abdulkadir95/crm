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

define('ebla-map-plus:views/route/pick-list', 'views/fields/array', function (Dep) {

    return Dep.extend({

        editTemplate: 'ebla-map-plus:route/pick-list/edit',

        addItemModalView: 'ebla-map-plus:views/route/modals/add-item',

        selectRecordsView: 'views/modals/select-records',

        pickListLocations: [],

        selected: [],

        displayAsList: true,

        allowCustomOptions: false,

        routeField: null,

        displayAsSeparatedButtons: false,

        events: {
            ...Dep.prototype.events,
            'click [data-action="addLocation"]': function (e) {
                const value = $(e.currentTarget).data('value');

                const attr = value.split('.');

                this.selectLocation(attr[0], attr[1]);
            }
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.routeField = this.name.replace('PickList', '');

            this.setupLocations();

            this.on('after:inline-edit-off', () => {
                this.setupLocations();
            });

            this.model.on('change:' + this.routeField, () => {
                this.setupLocations();
                this.reRender();
            });

            this.displayAsSeparatedButtons = this.getMetadata().get(['entityDefs', this.model.name, 'fields', this.routeField, 'displayAsSeparatedButtons']) || false;
        },

        setupLocations: function () {
            this.params.options = [];
            this.translatedOptions = {};
            this.selected = [];

            const locations = this.model.get(this.name) || [];
            this.pickListLocations = locations;

            locations.forEach(location => {
                this.params.options.push(location.id);
                this.selected.push(location.id);
                this.translatedOptions[location.id] = location.name + ' (' + location.scope + ')';
            });
        },

        getAddItemModalOptions: function () {
            const addressFields = this.getMetadata().get(['entityDefs', this.model.name, 'fields', this.routeField, 'addressFields']) || [];

            const options = [];
            const translatedOptions = {};

            addressFields.forEach(field => {
                const attr = field.split('.');

                if (!this.getAcl().checkScope(attr[0], 'read')) return;

                options.push(field);
                translatedOptions[field] = attr[0] + " (" + this.getLanguage().translate(attr[1], 'fields', attr[0]) + ")";
            });

            return {
                options,
                translatedOptions,
            };
        },

        removeValue: function (scope) {
            this.pickListLocations = this.pickListLocations.filter(location => {
                return location.id !== scope;
            });

            Dep.prototype.removeValue.call(this, scope);
        },

        data: function () {
            const data = Dep.prototype.data.call(this);

            const {options, translatedOptions} = this.getAddItemModalOptions();
            data.displayAsSeparatedButtons = this.displayAsSeparatedButtons;
            data.options = translatedOptions;

            return data;
        },

        fetch: function () {
            const data = Dep.prototype.fetch.call(this);

            this.pickListLocations = this.pickListLocations.sort((a, b) => {
                return this.selected.indexOf(a.id) - this.selected.indexOf(b.id);
            })

            data[this.name] = this.pickListLocations;

            return data;
        },

        selectLocation: function (scope, field) {
            this.notify('Loading...');

            const viewName = this.getMetadata().get('clientDefs.' + scope + '.modalViews.select') || this.selectRecordsView;

            this.createView('dialog', viewName, {
                scope: scope,
                mandatorySelectAttributeList: [field + 'Latitude', field + 'Longitude'],
            }, dialog => {
                dialog.render();

                this.notify(false);

                this.listenToOnce(dialog, 'select', model => {
                    this.clearView('dialog');

                    if (!this.selected.includes(model.id)) {
                        this.params.options.push(model.id);
                        this.translatedOptions[model.id] = model.get('name') + ' (' + scope + ')';
                    }

                    // check if this.pickListLocations already has this location
                    if (
                        this.pickListLocations.find(location =>
                            location.id === model.id || model.get(field + 'Latitude') === location.latitude || model.get(field + 'Longitude') === location.longitude)
                    ) {
                        return;
                    }

                    this.pickListLocations.push({
                        id: model.id,
                        scope: scope,
                        name: model.get('name'),
                        latitude: model.get(field + 'Latitude'),
                        longitude: model.get(field + 'Longitude'),
                    });

                    this.addValue(model.id);
                });
            });
        },

        actionAddItem: function () {
            this.createView('addModal', this.addItemModalView, this.getAddItemModalOptions(), view => {
                view.render();

                view.once('add', scope => {
                    const attr = scope.split('.');

                    this.selectLocation(attr[0], attr[1]);

                    view.close();
                });
            });
        },
    });
});
