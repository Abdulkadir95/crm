Espo.define('phlebfinders:views/assignment/record/panels/sales-orders', 'views/record/panels/relationship', function (Dep) {

    return Dep.extend({

        actionCreateRelatedSalesOrder: function () {
            this.notify('Loading...');
            Espo.Ajax.getRequest('SalesOrder/action/getAttributesFromAssignment', {
                assignmentId: this.model.id
            }).done(function (attributes) {
                var viewName = this.getMetadata().get('clientDefs.SalesOrder.modalViews.edit') || 'views/modals/edit';
                this.createView('quickCreate', viewName, {
                    scope: 'SalesOrder',
                    relate: {
                        model: this.model,
                        link: 'assignment',
                    },
                    attributes: attributes,
                }, function (view) {
                    view.render();
                    view.notify(false);
                    this.listenToOnce(view, 'after:save', function () {
                        this.collection.fetch();
                    }, this);
                }.bind(this));
            }.bind(this));
        },

    });
});
