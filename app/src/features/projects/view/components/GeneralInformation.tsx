import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { getFormattedDate } from 'utils/Utils';

export interface IProjectGeneralInformationProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const GeneralInformation: React.FC<IProjectGeneralInformationProps> = (props) => {
  const {
    projectForViewData: { project, location }
  } = props;

  const getRegionName = (regionNumber: number) => {
    const codeValue = props.codes.regions.find((code) => code.id === regionNumber);
    return (
      <Typography
        variant="body2"
        component="dd"
        data-testid="project-region"
        aria-label={`Region: ${codeValue?.name}`}>
        {codeValue?.name}
      </Typography>
    );
  };

  return (
    <Box data-testid="general_info_component" aria-label="general_info_header">
      <Typography component="dl">
        <Typography variant="h6" id="general_info_header" sx={{ display: 'none' }}>
          General Information
        </Typography>
        <Box>
          <Typography variant="body2" component="dt" color="textSecondary">
            Region:
          </Typography>
          {location.region ? getRegionName(location.region) : ''}
        </Box>

        <Typography variant="body2" component="dt" color="textSecondary">
          Brief Description:
        </Typography>
        <Typography variant="body2" component="dd" aria-label="Brief Description">
          {project.brief_desc}
        </Typography>

        <Typography variant="body2" component="dt" color="textSecondary">
          Start Date:
        </Typography>
        <Typography variant="body2" component="dd" aria-label="Start Date">
          {project.start_date
            ? getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, project.start_date)
            : '---'}
        </Typography>

        <Typography variant="body2" component="dt" color="textSecondary">
          End Date:
        </Typography>
        <Typography variant="body2" component="dd" aria-label="End Date">
          {project.end_date
            ? getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, project.end_date)
            : '---'}
        </Typography>

        <Typography variant="body2" component="dt" color="textSecondary">
          Actual Start Date:
        </Typography>
        <Typography variant="body2" component="dd" aria-label="Actual Start Date">
          {project.actual_start_date
            ? getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, project.actual_start_date)
            : '---'}
        </Typography>

        <Typography variant="body2" component="dt" color="textSecondary">
          Actual End Date:
        </Typography>
        <Typography variant="body2" component="dd" aria-label="Actual End Date">
          {project.actual_end_date
            ? getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, project.actual_end_date)
            : '---'}
        </Typography>
      </Typography>
    </Box>
  );
};

export default GeneralInformation;
