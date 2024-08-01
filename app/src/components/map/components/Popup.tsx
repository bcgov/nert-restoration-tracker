import React from 'react';
import { getStateLabelFromCode, getStatusStyle } from 'components/workflow/StateMachine';

export interface MapPopupProps {
  id: string;
  name: string;
  is_project: boolean;
  number_sites: number;
  size_ha: number;
  state_code: string;
  thumbnail?: string;
  mask?: boolean;
}

const MapPopup = (props: any) => {
  const id = props.id;
  const name = props.name;
  const isProject = props.is_project;
  const numberSites = props.number_sites;
  const sizeHa = props.size_ha;
  const stateCode = props.state_code;
  const thumbnail = props.thumbnail;
  const mask = props.mask || false;

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
    thumbnail: {
      position: 'relative' as React.CSSProperties['position'],
      img: {
        maxWidth: '360px',
        maxHeight: '300px',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: '100%',
        objectFit: 'cover' as React.CSSProperties['objectFit'],
        borderRadius: '10px'
      }
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
      {thumbnail && (
        <div style={style.thumbnail}>
          <img src={thumbnail} alt="thumbnail" style={style.thumbnail.img} />
        </div>
      )}
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
