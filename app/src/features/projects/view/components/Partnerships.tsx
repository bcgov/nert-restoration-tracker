import Typography from '@mui/material/Typography';
import { IGetProjectForViewResponse } from 'interfaces/useProjectPlanApi.interface';
import React from 'react';

export interface IPartnershipsProps {
  projectForViewData: IGetProjectForViewResponse;
  refresh: () => void;
}

/**
 * Partnerships content for a project.
 *
 * @return {*}
 */
const Partnerships: React.FC<IPartnershipsProps> = (props) => {
  const {
    projectForViewData: {
      partnerships: { partnerships }
    }
  } = props;

  const hasPartnerships = partnerships && partnerships.length > 0;

  return (
    <>
      {hasPartnerships &&
        partnerships?.map((partnership: string, index: number) => {
          return (
            <Typography key={index} variant="body2" color="textSecondary" data-testid="iucn_data">
              {partnership}
            </Typography>
          );
        })}

      {!hasPartnerships && (
        <Typography variant="body2" color="textSecondary" data-testid="no_partnerships">
          No Partnerships
        </Typography>
      )}
    </>
  );
};

export default Partnerships;
