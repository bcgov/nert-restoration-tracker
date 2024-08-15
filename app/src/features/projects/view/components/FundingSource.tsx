import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import {
  IGetProjectForViewResponse,
  IGetProjectForViewResponseFundingSource
} from 'interfaces/useProjectApi.interface';
import React from 'react';
import { getFormattedAmount, getFormattedDate } from 'utils/Utils';

export interface IProjectFundingProps {
  projectForViewData: IGetProjectForViewResponse;
}

/**
 * Funding source content for a project.
 *
 * @return {*}
 */
const FundingSource: React.FC<IProjectFundingProps> = (props) => {
  const {
    projectForViewData: { funding }
  } = props;

  const hasFundingSources = funding.fundingSources && funding.fundingSources.length > 0;

  return (
    <>
      {hasFundingSources &&
        funding.fundingSources.map(
          (item: IGetProjectForViewResponseFundingSource, index: number) => (
            <Box key={index} data-testid="funding_data">
              <Box mb={1}>
                <strong>{item.organization_name}</strong>
              </Box>
              <Box component="dl" mt={1}>
                <div>
                  <Typography variant="body2" component="dt" color="textSecondary">
                    Amount:
                  </Typography>
                  <Typography variant="body2" component="dd">
                    {getFormattedAmount(item.funding_amount)}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body2" component="dt" color="textSecondary">
                    Project ID:
                  </Typography>
                  <Typography variant="body2" component="dd">
                    {item.funding_project_id}
                  </Typography>
                </div>
                {item.description && (
                  <div>
                    <Typography variant="body2" component="dt" color="textSecondary">
                      Description:
                    </Typography>
                    <Typography variant="body2" component="dd">
                      {item.description}
                    </Typography>
                  </div>
                )}
                {item.start_date && (
                  <div>
                    <Typography variant="body2" component="dt" color="textSecondary">
                      Start Date:
                    </Typography>
                    <Typography variant="body2" component="dd">
                      {getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, item.start_date)}
                    </Typography>
                  </div>
                )}
                {item.end_date && (
                  <div>
                    <Typography variant="body2" component="dt" color="textSecondary">
                      End Date:
                    </Typography>
                    <Typography variant="body2" component="dd">
                      {getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, item.end_date)}
                    </Typography>
                  </div>
                )}
              </Box>
            </Box>
          )
        )}

      {!hasFundingSources && (
        <Typography variant="body2" color="textSecondary" data-testid="no_funding_sources">
          No Funding Sources
        </Typography>
      )}
    </>
  );
};

export default FundingSource;
