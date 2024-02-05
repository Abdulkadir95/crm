Espo.define('phlebfinders:views/assignment-item/fields/name', 'views/fields/varchar', function (Dep) {

    return Dep.extend({

        detailTemplate: 'phlebfinders:assignment-item/fields/name/detail',

        listTemplate: 'phlebfinders:assignment-item/fields/name/detail',

        editTemplate: 'phlebfinders:assignment-item/fields/name/edit',

        listLinkTemplate: 'sales:quote-item/fields/name/list-link',

        data: function () {
            var data = Dep.prototype.data.call(this);

            data['productSelectDisabled'] = this.isNotProduct();
            data['isProduct'] = !!this.model.get('productId');
            data['productId'] = this.model.get('productId');

            return data;
        },

        isNotProduct: function () {
            return (!this.model.get('productId') && this.model.get('name') && this.model.get('name') !== '');
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.events['click [data-action="selectProduct"]'] = this.actionSelectProduct;

            this.on('change', function () {
                this.handleSelectProductVisibility();
            }, this);
        },

        handleSelectProductVisibility: function () {
            if (this.isNotProduct()) {
                this.$el.find('[data-action="selectProduct"]').addClass('disabled').attr('disabled', 'disabled');
            } else {
                this.$el.find('[data-action="selectProduct"]').removeClass('disabled').removeAttr('disabled');
            }
        },

        handleNameAvailability: function () {
            if (this.model.get('productId')) {
                this.$element.attr('readonly', true);
            }
        },

        actionSelectProduct: function () {
            this.notify('Loading...');

            var viewName = this.getMetadata().get('clientDefs.Product.modalViews.select') || 'views/modals/select-category-tree-records';

            this.createView('dialog', viewName, {
                scope: 'Product',
                createButton: false,
                primaryFilterName: 'available',
                forceSelectAllAttributes: true
            }, function (view) {
                view.render();
                this.notify(false);
                this.listenToOnce(view, 'select', function (model) {
                    view.close();
                    this.selectProduct(model);
                }, this);
            }.bind(this));
        },

        selectProduct: function (product) {
            var copyFieldList = this.getMetadata().get(['entityDefs', this.model.entityType, 'fields', 'product', 'copyFieldList']) || [];
            copyFieldList.forEach(function (field) {
                var methodName = 'getEntityTypeFieldAttributeList';
                if (!this.getFieldManager()[methodName]) {
                    methodName = 'getScopeFieldAttributeList';
                }
                this.getFieldManager()[methodName]('Product', field).forEach(function (attribute) {
                    this.model.set(attribute, product.get(attribute));
                }, this);
            }, this);

            this.options.calculationHandler.selectProduct(this.model, product);

            this.handleSelectProductVisibility();
            this.handleNameAvailability();

            this.trigger('change');
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);
            this.handleSelectProductVisibility();
        },

    });
});
