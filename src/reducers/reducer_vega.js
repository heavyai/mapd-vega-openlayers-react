import UPDATE_VEGA_LAYER from '../actions/index'

export default function (state = null, action) {
  switch (action.type){
    case "UPDATE_VEGA_LAYER":
      return action.payload
  }
  return state

}