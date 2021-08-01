import React, { useEffect } from 'react';
import * as d3 from 'd3';
import { drawThresholdLine, drawSingleThreshold, drawThreshold } from '../utility/svg/threshold';

const Threshold = ({ data, x, y, graphID, id, config }) => {
  useEffect(() => {
    drawThreshold(d3.select(`#threshold-${id}`), data, x.scale, id, config);

    return () => {
      if (document.querySelector(`#narrative-${id}`))
        document.querySelector(`#narrative-${id}`).innerHTML = '';
      if (document.querySelector(`#narrative-second-${id}`))
        document.querySelector(`#narrative-second-${id}`).innerHTML = '';
      d3.select(`#threshold-${id}`).selectAll('*').remove();
    };
  }, [config]);

  return (
    <>
      <g id={`threshold-${id}`}></g>
    </>
  );
};

export default Threshold;
