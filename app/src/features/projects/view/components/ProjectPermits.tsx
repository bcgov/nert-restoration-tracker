import Typography from '@mui/material/Typography';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

const useStyles = makeStyles(() =>
  createStyles({
    projectPermitList: {
      margin: 0,
      padding: 0
    }
  })
);

export interface IProjectPermitsProps {
  projectForViewData: IGetProjectForViewResponse;
  refresh: () => void;
}

/**
 * Permits content for a project.
 *
 * @return {*}
 */
const ProjectPermits: React.FC<IProjectPermitsProps> = (props) => {
  const classes = useStyles();

  const {
    projectForViewData: { permit }
  } = props;

  const hasPermits = permit.permits && permit.permits.length > 0;

  return (
    <ul className={classes.projectPermitList}>
      {hasPermits &&
        permit.permits.map((item: any) => (
          <li key={item.permit_number} data-testid="permit_item">
            <Typography component="span" variant="body2">
              {item.permit_number} - <span>{item.permit_type}</span>
            </Typography>
          </li>
        ))}

      {!hasPermits && (
        <li>
          <Typography variant="body2" data-testid="no_permits_loaded">
            No permits
          </Typography>
        </li>
      )}
    </ul>
  );
};

export default ProjectPermits;
