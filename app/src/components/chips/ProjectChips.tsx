import Chip, { ChipProps } from '@mui/material/Chip';
import dayjs from 'dayjs';
import React from 'react';

const pageStyles = {
  chipActive: {
    color: 'white',
    fontWeight: 600,
    letterSpacing: '0.02rem',
    backgroundColor: '#A2B9E2'
  },
  chipPublishedCompleted: {
    color: 'white',
    fontWeight: 600,
    letterSpacing: '0.02rem',
    backgroundColor: '#70AD47'
  },
  chipUnpublished: {
    color: 'white',
    fontWeight: 600,
    backgroundColor: 'gray'
  },
  chipDraft: {
    color: 'white',
    fontWeight: 600,
    letterSpacing: '0.02rem',
    backgroundColor: '#A6A6A'
  },
  chipPriority: {
    color: 'white',
    fontWeight: 600,
    letterSpacing: '0.02rem',
    backgroundColor: 'orange'
  }
};

export const ProjectStatusChip: React.FC<{
  startDate: string;
  endDate?: string;
  chipProps?: Partial<ChipProps>;
}> = (props) => {
  let chipLabel;
  let chipStatusClass;

  if (!props.endDate || dayjs(props.endDate).endOf('day').isAfter(dayjs())) {
    chipLabel = 'Active';
    chipStatusClass = pageStyles.chipActive;
  } else {
    chipLabel = 'Completed';
    chipStatusClass = pageStyles.chipPublishedCompleted;
  }

  return <Chip size="small" sx={chipStatusClass} label={chipLabel} {...props.chipProps} />;
};

export const ProjectDraftChip: React.FC<{ chipProps?: Partial<ChipProps> }> = (props) => {
  return <Chip size="small" sx={pageStyles.chipDraft} label="Draft" {...props.chipProps} />;
};

export const ProjectPriorityChip: React.FC<{ chipProps?: Partial<ChipProps> }> = (props) => {
  return <Chip size="small" sx={pageStyles.chipPriority} label="Priority" {...props.chipProps} />;
};
