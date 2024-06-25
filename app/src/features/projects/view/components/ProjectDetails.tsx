import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import React from 'react';
import ThumbnailImageCard from 'components/attachments/ThumbnailImageCard';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';

const pageStyles = {
  conservationAreChip: {
    marginBottom: '2px',
    justifyContent: 'left'
  },
  conservAreaLabel: {
    color: '#545454',
    fontSize: '0.78rem',
    fontWeight: 500,
    textTransform: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};

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
  console.log('project', project);

  const conservationAreaStyled = (conservationArea: string) => {
    return (
      <Typography sx={pageStyles.conservAreaLabel} aria-label={`${conservationArea}`}>
        {conservationArea}
      </Typography>
    );
  };

  return (
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
            {project.location.is_within_overlapping === 'Y' &&
              project.location.conservationAreas &&
              project.location.conservationAreas.map(
                (data: { conservation_area: string }, index) => (
                  <Chip
                    key={index}
                    size="small"
                    sx={pageStyles.conservationAreChip}
                    label={conservationAreaStyled(data.conservation_area)}
                  />
                )
              )}
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default ProjectDetails;
