var zoom = 7;
var center = [33.150205, -96.8277325];
var selectedTopology = 'ScaleBarAdornment';

// Create the map.
var map = L.map('map').setView(center, zoom);

// Add image buttons for layers and help.
L.imageButtons({
    imgs: [
        {
            src: 'Images/LeftControlBar.png',
            id: 'adornmentOptions',
            title: 'Show Adornmentsw Control Bar',
            callback: function () {
                $('#leftControlBar').animate({
                    'left': '0px'
                });
            }
        },
        {
            src: 'Images/info.png',
            id: 'btnInfo',
            title: 'Show help',
            callback: function () { window.open('http://wiki.thinkgeo.com/wiki/map_suite_adornments', '_blank'); }
        }
    ]
}).addTo(map);

// Add WorldMapKit Online as the map's background layer. 
var osmWorldMapKitLayer = L.tileLayer('https://{s}.thinkgeo.com/api/v1/maps/raster/light/x1/3857/256/{z}/{x}/{y}.png', {
    subdomains: ['gisserver1', 'gisserver2', 'gisserver3', 'gisserver4', 'gisserver5', 'gisserver6'],
    layers: 'ThinkGeoCloudMaps',
    format: 'image/png',
    styles: 'Light',
    version: '1.1.1'
});
osmWorldMapKitLayer.addTo(map);

var layer = L.dynamicLayer(L.Util.getRootPath() + 'Adornments/SchoolShapeFileLayer/{z}/{x}/{y}', {
    unloadInvisibleTiles: true, reuseTiles: false
}).addTo(map);

layer.on('loading', function () {
    $('#loadingImage').show();
});
layer.on('load', function () {
    $('#loadingImage').hide();
});


var adornment = new AdornmentsOverlay({
    adornmentType: AdornmensType.ScaleBarAdornment,
    id: 'adornmentImg',
});
adornment.addTo(map);
var extent = GetMapBounds(map);
adornment.setUrl('Adornments/' + 'ScaleBarAdornment' + '/' + GetMapSize(map) + '/' + extent + '/');

$('.leftControlBarBody div').click(function () {
    var leftControlBarItems = $(".leftControlBarBody div");
    for (var i = 0; i < leftControlBarItems.length; i++) {
        $(leftControlBarItems[i]).attr("class", "unselected");
    }

    $(this).attr("class", "selected");
    selectedTopology = $(this).attr('id');
    if (selectedTopology == "LegendAdornment") {
        map.setView([33.1447, -96.8216], 15);
        if (!map.hasLayer(layer)) {
            map.addLayer(layer);
        }
    } else {
        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
        }
    }

    if (!map.hasLayer(osmWorldMapKitLayer)) {
        map.addLayer(osmWorldMapKitLayer);
        osmWorldMapKitLayer.bringToBack();
    }
    adornmentType = selectedTopology;
    var extent = GetMapBounds(map);
    adornment.setUrl('Adornments/' + selectedTopology + '/' + GetMapSize(map) + '/' + extent + '/');
});

$("html").click(function () {
    $('#leftControlBar').animate({ 'left': -$('#leftControlBar').width() + 'px' });
});