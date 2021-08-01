import React, { useState } from 'react';

const Modal = ({
  setModal,
  setThresholdNarratives,
  id,
  setThreshold,
  narrative,
  secondNarrative,
}) => {
  const [double, setDouble] = useState(secondNarrative);

  return (
    <>
      <div className="modal-background">
        <div className="modal">
          <div className="modal-header">
            <h2>Create Threshold Narrative</h2>
          </div>
          <div className="modal-radioBtn-container">
            <div>
              <input
                type="radio"
                name="numOfThreshold"
                value="single"
                checked={!double}
                onClick={() => setDouble(false)}
              />
              <span>Single Threshold Line</span>
            </div>
            <div>
              <input
                type="radio"
                name="numOfThreshold"
                value="double"
                checked={double}
                onClick={() => setDouble(true)}
              />
              <span>Double Threshold Lines</span>
            </div>
          </div>
          <div>In the text area below, create your narrative.</div>
          <ul aria-label="To insert dynamic variables use these bracketed letters:">
            <li>Current x-axis position: '[X]'</li>
            <li>Number of data points to the right of the line: '[H]'</li>
            <li>Number of data points to the left of the line: '[L]'</li>
          </ul>
          <div className="modal-textarea-container">
            {double ? (
              <>
                <label>Lower Threshold Narrative:</label>

                <textarea className="first" defaultValue={narrative} />

                <label>Higher Threshold Narrative:</label>

                <textarea className="second" defaultValue={secondNarrative} />
              </>
            ) : (
              <>
                <label>Threshold Narrative:</label>
                <br />
                <textarea className="first" defaultValue={narrative} />
              </>
            )}
          </div>
          <div className="modal-buttons-container">
            <button
              className="modal-submit"
              onClick={() => {
                const narrative = document.querySelector(`textarea.first`).value;
                let secondNarrative = '';
                if (document.querySelector(`textarea.second`)) {
                  secondNarrative = document.querySelector(`textarea.second`).value;
                }
                setThresholdNarratives({ id, narrative, secondNarrative });
                setThreshold({ id, display: true });
                setModal(false);
              }}
            >
              Add Threshold
            </button>
            <button
              className="modal-delete"
              onClick={() => {
                setThresholdNarratives({ id, narrative: '' });
                setThreshold({ id, display: false });
                setModal(false);
              }}
            >
              Remove Threshold
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
