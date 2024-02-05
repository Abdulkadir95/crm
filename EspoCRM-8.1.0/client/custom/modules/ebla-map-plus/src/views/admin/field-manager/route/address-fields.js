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

define('ebla-map-plus:views/admin/field-manager/route/address-fields', 'views/fields/multi-enum', function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            const list = [];
            const scopes = this.getMetadata().get('scopes');

            Object.keys(scopes).forEach(scope => {
                if (!scopes[scope].entity) return;

                const fieldDefs = this.getMetadata().get('entityDefs.' + scope + '.fields');
                Object.keys(fieldDefs).forEach(f => {
                    if (fieldDefs[f].type !== 'address') return;
                    if (fieldDefs[f].directAccessDisabled) return;
                    if (fieldDefs[f].disabled) return;
                    list.push(scope + "." + f);
                });
            })

            this.params.options = list;
        }
    });
});
