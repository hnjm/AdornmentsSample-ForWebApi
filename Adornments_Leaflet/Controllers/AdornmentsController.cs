using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using ThinkGeo.MapSuite;
using ThinkGeo.MapSuite.Drawing;
using ThinkGeo.MapSuite.Layers;
using ThinkGeo.MapSuite.Shapes;
using ThinkGeo.MapSuite.Styles;
using ThinkGeo.MapSuite.WebApi;

namespace Adornments
{
    [RoutePrefix("Adornments")]
    public class AdornmentsController : ApiController
    {
        private static readonly string baseDirectory;

        static AdornmentsController()
        {
            baseDirectory = AppDomain.CurrentDomain.BaseDirectory;
        }

        /// <summary>
        ///  Refresh adornment layer by adornment type.
        /// </summary>
        /// <param name="adornmentType"></param>
        /// <param name="size"></param>
        /// <param name="extent"></param>
        /// <returns>Return adornment layer HttpResponseMessage.</returns>
        [Route("RefreshAdornmentLayer/{adornmentType}/{size}/{extent}")]
        [HttpGet]
        public HttpResponseMessage RefreshAdornmentLayer(string adornmentType, Size size, string extent)
        {
            AdornmentsType currentAdornmentType = (AdornmentsType)Enum.Parse(typeof(AdornmentsType), adornmentType);
            string[] extentStrings = extent.Split(',');

            RectangleShape currentExtent = new RectangleShape(Convert.ToDouble(extentStrings[0]), Convert.ToDouble(extentStrings[3]), Convert.ToDouble(extentStrings[2]), Convert.ToDouble(extentStrings[1]));
            LayerOverlay layerOverlay = new LayerOverlay();
            layerOverlay.Layers.Add(GetAdornmentLayer(currentAdornmentType));

            return DrawAdornmentImage(layerOverlay, size.Width, size.Height, currentExtent);
        }

        /// <summary>
        /// Refresh school POI layer by z,x,y.
        /// </summary>
        /// <param name="z"></param>
        /// <param name="x"></param>
        /// <param name="y"></param>
        /// <returns>Return school POI layer HttpResponseMessage.</returns>
        [Route("RefreshSchoolPoiLayer/{z}/{x}/{y}")]
        [HttpGet]
        public HttpResponseMessage RefreshSchoolPoiLayer(int z, int x, int y)
        {
            LayerOverlay layerOverlay = new LayerOverlay();
            Proj4Projection wgs84ToGoogleProjection = new Proj4Projection();
            wgs84ToGoogleProjection.InternalProjectionParametersString = Proj4Projection.GetWgs84ParametersString(); //4326
            wgs84ToGoogleProjection.ExternalProjectionParametersString = Proj4Projection.GetGoogleMapParametersString(); //900913
            wgs84ToGoogleProjection.Open();

            string shpFilePathName = string.Format(@"{0}\App_Data\ShapeFile\Schools.shp", baseDirectory);
            string schoolImage = string.Format(@"{0}\Images\school.png", baseDirectory);
            ShapeFileFeatureLayer schoolsLayer = new ShapeFileFeatureLayer(shpFilePathName);
            schoolsLayer.Name = "schoolLayer";
            schoolsLayer.Transparency = 200f;
            schoolsLayer.ZoomLevelSet.ZoomLevel10.DefaultPointStyle = new PointStyle(new GeoImage(schoolImage));
            schoolsLayer.ZoomLevelSet.ZoomLevel10.ApplyUntilZoomLevel = ApplyUntilZoomLevel.Level20;
            schoolsLayer.FeatureSource.Projection = wgs84ToGoogleProjection;
            layerOverlay.Layers.Add(schoolsLayer);

            return DrawTileImage(layerOverlay, z, x, y);
        }

        /// <summary>
        /// Draw adornment image by map extent.
        /// </summary>
        /// <param name="layerOverlay"></param>
        /// <param name="width"></param>
        /// <param name="height"></param>
        /// <param name="currentExtent"></param>
        /// <returns>Return adornment image HttpResponseMessage.</returns>
        private HttpResponseMessage DrawAdornmentImage(LayerOverlay layerOverlay, int width, int height, RectangleShape currentExtent)
        {
            using (Bitmap bitmap = new Bitmap(width, height))
            {
                PlatformGeoCanvas geoCanvas = new PlatformGeoCanvas();
                geoCanvas.BeginDrawing(bitmap, currentExtent, GeographyUnit.Meter);
                layerOverlay.Draw(geoCanvas);
                geoCanvas.EndDrawing();

                MemoryStream ms = new MemoryStream();
                bitmap.Save(ms, ImageFormat.Png);

                HttpResponseMessage msg = new HttpResponseMessage(HttpStatusCode.OK);
                msg.Content = new ByteArrayContent(ms.ToArray());
                msg.Content.Headers.ContentType = new MediaTypeHeaderValue("image/png");

                return msg;
            }
        }

