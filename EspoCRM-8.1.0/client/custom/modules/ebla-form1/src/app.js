define("ebla-form:app", ["app", "router"], function (e, t) {
    return e.extend({

        masterView: "ebla-form:views/site/master",

        startEblaForm: function (e) {
            Espo.eblaFormId = e,
                Espo.Ui.notify(this.language.translate("pleaseWait", "messages")),
                Espo.Ajax.postRequest("EblaForm/defs", {eblaFormId: e}).then(e => {
                this.metadata.data = e.metadata, this.language.data = e.i18n, this.initMetadata();
                this.baseController.entire("ebla-form:views/create", e, e => {
                    e.render().then(() => {
                        Espo.Ui.notify(!1)
                    })
                })
            })
        },

        initMetadata() {
            this.fieldManager.defs = this.metadata.get("fields"), this.fieldManager.metadata = this.metadata, this.settings.defs = this.metadata.get("entityDefs.Settings") || {}, this.user.defs = this.metadata.get("entityDefs.User") || {}, this.preferences.defs = this.metadata.get("entityDefs.Preferences") || {}, this.viewHelper.layoutManager.userId = this.user.id || "ebla-form-user", this.initRouter()
        },

        initRouter: function () {
            this.router = new t({routes: {}}), this.viewHelper.router = this.router, this.baseController.setRouter(this.router), this.router.confirmLeaveOutMessage = this.language.translate("confirmLeaveOutMessage", "messages"), this.router.confirmLeaveOutConfirmText = this.language.translate("Yes"), this.router.confirmLeaveOutCancelText = this.language.translate("Cancel")
        }
    })
});