import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectPlanApi.interface';
import React from 'react';

const pageStyles = {
  partnerItem: {
    '&:last-child .seperator': {
      display: 'none'
    }
  }
};

export interface IPartnershipsProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
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
      partnerships: { indigenous_partnerships, stakeholder_partnerships }
    },
    codes
  } = props;

  const hasIndigenousPartnerships = indigenous_partnerships && indigenous_partnerships.length > 0;
  const hasStakeholderPartnerships =
    stakeholder_partnerships && stakeholder_partnerships.length > 0;

  return (
    <Box component="dl">
      <div>
        <Typography
          component="dt"
          variant="body2"
          color="textSecondary"
          data-testid="indigenousData"
          aria-label="Indigenous Partnerships"
        >
          Indigenous:
        </Typography>

        <Typography component="dd" variant="body2">
          {hasIndigenousPartnerships &&
            indigenous_partnerships?.map((indigenousPartnership: number, index: number) => {
              const codeValue = codes.first_nations.find(
                (code) => code.id === indigenousPartnership
              );
              return (
                <span
                  key={index}
                  data-testid="indigenous_partners_data"
                  style={pageStyles.partnerItem['&:last-child .seperator']}
                >
                  {codeValue?.name}
                  <span className="seperator">,&nbsp;</span>
                </span>
              );
            })}
          {!hasIndigenousPartnerships && (
            <span data-testid="no_indigenous_partners_data">None</span>
          )}
        </Typography>
      </div>

      <div>
        <Typography
          component="dt"
          variant="body2"
          color="textSecondary"
          data-testid="stakeholderData"
          aria-label="Other Partnerships"
        >
          Other:
        </Typography>

        <Typography component="dd" variant="body2">
          {hasStakeholderPartnerships &&
            stakeholder_partnerships?.map((stakeholderPartnership: string, index: number) => {
              return (
                <span
                  key={index}
                  data-testid="stakeholder_partners_data"
                  style={pageStyles.partnerItem['&:last-child .seperator']}
                >
                  {stakeholderPartnership}
                  <span className="seperator">,&nbsp;</span>
                </span>
              );
            })}
          {!hasStakeholderPartnerships && (
            <span data-testid="no_stakeholder_partners_data">None</span>
          )}
        </Typography>
      </div>
    </Box>
  );
};

export default Partnerships;