        /// <summary>
        /// Draw tile image by x,y,z.
        /// </summary>
        /// <param name="layerOverlay"></param>
        /// <param name="z"></param>
        /// <param name="x"></param>
        /// <param name="y"></param>
        /// <returns>Return tile image HttpResponseMessage.</returns>
        private HttpResponseMessage DrawTileImage(LayerOverlay layerOverlay, int z, int x, int y)
        {
            using (Bitmap bitmap = new Bitmap(256, 256))
            {
                PlatformGeoCanvas geoCanvas = new PlatformGeoCanvas();
                RectangleShape boundingBox = WebApiExtentHelper.GetBoundingBoxForXyz(x, y, z, GeographyUnit.Meter);
                geoCanvas.BeginDrawing(bitmap, boundingBox, GeographyUnit.Meter);
                layerOverlay.Draw(geoCanvas);
                geoCanvas.EndDrawing();

                MemoryStream ms = new MemoryStream();
                bitmap.Save(ms, ImageFormat.Png);

                HttpResponseMessage msg = new HttpResponseMessage(HttpStatusCode.OK);
                msg.Content = new ByteArrayContent(ms.ToArray());
                msg.Content.Headers.ContentType = new MediaTypeHeaderValue("image/png");

                return msg;
            }
        }

        /// <summary>
        /// Get adornment layer by adornments type.
        /// </summary>
        /// <param name="adornmentType"></param>
        /// <returns>Return adornment layer.</returns>
        private Layer GetAdornmentLayer(AdornmentsType adornmentType)
        {
            Layer adornmentLayer;
            switch (adornmentType)
            {
                case AdornmentsType.ScaleBarAdornment:
                    adornmentLayer = new ScaleBarAdornmentLayer();
                    break;
                case AdornmentsType.ScaleLineAdornment:
                    adornmentLayer = new ScaleLineAdornmentLayer();
                    break;
                case AdornmentsType.ScaleTextAdornment:
                    adornmentLayer = new ScaleTextAdornmentLayer();
                    break;
                case AdornmentsType.LogoAdornment:
                    adornmentLayer = BuildLogoAdornmentLayer();
                    break;
                case AdornmentsType.GraticuleAdornment:
                    adornmentLayer = BuildGraticuleAdornmentLayer();
                    break;
                case AdornmentsType.LegendAdornment:
                    adornmentLayer = BuildLegendAdornmentLayer();
                    break;
                case AdornmentsType.MagneticDeclinationAdornment:
                    adornmentLayer = BuildMagneticDeclinationAdornmentLayer();
                    break;
                default:
                    adornmentLayer = null;
                    break;
            }

            return adornmentLayer;
        }

        /// <summary>
        ///  Build legend adornment layer.
        /// </summary>
        /// <returns>Return legend adornment layer.</returns>
        private LegendAdornmentLayer BuildLegendAdornmentLayer()
        {
            //New legend title.
            LegendItem title = new LegendItem();
            title.TextStyle = new TextStyle("Map Legend", new GeoFont("Arial", 10, DrawingFontStyles.Bold), new GeoSolidBrush(GeoColor.SimpleColors.Black));

            //New railroad legend item.
            LegendItem legendItem1 = new LegendItem();
            legendItem1.ImageStyle = LineStyles.Railway1;
            legendItem1.TextStyle = new TextStyle("Railroad ", new GeoFont("Arial", 8), new GeoSolidBrush(GeoColor.SimpleColors.Black));

            //New parks legend item.
            LegendItem legendItem2 = new LegendItem();
            legendItem2.ImageStyle = AreaStyles.CreateSimpleAreaStyle(GeoColor.FromArgb(255, 167, 204, 149));
            legendItem2.TextStyle = new TextStyle("Parks", new GeoFont("Arial", 8), new GeoSolidBrush(GeoColor.SimpleColors.Black));

            //New school legend item.
            LegendItem legendItem3 = new LegendItem();
            string path = string.Format(@"{0}\Images\school.png", baseDirectory);
            legendItem3.ImageStyle = new PointStyle(new GeoImage(path));
            legendItem3.TextStyle = new TextStyle("School", new GeoFont("Arial", 8), new GeoSolidBrush(GeoColor.SimpleColors.Black));

            //New lengend adornment layer.Add lenged items to the layer.
            LegendAdornmentLayer legendLayer = new LegendAdornmentLayer();
            legendLayer.BackgroundMask = AreaStyles.CreateLinearGradientStyle(new GeoColor(255, 255, 255, 255), new GeoColor(255, 230, 230, 230), 90, GeoColor.SimpleColors.Black);
            legendLayer.LegendItems.Add(legendItem1);
            legendLayer.LegendItems.Add(legendItem2);
            legendLayer.LegendItems.Add(legendItem3);
            legendLayer.Height = 125;
            legendLayer.Title = title;
            legendLayer.Location = AdornmentLocation.LowerLeft;

            return legendLayer;
        }

