// New adornments-pane div container.
var div = L.DomUtil.create('div', 'adornments-pane');
// img container.
var img;
var adornmentType;

// Adornments type enum.
AdornmensType = {
    'LogoAdornment': 1,
    'ScaleBarAdornment': 2,
    'ScaleLineAdornment': 3,
    'ScaleTextAdornment': 4,
    'GraticuleAdornment': 5,
    'LegendAdornment': 6,
    'MagneticDeclinationAdornment': 7,
};

//  Customize AdornmentsOverlay. It inherits L.ImageOverlay.
AdornmentsOverlay = L.ImageOverlay.extend({
    initialize: function (opt_options) {
        var options = opt_options || {};
        img = L.DomUtil.create('img', 'adornments', div);   //Add adornments img container to adornments-pane container. 
        adornmentType = 'ScaleBarAdornment';
        img.id = options.id;
        img.title = '';
    },
    addTo: function (map) {
        var element = map.getContainer();
        element.appendChild(div);   //Add adornments-pane container to map container.
        map.on('zoomend', zoomend);         
        map.on('resizeend', resize);     
        map.on('moveend', moveend);  
    },
    setUrl: function (url) {
        img.src = url;
    },
});

//  Refresh adornment img when map zoomend.
function zoomend() {
    img.src = 'Adornments/RefreshAdornmentLayer/' + adornmentType + '/' + GetMapSize(map) + '/' + GetMapBounds(map) + '/';
};

//  Refresh adornment img when map resizeend.
function resize() {
    img.src = 'Adornments/RefreshAdornmentLayer/' + adornmentType + '/' + GetMapSize(map) + '/' + GetMapBounds(map) + '/';
}

//  Refresh adornment img when map moveend.
function moveend() {
    img.src = 'Adornments/RefreshAdornmentLayer/' + adornmentType + '/' + GetMapSize(map) + '/' + GetMapBounds(map) + '/';
}

//  Get EPSG3857 map extent.
function GetMapBounds(map) {
    var bounds = map.getBounds();
    var soutWestPoint = L.CRS.EPSG3857.project(bounds._southWest);
    var northEastPoint = L.CRS.EPSG3857.project(bounds._northEast);
    return [soutWestPoint.x, soutWestPoint.y, northEastPoint.x, northEastPoint.y];
}

//  Get map size.
function GetMapSize(map) {
    var point = map.getSize();
    return [point.x, point.y]
}
