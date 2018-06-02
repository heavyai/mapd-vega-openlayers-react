
export const UPDATE_VEGA_LAYER = 'UPDATE_VEGA_LAYER'
import {getConnection, getConnectionStatus, renderVega, saveConnectionObj} from "../mapd-connector"
import { conv4326To900913 } from '../utils'
import {serverInfo} from "../config";
import makeVegaSpec from "../vegaspec"

// extent = [minx, miny, maxx, maxy]
export function updateVegaLayer(size, extent) {

  const height = size ? size[1] : 692
  const width = size ? size[0] : 1383
  // const [xMin, yMin] = conv4326To900913([-128.99999999999966, 34.5774456877967])
  // const [xMax, yMax] = conv4326To900913([-66.00000000000017, 44.704220218170434])

  const vegaSpec = makeVegaSpec({
    width,
    height,
    minXBounds: extent ? extent[0] : -27062376.990310084,
    maxXBounds: extent ? extent[2] : 27062376.990310084,
    minYBounds: extent ? extent[1] : -13540972.434775544,
    maxYBounds: extent ? extent[3] : 13540972.434775544

  })

  return (dispatch) => {

    renderVega(vegaSpec)
      .then(result => {
        dispatch({
          type: "UPDATE_VEGA_LAYER",
          payload: result
        })
      })
      .catch(error => {
        console.log('error: ', error)
      })

  }
}

// connect to the mapd backend and add vega layer with initial map size and extent
export function establishConnection() {

  return ()  => {
    getConnection(serverInfo)
        .then(con => {
          // save the connection object so we can use it later
          saveConnectionObj(con)
          // check the connection status
          return getConnectionStatus(con)
        })
        .then(status => {
          if (status && status[0] && status[0].rendering_enabled) {
            console.log('connected with vega connector', status)
            // render the vega and add it to the map
            // updateVega(map.getSize(), map.getView().calculateExtent(map.getSize()))
          } else {
            // no BE rendering :(
            throw Error("backend rendering is not enabled")
          }
        })
        .catch(error => throw error)
  }

}