        /// <summary>
        /// Build graticule adornment layer.
        /// </summary>
        /// <returns>Return graticule adornment layer.</returns>
        private GraticuleFeatureLayer BuildGraticuleAdornmentLayer()
        {
            Proj4Projection proj4 = new Proj4Projection();
            proj4.InternalProjectionParametersString = Proj4Projection.GetEpsgParametersString(4326);
            proj4.ExternalProjectionParametersString = Proj4Projection.GetGoogleMapParametersString();
            proj4.Open();

            GraticuleFeatureLayer graticuleAdornmentLayer = new GraticuleFeatureLayer();
            graticuleAdornmentLayer.Projection = proj4;
            LineStyle graticuleLineStyle = new LineStyle(new GeoPen(GeoColor.FromArgb(150, GeoColor.StandardColors.Navy), 1));
            graticuleAdornmentLayer.GraticuleLineStyle = graticuleLineStyle;
            graticuleAdornmentLayer.GraticuleTextFont = new GeoFont("Times", 12, DrawingFontStyles.Bold);
            return graticuleAdornmentLayer;
        }

        /// <summary>
        /// Build logo adornment layer.
        /// </summary>
        /// <returns>Return logo adornment layer.</returns>
        private LogoAdornmentLayer BuildLogoAdornmentLayer()
        {
            LogoAdornmentLayer logoAdornmentLayer = new LogoAdornmentLayer();
            string path = string.Format(@"{0}\Images\ThinkGeoLogo.png", baseDirectory);
            logoAdornmentLayer.Location = AdornmentLocation.UpperRight;
            logoAdornmentLayer.Image = new GeoImage(path);

            return logoAdornmentLayer;
        }

        /// <summary>
        /// Build magnetic declination adornmentLayer.
        /// </summary>
        /// <returns>Return magnetic declination adornmentLayer.</returns>
        private MagneticDeclinationAdornmentLayer BuildMagneticDeclinationAdornmentLayer()
        {
            Proj4Projection wgs84ToGoogleProjection = new Proj4Projection();
            wgs84ToGoogleProjection.InternalProjectionParametersString = Proj4Projection.GetGoogleMapParametersString(); //900913
            wgs84ToGoogleProjection.ExternalProjectionParametersString = Proj4Projection.GetWgs84ParametersString(); //4326
            wgs84ToGoogleProjection.Open();

            //Configure magnetic declination adornmentLayer.
            MagneticDeclinationAdornmentLayer magneticDeclinationAdornmentLayer = new MagneticDeclinationAdornmentLayer();
            magneticDeclinationAdornmentLayer.ProjectionToDecimalDegrees = wgs84ToGoogleProjection;
            magneticDeclinationAdornmentLayer.Location = AdornmentLocation.UpperRight;
            magneticDeclinationAdornmentLayer.TrueNorthPointStyle.SymbolSize = 25;
            magneticDeclinationAdornmentLayer.TrueNorthPointStyle.SymbolType = PointSymbolType.Triangle;
            magneticDeclinationAdornmentLayer.TrueNorthLineStyle.InnerPen.Width = 2f;
            magneticDeclinationAdornmentLayer.TrueNorthLineStyle.OuterPen.Width = 5f;
            magneticDeclinationAdornmentLayer.MagneticNorthLineStyle.InnerPen.Width = 2f;
            magneticDeclinationAdornmentLayer.MagneticNorthLineStyle.OuterPen.Width = 5f;

            return magneticDeclinationAdornmentLayer;
        }
    }
}
