import { mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
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

export interface IProjectPartnershipsFormArrayItem {
  partnership: string;
}

export interface IProjectPartnershipsForm {
  partnership: {
    partnerships: IProjectPartnershipsFormArrayItem[];
  };
}

export const ProjectPartnershipsFormArrayItemInitialValues: IProjectPartnershipsFormArrayItem = {
  partnership: '' as string
};

export const ProjectPartnershipFormInitialValues: IProjectPartnershipsForm = {
  partnership: {
    partnerships: [ProjectPartnershipsFormArrayItemInitialValues]
  }
};

export const ProjectPartnershipFormYupSchema = yup.object().shape({
  partnership: yup.object().shape({
    partnerships: yup
      .array()
      .of(
        yup.object().shape({
          partnership: yup
            .string()
            .nullable()
            .transform((value, orig) => (orig.trim() === '' ? null : value))
            .max(300, 'Cannot exceed 300 characters.')
        })
      )
      .isUniquePartnership('Partnership entries must be unique.')
  })
});

/**
 * Create project - Partnerships form
 *
 * @return {*}
 */
const ProjectPartnershipsForm: React.FC = () => {
  const { values, getFieldMeta, errors } = useFormikContext<IProjectPartnershipsForm>();

  const [infoOpen, setInfoOpen] = useState(false);
  const handleClickOpen = () => {
    setInfoOpen(true);
  };

  return (
    <>
      <InfoDialogDraggable
        isProject={true}
        open={infoOpen}
        dialogTitle={CreateProjectI18N.partnership}
        onClose={() => setInfoOpen(false)}>
        <InfoContent isProject={true} contentIndex={CreateProjectI18N.partnership} />
      </InfoDialogDraggable>

      <Typography component="legend">
        Partnerships
        <IconButton edge="end" onClick={handleClickOpen}>
          <InfoIcon color="info" />
        </IconButton>
      </Typography>

      <FieldArray
        name="partnership.partnerships"
        render={(arrayHelpers) => (
          <>
            {values.partnership &&
              values.partnership.partnerships?.map((partnership, index) => {
                const partnershipMeta = getFieldMeta(
                  `partnership.partnerships.[${index}].partnership`
                );

                return (
                  /* partnerships List */
                  <Grid container spacing={3} key={index}>
                    <Grid item xs={12} md={12}>
                      <List>
                        <ListItem sx={pageStyles.customListItem}>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={12}>
                              <CustomTextField
                                name={`partnership.partnerships.[${index}].partnership`}
                                label="Partnership"
                                maxLength={300}
                                other={{
                                  value: partnership.partnership,
                                  error: partnershipMeta.touched && Boolean(partnershipMeta.error),
                                  helperText: partnershipMeta.touched && partnershipMeta.error
                                }}
                              />
                            </Grid>
                          </Grid>
                          {index >= 1 && (
                            <ListItemSecondaryAction>
                              <IconButton
                                color="primary"
                                data-testid="delete-icon"
                                aria-label="remove partnership"
                                onClick={() => arrayHelpers.remove(index)}
                                edge="end"
                                size="large">
                                <Icon path={mdiTrashCanOutline} size={1} />
                              </IconButton>
                            </ListItemSecondaryAction>
                          )}
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                );
              })}
            <Box pt={0.5}>
              <Button
                disabled={
                  !!values.partnership.partnerships.length &&
                  (!values.partnership.partnerships[values.partnership.partnerships.length - 1]
                    .partnership ||
                    values.partnership.partnerships.length >= 5)
                }
                type="button"
                variant="outlined"
                color="primary"
                aria-label="add partnership"
                startIcon={<Icon path={mdiPlus} size={1}></Icon>}
                onClick={() => arrayHelpers.push(ProjectPartnershipsFormArrayItemInitialValues)}>
                Add New Partnership
              </Button>
            </Box>
          </>
        )}
      />
      <Box>
        {errors.partnership?.partnerships && !Array.isArray(errors.partnership?.partnerships) && (
          <Box pt={2}>
            <Typography style={{ fontSize: '12px', color: '#f44336' }}>
              {errors.partnership.partnerships}
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );
};

export default ProjectPartnershipsForm;
