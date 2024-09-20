import { Chip, Divider, Tooltip } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import {
  IGetProjectForViewResponse,
  IGetProjectForViewResponseFundingSource
} from 'interfaces/useProjectApi.interface';
import React from 'react';
import { getFormattedAmount, getFormattedDate } from 'utils/Utils';
import { fundingSrcStyles } from 'utils/pagedProjectPlanTableUtils';

export interface IProjectFundingProps {
  projectForViewData: IGetProjectForViewResponse;
}

const fundSrcStyled = (fundSrc: string) => {
  return (
    <Tooltip title={fundSrc} disableHoverListener={fundSrc.length < 30}>
      <Typography sx={fundingSrcStyles.fundLabel} aria-label={`${fundSrc}`}>
        {fundSrc}
      </Typography>
    </Tooltip>
  );
};

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
              <Chip
                data-testid="funding_src_item"
                size="small"
                sx={fundingSrcStyles.fundChip}
                label={fundSrcStyled(item.organization_name)}
              />
              <Typography variant="body2" component="dt" color="textSecondary">
                Amount:
              </Typography>
              <Typography variant="body2" component="dd">
                {/* When funding amount is -1 it means it is not for public view */}
                {-1 !== item.funding_amount
                  ? getFormattedAmount(item.funding_amount)
                  : 'Not Public'}
              </Typography>
              <Typography variant="body2" component="dt" color="textSecondary">
                Project ID:
              </Typography>
              <Typography variant="body2" component="dd">
                {item.funding_project_id}
              </Typography>
              {item.description && (
                <>
                  <Typography variant="body2" component="dt" color="textSecondary">
                    Description:
                  </Typography>
                  <Typography variant="body2" component="dd">
                    {item.description}
                  </Typography>
                </>
              )}
              {item.start_date && (
                <>
                  <Typography variant="body2" component="dt" color="textSecondary">
                    Start Date:
                  </Typography>
                  <Typography variant="body2" component="dd">
                    {item.start_date
                      ? getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, item.start_date)
                      : '---'}
                  </Typography>
                </>
              )}
              {item.end_date && (
                <>
                  <Typography variant="body2" component="dt" color="textSecondary">
                    End Date:
                  </Typography>
                  <Typography variant="body2" component="dd">
                    {item.end_date
                      ? getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, item.end_date)
                      : '---'}
                  </Typography>
                </>
              )}
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
