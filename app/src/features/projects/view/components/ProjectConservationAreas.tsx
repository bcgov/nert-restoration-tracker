import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import {
  IGetProjectForViewResponse,
  IGetProjectForViewResponseConservationAreas
} from 'interfaces/useProjectApi.interface';
import React from 'react';

const pageStyles = {
  conservationAreaChip: {
    marginBottom: '2px',
    justifyContent: 'left'
  },
  conservationAreaLabel: {
    color: '#545454',
    fontSize: '0.78rem',
    fontWeight: 500,
    textTransform: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};

export interface IProjectConservationAreasProps {
  projectViewData: IGetProjectForViewResponse;
}

const conservationAreaStyled = (conservationArea: string) => {
  return (
    <Typography sx={pageStyles.conservationAreaLabel} aria-label={`${conservationArea}`}>
      {conservationArea}
    </Typography>
  );
};

/**
 * Conservation Areas content for a project.
 *
 * @return {*}
 */
const ProjectConservationAreas: React.FC<IProjectConservationAreasProps> = (props) => {
  const {
    projectViewData: { location }
  } = props;

  const hasConservationAreas = location.conservationAreas && location.conservationAreas.length > 0;

  return (
    <>
      {hasConservationAreas &&
        location.conservationAreas.map(
          (item: IGetProjectForViewResponseConservationAreas, index) => (
            <Chip
              key={index}
              data-testid="conservationArea_item"
              size="small"
              sx={pageStyles.conservationAreaChip}
              label={conservationAreaStyled(item.conservationArea)}
            />
          )
        )}

      {!hasConservationAreas && (
        <Chip label="No Conservation Areas" data-testid="no_conservationArea_loaded" />
      )}
    </>
  );
};

export default ProjectConservationAreas;
