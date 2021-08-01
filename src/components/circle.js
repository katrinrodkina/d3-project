import React, { useEffect } from 'react';
import * as d3 from 'd3';

import { renderCircle } from '../utility/svg/point';
import { createToolTip, attachToolTip } from '../utility/svg/tooltip';

const Circle = ({ id, data, x, y, config, dataPlot, ifOwnColor, dataPlotID }) => {
  useEffect(() => {
    const points = renderCircle(
      d3.select(`g#circle-${id}-${dataPlotID}`),
      data,
      x,
      y,
      config,
      dataPlot,
      ifOwnColor
    );

    const tooltip = createToolTip(id);
    attachToolTip(points, tooltip, dataPlot.xVal, dataPlot.yVal);

    return () => {
      d3.select(`g#circle-${id}-${dataPlotID}`).selectAll('*').remove();
    };
  }, [data, config, x, y]);

  return <g id={`circle-${id}-${dataPlotID}`}></g>;
};

export default Circle;
