import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

export interface IProjectAuthorizationsProps {
  projectForViewData: IGetProjectForViewResponse;
  refresh: () => void;
}

/**
 * Authorizations content for a project.
 *
 * @return {*}
 */
const ProjectAuthorizations: React.FC<IProjectAuthorizationsProps> = (props) => {
  const {
    projectForViewData: { permit }
  } = props;

  const hasAuthorizations = permit.permits && permit.permits.length > 0;

  return (
    <>
      {hasAuthorizations &&
        permit.permits.map((item: any) => (
          <Box key={item.permit_number} data-testid="authorization_item">
            <Typography variant="body2" component="dt" color="textSecondary">
              {item.permit_number}
            </Typography>
            <Typography variant="body2" component="dd">
              {item.permit_type}
            </Typography>
          </Box>
        ))}

      {!hasAuthorizations && (
        <Typography variant="body2" data-testid="no_authorization_loaded">
          No Authorizations
        </Typography>
      )}
    </>
  );
};

export default ProjectAuthorizations;
