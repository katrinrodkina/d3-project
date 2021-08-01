import React, { useEffect } from 'react';
import styles from '../../styles/GraphFrame.module.css';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import Legend from './legend';

const GraphFrame = (props) => {
  const { id, setSelectedGraph, selected, handleDelete, type, fileName } = props;

  useEffect(() => {
    if (selected) {
      handleClick();
    }
  }, [selected]);

  const handleClick = () => {
    document.querySelector(`.${styles.highlight}`)?.classList.remove(styles.highlight);
    document.querySelector(`#frame-${id}`).classList.add(styles.highlight);
    setSelectedGraph(id);
  };

  const handleDownload = (data) => {
    const { id } = data;
    generatePNGAndDownload(
      document.getElementById(`frame-${id}`),
      () => {
        document.getElementById(`frame-${id}`).style.border = "5px solid white";
        Array.from(document.getElementsByClassName("GraphFrame_deleteGraph__3ldRg")).forEach(e => e.style.display = "none");
        document.getElementById(`${type}Chart-${id}`).setAttribute("height", "450px");
        document.getElementById(`${type}Chart-${id}`).setAttribute("width", "450px");

      },
      () => {
        document.getElementById(`frame-${id}`).style.border = '';
        Array.from(document.getElementsByClassName('GraphFrame_deleteGraph__3ldRg')).forEach(
          (e) => (e.style.display = '')
        );
        document.getElementById(`${type}Chart-${id}`).removeAttribute('height');
        document.getElementById(`${type}Chart-${id}`).removeAttribute('width');
        confirmAlert({
          title: 'Chart Downloaded!',
          buttons: [
            {
              label: 'OK',
            },
          ],
        });
      }
    );
  };
  return (
    <div className={styles.graphFrame} id={`frame-${id}`} onClick={handleClick}>
      <div className={styles.frameHeader}>
        <Legend id={id} />
        <h2 className={styles.title}>{fileName || 'Chart Title'}</h2>
        <button
          title="download"
          className={styles.deleteGraph}
          onClick={() => handleDownload({ id })}
        >
          ↓
        </button>
        <button
          className={styles.deleteGraph}
          onClick={(e) => {
            e.stopPropagation();
            handleDelete({ id });
          }}
        >
          X
        </button>
      </div>
      <div className={styles.wrapper}>{props.children}</div>
      <div className={styles.descriptionDiv}>
        <p className={styles.description} id={`narrative-${id}`}>
          Description: This is a graph using mock data. Upload your own and start playing around!
        </p>
        <p className={styles.description} id={`narrative-second-${id}`}></p>
      </div>
    </div>
  );
};

export default GraphFrame;
