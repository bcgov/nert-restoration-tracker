import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import React, { useState } from 'react';
import ThumbnailImageCard from 'components/attachments/ThumbnailImageCard';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import ProjectConservationAreas from './ProjectConservationAreas';
import InfoDialogDraggable from 'components/dialog/InfoDialogDraggable';
import InfoContent from 'components/info/InfoContent';
import { ViewProjectI18N } from 'constants/i18n';
import { Tooltip } from '@mui/material';

export interface IProjectDetails {
  project: IGetProjectForViewResponse;
  thumbnailImageUrl: string;
}

/*
 * Page to display a single Project.
 *
 * @return {*}
 */
const ProjectDetails: React.FC<IProjectDetails> = (props) => {
  const { project, thumbnailImageUrl } = props;

  const [infoOpen, setInfoOpen] = useState(false);
  const handleClickOpen = () => {
    setInfoOpen(true);
  };

  return (
    <>
      <InfoDialogDraggable
        isProject={true}
        open={infoOpen}
        dialogTitle={ViewProjectI18N.detailsInfo}
        onClose={() => setInfoOpen(false)}>
        <InfoContent isProject={true} contentIndex={ViewProjectI18N.detailsInfo} />
      </InfoDialogDraggable>

      <Grid container spacing={2}>
        {
          // Project Image
          thumbnailImageUrl && (
            <Grid item xs={4}>
              <ThumbnailImageCard image={thumbnailImageUrl} />
            </Grid>
          )
        }

        <Grid item xs={8}>
          <Box ml={1}>
            <Box>
              <Typography variant="subtitle2" component="span" color="textSecondary" noWrap>
                Project Size (Ha):
              </Typography>
              <Typography
                ml={1}
                sx={{ fontWeight: 'bold' }}
                variant="subtitle2"
                component="span"
                color="textPrimary">
                {project.location.size_ha}
              </Typography>
              <Tooltip title={ViewProjectI18N.detailsInfo} placement="right">
                <IconButton
                  sx={{ float: 'right' }}
                  edge="end"
                  onClick={handleClickOpen}
                  aria-label="Information">
                  <InfoIcon color="info" />
                </IconButton>
              </Tooltip>
            </Box>

            <Box mt={-0.6}>
              <Typography variant="subtitle2" component="span" color="textSecondary">
                Number of Sites:
              </Typography>
              <Typography
                ml={1}
                sx={{ fontWeight: 'bold' }}
                variant="subtitle2"
                component="span"
                color="textPrimary">
                {project.location.number_sites}
              </Typography>
            </Box>

            <Box mt={-0.6}>
              <Typography variant="subtitle2" component="span" color="textSecondary">
                Number of People Involved:
              </Typography>
              <Typography
                ml={1}
                sx={{ fontWeight: 'bold' }}
                variant="subtitle2"
                component="span"
                color="textPrimary">
                {project.project.people_involved}
              </Typography>
            </Box>

            <Box mt={-0.6}>
              <Typography variant="subtitle2" component="span" color="textSecondary">
                Project part of a publicly available restoration plan:
              </Typography>
              <Typography
                ml={1}
                sx={{ fontWeight: 'bold' }}
                variant="subtitle2"
                component="span"
                color="textPrimary">
                {!project.project.is_project_part_public_plan ? 'No' : 'Yes'}
              </Typography>
            </Box>

            <Box mt={-0.6}>
              <Typography variant="subtitle2" component="span" color="textSecondary">
                Project within or overlapping known area of cultural or conservation priority:
              </Typography>
              <Typography
                ml={1}
                sx={{ fontWeight: 'bold' }}
                variant="subtitle2"
                component="span"
                color="textPrimary">
                {project.location.is_within_overlapping === 'D'
                  ? "Don't know"
                  : project.location.is_within_overlapping === 'Y'
                    ? 'Yes'
                    : 'No'}
              </Typography>
              {project.location.is_within_overlapping === 'Y' && (
                <Box ml={1} display="flex" flexDirection={'column'} alignItems="left">
                  <ProjectConservationAreas projectViewData={project} />
                </Box>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default ProjectDetails;
