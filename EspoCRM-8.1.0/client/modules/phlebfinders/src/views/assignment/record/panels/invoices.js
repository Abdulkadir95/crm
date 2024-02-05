Espo.define('phlebfinders:views/assignment/record/panels/invoices', 'views/record/panels/relationship', function (Dep) {

    return Dep.extend({

        actionCreateRelatedInvoice: function () {
            this.notify('Loading...');
            Espo.Ajax.getRequest('Invoice/action/getAttributesFromAssignment', {
                assignmentId: this.model.id
            }).done(function (attributes) {
                var viewName = this.getMetadata().get('clientDefs.Invoice.modalViews.edit') || 'views/modals/edit';
                this.createView('quickCreate', viewName, {
                    scope: 'Invoice',
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
