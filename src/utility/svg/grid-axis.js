import React from 'react';
import * as d3 from 'd3';
import { SVG } from '../constants';

import { organizeDataPlots } from './helpers';
import { findDomainAndFormatter, createScale } from './scales';

import Axis from '../../components/axis';
import AxisLabel from '../../components/axis-label';
import Grid from '../../components/grid';

export const renderAxes = (x_scale, y_scale, id, data, config) => {
  return [
    <Axis key={`${id}-x`} scale={x_scale} id={`${id}-x`} ifX={true} data={data} config={config} />,
    <Axis key={`${id}-y`} scale={y_scale} id={`${id}-y`} ifX={false} data={data} config={config} />,
    ...renderAxisLabels(id, config),
  ];
};

export const renderAxisLabels = (id, config) => {
  return [
    <AxisLabel ifX={false} id={id} config={config} key={`${id}+${config.xLabel}-1`} />,
    <AxisLabel ifX={true} id={id} config={config} key={`${id}+${config.xLabel}-2`} />,
  ];
};

export const renderGrid = (x_scale, id, data, config) => {
  return <Grid key={`grid-${id}`} x_scale={x_scale} id={id} data={data} config={config} />;
};

export const addGridToChart = (
  parent,
  x,
  y,
  type,
  data,
  dataPlots,
  height = SVG.HEIGHT,
  width = SVG.WIDTH,
  margin = SVG.MARGIN
) => {
  let xData;
  const { xVals } = organizeDataPlots(dataPlots);
  if (type == 'band') {
    xData = findDomainAndFormatter(type, data, xVals).domain;
    if (xData.length > 20) {
      const length = xData.length;
      xData = xData.filter((el, i) => {
        return !(i % Math.floor(length / 20));
      });
    }
  } else if (x.ticks) {
    xData = x.ticks();
  } else xData = [];

  let yData = [];
  if (y.ticks) yData = y.ticks();

  return parent
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('stroke', 'currentColor')
    .attr('stroke-opacity', 0.1)
    .call((g) =>
      g
        .append('g')
        .selectAll('line')
        .data(xData)
        .join('line')
        .attr('x1', (d) => x(d) - margin.left)
        .attr('x2', (d) => x(d) - margin.left)
        .attr('y1', 0)
        .attr('y2', height + 10)
    )
    .call((g) =>
      g
        .append('g')
        .selectAll('line')
        .data(yData)
        .join('line')
        .attr('y1', (d) => y(d) - margin.top)
        .attr('y2', (d) => y(d) - margin.top)
        .attr('x1', -10)
        .attr('x2', width)
    );
};
function wrap(text, width) {
  text.each(function () {
    var text = d3.select(this),
      words = text.text().split(/[ _]+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1,
      x = text.attr('x'),
      y = text.attr('y'),
      dy = 0,
      tspan = text
        .text(null)
        .append('tspan')
        .attr('x', x)
        .attr('y', y)
        .attr('dy', dy + 'em');

    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(' '));

      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(' '));
        line = [word];
        tspan = text
          .append('tspan')
          .attr('x', x)
          .attr('y', y)
          .attr('dy', ++lineNumber * lineHeight + dy + 'em')
          .text(word);
      }
    }
  });
}

export const drawXAxis = (
  parent,
  x,
  formatter,
  config,
  margin = SVG.MARGIN,
  height = SVG.HEIGHT
) => {
  let xAxis;

  if (config.xFormat == 'band') {
    xAxis = parent
      .call(
        d3.axisBottom(x).tickValues(
          x.domain().filter(function (_, i) {
            if (x.domain().length > 20) {
              return !(i % Math.floor(x.domain().length / 20));
            } else return true;
          })
        )
      )
      .attr('transform', `translate(0, ${height + margin.top + 10})`);
  } else {
    xAxis = parent
      .call(d3.axisBottom(x).tickFormat(formatter))
      .attr('transform', `translate(0, ${height + margin.top + 10})`);
  }

  const xAxisTicks = xAxis
    .selectAll('text')
    .style('text-anchor', 'end')
    .style('font-size', '1.5em')
    .style('fill', '#000');

  if (config.horizontal && config.type == 'bar') {
    xAxisTicks.attr('transform', 'translate(-10, -10)rotate(0)').style('font-size', '1.7em');

    xAxis
      .call(d3.axisLeft(x).tickFormat(formatter))
      .attr('transform', `translate(130, ${margin.top - 115})`)
      .selectAll('.tick text')
      .each(function () {
        d3.select(this).call(wrap, 150);
      });
  } else {
    xAxisTicks.attr('transform', 'translate(-5,10)rotate(-30)');
  }

  if (xAxisTicks.size() > 19) xAxisTicks.remove();
};

export const drawYAxis = (
  parent,
  y,
  formatter,
  config,
  margin = SVG.MARGIN,
  height = SVG.HEIGHT
) => {
  if (config.horizontal) {
    parent.selectAll('*').remove();
    const scale = createScale('linear', y.domain(), y.range().reverse());
    parent
      .call(d3.axisBottom(scale).tickFormat(formatter))
      .attr('transform', `translate(115, ${height + 120})`);
  } else {
    parent.selectAll('*').remove();
    parent
      .transition()
      .duration(350)
      .call(d3.axisLeft(y).tickFormat(formatter))
      .attr('transform', `translate(${margin.left - 10}, 0)`);
  }
};

export const addAxisLabelToChart = (
  parent,
  text = 'some label',
  ifXAxis,
  height = SVG.HEIGHT,
  width = SVG.WIDTH,
  margin = SVG.MARGIN
) => {
  const label = parent
    .append('text')
    .attr('class', 'yLabel')
    .style('font-size', '1.2em')
    .text(text[0].toUpperCase() + text.slice(1));

  if (ifXAxis) {
    label
      .attr('x', width / 2)
      .attr('y', height + margin.top + margin.bottom - 10)
      .style('text-anchor', 'start');
  } else {
    label
      .attr('transform', 'rotate(-90)')
      .attr('y', margin.left > 100 ? margin.left - 100 + 20 : 20)
      .attr('x', -(height / 2 + margin.top))
      .style('text-anchor', 'middle');
  }
};
