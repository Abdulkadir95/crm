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

Espo.require('views/list', function (Dep) {
    const _setupFn = Dep.prototype.setup;
    Dep.prototype.setup = function () {
        _setupFn.call(this);
        this.recordMapView = 'ebla-map-plus:views/record/map-list';
    }

    const _setupModesFn = Dep.prototype.setupModes;
    Dep.prototype.setupModes = function () {
        _setupModesFn.call(this);

        var entityDefs = this.getMetadata().get(['entityDefs', this.scope, 'fields']);

        const mapViewMode = this.getMetadata().get(['clientDefs', this.scope, 'listMapViewEnabled']) || false;
        if (mapViewMode) {
            this.viewModeList.push('map');
        }

        // code snippet from the parent function
        if (this.viewModeList.length > 1) {
            this.viewMode = null;
            var modeKey = 'listViewMode' + this.scope;
            if (this.getStorage().has('state', modeKey)) {
                var storedViewMode = this.getStorage().get('state', modeKey);
                if (storedViewMode) {
                    if (~this.viewModeList.indexOf(storedViewMode)) {
                        this.viewMode = storedViewMode;
                    }
                }
            }
            if (!this.viewMode) {
                this.viewMode = this.defaultViewMode;
            }
        }
    }

    Dep.prototype.setViewModeMap = function () {
        this.collection.resetOrderToDefault();
    }
});
