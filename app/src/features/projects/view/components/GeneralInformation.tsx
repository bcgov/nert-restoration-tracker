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
    projectForViewData: { project, species, location }
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
    <Box data-testid="general_info_component">
      <Typography variant="body2" component="dt" color="textSecondary">
        Region:
      </Typography>
      {getRegionName(location.region)}

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

      <Typography variant="body2" component="dt" color="textSecondary">
        Actual Start Date:
      </Typography>
      <Typography variant="body2" component="dd">
        {project.actual_start_date
          ? getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, project.actual_start_date)
          : '---'}
      </Typography>

      <Typography variant="body2" component="dt" color="textSecondary">
        Actual End Date:
      </Typography>
      <Typography variant="body2" component="dd">
        {project.actual_end_date
          ? getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, project.actual_end_date)
          : '---'}
      </Typography>

      <Typography variant="body2" component="dt" color="textSecondary">
        Focal Species:
      </Typography>
      <Box component="dd">
        {species.focal_species_names?.length ? (
          species.focal_species_names.map((item: any, index: number) => {
            return (
              <Typography variant="body2" key={index} data-testid="focal_species_data">
                {item}
              </Typography>
            );
          })
        ) : (
          <Typography variant="body2">No Focal Species</Typography>
        )}
      </Box>
    </Box>
  );
};

export default GeneralInformation;
