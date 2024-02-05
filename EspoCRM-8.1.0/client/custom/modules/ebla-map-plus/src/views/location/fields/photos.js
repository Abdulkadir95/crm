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

define('ebla-map-plus:views/location/fields/photos', 'views/fields/attachment-multiple', function (Dep) {

    return Dep.extend({

        getValueForDisplay: function () {
            var photos = this.model.get(this.name);

            if (this.mode === 'detail' && !!photos) {

                var previews = [];

                photos.forEach(photo => {

                    previews.push(
                        '<div class="attachment-preview">' +
                        this.getDetailPreview(this.getImageUrl(photo.photo_reference)) + '</div>'
                    );
                })

                return previews.join('');
            }
        },

        getImageUrl: function (reference) {
            var apiKey = this.getConfig().get('googleMapsApiKey');
            return 'https://maps.googleapis.com/maps/api/place/photo?maxheight=150&photoreference=' + reference + '&key=' + apiKey;
        },

        getDetailPreview: function (url) {
            return '<img width="150" src="' +
                url + '" class="image-preview">';
        },

    });
});
