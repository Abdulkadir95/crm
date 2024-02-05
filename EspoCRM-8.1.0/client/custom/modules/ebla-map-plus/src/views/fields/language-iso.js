define('ebla-map-plus:views/fields/language-iso', 'views/fields/enum', function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            this.params.options = Espo.Utils.clone(this.getMetadata().get(['app', 'language', 'listISO639']) || []);
            this.translatedOptions = Espo.Utils.clone(this.getLanguage().translate('languageISO639', 'options') || {});
            this.params.options.unshift('');
        },

    });
});
