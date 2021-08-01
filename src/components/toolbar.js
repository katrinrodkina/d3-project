import React, { useRef, useState } from 'react';
import { connect } from 'react-redux';

import styles from '../../styles/Toolbar.module.css';
import Modal from './modal';
import Checkbox from './input/checkbox';
import Dropdown from './input/dropdown';
import FileUpload from './input/file-upload';

import {
  AVAILABLE_Y_FORMATS,
  AVAILABLE_X_FORMATS,
  AVAILABLE_Y_FORMATS_BAR,
  AVAILABLE_X_FORMATS_BAR,
  SCALE,
  AVAILABLE_GRAPHS,
  CURVE_TYPES,
  IS_CSV,
  LINE_COLORS,
  BAR_POINT_COLORS,
  GRAPH_TYPE,
  POINT_COLOR_OPTIONS,
} from '../utility/constants';

import {
  setGraphType,
  setGrid,
  setColorScheme,
  setSpecificColor,
  setXParameter,
  setXFormat,
  setYParameter,
  setYFormat,
  setCurveType,
  setXLabel,
  setYLabel,
  addGraph,
  setHorizontal,
  setBackfill,
  addDataPlot,
  removeDataPlot,
  setPointShape,
  setThreshold,
  setThresholdNarratives,
  setPadAngle,
  setIfDonut,
  setSelectedGraph,
  setHighestId,
  setData,
} from '../redux/actions/actions';
import { getCurrentConfig, getHighestId, getCurrentData } from '../redux/getters/getters';
import { handleCSVIinputFile, handleJSONIinputFile } from './input/input-utility';

