define("ebla-ai:views/settings/fields/ai-provider",["views/fields/enum"],function(e){return e.extend({fetchEmptyValueAsNull:!0,setupOptions:function(){this.params.options=Object.keys(this.getMetadata().get(["app","aiProviders"])||{}),this.params.options.unshift("")}})});