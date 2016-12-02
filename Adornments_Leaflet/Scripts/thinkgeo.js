var zoom = 7;
var center = [33.150205, -96.8277325];
var selectedTopology = 'ScaleBarAdornment';

// Create the map.
var map = L.map('map').setView(center, zoom);

// Add image buttons for adornments and help.
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
var osmWorldMapKitLayer = L.tileLayer.wms('http://{s}.thinkgeo.com/CachedWMSServer/WmsServer.axd', {
    subdomains: ['worldmapkit1', 'worldmapkit2', 'worldmapkit3', 'worldmapkit4', 'worldmapkit5', 'worldmapkit6'],
    layers: 'OSMWorldMapKitLayer',
    format: 'image/png',
    styles: 'WorldMapKitDefaultStyle',
    version: '1.1.1',
    attribution: '<a href="http://thinkgeo.com/map-suite-developer-gis/world-map-kit-sdk/">ThinkGeo</a> | &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors '
});
osmWorldMapKitLayer.addTo(map);

//  Add a dynamic layer to map as POI layer.
var layer = L.dynamicLayer(L.Util.getRootPath() + 'Adornments/RefreshSchoolPoiLayer/{z}/{x}/{y}', {
    unloadInvisibleTiles: true, reuseTiles: false
}).addTo(map);

layer.on('loading', function () {
    $('#loadingImage').show();
});
layer.on('load', function () {
    $('#loadingImage').hide();
});

//  Add adornment layer to map.
var adornment = new AdornmentsOverlay({
    adornmentType: AdornmensType.ScaleBarAdornment,
    id: 'adornmentImg',
});
adornment.addTo(map);
var extent = GetMapBounds(map);
adornment.setUrl('Adornments/RefreshAdornmentLayer/' + 'ScaleBarAdornment' + '/' + GetMapSize(map) + '/' + extent + '/');

// Handle left navigation bar selected item changed events.
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
    adornment.setUrl('Adornments/RefreshAdornmentLayer/' + selectedTopology + '/' + GetMapSize(map) + '/' + extent + '/');
});

$("html").click(function () {
    $('#leftControlBar').animate({ 'left': -$('#leftControlBar').width() + 'px' });
});