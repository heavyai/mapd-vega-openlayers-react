import React, { Component, PropTypes } from 'react';
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import { updateVegaLayer } from "../actions/index";
import {debounce} from "../utils";
import proj4 from 'proj4';
const ol = require('openlayers')
const styles = require("./map.css");
const ol_map_styles = require('openlayers/css/ol.css')


// React component
class MapComponent extends Component {
  constructor(props) {
    super(props);

    this.map = null

    // Custom rectangle polygon filter
    this.source = new ol.source.Vector({wrapX: false});
    this.vector = null
    this.draw = null

    this.vegaSize = null
    this.vegaExtent = null
    this.mapProjection = null

    ol.proj.setProj4(proj4);

    proj4.defs('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 ' +
        '+x_0=400000 +y_0=-100000 +ellps=airy ' +
        '+towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 ' +
        '+units=m +no_defs');
    const proj27700 = ol.proj.get('EPSG:27700');
    proj27700.setExtent([0, 0, 700000, 1300000]);

    proj4.defs('EPSG:23032', '+proj=utm +zone=32 +ellps=intl ' +
        '+towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs');
    const proj23032 = ol.proj.get('EPSG:23032');
    proj23032.setExtent([-1206118.71, 4021309.92, 1295389.00, 8051813.28]);

    proj4.defs('EPSG:5479', '+proj=lcc +lat_1=-76.66666666666667 +lat_2=' +
        '-79.33333333333333 +lat_0=-78 +lon_0=163 +x_0=7000000 +y_0=5000000 ' +
        '+ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
    const proj5479 = ol.proj.get('EPSG:5479');
    proj5479.setExtent([6825737.53, 4189159.80, 9633741.96, 5782472.71]);

    proj4.defs('EPSG:21781', '+proj=somerc +lat_0=46.95240555555556 ' +
        '+lon_0=7.439583333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel ' +
        '+towgs84=674.4,15.1,405.3,0,0,0,0 +units=m +no_defs');
    const proj21781 = ol.proj.get('EPSG:21781');
    proj21781.setExtent([485071.54, 75346.36, 828515.78, 299941.84]);

    proj4.defs('EPSG:3413', '+proj=stere +lat_0=90 +lat_ts=70 +lon_0=-45 +k=1 ' +
        '+x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs');
    const proj3413 = ol.proj.get('EPSG:3413');
    proj3413.setExtent([-4194304, -4194304, 4194304, 4194304]);

    proj4.defs('EPSG:2163', '+proj=laea +lat_0=45 +lon_0=-100 +x_0=0 +y_0=0 ' +
        '+a=6370997 +b=6370997 +units=m +no_defs');
    const proj2163 = ol.proj.get('EPSG:2163');
    proj2163.setExtent([-8040784.5135, -2577524.9210, 3668901.4484, 4785105.1096]);

    proj4.defs('ESRI:54009', '+proj=moll +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 ' +
        '+units=m +no_defs');
    const proj54009 = ol.proj.get('ESRI:54009');
    proj54009.setExtent([-18e6, -9e6, 18e6, 9e6]);


    this.drawShape = this.drawShape.bind(this)
    this.clearDrawShapes = this.clearDrawShapes.bind(this)
    this.reproject = this.reproject.bind(this)
    this.update = this.update.bind(this)
  }

  componentDidMount() {

    this.map =  this.map = new ol.Map({
      target: 'map',
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        })
      ],
      view: new ol.View({
        projection : "EPSG:900913",
        center: [0, 0],
        zoom: 2
      })
    });

    this.vegaSize = this.map.getSize()
    this.vegaExtent = this.map.getView().calculateExtent(this.currentSize)
    this.mapProjection = this.map.getView().getProjection()

    this.props.updateVegaLayer(this.vegaSize, this.vegaExtent)


   this.map.on('moveend', debounce(this.update, 100));

    // this.map.on('moveend', () => {
    //   this.currentSize = this.map.getSize()
    //   this.currentExtent = this.map.getView().calculateExtent(this.currentSize)
    //   this.mapProjection = this.map.getView().getProjection()
    //   this.props.updateVegaLayer(this.currentSize, this.currentExtent)
    // })

  }

  // calls renderVega with new vega spec
  update() {
    // if(!vector){
    this.vegaSize = this.map.getSize()
    this.vegaExtent = this.map.getView().calculateExtent(this.vegaSize)
    this.props.updateVegaLayer(this.vegaSize, this.vegaExtent)
    // }
  }

  addVegaLayer(){
    const vegaSource = this.props.vegaLayer ? new URL(this.props.vegaLayer) : ''

    const vegaLayerSource = new ol.source.ImageStatic({
      url: vegaSource,
      projection: this.mapProjection,
      imageExtent: this.vegaExtent
    })

    this.map.getLayers().forEach(layer => {

      if(layer.get('name') !== 'VegaLayer'){
        const vega_layer = new ol.layer.Image({
          name: "VegaLayer",
          source: vegaLayerSource
        })

        this.map.addLayer(vega_layer)
      }
      else {
        layer.setSource(vegaLayerSource)
      }
    })
  }

  drawShape(){
    const geometryFunction = ol.interaction.Draw.createBox();
    this.draw = new ol.interaction.Draw({
      source: this.source,
      type: 'Circle',
      geometryFunction: geometryFunction
    })

    this.vector = new ol.layer.Vector({
      name: 'CustomFilter',
      source: this.source
    });

    this.map.addInteraction(this.draw)
    this.map.addLayer(this.vector)

    this.draw.on('drawend', (evt) => {

      const sketch = evt.feature

      // helper values to create vega spec
      const sketchExtent = sketch.getGeometry().getExtent()
      const topLeft = this.map.getPixelFromCoordinate(ol.extent.getTopLeft(sketchExtent))
      const bottomLeft = this.map.getPixelFromCoordinate(ol.extent.getBottomLeft(sketchExtent))
      const topRight = this.map.getPixelFromCoordinate(ol.extent.getTopRight(sketchExtent))
      const sketchWidth = topRight[0] - topLeft[0]
      const sketchHeight = bottomLeft[1] - topLeft[1]

      this.vegaSize = [Math.round(sketchWidth), Math.round(sketchHeight)]
      this.vegaExtent = sketchExtent

      // calls renderVega with custom shape size and extent
      if(sketchExtent[0] !== Infinity){
        this.props.updateVegaLayer(this.vegaSize, this.vegaExtent)
      }
    })
  }

