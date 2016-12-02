﻿var zoom = 7;
var center = [33.150205, -96.8277325];
var selectedAdornment = 'ScaleBarAdornment';

// Create the map.
var map = new ol.Map({
    target: 'map',
    controls: ol.control.defaults({ attribution: false }).extend(
        [new ol.control.Attribution({
            collapsible: false
        })]),
    view: new ol.View({
        center: ol.proj.transform([-95.81131, 40.14711], 'EPSG:4326', 'EPSG:3857'),
        zoom: 5,
        maxZoom: 19,
        minZoom: 0
    })
});

// Add image buttons for adornments and help.
var imgControls = new app.ImagesControl({
    imgs: [
            {
                id: 'adornmentOptions',
                src: 'Images/LeftControlBar.png',
                title: 'Show Adornments Control Bar',
                callback: function () { $('#leftControlBar').animate({ 'left': '0px' }); }
            },
            {
                id: 'btnInfo',
                src: 'Images/info.png',
                title: 'Show help',
                callback: function () { window.open('http://wiki.thinkgeo.com/wiki/map_suite_adornments', '_blank'); }
            }
    ]
});
map.addControl(imgControls);

// Add WorldMapKit Online as the map's background layer. 
var osmWorldMapKitLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS(({
        urls: ['http://worldmapkit1.thinkgeo.com/CachedWMSServer/WmsServer.axd',
            'http://worldmapkit2.thinkgeo.com/CachedWMSServer/WmsServer.axd',
            'http://worldmapkit3.thinkgeo.com/CachedWMSServer/WmsServer.axd',
            'http://worldmapkit4.thinkgeo.com/CachedWMSServer/WmsServer.axd',
            'http://worldmapkit5.thinkgeo.com/CachedWMSServer/WmsServer.axd',
            'http://worldmapkit6.thinkgeo.com/CachedWMSServer/WmsServer.axd'],
        params:
            {
                'LAYERS': 'OSMWorldMapKitLayer',
                'VERSION': '1.1.1',
                'STYLE': 'WorldMapKitDefaultStyle'
            },
        attributions: [new ol.Attribution({
            html: '<a href="http://thinkgeo.com/map-suite-developer-gis/world-map-kit-sdk/">ThinkGeo</a> | &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors <a href="http://www.openstreetmap.org/copyright">ODbL</a>'
        })]
    }))
});
map.addLayer(osmWorldMapKitLayer);

//  Add a dynamic layer to map as POI layer.
var xyzSource = new ol.source.XYZ({
    url: getRootPath() + 'Adornments/RefreshSchoolPoiLayer/{z}/{x}/{y}',
    maxZoom: 19
});
xyzSource.tileLoadFunction = function (imageTile, src) {
    imageTile.getImage().src = src + '?t=' + new Date().getTime();;
};
var shapLayer = new ol.layer.Tile({
    source: xyzSource
});
map.addLayer(shapLayer);

//  Add adornment layer to map.
var adornment = AdornmentsOverlay({
    adornmentType: AdornmensType.ScaleBarAdornment,
    id: 'adornmentImg'
});
addTo(map);
var size = map.getSize();
var extent = map.getView().calculateExtent(size);
setUrl('Adornments/RefreshAdornmentLayer/ScaleBarAdornment/' + size + '/' + extent + '/');

// Handle left navigation bar selected item changed events.
$('.leftControlBarBody div').click(function () {
    var leftControlBarItems = $(".leftControlBarBody div");
    for (var i = 0; i < leftControlBarItems.length; i++) {
        $(leftControlBarItems[i]).attr("class", "unselected");
    }
    $(this).attr("class", "selected");

    selectedAdornment = $(this).attr('id');

    if (selectedAdornment == "LegendAdornment") {
        map.setView(new ol.View({
            center: ol.proj.transform([-96.8216, 33.1447], 'EPSG:4326', 'EPSG:3857'),
            zoom: 15
        }));
        shapLayer.setVisible(true);
    } else {
        shapLayer.setVisible(false);
    }

    size = map.getSize();
    extent = map.getView().calculateExtent(size);
    adornmentType = selectedAdornment;
    setUrl('Adornments/RefreshAdornmentLayer/' + selectedAdornment + '/' + size + '/' + extent + '/');
});

$("html").click(function () {
    $('#leftControlBar').animate({
        'left': -$('#leftControlBar').width() + 'px'
    });
});