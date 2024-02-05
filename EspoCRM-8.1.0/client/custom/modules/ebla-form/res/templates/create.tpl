<div class="ebla-form-container container content">
    <div class="col-md-8 col-md-offset-2 col-sm-12">
        <div id="ebla-form-create" class="panel panel-default">
            {{#if showLogo}}
                <div class="panel-heading">
                    <div class="logo-container" style="margin: 0 auto;">
                        <img src="{{logoSrc}}" class="logo">
                    </div>
                </div>
            {{/if}}
            {{#if welcomeMessage}}
                <div class="welcome-message">
                    {{{welcomeMessage}}}
                </div>
            {{/if}}
            <div class="panel-body">
                {{#if thankYou}}
                    <div class="done">{{{thankYou}}}</div>
                {{else}}
                    <div class="edit-container">{{{edit}}}</div>
                    {{#if reCaptchaSiteKey}}
                        <div id="g-recaptcha" class="g-recaptcha form-group"></div>
                    {{/if}}
                    <button type="button" class="btn btn-success btn-block" id="btn-submit-ebla-form" tabindex="3">
                        {{translate 'Submit' scope='Global'}}
                    </button>
                {{/if}}
            </div>
        </div>
    </div>
</div>
