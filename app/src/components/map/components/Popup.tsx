import React from 'react';
import { getStateLabelFromCode, getStatusStyle } from 'components/workflow/StateMachine';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { S3FileType } from 'constants/attachments';
import { create } from 'domain';
import { text } from 'stream/consumers';
import { get } from 'http';
import { borderRadius, margin } from '@mui/system';

const MapPopup = (props: any) => {
  const id = props.id;
  const name = props.name;
  const isProject = props.is_project;
  const numberSites = props.number_sites;
  const sizeHa = props.size_ha;
  const stateCode = props.state_code;

  const originalChipStyle = getStatusStyle(stateCode) || {};

  const style = {
    popup: {
      textAlign: 'center' as React.CSSProperties['textAlign']
    },
    description: {
      textAlign: 'left' as React.CSSProperties['textAlign'],
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridColumnGap: '1rem'
    },
    value: {
      fontWeight: 'bold' as React.CSSProperties['fontWeight']
    },
    status: {
      ...originalChipStyle,
      display: 'inline-block',
      padding: '0 0.5rem 0 0.5rem',
      borderRadius: '5px'
    },
    button: {
      marginTop: '1rem',
      fontSize: '1.2em',
      fontWeight: 'bold',
      background: '#003366',
      cursor: 'pointer',
      borderRadius: '5px',
      color: 'white',
      padding: '7px 20px',
      border: 'none',
      textAlign: 'center',
      textDecoration: 'none',
      display: 'inline-block',
      fontFamily: 'Arial, sans-serif'
    } as React.CSSProperties
  };
  return (
    <div style={style.popup}>
      <div style={style.description}>
        <div>{isProject ? 'Project' : 'Plan'} Name:</div>
        <div style={style.value}>{name}</div>
        <div>{isProject ? 'Project' : 'Plan'} Size (Ha):</div>
        <div style={style.value}>{sizeHa}</div>

        <div>{isProject ? 'Project' : 'Plan'} Status:</div>
        <div>
          <div style={style.status}>{getStateLabelFromCode(stateCode)}</div>
        </div>

        <div>Number of Sites:</div>
        <div style={style.value}>{numberSites}</div>
      </div>
      <div>
        <a href={`/${isProject ? 'projects' : 'plans'}/${id}`}>
          <button style={style.button}>View {isProject ? 'Project' : 'Plan'} Details</button>
        </a>
      </div>
    </div>
  );
};

export default MapPopup;
