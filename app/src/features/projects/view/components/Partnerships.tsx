import Typography from '@mui/material/Typography';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
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
      partnership: { partnerships }
    }
  } = props;

  const hasPartnerships = partnerships && partnerships.length > 0;

  return (
    <>
      {hasPartnerships &&
        partnerships?.map((data: { partnership: string }, index: number) => {
          return (
            <Typography
              key={index}
              variant="body2"
              color="textSecondary"
              data-testid="partnerships_data">
              {data.partnership}
            </Typography>
          );
        })}

      {!hasPartnerships && (
        <Typography variant="body2" color="textSecondary" data-testid="no_partnerships_data">
          No Partnerships
        </Typography>
      )}
    </>
  );
};

export default Partnerships;
