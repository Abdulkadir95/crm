<div class="link-container list-group">{{#each itemHtmlList}}{{{./this}}}{{/each}}</div>
<div class="array-control-container">
    {{#if displayAsSeparatedButtons}}
        {{#each options}}
            <button
                class="btn btn-default btn-block"
                type="button"
                data-action="addLocation"
                data-value="{{@key}}"
            >{{this}}</button>
        {{/each}}
    {{else}}
        <button
            class="btn btn-default btn-block"
            type="button"
            data-action="showAddModal"
        >{{translate 'Add'}}</button>
    {{/if}}
</div>
