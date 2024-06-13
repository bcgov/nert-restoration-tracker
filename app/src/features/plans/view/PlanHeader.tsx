import { Paper } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { IGetPlanForViewResponse } from 'interfaces/usePlanApi.interface';
import React from 'react';

export interface IPlanHeaderProps {
  planWithDetails: IGetPlanForViewResponse;
}

/**
 * Plan Header Information.
 *
 * @return {*}
 */
const PlanHeader: React.FC<IPlanHeaderProps> = (props) => {
  const { planWithDetails } = props;

  return (
    <Box mb={1}>
      <Paper elevation={2}>
        <Box p={1}>
          <Grid container spacing={0}>
            <Grid item xs={2}>
              <Card sx={{ maxWidth: 200, borderRadius: '16px' }}>
                <CardMedia
                  sx={{ height: 124, borderRadius: '16px' }}
                  image="https://nrs.objectstore.gov.bc.ca/nerdel/local/restoration/projects/31/attachments/lizard.png"
                  title="green iguana"
                />
              </Card>
            </Grid>
            <Grid item xs={10}>
              <Box ml={1} mt={1.5}>
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
                    {planWithDetails.location.size_ha}
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
                    {planWithDetails.location.number_sites}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default PlanHeader;
