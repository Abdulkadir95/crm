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

define('ebla-map-plus:views/admin/entity-manager/fields/list-map-address-field', 'views/fields/enum', function (Dep) {
    return Dep.extend({

        fieldTypeList: [
            'address'
        ],

        setupOptions() {
            const entityType = this.model.get('name');

            const options =
                this.getFieldManager()
                    .getEntityTypeFieldList(entityType, {
                        typeList: this.fieldTypeList,
                        onlyAvailable: true,
                    })
                    .sort((a, b) => {
                        return this.getLanguage().translate(a, 'fields', entityType)
                            .localeCompare(
                                this.getLanguage().translate(b, 'fields', entityType)
                            );
                    });

            this.translatedOptions = {};

            options.forEach(item => {
                this.translatedOptions[item] = this.translate(item, 'fields', entityType);
            })

            this.params.options = options;
        }
    });
});
