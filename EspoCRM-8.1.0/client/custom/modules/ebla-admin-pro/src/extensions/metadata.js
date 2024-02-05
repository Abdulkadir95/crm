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

Espo.require('metadata', function (Dep) {
    const _get = Dep.prototype.get;

    _.extend(Dep.prototype, {
        get: function (path, defaultValue, fetchAll) {
            _get.call(this, path, defaultValue, fetchAll);

            const activeScopes = _get.call(this, 'app.activeScopes', false);

            const _parentResult = _get.call(this, path, defaultValue, fetchAll);

            if (!activeScopes || path !== 'scopes' || fetchAll || activeScopes.length === 0) {
                return _parentResult;
            }

            var activeScopesResult = {};

            (activeScopes || []).forEach(function (scope) {
                if (_parentResult[scope]) {
                    activeScopesResult[scope] = _parentResult[scope];
                }
            });

            return activeScopesResult;
        },
    });
});
