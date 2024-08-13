import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import CustomTextField from 'components/fields/CustomTextField';
import PlanStartEndDateFields from 'components/fields/PlanStartEndDateFields';
import ThumbnailImageField from 'components/fields/ThumbnailImageField';
import { getStateCodeFromLabel, getStatusStyle, states } from 'components/workflow/StateMachine';
import { useFormikContext } from 'formik';
import React, { useState } from 'react';
import yup from 'utils/YupSchema';
import InfoDialog from 'components/dialog/InfoDialog';
import InfoDialogDraggable from 'components/dialog/InfoDialogDraggable';
import InfoContent from 'components/info/InfoContent';
import { CreatePlanI18N } from 'constants/i18n';

export interface IPlanGeneralInformationForm {
  project: {
    is_project: boolean;
    project_name: string;
    state_code: number;
    brief_desc: string;
    start_date: string;
    end_date: string;
    is_healing_land: boolean;
    is_healing_people: boolean;
    is_land_initiative: boolean;
    is_cultural_initiative: boolean;
    project_image?: File | null;
    image_url?: string;
    image_key?: string;
  };
}

export const PlanGeneralInformationFormInitialValues: IPlanGeneralInformationForm = {
  project: {
    is_project: false,
    project_name: '',
    state_code: getStateCodeFromLabel(states.DRAFT),
    brief_desc: '',
    start_date: '',
    end_date: '',
    is_healing_land: false,
    is_healing_people: false,
    is_land_initiative: false,
    is_cultural_initiative: false,
    project_image: null,
    image_url: '',
    image_key: ''
  }
};

export const PlanGeneralInformationFormYupSchema = yup.object().shape({
  project: yup.object().shape({
    project_name: yup.string().max(300, 'Cannot exceed 300 characters').required('Required'),
    start_date: yup.string().isValidDateString().required('Required'),
    end_date: yup.string().nullable().isValidDateString().isEndDateAfterStartDate('start_date'),
    brief_desc: yup
      .string()
      .max(500, 'Cannot exceed 500 characters')
      .required('You must provide a brief description for the plan')
  })
});

/**
 * Create plan - General information section
 *
 * @return {*}
 */

const PlanGeneralInformationForm: React.FC = () => {
  const formikProps = useFormikContext<IPlanGeneralInformationForm>();

  const [infoOpen, setInfoOpen] = useState(false);
  const handleClickOpen = () => {
    setInfoOpen(true);
  };
  return (
    <>
      <InfoDialogDraggable
        isProject={false}
        open={infoOpen}
        dialogTitle={CreatePlanI18N.briefDescription}
        onClose={() => setInfoOpen(false)}>
        <InfoContent isProject={false} contentIndex={CreatePlanI18N.briefDescription} />
      </InfoDialogDraggable>
      <Grid container spacing={3}>
        <ThumbnailImageField />
        <Grid item xs={12} md={9}>
          <Grid container spacing={3} direction="column">
            <Grid item xs={12}>
              <CustomTextField
                name="project.project_name"
                label="Plan Name"
                other={{
                  required: true
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name="project.no_data"
                label="Plan Status"
                other={{
                  InputProps: {
                    readOnly: true,
                    startAdornment: (
                      <Chip
                        size="small"
                        sx={getStatusStyle(getStateCodeFromLabel(states.DRAFT))}
                        label={states.DRAFT}
                      />
                    ),
                    endAdornment: <InfoDialog isProject={false} infoContent={'workflow'} />
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Grid item xs={12}>
                <CustomTextField
                  name="project.brief_desc"
                  label={CreatePlanI18N.briefDescription}
                  maxLength={500}
                  other={{
                    required: true,
                    multiline: true,
                    maxRows: 5,
                    InputProps: {
                      endAdornment: (
                        <IconButton edge="end" onClick={handleClickOpen}>
                          <InfoIcon color="info" />
                        </IconButton>
                      )
                    }
                  }}
                />
              </Grid>
            </Grid>
            <PlanStartEndDateFields
              formikProps={formikProps}
              startName={'project.start_date'}
              endName={'project.end_date'}
              startRequired={true}
              endRequired={false}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default PlanGeneralInformationForm;
