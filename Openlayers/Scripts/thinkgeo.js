﻿var zoom = 7;
var center = [33.150205, -96.8277325];
var selectedAdornment = 'ScaleBarAdornment';

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

var url = 'https://gisserver{1-6}.thinkgeo.com/api/v1/maps/raster/light/x1/3857/512/{z}/{x}/{y}.png';

var thinkgeoCloudMapsLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: url,
        maxZoom: 19,
        tileSize: 512,
        params:
        {
            'LAYERS': 'ThinkGeoCloudMaps',
            'VERSION': '10.4.0',
            'STYLE': 'Light'
        }
    })
});
map.addLayer(thinkgeoCloudMapsLayer);

var xyzSource = new ol.source.XYZ({
    url: getRootPath() + 'Adornments/SchoolShapeFileLayer/{z}/{x}/{y}',
    maxZoom: 19
});
xyzSource.tileLoadFunction = function (imageTile, src) {
    imageTile.getImage().src = src + '?t=' + new Date().getTime();;
};
var shapLayer = new ol.layer.Tile({
    source: xyzSource
});
map.addLayer(shapLayer);

var adornment = AdornmentsOverlay({
    adornmentType: AdornmensType.ScaleBarAdornment,
    id: 'adornmentImg'
});
addTo(map);
var size = map.getSize();
var extent = map.getView().calculateExtent(size);
setUrl('Adornments/ScaleBarAdornment/' + size + '/' + extent + '/');

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
    setUrl('Adornments/' + selectedAdornment + '/' + size + '/' + extent + '/');
});

$("html").click(function () {
    $('#leftControlBar').animate({
        'left': -$('#leftControlBar').width() + 'px'
    });
});