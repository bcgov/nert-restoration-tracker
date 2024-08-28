import Typography from '@mui/material/Typography';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

export interface IProjectObjectivesProps {
  projectForViewData: IGetProjectForViewResponse;
  refresh: () => void;
}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const Objectives: React.FC<IProjectObjectivesProps> = (props) => {
  const {
    projectForViewData: { project }
  } = props;

  return (
    <>
      <Typography style={{ whiteSpace: 'pre-line' }} variant="body2">
        {project.brief_desc}
      </Typography>
    </>
  );
};

export default Objectives;
