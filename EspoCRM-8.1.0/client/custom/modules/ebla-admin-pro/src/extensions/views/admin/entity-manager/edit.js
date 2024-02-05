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

Espo.require('views/admin/entity-manager/edit', function (Dep) {
    const _setup = Dep.prototype.setup;

    _.extend(Dep.prototype, {

        setup: function () {
            _setup.call(this);

            this.on('after:save', () => {
                if (this.isNew) {
                    this.getMetadata().addScope(this.model.get('name'));
                    Espo._activeScopes.push(this.model.get('name'));
                    this.getConfig()
                        .clone()
                        .clear()
                        .set('activeScopes', Espo._activeScopes)
                        .save();
                }
            });
        }
    });
});
