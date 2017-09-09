import { ToolMode } from 'app/model/paper';
import { Point } from 'app/scripts/common';

import * as actions from './actions';

// TODO: fill/stroke color will need to be associated with the currently selected items as well
export interface State {
  readonly toolMode: ToolMode;
  readonly fillColor: string;
  readonly strokeColor: string;
  readonly selectionBox: Readonly<{ from: Point; to: Point }>;
  readonly shapePreview: string;
}

export function buildInitialState(): State {
  return {
    toolMode: ToolMode.Selection,
    // TODO: figure out if these are appropriate initial values
    fillColor: '#000000',
    strokeColor: '#000000',
    selectionBox: undefined,
    shapePreview: undefined,
  };
}

export function reducer(state = buildInitialState(), action: actions.Actions) {
  switch (action.type) {
    case actions.SET_TOOL_MODE:
      return { ...state, toolMode: action.payload.toolMode };
    case actions.SET_FILL_COLOR:
      return { ...state, fillColor: action.payload.fillColor };
    case actions.SET_STROKE_COLOR:
      return { ...state, strokeColor: action.payload.strokeColor };
    case actions.SET_SELECTION_BOX:
      return { ...state, selectionBox: action.payload.selectionBox };
    case actions.SET_SHAPE_PREVIEW:
      return { ...state, shapePreview: action.payload.pathData };
  }
  return state;
}
