import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';
import IntegerSingleField from 'components/fields/IntegerSingleField';
import MultiAutocompleteFieldVariableSize, {
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import { focus, focusOptions, getFocusCodeFromLabel } from 'constants/misc';
import { useFormikContext } from 'formik';
import React, { useState } from 'react';
import yup from 'utils/YupSchema';
import InfoDialogDraggable from 'components/dialog/InfoDialogDraggable';
import InfoContent from 'components/info/InfoContent';
import { CreateProjectI18N } from 'constants/i18n';

export interface IProjectFocusForm {
  focus: {
    focuses: IMultiAutocompleteFieldOption[] | number[];
    people_involved: number | null;
  };
}

export const ProjectFocusFormInitialValues: IProjectFocusForm = {
  focus: {
    focuses: [],
    people_involved: null
  }
};

export const ProjectFocusFormYupSchema = yup.object().shape({
  focus: yup.object().shape({
    focuses: yup.array().min(1, 'You must select at least one option').required('Required'),
    people_involved: yup
      .number()
      .nullable()
      .isNumberOfPeopleInvolvedRequired(
        'People Involved is required when Healing the People is selected'
      )
  })
});

/**
 * Create project - General information section
 *
 * @return {*}
 */

const ProjectFocusForm: React.FC = () => {
  const formikProps = useFormikContext<IProjectFocusForm>();
  const { values } = formikProps;

  const [infoOpen, setInfoOpen] = useState(false);
  const [infoTitle, setInfoTitle] = useState('');

  const handleClickOpen = (indexContent: string) => {
    setInfoTitle(indexContent ? indexContent : '');
    setInfoOpen(true);
  };

  return (
    <>
      <InfoDialogDraggable
        isProject={true}
        open={infoOpen}
        dialogTitle={infoTitle}
        onClose={() => setInfoOpen(false)}>
        <InfoContent isProject={true} contentIndex={infoTitle} />
      </InfoDialogDraggable>

      <Box mt={2}>
        <Typography component="legend">
          Healing the Land and/or People
          <IconButton edge="end" onClick={() => handleClickOpen(CreateProjectI18N.focus)}>
            <InfoIcon color="info" />
          </IconButton>
        </Typography>

        <Grid container spacing={3} direction="column">
          <Grid item xs={12}>
            <MultiAutocompleteFieldVariableSize
              id="focus.focuses"
              data-testid="focus"
              label="Project Focus"
              options={focusOptions}
              required={true}
            />
          </Grid>
          <Grid item xs={12}>
            <IntegerSingleField
              name="focus.people_involved"
              label={CreateProjectI18N.numberOfPeopleInvolved}
              required={
                values.focus &&
                values.focus.focuses.some((values) => {
                  return values == getFocusCodeFromLabel(focus.HEALING_THE_PEOPLE);
                })
                  ? true
                  : false
              }
              adornment={
                <IconButton
                  edge="end"
                  onClick={() => handleClickOpen(CreateProjectI18N.numberOfPeopleInvolved)}>
                  <InfoIcon color="info" />
                </IconButton>
              }
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default ProjectFocusForm;
