import React from 'react';
import * as d3 from 'd3';
import { SVG } from '../constants';

import Threshold from '../../components/threshold';

export const renderThreshold = (x_scale, y_scale, id, data, config) => {
  return (
    <Threshold
      key={`threshold-${id}`}
      data={data}
      graphID={id}
      id={id}
      x={x_scale}
      y={y_scale}
      config={config}
    />
  );
};

export const drawThreshold = (parent, data, x, id, config) => {
  drawSingleThreshold(parent, data, x, undefined, id, config, false);
  if (config.threshold.secondNarrative) {
    drawSingleThreshold(parent, data, x, undefined, id, config, true);
  }
};

export const drawSingleThreshold = (parent, data, x, y, id, config, ifSecond) => {
  let narrative = config.threshold.narrative;
  if (ifSecond) narrative = config.threshold.secondNarrative;
  let narrativeSpan = document.querySelector(`#narrative-${id}`);
  if (ifSecond) narrativeSpan = document.querySelector(`#narrative-second-${id}`);

  let populatedNarrative = ``;

  for (let i = 0; i < narrative.length; i++) {
    if (narrative[i] == '[') {
      if (narrative.slice(i, i + 3) == '[X]') {
        populatedNarrative += narrative.slice(0, i) + '${this.' + config.dataPlots[0].xVal + '}';
      } else if (narrative.slice(i, i + 3) == '[H]') {
        populatedNarrative += narrative.slice(0, i) + '${this.HIGHER}';
      } else if (narrative.slice(i, i + 3) == '[L]') {
        populatedNarrative += narrative.slice(0, i) + '${this.LOWER}';
      } else continue;
      narrative = narrative.slice(i + 3);
      i = -1;
    }
  }
  if (narrative.length) populatedNarrative += narrative;

  narrativeSpan.innerHTML = 'Drag line to choose threshold.';

  const line = parent
    .append('line')
    .attr('class', 'movable')
    .attr('x1', ifSecond ? SVG.WIDTH - 10 : SVG.MARGIN.left)
    .attr('y1', SVG.MARGIN.top - 5)
    .attr('x2', ifSecond ? SVG.WIDTH - 10 : SVG.MARGIN.left)
    .attr('y2', SVG.MARGIN.top + SVG.HEIGHT + 10)
    .attr('stroke-width', 7)
    .attr('stroke', 'black')
    .call(
      d3
        .drag()
        .on('drag', function (event) {
          d3.select(this).attr('x1', event.x).attr('x2', event.x);
        })
        .on('end', function (event) {
          const templateVars = {
            [config.dataPlots[0].xVal]: calculateCurrentPosition(x, event, config.xFormat),
            HIGHER: calculateHigherThan(data, config.dataPlots[0].xVal, event, x, config.xFormat),
            LOWER: calculateLowerThan(data, config.dataPlots[0].xVal, event, x, config.xFormat),
          };
          let label = '';
          if (config.threshold.secondNarrative) {
            label = ifSecond ? 'Higher: ' : 'Lower: ';
          }

          if (event.x > SVG.WIDTH - 10) {
            d3.select(this)
              .attr('x1', SVG.WIDTH - 10)
              .attr('x2', SVG.WIDTH - 10);
          } else if (event.x < SVG.MARGIN.left) {
            d3.select(this).attr('x1', SVG.MARGIN.left).attr('x2', SVG.MARGIN.left);
          }

          const dynamicContent = fillTemplate(populatedNarrative, templateVars);
          narrativeSpan.innerHTML = label + dynamicContent;
        })
    );
};

const calculateCurrentPosition = (x, event, format) => {
  const curr = x.invert(event.x);
  if (typeof curr == 'number') {
    if (format == 'percent') return `${(curr * 100).toFixed(2)}%`;
    return curr.toFixed(2);
  }

  return curr;
};

const calculateHigherThan = (data, key, event, x, format) => {
  let dataPoints = 0;

  for (let i = data.length - 1; i >= 0; i--) {
    const curr = data[i][key];
    if (format == 'time' && x(new Date(curr)) >= event.x) dataPoints++;
    else if (x(curr) >= event.x) dataPoints++;
  }

  return dataPoints;
};

const calculateLowerThan = (data, key, event, x, format) => {
  let dataPoints = 0;

  for (let i = 0; i < data.length; i++) {
    const curr = data[i][key];
    if (format == 'time' && x(new Date(curr)) <= event.x) dataPoints++;
    else if (x(curr) <= event.x) dataPoints++;
  }

  return dataPoints;
};

const fillTemplate = function (populatedNarrative, templateVars) {
  return new Function('return `' + populatedNarrative + '`;').call(templateVars);
};

///// Older functions => for posterity and stock graph if needed

