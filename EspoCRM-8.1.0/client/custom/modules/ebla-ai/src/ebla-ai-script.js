Espo.require("views/note/fields/post",function(e){const t=e.prototype.setup,i=e.prototype.afterRender;_.extend(e.prototype,{setup:function(){t.call(this),this.events['click [data-action="aiGenerate"]']=this.actionAiGenerate},afterRender:function(){var e;i.call(this),this.isEditMode()&&!this.params.disableAiGenerate&&(e=$("<button></button>").addClass("btn btn-default").attr("data-action","aiGenerate").css({position:"absolute",bottom:"0px",right:"13px",border:"none","border-radius":"50%",padding:"0px 13px",cursor:"pointer"}).append($("<i></i>").css("font-size","12px").addClass("fas fa-bolt")),this.$el.css({position:"relative"}).append(e))},actionAiGenerate:function(){this.createView("dialog","ebla-ai:views/modals/ai-generate",{model:this.model},e=>{e.render(),this.listenToOnce(e,"insert",e=>{this.model.set(this.name,e.output),this.$element.focus()})})}})}),Espo.require("views/modals/compose-email",function(e){const t=e.prototype.setup;_.extend(e.prototype,{setup:function(){t.call(this),this.buttonList.push({name:"aiReply",label:"AI Reply",style:"primary"})},actionAiReply:function(){this.createView("dialog","ebla-ai:views/modals/ai-generate",{model:this.model},e=>{e.render(),this.listenToOnce(e,"insert",e=>{this.model.set("body",e.output)})})}})});