import { mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import InfoIcon from '@mui/icons-material/Info';
import { List, ListItem } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Typography from '@mui/material/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import { FieldArray, useFormikContext } from 'formik';
import React, { useState } from 'react';
import yup from 'utils/YupSchema';
import InfoDialogDraggable from 'components/dialog/InfoDialogDraggable';
import InfoContent from 'components/info/InfoContent';
import { CreateProjectI18N } from 'constants/i18n';

const pageStyles = {
  customListItem: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: '5rem'
  }
};

export interface IProjectObjectivesFormArrayItem {
  objective: string;
}

export interface IProjectObjectivesForm {
  objective: {
    objectives: IProjectObjectivesFormArrayItem[];
  };
}

export const ProjectObjectivesFormArrayItemInitialValues: IProjectObjectivesFormArrayItem = {
  objective: '' as unknown as string
};

export const ProjectObjectiveFormInitialValues: IProjectObjectivesForm = {
  objective: {
    objectives: [ProjectObjectivesFormArrayItemInitialValues]
  }
};

export const ProjectObjectiveFormYupSchema = yup.object().shape({
  objective: yup.object().shape({
    objectives: yup
      .array()
      .of(
        yup.object().shape({
          objective: yup
            .string()
            .trim()
            .nullable()
            .transform((value, orig) => (orig.trim() === '' ? null : value))
            .max(300, 'Objective cannot exceed 500 characters.')
            .required('Project objective is required.')
        })
      )
      .isUniqueObjective('Objective entries must be unique.')
  })
});

/**
 * Create project - Objectives section
 *
 * @return {*}
 */
const ProjectObjectivesForm: React.FC = () => {
  const { values, getFieldMeta, errors } = useFormikContext<IProjectObjectivesForm>();

  const [infoOpen, setInfoOpen] = useState(false);
  const handleClickOpen = () => {
    setInfoOpen(true);
  };

  return (
    <>
      <InfoDialogDraggable
        isProject={true}
        open={infoOpen}
        dialogTitle={CreateProjectI18N.objective}
        onClose={() => setInfoOpen(false)}
        aria-labelledby="objective-info-dialog">
        <InfoContent isProject={true} contentIndex={CreateProjectI18N.objective} />
      </InfoDialogDraggable>

      <Box mt={6}>
        <FieldArray
          name="objective.objectives"
          render={(arrayHelpers) => (
            <>
              {values.objective.objectives?.map((objective, index) => {
                const objectiveMeta = getFieldMeta(`objective.objectives.[${index}].objective`);

                return (
                  /* Objectives List */
                  <List key={index} role="list" aria-label="Objectives List">
                    <ListItem
                      sx={pageStyles.customListItem}
                      role="listitem"
                      aria-label={`Objective ${index + 1}`}>
                      <CustomTextField
                        name={`objective.objectives.[${index}].objective`}
                        label={CreateProjectI18N.objective}
                        maxLength={200}
                        other={{
                          required: true,
                          value: objective.objective,
                          error: objectiveMeta.touched && Boolean(objectiveMeta.error),
                          helperText: objectiveMeta.touched && objectiveMeta.error,
                          'aria-label': `Objective ${index + 1}`,
                          InputProps: {
                            endAdornment: !index ? (
                              <IconButton
                                edge="end"
                                onClick={handleClickOpen}
                                aria-label="Open Objective Information">
                                <InfoIcon color="info" />
                              </IconButton>
                            ) : null
                          }
                        }}
                      />
                      {index >= 1 && (
                        <ListItemSecondaryAction>
                          <IconButton
                            color="primary"
                            data-testid="delete-icon"
                            aria-label={`Remove Objective ${index + 1}`}
                            onClick={() => arrayHelpers.remove(index)}
                            edge="end"
                            size="large">
                            <Icon path={mdiTrashCanOutline} size={1} />
                          </IconButton>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                  </List>
                );
              })}
              <Box pt={0.5}>
                <Button
                  disabled={
                    !values.objective.objectives[
                      values.objective.objectives.length - 1
                    ].objective.trim() || values.objective.objectives.length >= 5
                  }
                  type="button"
                  variant="outlined"
                  color="primary"
                  aria-label="Add Objective"
                  startIcon={<Icon path={mdiPlus} size={1}></Icon>}
                  onClick={() => arrayHelpers.push(ProjectObjectivesFormArrayItemInitialValues)}>
                  Add New {CreateProjectI18N.objective}
                </Button>
              </Box>
            </>
          )}
        />
        {errors.objective?.objectives && !Array.isArray(errors.objective?.objectives) && (
          <Box pt={2}>
            <Typography style={{ fontSize: '12px', color: '#f44336' }}>
              {errors.objective.objectives}
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );
};

export default ProjectObjectivesForm;
