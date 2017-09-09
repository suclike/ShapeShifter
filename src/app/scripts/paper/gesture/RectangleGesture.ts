import { Layer, LayerUtil, PathLayer } from 'app/model/layers';
import { ToolMode } from 'app/model/paper';
import { Path } from 'app/model/paths';
import { Guides, Items, Selections, Transforms } from 'app/scripts/paper/util';
import { PaperService } from 'app/services';
import * as paper from 'paper';

import { Gesture } from './Gesture';

export class RectangleGesture extends Gesture {
  constructor(private readonly ps: PaperService, private readonly cornerRadius = 0) {
    super();
  }

  // @Override
  onMouseDrag(event: paper.ToolEvent) {
    const downPoint = Transforms.mousePointToLocalCoordinates(event.downPoint);
    const point = Transforms.mousePointToLocalCoordinates(event.point);

    const rect = new paper.Rectangle(downPoint, point);
    if (event.modifiers.shift) {
      rect.height = rect.width;
    }
    const path = new paper.Path.Rectangle(
      rect,
      new paper.Size(this.cornerRadius, this.cornerRadius),
    );
    path.applyMatrix = true;
    if (event.modifiers.alt) {
      const halfWidth = rect.width / 2;
      const halfHeight = rect.height / 2;
      path.transform(new paper.Matrix(1, 0, 0, 1, -halfWidth, -halfHeight));
    }
    this.ps.setShapePreview(path.pathData);
  }

  // @Override
  onMouseUp(event: paper.ToolEvent) {
    const shapePreview = this.ps.getShapePreview();
    if (shapePreview) {
      const path = new paper.Path(shapePreview);
      const vl = this.ps.getVectorLayer().clone();
      const pl = new PathLayer({
        name: LayerUtil.getUniqueLayerName([vl], 'path'),
        children: [] as Layer[],
        pathData: new Path(path.pathData),
        fillColor: '#000',
      });
      const children = [...vl.children, pl];
      vl.children = children;
      this.ps.setVectorLayer(vl);
      this.ps.setShapePreview(undefined);
      this.ps.setSelectedLayers(new Set([pl.id]));
    }
    this.ps.setToolMode(ToolMode.Selection);
  }
}
