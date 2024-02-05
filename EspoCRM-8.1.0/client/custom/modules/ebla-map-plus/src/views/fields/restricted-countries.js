define('ebla-map-plus:views/fields/restricted-countries', 'views/fields/multi-enum', function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            this.params.options = Object.keys(this.getMetadata().get(['app', 'countries']) || {});

            this.translatedOptions = this.getMetadata().get(['app', 'countries']) || {};
        },

    });
});