// called when clicking on Clear Polygon button which removes polygon filter
  clearDrawShapes() {
    this.map.removeInteraction(this.draw)
    this.map.removeLayer(this.vector)
    this.vector = null
    this.vegaSize = this.map.getSize()
    this.vegaExtent = this.map.getView().calculateExtent(this.vegaSize)
    this.props.updateVegaLayer(this.vegaSize, this.vegaExtent)

  }


  reproject(event){
    const newProj = ol.proj.get(event.target.value);
    const newProjExtent = newProj.getExtent();
    const newView = new ol.View({
      projection: newProj,
      center: ol.extent.getCenter(newProjExtent || [0, 0, 0, 0]),
      zoom: 0,
      extent: newProjExtent || undefined
    });

    this.map.setView(newView);
  }


  componentWillUpdate(nextProps){
    this.addVegaLayer()
  }

  render() {
    return (
        <div>
          <button className={ styles.drawButton } onClick={ this.drawShape } >Draw Polygon</button>
          <button className={ styles.drawButton }  onClick={ this.clearDrawShapes }>Clear Polygon</button>
          <form className={ styles.projectionForm }>
            <select className={ styles.projection } onChange={this.reproject}>
              <option value="EPSG:900913">WGS84(EPSG:900913)</option>
              <option value="EPSG:4326">WGS 84 (EPSG:4326)</option>
              <option value="EPSG:3857">Spherical Mercator(EPSG:3857)</option>
              <option value="EPSG:27700">British National Grid (EPSG:27700)</option>
              <option value="EPSG:23032">ED50 / UTM zone 32N (EPSG:23032)</option>
              <option value="EPSG:2163">US National Atlas Equal Area (EPSG:2163)</option>
              <option value="EPSG:3413">NSIDC Polar Stereographic North(EPSG:3413)</option>
              <option value="EPSG:5479">RSRGD2000 / MSLC2000 (EPSG:5479)</option>
              <option value="ESRI:54009">Mollweide(ESRI:54009)</option>
            </select>
          </form>

          <div id="map" className={ ol_map_styles }></div>
        </div>

    );
  }
}

function mapStateToProps(state)  {
  return {
    vegaLayer: state.vegaLayer
  }
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateVegaLayer }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(MapComponent)