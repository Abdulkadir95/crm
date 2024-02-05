define("ebla-ai:views/modals/ai-generate/fields/send",["views/fields/base"],function(e){return e.extend({templateContent:`
            <div class="field">
                <button class="btn btn-primary" type="button" name="send" data-action="send">
                    {{translate 'Send' scope='Ai'}}
                </button>
            </div>
        `,setup:function(){this.events['click [data-action="send"]']=this.actionSend},actionSend:function(){var e=this.params.parentModel,t=this.model.get("prompt");e&&t&&(Espo.Ui.notify(" ... "),Espo.Ajax.postRequest("EblaAi/run",{prompt:t,targetId:e.id??e.get("repliedId"),targetType:e.entityType}).then(t=>{this.model.set("output",t.output||null);let e=null;if(t.isSuccess||(e=t.message||null),this.model.set("errorMessage",e),t.isSuccess)Espo.Ui.success(this.translate("runSuccess","messages","Ai"));else{let e=this.translate("runError","messages","Ai");t.message&&(e+=" "+t.message),Espo.Ui.error(e)}}))}})});