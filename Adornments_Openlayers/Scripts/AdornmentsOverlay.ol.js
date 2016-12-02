// New div container.
var div = document.createElement('div');
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

//  New class AdornmentsOverlay. It inherits ol.Overlay.
AdornmentsOverlay = function (opt_options) {
    var options = opt_options || {};
    adornmentType = options.adornmentType;
    img = document.createElement('img');
    img.id = options.id;
    img.title = '';
    img.setAttribute('class', 'adornments');
    div.setAttribute('class', 'adornments-pane');
    div.appendChild(img);
}
ol.inherits(AdornmentsOverlay, ol.Overlay);

//  Add adornments container to map.
addTo = function (map) {
    var element = document.getElementsByClassName('ol-overlaycontainer');
    element[0].appendChild(div);
    map.on('resizeend', resizeend);
    map.on('moveend', moveend);
    map.on('zoomend', zoomend);
};

//  Refresh adornment img, when map zoomend.
zoomend = function () {
    var size = map.getSize();
    var extent = map.getView().calculateExtent(size);
    img.src = 'Adornments/RefreshAdornmentLayer/' + adornmentType + '/' + size + '/' + extent + '/';
};

//  Refresh adornment img, when map moveend.
moveend = function () {
    var size = map.getSize();
    var extent = map.getView().calculateExtent(size);
    img.src = 'Adornments/RefreshAdornmentLayer/' + adornmentType + '/' + size + '/' + extent + '/';
}

//  Refresh adornment img, when map resizeend.
resizeend = function () {
    var size = map.getSize();
    var extent = map.getView().calculateExtent(size);
    img.src = 'Adornments/RefreshAdornmentLayer/' + adornmentType + '/' + size + '/' + extent + '/';
};

setUrl = function (url) {
    img.src = url;
}











