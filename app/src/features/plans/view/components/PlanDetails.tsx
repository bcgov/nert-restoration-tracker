import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import React from 'react';
import ThumbnailImageCard from 'components/attachments/ThumbnailImageCard';
import { IGetPlanForViewResponse } from 'interfaces/usePlanApi.interface';

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

export interface IPlanDetails {
  plan: IGetPlanForViewResponse;
  thumbnailImageUrl: string;
}

/*
 * Page to display a single Project.
 *
 * @return {*}
 */
const PlanDetails: React.FC<IPlanDetails> = (props) => {
  const { plan, thumbnailImageUrl } = props;

  return (
    <Grid container spacing={2}>
      {
        // Plan Image
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
              Plan Size (Ha):
            </Typography>
            <Typography
              ml={1}
              sx={{ fontWeight: 'bold' }}
              variant="subtitle2"
              component="span"
              color="textPrimary">
              {plan.location.size_ha}
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
              {plan.location.number_sites}
            </Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default PlanDetails;
