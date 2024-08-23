import { CircularProgress } from '@mui/material';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';
import { useCodesContext } from 'hooks/useContext';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { handleGetPartnershipRefName, handleGetPartnershipTypeName } from 'utils/Utils';

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

  const codes = useCodesContext().codesDataLoader.data;

  const hasPartnerships = partnerships && partnerships.length > 0;

  if (!hasPartnerships) {
    return (
      <Typography variant="body2" color="textSecondary" data-testid="no_partnerships_data">
        No Partnerships
      </Typography>
    );
  }

  if (!codes) {
    return <CircularProgress />;
  }

  return (
    <Box py={2}>
      {partnerships?.map((data, index: number) => {
        return (
          <Typography
            key={index}
            variant="body2"
            color="textSecondary"
            data-testid="partnerships_data"
            sx={{
              display: 'inline-block',
              '&::first-letter': {
                textTransform: 'capitalize'
              }
            }}>
            <strong>{handleGetPartnershipTypeName(data.partnership_type, codes)}</strong>
            {'|'}
            <em>
              {handleGetPartnershipRefName(data.partnership_type, data.partnership_ref, codes)}
            </em>
            {data.partnership_name ? `|${data.partnership_name}` : ''}
          </Typography>
        );
      })}
    </Box>
  );
};

export default Partnerships;
