<div class="row">
    <div class="col-sm-12 col-xs-12 input-group">
        <input type="text" class="form-control" data-name="{{name}}Search" placeholder="{{translate 'Search'}}">
        <span class="input-group-btn">
            <button
                class="btn btn-default btn-icon"
                type="button"
                data-action="locateAddress"
                data-placement="top"
                title="{{translate 'Pick your location' scope='Location'}}"
            >
                <span class="fas fa-crosshairs fa-sm"></span>
            </button>
        </span>
    </div>
</div>
<div class="row">
    <div class="col-sm-6 col-xs-6">
        <input type="number" class="form-control" data-name="{{name}}Latitude" value="{{latitudeValue}}" placeholder="{{translate 'Latitude'}}" maxlength="10">
    </div>
    <div class="col-sm-6 col-xs-6">
        <input type="number" class="form-control" data-name="{{name}}Longitude" value="{{longitudeValue}}" placeholder="{{translate 'Longitude'}}" maxlength="10">
    </div>
</div>
<hr style="margin-top: 1px;margin-bottom: 5px;border-style: dashed;">
