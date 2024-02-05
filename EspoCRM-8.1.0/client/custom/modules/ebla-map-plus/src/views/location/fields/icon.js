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

define('ebla-map-plus:views/location/fields/icon', 'views/fields/image', function (Dep) {

    return Dep.extend({

        getValueForDisplay: function () {
            var src = this.model.get(this.name);

            var img = '<img src="' + src + '" class="image-preview">';
            return '<a href="'+ this.getDownloadUrl('') +'" target="_BLANK">' +
               img +
                '</a>';
        },

        getDownloadUrl: function (id) {
            return this.model.get('authorUrl') || this.model.get('url');
        },

    });
});
