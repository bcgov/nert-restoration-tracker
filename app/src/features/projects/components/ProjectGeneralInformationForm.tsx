import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import CustomTextField from 'components/fields/CustomTextField';
import ProjectStartEndDateFields from 'components/fields/ProjectStartEndDateFields';
import {
  getStateCodeFromLabel,
  getStateLabelFromCode,
  getStatusStyle,
  states
} from 'components/workflow/StateMachine';
import ChipSelect from 'components/workflow/ChipSelect';
import { useFormikContext } from 'formik';
import React, { useState } from 'react';
import yup from 'utils/YupSchema';
import './styles/projectImage.css';
import ThumbnailImageField from 'components/fields/ThumbnailImageField';
import InfoDialog from 'components/dialog/InfoDialog';
import InfoDialogDraggable from 'components/dialog/InfoDialogDraggable';
import InfoContent from 'components/info/InfoContent';
import { CreateProjectI18N } from 'constants/i18n';

interface ICurrentProjectStateProps {
  currentStateCode?: number;
}

export interface IProjectGeneralInformationForm {
  project: {
    project_name: string;
    is_project: boolean;
    state_code: number;
    brief_desc: string;
    start_date: string;
    end_date: string;
    actual_start_date: string;
    actual_end_date: string;
    is_healing_land: boolean;
    is_healing_people: boolean;
    is_land_initiative: boolean;
    is_cultural_initiative: boolean;
    is_project_part_public_plan: boolean;
    people_involved: number | null;
    project_image?: File | null;
    image_url?: string;
    image_key?: string;
  };
}

export const ProjectGeneralInformationFormInitialValues: IProjectGeneralInformationForm = {
  project: {
    project_name: '',
    is_project: true,
    state_code: getStateCodeFromLabel(states.DRAFT),
    brief_desc: '',
    start_date: '',
    end_date: '',
    actual_start_date: '',
    actual_end_date: '',
    is_healing_land: false,
    is_healing_people: false,
    is_land_initiative: false,
    is_cultural_initiative: false,
    is_project_part_public_plan: false,
    people_involved: null,
    project_image: null,
    image_url: '',
    image_key: ''
  }
};

export const ProjectGeneralInformationFormYupSchema = yup.object().shape({
  project: yup.object().shape({
    project_name: yup.string().max(300, 'Cannot exceed 300 characters').required('Required'),
    start_date: yup.string().isValidDateString().required('Required'),
    end_date: yup.string().nullable().isValidDateString().isEndDateAfterStartDate('start_date'),
    actual_start_date: yup.string().nullable().isValidDateString(),
    actual_end_date: yup
      .string()
      .nullable()
      .isValidDateString()
      .isEndDateAfterStartDate('actual_start_date'),
    brief_desc: yup
      .string()
      .max(500, 'Cannot exceed 500 characters')
      .required('You must provide a brief description for the project')
  })
});

/**
 * Create/Edit project - General information section
 *
 * @return {*}
 */
const ProjectGeneralInformationForm: React.FC<ICurrentProjectStateProps> = (props) => {
  const formikProps = useFormikContext<IProjectGeneralInformationForm>();

  const currentState = props.currentStateCode
    ? getStateLabelFromCode(props.currentStateCode)
    : states.DRAFT;
  const state = getStateLabelFromCode(formikProps.values.project.state_code);
  const [infoOpen, setInfoOpen] = useState(false);
  const handleClickOpen = () => {
    setInfoOpen(true);
  };

  return (
    <>
      <InfoDialogDraggable
        isProject={true}
        open={infoOpen}
        dialogTitle={CreateProjectI18N.briefDescription}
        onClose={() => setInfoOpen(false)}
        aria-labelledby="brief-description-info-dialog">
        <InfoContent isProject={true} contentIndex={CreateProjectI18N.briefDescription} />
      </InfoDialogDraggable>

      <Grid container spacing={3} justifyContent={'space-between'}>
        <ThumbnailImageField />
        <Grid item xs={12} md={9}>
          <Grid container spacing={3} direction="column">
            <Grid item xs={12}>
              <CustomTextField
                name="project.project_name"
                label="Project Name"
                other={{
                  required: true,
                  'aria-label': 'Project Name'
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name="project.no_data"
                label="Project Status"
                other={{
                  InputProps: {
                    readOnly: true,
                    startAdornment: (
                      <Chip
                        size="small"
                        sx={getStatusStyle(getStateCodeFromLabel(currentState || states.DRAFT))}
                        label={currentState || states.DRAFT}
                        aria-label="Project Status"
                      />
                    ),
                    endAdornment: (
                      <>
                        {state != states.DRAFT && (
                          <Box>
                            <ChipSelect
                              isProject={true}
                              currentStatus={currentState}
                              formikProps={formikProps}
                              aria-label="Project Status Selector"
                            />
                          </Box>
                        )}
                        <InfoDialog
                          isProject={true}
                          infoContent={'workflow'}
                          aria-label="Workflow Information"
                        />
                      </>
                    )
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Grid item xs={12}>
                <CustomTextField
                  name="project.brief_desc"
                  label={CreateProjectI18N.briefDescription}
                  maxLength={500}
                  other={{
                    required: true,
                    multiline: true,
                    maxRows: 5,
                    'aria-label': 'Brief Description',
                    InputProps: {
                      endAdornment: (
                        <IconButton
                          edge="end"
                          onClick={handleClickOpen}
                          aria-label="Open Brief Description Information">
                          <InfoIcon color="info" />
                        </IconButton>
                      )
                    }
                  }}
                />
              </Grid>
            </Grid>
            <ProjectStartEndDateFields
              formikProps={formikProps}
              plannedStartName={'project.start_date'}
              plannedEndName={'project.end_date'}
              plannedStartRequired={true}
              plannedEndRequired={false}
              actualStartName={'project.actual_start_date'}
              actualEndName={'project.actual_end_date'}
              actualStartRequired={false}
              actualEndRequired={false}
              aria-label="Project Start and End Dates"
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default ProjectGeneralInformationForm;
