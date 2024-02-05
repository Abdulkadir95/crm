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

define('ebla-map-plus:views/admin/entity-manager/fields/list-map-layout', ['views/fields/enum', 'views/admin/layouts/index'], function (Dep, LayoutsIndex) {
    return Dep.extend({

        typeList: [
            'list',
            'listSmall'
        ],

        setupOptions: function () {
            this.params.options = [];
            this.translatedOptions = {};
            const scope = this.model.get('name');
            const additionalLayouts = this.getMetadata().get(['clientDefs', scope, 'additionalLayouts']) || {};

            for (const aItem in additionalLayouts) {

                // check if the layout is including in the typeList
                if (this.typeList.indexOf(additionalLayouts[aItem].type) === -1) {
                    continue;
                }
                this.typeList.push(aItem);
            }

            this.scopeList = [scope];

            const dataList = LayoutsIndex.prototype.getLayoutScopeDataList.call(this);

            dataList.forEach(item1 => {
                this.typeList.forEach(type => {
                    if (type.substr(-6) === 'Portal') {
                        return;
                    }

                    this.params.options.push(type);

                    this.translatedOptions[type] = this.translate(type, 'layouts', 'Admin');
                });
            });
        },

        translateLayoutName: function (type, scope) {
            return LayoutsIndex.prototype.translateLayoutName.call(this, type, scope);
        },
    });
});
