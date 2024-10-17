import { mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Typography from '@mui/material/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import { FieldArray, useFormikContext } from 'formik';
import React, { useState } from 'react';
import { IProjectLocationForm } from 'features/projects/components/ProjectLocationForm';
import { Checkbox, FormControlLabel } from '@mui/material';
import InfoDialogDraggable from 'components/dialog/InfoDialogDraggable';
import InfoContent from 'components/info/InfoContent';
import { CreateProjectI18N } from 'constants/i18n';
import InfoIcon from '@mui/icons-material/Info';

const pageStyles = {
  customListItem: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: '5rem'
  }
};

export interface IProjectLocationConservationAreasArrayItem {
  conservationArea: string;
  isPublic: boolean;
}

export const ProjectLocationConservationAreasFormArrayItemInitialValues: IProjectLocationConservationAreasArrayItem =
  {
    conservationArea: '' as unknown as string,
    isPublic: false
  };

/**
 * Create project - Conservation areas
 *
 * @return {*}
 */
const ProjectLocationConservationAreas: React.FC = () => {
  const { values, getFieldMeta, errors } = useFormikContext<IProjectLocationForm>();

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
        onClose={() => setInfoOpen(false)}
        aria-labelledby="conservation-area-info-dialog">
        <InfoContent isProject={true} contentIndex={infoTitle} />
      </InfoDialogDraggable>

      <FieldArray
        name="location.conservationAreas"
        render={(arrayHelpers) => {
          return (
            <>
              {values.location.conservationAreas?.map((conservationArea, index) => {
                const conservationAreaMeta = getFieldMeta(
                  `location.conservationAreas.[${index}].conservationArea`
                );

                return (
                  /* conservation Area List */
                  <Grid container spacing={3} key={index}>
                    <Grid item xs={12} md={10.5}>
                      <List role="list" aria-label="Conservation Areas List">
                        <ListItem
                          sx={pageStyles.customListItem}
                          role="listitem"
                          aria-label={`Conservation Area ${index + 1}`}>
                          <Grid container spacing={3}>
                            <Grid item xs={6} md={8}>
                              <CustomTextField
                                name={`location.conservationAreas.[${index}].conservationArea`}
                                label="Conservation Area"
                                maxLength={100}
                                other={{
                                  disabled: values.location.is_within_overlapping !== 'true',
                                  required: !index ? true : false,
                                  value: conservationArea.conservationArea,
                                  error:
                                    conservationAreaMeta.touched &&
                                    Boolean(conservationAreaMeta.error),
                                  helperText:
                                    conservationAreaMeta.touched && conservationAreaMeta.error,
                                  'aria-label': `Conservation Area ${index + 1}`
                                }}
                              />
                            </Grid>
                            <Grid item xs={4}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    color="primary"
                                    id="isPublic"
                                    name="isPublic"
                                    aria-label={`Hidden from Public ${index + 1}`}
                                    checked={!conservationArea.isPublic}
                                    value={conservationArea.isPublic}
                                    onChange={() => {
                                      arrayHelpers.replace(index, {
                                        ...conservationArea,
                                        isPublic: !conservationArea.isPublic
                                      });
                                    }}
                                  />
                                }
                                label={
                                  <Typography color="textSecondary">
                                    Hidden from Public?{' '}
                                    <IconButton
                                      edge="end"
                                      onClick={() =>
                                        handleClickOpen(
                                          CreateProjectI18N.locationConservationAreaHidden
                                        )
                                      }
                                      aria-label="Open Hidden from Public Information">
                                      <InfoIcon color="info" />
                                    </IconButton>
                                  </Typography>
                                }
                              />
                            </Grid>
                          </Grid>
                          {index >= 1 && (
                            <ListItemSecondaryAction>
                              <IconButton
                                disabled={values.location.is_within_overlapping !== 'true'}
                                color="primary"
                                data-testid="delete-icon"
                                aria-label={`Remove Conservation Area ${index + 1}`}
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
                    !!values.location.conservationAreas.length &&
                    (!values.location.conservationAreas[
                      values.location.conservationAreas.length - 1
                    ].conservationArea.trim() ||
                      values.location.conservationAreas.length >= 5 ||
                      values.location.is_within_overlapping !== 'true')
                  }
                  type="button"
                  variant="outlined"
                  color="primary"
                  aria-label="Add Conservation Area"
                  startIcon={<Icon path={mdiPlus} size={1}></Icon>}
                  onClick={() =>
                    arrayHelpers.push(ProjectLocationConservationAreasFormArrayItemInitialValues)
                  }>
                  Add New Conservation Area
                </Button>
              </Box>
            </>
          );
        }}
      />
      <Box>
        {errors.location?.conservationAreas &&
          !Array.isArray(errors.location?.conservationAreas) && (
            <Box pt={2}>
              <Typography style={{ fontSize: '12px', color: '#f44336' }}>
                {errors.location.conservationAreas}
              </Typography>
            </Box>
          )}
      </Box>
    </>
  );
};

export default ProjectLocationConservationAreas;
