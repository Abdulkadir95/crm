Espo.define('phlebfinders:views/assignment/record/detail', 'views/templates/event/record/detail', function (Dep) {
    return Dep.extend({

        buttonList: [
            {
                name: 'edit',
                label: 'Edit',
            },
            {
                name: 'createQuote',
                style: 'default',
                hidden: true,
                label: 'Create Quote',
            },
            {
                name: 'createPayment',
                style: 'default',
                hidden: true,
                label: 'Create Payment',
            },
            {
                name: 'findClosestContact',
                style: 'warning',
                label: 'Find Closest Contact',
            }
        ],

        setup: function () {
            Dep.prototype.setup.call(this);
            const manageButtonView = () => {
                if (
                    (this.model.get('itemList') || []).length > 0 &&
                    this.model.get('autoQuoteCreated') !== true &&
                    this.getAcl().check('Quote', 'create')
                ) {
                    this.showActionItem('createQuote');
                }

                if (
                    this.model.get('autoPaymentCreated') !== true &&
                    this.getAcl().check('Payment', 'create')
                ) {
                    this.showActionItem('createPayment');
                }
            }

            this.on('after:render', () => {
                manageButtonView.call(this);
                this.model.on('change:autoQuoteCreated', () => manageButtonView.call(this))
                this.model.on('change:autoPaymentCreated', () => manageButtonView.call(this))
            });
        },

        actionCreateQuote: function () {
            this.notify('Loading...');

            $.ajax({
                url: 'Quote/action/getAttributesFromAssignment',
                type: 'GET',
                data: {
                    assignmentId: this.model.id
                }
            }).done((attrs) => {
                this.getModelFactory().create('Quote', (quote) => {
                    quote.set({
                        assignedUserId: this.model.get('assignedUserId'),
                        autoCreated: true,
                        ...attrs
                    });
                    quote.save().then(() => {
                        this.model.save({autoQuoteCreated: true}, {patch: true}).then(() => {
                            Espo.Ui.notify(false);
                            this.hideActionItem('createQuote');
                            this.getView('bottom').getView('quotes').collection.fetch();
                            this.reRender();
                        });
                    });
                });
            });
        },

        actionCreatePayment: function () {
            const nameHash = {};
            nameHash[this.model.id] = this.model.get('name');

            this.createView('modal', 'views/modals/select-records', {
                scope: 'Contact',
                collectionUrl: 'Assigment/' + this.model.id + '/contacts',
                filters: {
                    assignments: {
                        type: 'linkedWith',
                        value: [this.model.id],
                        data: {
                            type: 'anyOf',
                            nameHash: nameHash,
                        }
                    }
                },
                mandatorySelectAttributeList: [
                    'salutationName',
                    'firstName',
                    'lastName',
                    'accountName',
                    'accountId',
                    'emailAddress',
                    'emailAddressData',
                    'phoneNumber',
                    'phoneNumberData'
                ],
                createButton: false,
            }, function (view) {
                view.render();

                this.listenToOnce(view, 'select', (model) => {
                    this.notify('Loading...');
                    const attributes = {autoCreated: true};

                    attributes.contactId = model.id;
                    attributes.contactName = model.get('name');

                    if (model.get('accountId')) {
                        attributes.accountId = model.get('accountId');
                        attributes.accountName = model.get('accountName');
                    } else {
                        attributes.accountId = this.model.get('accountId');
                        attributes.accountName = this.model.get('accountName');
                    }

                    this.getModelFactory().create('Payment', (payment) => {
                        payment.set({
                            name: this.model.get('name'),
                            assignmentId: this.model.id,
                            assignedUserId: this.model.get('assignedUserId'),
                            ...attributes
                        });

                        payment.save().then(() => {
                            this.model.save({autoPaymentCreated: true}, {patch: true}).then(() => {
                                Espo.Ui.notify(false);
                                this.hideActionItem('createPayment');
                                this.getView('bottom').getView('payments').collection.fetch();
                                this.reRender();
                            });
                        });
                    });
                });
            }, this);
        },

        actionFindClosestContact: function () {
            var viewName = 'phlebfinders:views/modals/find-closest-contact';

            this.notify('Loading...');
            this.createView('dialogSelectRelated', viewName, {
                scope: 'Contact',
                multiple: true,
                createButton: false,
                assignment: this.model,
                //filters: filters,
                //massRelateEnabled: massRelateEnabled,
                //primaryFilterName: primaryFilterName,
                //boolFilterList: boolFilterList,
            }, function (dialog) {
                dialog.render();
                Espo.Ui.notify(false);

                this.listenToOnce(dialog, 'select', function (models) {
                    this.clearView('dialogSelectRelated');
                    if (Object.prototype.toString.call(models) !== '[object Array]') {
                        models = [models];
                    }
                    var idNames = {};
                    models.forEach(function (model) {
                        idNames[model.id] = model.get('name');
                    });

                    var attributes = {
                        contactsIds: Object.keys(idNames),
                        contactsNames: idNames
                    };

                    this.notify('Saving...');
                    this.model.save(attributes, {patch: true}).then(() => {
                        Espo.Ui.notify(false);
                        this.reRender();
                    });
                }, this);
            });
        },
    });
});