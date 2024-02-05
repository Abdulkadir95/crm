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

define('ebla-map-plus:views/location/fields/rating-history', ['views/fields/base', 'lib!Flotr'], function (Dep, Flotr) {

    return Dep.extend({

        detailTemplate: 'ebla-map-plus:location/fields/rating-history/detail',

        flotr: null,

        afterRender: function () {

            if (this.mode === 'detail') {

                this.flotr = Flotr;

                this.$container = this.$el.find('.chart-container');

                this.draw();
            }
        },

        init: function () {
            Dep.prototype.init.call(this);

            this.$container = this.$el.find('.chart-container');

            this.on('resize', function () {
                if (!this.isRendered()) return;
                setTimeout(function () {
                    this.draw();
                }.bind(this), 50);
            }, this);

        },

        draw: function () {
            const chartData = this.model.get(this.name);
            if (!chartData) return;

            this.flotr.draw(document.getElementById("chart-container"), [chartData], {
                xaxis: {
                    mode: 'time',
                    labelsAngle: 45
                },
                selection: {
                    mode: 'x'
                },
                yaxis: {
                    ticks: [0, 1, 2, 3, 4, 5, [6, '']],
                    min: 0,
                    max: 6
                },
                HtmlText: false
            });
        },

    });
});
