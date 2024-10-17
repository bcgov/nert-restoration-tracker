import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetPlanForViewResponse } from 'interfaces/usePlanApi.interface';
import React from 'react';
import { getFormattedDate } from 'utils/Utils';

export interface IProjectGeneralInformationProps {
  planForViewData: IGetPlanForViewResponse;
  codes: IGetAllCodeSetsResponse;
}

/**
 * General information content for a plan.
 *
 * @return {*}
 */
const PlanGeneralInformation: React.FC<IProjectGeneralInformationProps> = (props) => {
  const {
    planForViewData: { project, location }
  } = props;

  const getRegionName = (regionNumber: number) => {
    const codeValue = props.codes.regions.find((code) => code.id === regionNumber);
    return (
      <Typography variant="body2" component="dd" data-testid="project-region">
        {codeValue?.name}
      </Typography>
    );
  };

  return (
    <Box data-testid="general_info_component" aria-label="general-info-title">
      <Typography component="dl">
        <Typography variant="h6" id="general_info_header" sx={{ display: 'none' }}>
          General Information
        </Typography>

        <Typography variant="body2" component="dt" color="textSecondary">
          Region:
        </Typography>
        {location.region ? getRegionName(location.region) : '---'}

        <Typography variant="body2" component="dt" color="textSecondary">
          Brief Description:
        </Typography>
        <Typography variant="body2" component="dd">
          {project.brief_desc}
        </Typography>

        <Typography variant="body2" component="dt" color="textSecondary">
          Start Date:
        </Typography>
        <Typography variant="body2" component="dd">
          {project.start_date
            ? getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, project.start_date)
            : '---'}
        </Typography>

        <Typography variant="body2" component="dt" color="textSecondary">
          End Date:
        </Typography>
        <Typography variant="body2" component="dd">
          {project.end_date
            ? getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, project.end_date)
            : '---'}
        </Typography>
      </Typography>
    </Box>
  );
};

export default PlanGeneralInformation;
