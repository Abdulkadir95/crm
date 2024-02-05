<div class="button-container">
    <div class="btn-group">
        <button class="btn btn-default dropdown-toggle" data-toggle="dropdown">
            {{translate 'Add Field' scope='Import'}}
            <span class="caret"></span>
        </button>
        <ul class="dropdown-menu pull-left">
            {{#each fieldList}}
            <li><a role="button:" data-action="addField" data-name="{{./this}}">{{translate this scope=../scope category='fields'}}</a></li>
            {{/each}}
        </ul>
    </div>
</div>
<div id="default-values-container">
</div>