export const calculateThresholdStats = (trueHitsPos, falseHitsPos, event, ifHighThreshold, id) => {
  const selector = ifHighThreshold ? 'HighThreshold' : 'LowThreshold';

  const trueHitsNum = trueHitsPos.length;
  let trueHitsAbove = 0;

  for (let i = trueHitsPos.length - 1; i >= 0; i--) {
    const curr = trueHitsPos[i];
    if (curr.x > event.x) trueHitsAbove++;
    else break;
  }

  document.querySelector(`#trueAbove${selector}-${id}`).innerText = (
    (trueHitsAbove * 100) /
    trueHitsNum
  ).toFixed(2);

  const falseHitsNum = falseHitsPos.length;
  let falseHitsAbove = 0;

  for (let i = 0; i < falseHitsPos.length; i++) {
    const curr = falseHitsPos[i];
    if (curr.x < event.x) falseHitsAbove++;
    else break;
  }

  document.querySelector(`#falseBelow${selector}-${id}`).innerText = (
    (falseHitsAbove * 100) /
    falseHitsNum
  ).toFixed(2);
};

export const filterHits = (data, key, filterVal) => {
  return data.filter((row) => row[key] == filterVal);
};

export const drawThresholdLine = (parent, data, x, y, id) => {
  const trueHitsPos = data
    .filter((el) => el.LABEL == 0)
    .map((el) => {
      return { x: x(el.PROBA) };
    });

  const falseHitsPos = data
    .filter((el) => el.LABEL == 1)
    .map((el) => {
      return { x: x(el.PROBA) };
    });

  const line = parent
    .append('line')
    .attr('class', 'movable')
    .attr('x1', SVG.MARGIN.left)
    .attr('y1', SVG.MARGIN.top - 5)
    .attr('x2', SVG.MARGIN.left)
    .attr('y2', SVG.MARGIN.top + SVG.HEIGHT + 10)
    .attr('stroke-width', 7)
    .attr('stroke', 'black')
    .call(
      d3
        .drag()
        .on('drag', function (event) {
          d3.select(this).attr('x1', event.x).attr('x2', event.x);
        })
        .on('end', function (event) {
          if (event.x > SVG.WIDTH - 5) {
            d3.select(this)
              .attr('x1', SVG.WIDTH - 5)
              .attr('x2', SVG.WIDTH - 5);
            document.querySelector(`#trueAboveLowThreshold-${id}`).innerText = '0.00';
            document.querySelector(`#falseBelowLowThreshold-${id}`).innerText = '100.00';
          } else if (event.x < SVG.MARGIN.left) {
            d3.select(this).attr('x1', SVG.MARGIN.left).attr('x2', SVG.MARGIN.left);
            document.querySelector(`#trueAboveLowThreshold-${id}`).innerText = '100.00';
            document.querySelector(`#falseBelowLowThreshold-${id}`).innerText = '0.00';
          } else calculateThresholdStats(trueHitsPos, falseHitsPos, event, false, id);
        })
    );

  const secondLine = parent
    .append('line')
    .attr('class', 'movable')
    .attr('x1', SVG.WIDTH - 10)
    .attr('y1', SVG.MARGIN.top - 5)
    .attr('x2', SVG.WIDTH - 10)
    .attr('y2', SVG.MARGIN.top + SVG.HEIGHT + 10)
    .attr('stroke-width', 7)
    .attr('stroke', 'black')
    .call(
      d3
        .drag()
        .on('drag', function (event) {
          d3.select(this).attr('x1', event.x).attr('x2', event.x);
        })
        .on('end', function (event) {
          if (event.x > SVG.WIDTH - 5) {
            d3.select(this)
              .attr('x1', SVG.WIDTH - 5)
              .attr('x2', SVG.WIDTH - 5);
            document.querySelector(`#trueAboveHighThreshold-${id}`).innerText = '0.00';
            document.querySelector(`#falseBelowHighThreshold-${id}`).innerText = '100.00';
          } else if (event.x < SVG.MARGIN.left) {
            d3.select(this).attr('x1', SVG.MARGIN.left).attr('x2', SVG.MARGIN.left);
            document.querySelector(`#trueAboveHighThreshold-${id}`).innerText = '100.00';
            document.querySelector(`#falseBelowHighThreshold-${id}`).innerText = '0.00';
          } else calculateThresholdStats(trueHitsPos, falseHitsPos, event, true, id);
        })
    );

  document.querySelector(`#narrative-${id}`).innerHTML = `
  Your high threshold requires no checks on the <span id='trueAboveHighThreshold-${id}'>0.00</span>% most likely true hits (blue)
  and is accurately finding or checking <span id='falseBelowHighThreshold-${id}'>100.00</span>% of the false positives (green) <br/>
  Your low threshold requires no checks on the <span id='falseBelowLowThreshold-${id}'>0.00</span>% most likely false positives (green)
  and is accurately finding or checking <span id='trueAboveLowThreshold-${id}'>100.00</span>% of the true hits (blue)`;
};
