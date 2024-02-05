define('phlebfinders:views/modals/find-closest-contact', 'views/modals/select-records', function (Dep) {

    return Dep.extend({

        cssName: 'find-closest-contact',

        difference: 1.10,

        loadList: function () {
            var viewName = 'phlebfinders:views/record/map-list';

            var latBase = this.options.assignment.get('assignmentsAddressLatitude');
            var lngBase = this.options.assignment.get('assignmentsAddressLongitude');

            this.collection.whereAdditional = [
                {
                    attribute: 'addressLongitude',
                    type: 'between',
                    value: [lngBase - this.difference, lngBase + this.difference]
                },
                {
                    attribute: 'addressLatitude',
                    type: 'between',
                    value: [latBase - this.difference, latBase + this.difference]
                }
            ];

            this.createView('list', viewName, {
                assignment: this.options.assignment,
                collection: this.collection,
                el: this.containerSelector + ' .list-container',
                selectable: true,
                checkboxes: this.multiple,
                massActionsDisabled: true,
                rowActionsView: false,
                layoutName: 'listSmall',
                searchManager: this.searchManager,
                checkAllResultDisabled: !this.massRelateEnabled,
                buttonsDisabled: true,
                skipBuildRows: true
            }, function (view) {
                this.listenToOnce(view, 'select', function (model) {
                    this.trigger('select', model);
                    this.close();
                }.bind(this));

                if (this.multiple) {
                    this.listenTo(view, 'check', function () {
                        if (view.checkedList.length) {
                            this.enableButton('select');
                        } else {
                            this.disableButton('select');
                        }
                    }, this);
                    this.listenTo(view, 'select-all-results', function () {
                        this.enableButton('select');
                    }, this);
                }

                if (this.options.forceSelectAllAttributes || this.forceSelectAllAttributes) {
                    this.listenToOnce(view, 'after:build-rows', function () {
                        this.wait(false);
                    }, this);
                    this.collection.fetch();
                } else {
                    view.getSelectAttributeList(function (selectAttributeList) {
                        if (!~selectAttributeList.indexOf('name')) {
                            selectAttributeList.push('name');
                        }

                        var mandatorySelectAttributeList = this.options.mandatorySelectAttributeList || this.mandatorySelectAttributeList || [];
                        mandatorySelectAttributeList.forEach(function (attribute) {
                            if (!~selectAttributeList.indexOf(attribute)) {
                                selectAttributeList.push(attribute);
                            }
                        }, this);

                        if (selectAttributeList) {
                            this.collection.data.select = selectAttributeList.join(',');
                        }
                        this.listenToOnce(view, 'after:build-rows', function () {
                            this.wait(false);
                        }, this);
                        this.collection.fetch();
                    }.bind(this));
                }
            });
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);
            this.$el.find('.modal-dialog').css('width', '100%');
        }
    });
});
