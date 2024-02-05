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

define('ebla-map-plus:handlers/location-directions', ['action-handler'], function (Dep) {

    return Dep.extend({

        init: function () {
            if (this.view.model.get('addressLongitude') && this.view.model.get('addressLatitude') || (this.view.model.get('addressData') || {}).place_id) {
                this.view.showHeaderActionItem('directions');
            }
        },

        actionDirections: function () {
            let destination = "destination=" + this.view.model.get('addressLatitude') + ',' + this.view.model.get('addressLongitude');

            let placeId = (this.view.model.get('addressData') || {}).place_id;
            if (placeId) {
                destination = "destination=" + this.view.model.get('name') + "&destination_place_id=" + placeId;
            }

            window.open("https://www.google.com/maps/dir/?api=1&" + destination);
        },

    });
});
