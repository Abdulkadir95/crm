Espo.define('phlebfinders:views/assignment/record/item', 'views/base', function (Dep) {

    return Dep.extend({

        template: 'phlebfinders:assignment/record/item',

        data: function () {

            var listLayout = Espo.Utils.cloneDeep(this.listLayout);

            listLayout.forEach(function (item) {
                if (~this.readOnlyFieldList.indexOf(item.name)) {
                    item.isReadOnly = true;
                }
            }, this);
            return {
                id: this.model.id,
                mode: this.mode,
                showRowActions: this.options.showRowActions,
                listLayout: listLayout
            };
        },

        setup: function () {
            this.mode = this.options.mode;

            this.parentModel = this.options.parentModel;

            this.calculationHandler = this.options.calculationHandler;

            if (this.options.showRowActions) {
                this.createView('rowActions', 'views/record/row-actions/view-and-edit', {
                    model: this.model,
                    acl: {
                        edit: this.options.aclEdit,
                        read: true
                    }
                });
            }

            this.listLayout = this.options.listLayout;

            this.fieldList = [];
            this.readOnlyFieldList = [];

            this.fieldViewNameMap = {
                name: 'phlebfinders:views/assignment-item/fields/name'
            };

            this.listLayout.forEach(function (item) {
                var name = item.name;
                var options = {};

                if (this.mode === 'detail') {
                    if (item.link) {
                        options.mode = 'listLink';
                    }
                }

                var type = this.model.getFieldType(name) || 'base';

                var customView = null;
                if (type === 'currency') {
                    customView = 'sales:views/quote-item/fields/currency-amount-only';
                    options.hideCurrency = true;
                }

                if (this.model.getFieldParam(name, 'readOnly') && !this.model.getFieldParam(name, 'itemNotReadOnly')) {
                    this.readOnlyFieldList.push(name);
                    options.mode = 'detail';
                }

                var view = item.view || this.fieldViewNameMap[item.name] || customView || this.model.getFieldParam(name, 'view');
                if (!view) {
                    view = this.getFieldManager().getViewName(type);
                }

                this.createField(name, view, options);
            }, this);

            this.createField('description', 'views/fields/text', {mode: this.mode === 'edit' ? 'edit' : 'list'});
        },

        getFieldView: function (name) {
            return this.getView(name + 'Field');
        },

        createField: function (name, view, options, params) {
            var o = {
                model: this.model,
                defs: {
                    name: name,
                    params: params || {}
                },
                mode: this.mode,
                el: this.options.el + ' .field[data-name="item-' + name + '"]',
                inlineEditDisabled: true,
                readOnlyDisabled: true,
                calculationHandler: this.options.calculationHandler
            };

            if (options) {
                for (var i in options) {
                    o[i] = options[i];
                }
            }

            this.createView(name + 'Field', view, o, function (view) {
                this.listenTo(view, 'change', function () {
                    setTimeout(function () {
                        this.trigger('change');
                    }.bind(this), 50);
                }, this);
            }.bind(this));

            this.fieldList.push(name);
        },

        afterRender: function () {
            this.options.calculationHandler.listenedItemFieldList.forEach(function (field) {
                if (this.getFieldView(field)) {
                    this.listenTo(this.getFieldView(field), 'change', function () {
                        this.calculateAmount(field);
                    }, this);
                }
            }, this);
        },

        calculateAmount: function (field) {
            var currency = this.parentModel.get('amountCurrency');
            this.calculationHandler.boundCurrencyItemFieldList.forEach(function (item) {
                this.model.set(item + 'Currency', currency);
            }, this);

            this.calculationHandler.calculateItem(this.model, field);
        },

        fetch: function () {
            var data = {
                id: this.model.id,
                quantity: this.model.get('quantity'),
                unitPrice: this.model.get('unitPrice'),
                unitPriceCurrency: this.model.get('unitPriceCurrency'),
                amount: this.model.get('amount'),
                amountCurrency: this.model.get('amountCurrency'),
                productId: this.model.get('productId') || null,
                productName: this.model.get('productName') || null,
                name: this.model.get('name'),
                description: this.model.get('description')
            };

            for (var attribute in this.model.attributes) {
                if (!(attribute in data)) {
                    data[attribute] = this.model.attributes[attribute];
                }
            }

            return data;
        }

    });
});
