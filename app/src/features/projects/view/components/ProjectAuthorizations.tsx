import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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
    projectForViewData: { authorization }
  } = props;

  const hasAuthorizations = authorization.authorizations && authorization.authorizations.length > 0;

  return (
    <>
      {hasAuthorizations &&
        authorization.authorizations.map(
          (item: { authorization_ref: string; authorization_type: string }) => (
            <Box key={item.authorization_ref} data-testid="authorization_item">
              <Typography variant="body2" component="dt" color="textSecondary">
                {item.authorization_ref}
              </Typography>
              <Typography variant="body2" component="dd">
                {item.authorization_type}
              </Typography>
            </Box>
          )
        )}

      {!hasAuthorizations && (
        <Typography variant="body2" data-testid="no_authorization_loaded">
          No Authorizations
        </Typography>
      )}
    </>
  );
};

export default ProjectAuthorizations;
