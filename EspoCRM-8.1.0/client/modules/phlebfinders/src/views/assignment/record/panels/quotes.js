Espo.define('phlebfinders:views/assignment/record/panels/quotes', 'views/record/panels/relationship', function (Dep) {

    return Dep.extend({

        actionCreateRelatedQuote: function () {
            this.notify('Loading...');
            $.ajax({
                url: 'Quote/action/getAttributesFromAssignment',
                type: 'GET',
                data: {
                    assignmentId: this.model.id
                }
            }).done(function (attributes) {
                var viewName = this.getMetadata().get('clientDefs.Quote.modalViews.edit') || 'views/modals/edit';
                this.createView('quickCreate', viewName, {
                    scope: 'Quote',
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