const Toolbar = (props) => {
  const [flipTrueHits, setFlipTrueHits] = React.useState(false);
  const fileUploadInput = useRef(null);
  const {
    setGraphType,
    config,
    data,
    setLabelForY,
    setLabelForX,
    setColorScheme,
    setSpecificColor,
    setYParameter,
    setXParameter,
    setGrid,
    setYFormat,
    setXFormat,
    setCurveType,
    setHorizontal,
    setBackfill,
    setData,
    addDataPlot,
    removeDataPlot,
    addGraph,
    highestId,
    setHighestId,
    setSelectedGraph,
    setPointShape,
    setThreshold,
    setThresholdNarratives,
    setPadAngle,
    setIfDonut,
    entireState,
  } = props;
  React.useEffect(() => {
    fileUploadInput.current.value = null;
  }, [config]);

  const [modal, setModal] = useState(false);

  const [uploadModal, setUploadModal] = useState(false);
  const [uploadID, setUploadID] = useState('');

  const handleNewGraph = () => {
    const newID = highestId + 1;
    addGraph({ id: newID });
    setData({ id: newID });
    setHighestId(newID);
    setSelectedGraph(newID);
    document.querySelector('.highlight')?.classList.remove('highlight');
  };

  if (!config)
    return (
      <div className={styles.toolbarContainer} ref={fileUploadInput}>
        <button onClick={handleNewGraph} className={`${styles.addNewGraph}  ${styles.addBtn}`}>
          <div className={styles.plusSign}>+</div>
          <div className={styles.addNew}>Add New Graph</div>
        </button>
      </div>
    );

  const {
    id,
    grid,
    type,
    xLabel,
    yLabel,
    curveType,
    horizontal,
    backfill,
    ifDonut,
    padAngle,
    yFormat,
    yVal,
    xFormat,
    xVal,
    colorScheme,
    dataPlots,
    threshold,
  } = config;

  const handleCheckbox = (boolean, onChange, property) => {
    return onChange({ id, [property]: !boolean });
  };

  const handleSetLabelCheckbox = (coord) => {
    if (coord == SCALE.X) {
      return xLabel.display
        ? setLabelForX({ display: false, value: '' })
        : setLabelForX({ display: true, value: '' });
    } else {
      return yLabel.display
        ? setLabelForY({ display: false, value: '' })
        : setLabelForY({ display: true, value: '' });
    }
  };

  const handleSetLabelInput = (ev, coord) => {
    if (coord == SCALE.X) {
      return xLabel.display && setLabelForX({ display: true, value: ev.target.value });
    } else {
      return yLabel.display && setLabelForY({ display: true, value: ev.target.value });
    }
  };

  const handleCurveChange = (curve) => {
    return setCurveType({ id, curveType: curve });
  };

  function handleFileUpload(ev) {
    const reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(ev.target.files[0]);
  }

  function onReaderLoad(ev) {
    const inputFileType = fileUploadInput.current.value;
    const fileName = fileUploadInput.current.files[0].name.slice(0, -4);
    let uploadedData;
    if (IS_CSV.test(inputFileType)) {
      uploadedData = handleCSVIinputFile(ev.target.result);
    } else {
      uploadedData = handleJSONIinputFile(ev.target.result);
    }
    setData({ id, data: uploadedData, flipTrueHits, fileName });
  }

  return (
    <div className={styles.toolbarContainer}>
      <div className={`${styles.toolbarColumn} ${styles.buffer}`}>
        <FileUpload
          labelText={'Upload File'}
          ref={fileUploadInput}
          className={'file-input'}
          changeHandler={(ev) => handleFileUpload(ev)}
        />
        <Checkbox
          labelText={'Flip True Hits?'}
          checked={flipTrueHits}
          changeHandler={() => setFlipTrueHits(!flipTrueHits)}
        />
      </div>
      <div className={`${styles.toolbarColumn} ${styles.buffer}`}>
        <Dropdown
          labelText={'Type of Graph:'}
          changeHandler={(type) => setGraphType({ id, type })}
          options={AVAILABLE_GRAPHS}
          type={type}
          defaultValue={type}
        />
      </div>
      {type != GRAPH_TYPE.PIE && (
        <div className={`${styles.toolbarColumn} ${styles.buffer}`}>
          <Dropdown
            labelText={'X Scale: '}
            changeHandler={(format) => setXFormat({ id, xFormat: format })}
            options={type == GRAPH_TYPE.BAR ? AVAILABLE_X_FORMATS_BAR : AVAILABLE_X_FORMATS}
            type={type}
            defaultValue={xFormat}
          />
          <Dropdown
            labelText={'Y Scale: '}
            changeHandler={(format) => setYFormat({ id, yFormat: format })}
            options={type == GRAPH_TYPE.BAR ? AVAILABLE_Y_FORMATS_BAR : AVAILABLE_Y_FORMATS}
            type={type}
            defaultValue={yFormat}
          />
        </div>
      )}
      {type != GRAPH_TYPE.PIE ? (
        dataPlots.map((dataPlot, i, arr) => {
          return (
            <div key={`plot-${i}`} className={`${styles.toolbarColumnExtra}`}>
              <div>
                <Dropdown
                  labelText={i == 0 ? 'X Parameter:' : `${i + 1} X: `}
                  changeHandler={(val) => setXParameter({ id, dataPlotID: i, xVal: val })}
                  options={data}
                  type={type}
                  specialObject={true}
                  defaultValue={dataPlot.xVal}
                  key={`x-param-${i}`}
                />
                <Dropdown
                  labelText={i == 0 ? 'Y Parameter:' : `${i + 1} Y: `}
                  changeHandler={(val) => setYParameter({ id, dataPlotID: i, yVal: val })}
                  options={data}
                  type={type}
                  specialObject={true}
                  defaultValue={dataPlot.yVal}
                  key={`y-param-${i}`}
                />
              </div>
              <div>
                <div>
                  {arr.length > 1 && type != GRAPH_TYPE.BAR && (
                    <Dropdown
                      labelText={'Color:'}
                      changeHandler={(color) => setSpecificColor({ id, dataPlotID: i, color })}
                      options={POINT_COLOR_OPTIONS}
                      type={type}
                      default={colorScheme}
                      key={`color-${i}`}
                    />
                  )}
                  {arr.length > 1 && type == GRAPH_TYPE.POINT && (
                    <Dropdown
                      labelText={'Shape:'}
                      changeHandler={(shape) => setPointShape({ id, dataPlotID: i, shape })}
                      options={['circle', 'triangle', 'square', 'cross', 'diamond']}
                      type={type}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <Dropdown
          labelText={'Choose Property:'}
          changeHandler={(val) => setXParameter({ id, dataPlotID: 0, xVal: val })}
          options={data}
          type={type}
          specialObject={true}
          defaultValue={dataPlots[0].xVal}
          key={`x-prop-${id}`}
        />
      )}
      <div className={`${styles.toolbarColumn} ${styles.buffer}`}>
        {type != GRAPH_TYPE.PIE && type != GRAPH_TYPE.BAR && dataPlots.length < 3 && (
          <button
            className={`${styles.addPlot} ${styles.addBtn}`}
            onClick={() => {
              if (dataPlots.length < 3) addDataPlot({ id });
            }}
          >
            Add Plot
          </button>
        )}
        {type != GRAPH_TYPE.PIE && type != GRAPH_TYPE.BAR && dataPlots.length > 1 && (
          <button
            className={`${styles.removePlot} ${styles.addBtn}`}
            onClick={() => {
              removeDataPlot({ id });
            }}
          >
            Remove Plot
          </button>
        )}
        {modal && (
          <Modal
            setModal={setModal}
            setThresholdNarratives={setThresholdNarratives}
            id={id}
            setThreshold={setThreshold}
            narrative={config.threshold.narrative}
            secondNarrative={config.threshold.secondNarrative}
          />
        )}
        {(type == GRAPH_TYPE.POINT || type == GRAPH_TYPE.LINE) && (
          <button
            className={`${styles.removePlot} ${styles.addBtn}`}
            onClick={() => setModal(true)}
          >
            {config.threshold.display ? 'Edit' : 'Add'} Threshold
          </button>
        )}
        {type != GRAPH_TYPE.PIE && (
          <Checkbox
            labelText={'Grid'}
            checked={grid}
            changeHandler={() => handleCheckbox(grid, setGrid, 'grid')}
          />
        )}
        {type == GRAPH_TYPE.BAR && (
          <Checkbox
            labelText={'Horizontal'}
            checked={horizontal}
            changeHandler={() => handleCheckbox(horizontal, setHorizontal, 'horizontal')}
          />
        )}
        {type == GRAPH_TYPE.BAR && horizontal && (
          <Checkbox
            labelText={'Backfill'}
            checked={backfill}
            changeHandler={() => handleCheckbox(backfill, setBackfill, 'backfill')}
          />
        )}
        {type == GRAPH_TYPE.PIE && (
          <>
            <Checkbox
              labelText={'Donut Layout'}
              checked={ifDonut}
              changeHandler={() => handleCheckbox(ifDonut, setIfDonut, 'ifDonut')}
              key={`donut`}
            />
            <Checkbox
              labelText={'Pie Padding'}
              checked={padAngle}
              changeHandler={() => handleCheckbox(padAngle, setPadAngle, 'padAngle')}
              key={`padAngle`}
            />
          </>
        )}
      </div>
      <div className={`${styles.toolbarColumn} ${styles.buffer}`}>
        {(dataPlots.length < 2 || type == GRAPH_TYPE.BAR) && (
          <Dropdown
            labelText={'Color Scheme:'}
            options={type == GRAPH_TYPE.LINE ? LINE_COLORS : BAR_POINT_COLORS}
            changeHandler={(color) => setColorScheme({ id, colorScheme: color })}
            defaultValue={colorScheme}
          />
        )}
        {type === GRAPH_TYPE.LINE && (
          <Dropdown
            labelText={'Curve Type:'}
            changeHandler={handleCurveChange}
            options={CURVE_TYPES}
            defaultValue={curveType}
          />
        )}
      </div>
      <div className={`${styles.toolbarColumn} ${styles.buffer}`}>
        <button onClick={handleNewGraph} className={`${styles.addNewGraph}  ${styles.addBtn}`}>
          <div className={styles.plusSign}>+</div>
          <div className={styles.addNew}>Add New Graph</div>
        </button>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    config: getCurrentConfig(state.graph),
    highestId: getHighestId(state.graph),
    data: getCurrentData(state.graph),
    entireState: state,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setGrid: (id) => dispatch(setGrid(id)),
    setColorScheme: (scheme) => dispatch(setColorScheme(scheme)),
    setSpecificColor: (color) => dispatch(setSpecificColor(color)),
    setLabelForX: (label) => dispatch(setXLabel(label)),
    setLabelForY: (label) => dispatch(setYLabel(label)),
    setGraphType: (type) => dispatch(setGraphType(type)),
    setYParameter: (yVal) => dispatch(setYParameter(yVal)),
    setYFormat: (format) => dispatch(setYFormat(format)),
    setXParameter: (xVal) => dispatch(setXParameter(xVal)),
    setXFormat: (format) => dispatch(setXFormat(format)),
    setCurveType: (curveType) => dispatch(setCurveType(curveType)),
    setHorizontal: (id) => dispatch(setHorizontal(id)),
    setBackfill: (id) => dispatch(setBackfill(id)),
    setData: (data) => dispatch(setData(data)),
    addGraph: (id) => dispatch(addGraph(id)),
    addDataPlot: (id) => dispatch(addDataPlot(id)),
    removeDataPlot: (id) => dispatch(removeDataPlot(id)),
    setHighestId: (id) => dispatch(setHighestId(id)),
    setSelectedGraph: (id) => dispatch(setSelectedGraph(id)),
    setPointShape: (shape) => dispatch(setPointShape(shape)),
    setThreshold: (id) => dispatch(setThreshold(id)),
    setThresholdNarratives: (narrative) => dispatch(setThresholdNarratives(narrative)),
    setIfDonut: (id) => dispatch(setIfDonut(id)),
    setPadAngle: (id) => dispatch(setPadAngle(id)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
