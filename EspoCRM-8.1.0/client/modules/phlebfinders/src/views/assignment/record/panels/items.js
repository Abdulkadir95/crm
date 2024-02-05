Espo.define('phlebfinders:views/assignment/record/panels/items', 'views/record/panels/bottom', function (Dep) {

    return Dep.extend({

        template: 'phlebfinders:assignment/record/panels/items',

        setup: function () {
            Dep.prototype.setup.call(this);

            this.createView('itemList', 'phlebfinders:views/assignment/fields/item-list', {
                model: this.model,
                el: this.options.el + ' .field-itemList',
                defs: {
                    name: 'itemList'
                },
                mode: this.mode
            });
        },

        getFields: function () {
            var fields = {};
            fields.itemList = this.getView('itemList');
            return fields;
        },

    });
});
