Espo.require("views/fields/file",function(e){const t=e.prototype.getModelFactory;_.extend(e.prototype,{getModelFactory:function(){var e=t.call(this);return Espo.eblaFormId?_.extend(e,{create:function(e,o,r){return new Promise(t=>{r=r||this,this.getSeed(e,e=>{e=new e;e.urlRoot="EblaForm/Attachment/"+Espo.eblaFormId,o&&o.call(r,e),t(e)})})}}):e}})}),Espo.require("views/fields/attachment-multiple",function(e){const t=e.prototype.getModelFactory;_.extend(e.protortype,{getModelFactory:function(){var e=t.call(this);return Espo.eblaFormId?_.extend(e,{create:function(e,r,n){return new Promise(o=>{n=n||this,this.getSeed(e,e=>{const t=new e;t.urlRoot="EblaForm/Attachment/"+Espo.eblaFormId,t._clone=t.clone,t.clone=()=>{var e=t._clone();return e.urlRoot="EblaForm/Attachment/"+Espo.eblaFormId,e},r&&r.call(n,t),o(t)})})}}):e}})});