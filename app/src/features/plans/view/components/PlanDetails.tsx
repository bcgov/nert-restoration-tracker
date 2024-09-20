import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import React, { useState } from 'react';
import ThumbnailImageCard from 'components/attachments/ThumbnailImageCard';
import { IGetPlanForViewResponse } from 'interfaces/usePlanApi.interface';
import InfoDialogDraggable from 'components/dialog/InfoDialogDraggable';
import InfoContent from 'components/info/InfoContent';
import { ViewPlanI18N } from 'constants/i18n';
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

  const [infoOpen, setInfoOpen] = useState(false);
  const handleClickOpen = () => {
    setInfoOpen(true);
  };

  return (
    <>
      <InfoDialogDraggable
        isProject={false}
        open={infoOpen}
        dialogTitle={ViewPlanI18N.sizeAndSites}
        onClose={() => setInfoOpen(false)}>
        <InfoContent isProject={false} contentIndex={ViewPlanI18N.sizeAndSites} />
      </InfoDialogDraggable>

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
              <Tooltip title={ViewPlanI18N.sizeAndSites} placement="right">
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
                {plan.location.number_sites}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default PlanDetails;
