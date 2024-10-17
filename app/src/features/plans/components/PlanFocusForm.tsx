import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import MultiAutocompleteFieldVariableSize, {
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import { focusOptions } from 'constants/misc';
import React, { useState } from 'react';
import yup from 'utils/YupSchema';
import InfoDialogDraggable from 'components/dialog/InfoDialogDraggable';
import InfoContent from 'components/info/InfoContent';
import { CreatePlanI18N } from 'constants/i18n';

export interface IPlanFocusForm {
  focus: {
    focuses: IMultiAutocompleteFieldOption[] | number[];
  };
}

export const PlanFocusFormInitialValues: IPlanFocusForm = {
  focus: {
    focuses: []
  }
};

export const PlanFocusFormYupSchema = yup.object().shape({
  focus: yup.object().shape({
    focuses: yup.array().min(1, 'You must select at least one option').required('Required')
  })
});

/**
 * Create project - General information section
 *
 * @return {*}
 */

const PlanFocusForm: React.FC = () => {
  const [infoOpen, setInfoOpen] = useState(false);

  const handleClickOpen = () => {
    setInfoOpen(true);
  };

  return (
    <>
      <InfoDialogDraggable
        isProject={false}
        open={infoOpen}
        dialogTitle={CreatePlanI18N.focus}
        onClose={() => setInfoOpen(false)}>
        <InfoContent isProject={false} contentIndex={CreatePlanI18N.focus} />
      </InfoDialogDraggable>

      <Typography component="legend" id="focus-form-title">
        Healing the Land and/or People
        <IconButton edge="end" onClick={handleClickOpen} aria-label="More information">
          <InfoIcon color="info" />
        </IconButton>
      </Typography>
      <Grid container spacing={3} mb={2}>
        <Grid item xs={12} md={11.46}>
          <Grid container spacing={3} direction="column">
            <Grid item xs={12}>
              <MultiAutocompleteFieldVariableSize
                id="focus.focuses"
                data-testid="focus"
                label="Plan Focus"
                options={focusOptions}
                required={true}
                aria-required="true"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default PlanFocusForm;
