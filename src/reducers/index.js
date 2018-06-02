import { combineReducers } from 'redux';
import VegaReducer from './reducer_vega';

const rootReducer = combineReducers({
  vegaLayer: VegaReducer
})

export default rootReducer;