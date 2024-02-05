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

define('ebla-map-plus:views/route/modals/add-item', 'views/modal', function (Dep) {

    return Dep.extend({

        backdrop: true,

        fitHeight: true,

        cssName: 'array-select-modal',

        _template: `
            {{#unless optionList}} {{translate 'No Data'}} {{/unless}}
            <ul class="list-group array-add-list-group no-side-margin">
            {{#each optionList}}
                <li class="list-group-item clearfix">
                    <a href="javascript:" class="select text-bold" data-value="{{./this}}">
                        {{prop ../translatedOptions this}}
                    </a>
                </li>
            {{/each}}
            </ul>
        `,

        data: function () {
            return {
                optionList: this.optionList,
                translatedOptions: this.translatedOptions,
            };
        },

        events: {
            'click .select': function (e) {
                const value = $(e.currentTarget).attr('data-value');
                this.trigger('add', value);
            },
        },

        setup: function () {
            this.optionList = this.options.options || [];
            this.translatedOptions = this.options.translatedOptions || {};

            this.optionList.forEach((option) => {
                this.translatedOptions[option] = this.translatedOptions[option] || option;
            });

            this.header = this.translate('Select Item');

            this.buttonList = [{
                name: 'cancel',
                label: 'Cancel'
            }];
        },
    });
});
