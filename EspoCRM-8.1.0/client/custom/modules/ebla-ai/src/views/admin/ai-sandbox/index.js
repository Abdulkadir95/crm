define("ebla-ai:views/admin/ai-sandbox/index",["view","model"],function(e,a){return e.extend({templateContent:`
<div class="page-header"><h3><a href="#Admin">{{translate 'Administration'}}</a>
<span class="breadcrumb-separator"><span class="chevron-right"></span></span>
{{translate 'Ai Sandbox' scope='Admin'}}</h3></div>
<div class="record">{{{record}}}</div>`,targetEntityType:null,storageKey:"aiSandbox",data:function(){return{}},setup:function(){var e=[""].concat(this.getMetadata().getScopeEntityList().filter(e=>this.getMetadata().get(["scopes",e,"object"]))),t={prompt:null,targetId:null,targetType:null,output:null},s=(this.getSessionStorage().has(this.storageKey)&&(s=this.getSessionStorage().get(this.storageKey),t.prompt=s.prompt||null,t.targetId=s.targetId||null,t.targetName=s.targetName||null,t.targetType=s.targetType||null),this.model=new a);s.name="Ai",s.setDefs({fields:{targetType:{type:"enum",options:e,translation:"Global.scopeNames",view:"views/fields/entity-type"},target:{type:"link",entity:t.targetType},prompt:{type:"text",view:"views/fields/text"},output:{type:"text",readOnly:!0,displayRawText:!0},errorMessage:{type:"text",readOnly:!0,displayRawText:!0}}}),s.set(t),this.createRecordView(),this.listenTo(this.model,"change:targetType",(e,t,s)=>{s.ui&&setTimeout(()=>{this.targetEntityType=this.model.get("targetType"),this.model.set({targetId:null,targetName:null},{silent:!0});var e=Espo.Utils.cloneDeep(this.model.attributes);this.clearView("record"),this.model.set(e,{silent:!0}),this.model.defs.fields.target.entity=this.targetEntityType,this.createRecordView().then(e=>e.render())},10)}),this.listenTo(this.model,"run",()=>this.run()),this.listenTo(this.model,"change",(e,t)=>{t.ui&&(t={prompt:this.model.get("prompt"),targetType:this.model.get("targetType"),targetId:this.model.get("targetId"),targetName:this.model.get("targetName")},this.getSessionStorage().set(this.storageKey,t))})},createRecordView:function(){return this.createView("record","ebla-ai:views/admin/ai-sandbox/record/edit",{selector:".record",model:this.model,targetEntityType:this.targetEntityType,confirmLeaveDisabled:!0,shortcutKeysEnabled:!0})},updatePageTitle:function(){this.setPageTitle(this.getLanguage().translate("Ai Sandbox","labels","Admin"))},run:function(){var e=this.model.get("prompt");this.model.set({output:null,errorMessage:null}),""===e||null===e?(this.model.set("output",null),Espo.Ui.warning(this.translate("emptyprompt","messages","Ai"))):(Espo.Ui.notify(" ... "),Espo.Ajax.postRequest("EblaAi/run",{prompt:e,targetId:this.model.get("targetId"),targetType:this.model.get("targetType")}).then(t=>{this.model.set("output",t.output||null);let e=null;if(t.isSuccess||(e=t.message||null),this.model.set("errorMessage",e),t.isSuccess)Espo.Ui.success(this.translate("runSuccess","messages","Ai"));else{let e=this.translate("runError","messages","Ai");t.message&&(e+=" "+t.message),Espo.Ui.error(e)}}))}})});