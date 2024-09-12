import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';
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
import get from 'lodash-es/get';
import RangeSelectField from 'components/fields/RangeSelectField';
import { MenuItem, TextField } from '@mui/material';

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
      .typeError('Number of People must be a number type.')
      .positive('Number of People must be provided and must be greater than 0.')
      .nullable()
      .isNumberOfPeopleInvolvedRequired(
        'Required when "Healing the People" and/or "Cultural or Community Investment Initiative" is selected.'
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

  const peopleInvolvedFormName = 'focus.people_involved';

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
            <TextField
              size="small"
              name={peopleInvolvedFormName}
              label={CreateProjectI18N.numberOfPeopleInvolved}
              select={true}
              required={
                values.focus &&
                values.focus.focuses.some((values) => {
                  return (
                    values == getFocusCodeFromLabel(focus.HEALING_THE_PEOPLE) ||
                    values ==
                      getFocusCodeFromLabel(focus.CULTURAL_OR_COMMUNITY_INVESTMENT_INITIATIVE)
                  );
                })
                  ? true
                  : false
              }
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <RangeSelectField
                    formikProps={formikProps}
                    formFieldName={peopleInvolvedFormName}
                  />
                ),
                endAdornment: (
                  <IconButton
                    edge="end"
                    onClick={() => handleClickOpen(CreateProjectI18N.numberOfPeopleInvolved)}>
                    <InfoIcon color="info" />
                  </IconButton>
                )
              }}
              error={
                get(formikProps.touched, peopleInvolvedFormName) &&
                Boolean(get(formikProps.errors, peopleInvolvedFormName))
              }
              helperText={
                get(formikProps.touched, peopleInvolvedFormName) &&
                (get(formikProps.errors, peopleInvolvedFormName) as string)
              }>
              <MenuItem></MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default ProjectFocusForm;
