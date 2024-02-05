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

(function (Espo) {
    const moduleName = 'ebla-admin-pro';
    const extending = [
        'metadata',
        'views/admin/entity-manager/index',
        'views/admin/entity-manager/edit',
        'views/admin/index',
    ];

    extending.forEach(function (id) {
        Espo.require(moduleName + ':extensions/' + id, Function.prototype);
    });
}).call(window, Espo);
