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

define('ebla-map-plus:views/location/fields/address-data', ['views/fields/text', 'lib!JsonFormatter'], function (Dep, JsonFormatter) {

    return Dep.extend({

        detailTemplate: 'ebla-map-plus:location/fields/address-data/detail',

        json: null,

        setup: function () {
            Dep.prototype.setup.call(this);

            this.json = this.model.get(this.name);
        },

        data: function () {
            return {
                json: this.json,
            }
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);
            this.renderJsonData();
        },

        renderJsonData: function () {
            const result = document.getElementById('live-result');
            try {
                const formatter = new JSONFormatter(this.json, 1, {
                    hoverPreviewEnabled: false,
                    hoverPreviewArrayCount: 100,
                    hoverPreviewFieldCount: 5,
                    animateOpen: true,
                    animateClose: true,
                    theme: null,
                    useToJSON: true
                });
                result.innerHTML = '';
                result.style.backgroundColor = this.darkMode ? '#000' : '#fff';
                result.appendChild(formatter.render());
            } catch (e) {
                result.style.backgroundColor = '#fff';
                result.innerHTML = '<p class="text-danger">Invalid JsonObject</p>';
            }
        }
    });
});
