{{#if value}}
    <a href="{{url}}" target="_blank">{{translate 'Open layout on layout manager'}}</a>
{{else}}
    {{#if valueIsSet}}<span class="none-value">{{translate 'None'}}</span>{{else}}
        <span class="loading-value">...</span>{{/if}}
{{/if}}
