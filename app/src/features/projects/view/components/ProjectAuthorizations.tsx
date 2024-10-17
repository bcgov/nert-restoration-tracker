import Icon from '@mdi/react';
import { mdiAlphaPCircleOutline, mdiCheck } from '@mdi/js';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import * as utils from 'utils/pagedProjectPlanTableUtils';

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

  const authTooltip = (authDesc: string, authType: string) => {
    return (
      <Tooltip title={authDesc} placement="left">
        <Typography sx={utils.authStyles.authLabel} aria-label={`Authorization Type: ${authType}`}>
          {authType}
        </Typography>
      </Tooltip>
    );
  };

  return (
    <>
      {hasAuthorizations &&
        authorization.authorizations.map(
          (
            item: {
              authorization_ref: string;
              authorization_type: string;
              authorization_desc: string;
            },
            index
          ) => (
            <Box key={index} role="listitem" aria-label={`Authorization ${index + 1}`}>
              <Chip
                deleteIcon={
                  <>
                    <Tooltip
                      title={
                        item.authorization_ref ? 'Authorized: ' + item.authorization_ref : 'Pending'
                      }
                      placement="top">
                      <Icon
                        path={item.authorization_ref ? mdiCheck : mdiAlphaPCircleOutline}
                        color="lightgray"
                        size={0.8}
                      />
                    </Tooltip>
                  </>
                }
                onDelete={() => {}}
                data-testid="authorization_item"
                size="small"
                sx={
                  item.authorization_ref
                    ? utils.authStyles.authChip
                    : utils.authStyles.pendingAuthChip
                }
                label={authTooltip(item.authorization_desc, item.authorization_type)}
                aria-label={`Authorization ${index + 1}: ${item.authorization_type}`}
              />
            </Box>
          )
        )}

      {!hasAuthorizations && (
        <Typography
          variant="body2"
          data-testid="no_authorization_loaded"
          aria-label="No Authorizations">
          No Authorizations
        </Typography>
      )}
    </>
  );
};

export default ProjectAuthorizations;
