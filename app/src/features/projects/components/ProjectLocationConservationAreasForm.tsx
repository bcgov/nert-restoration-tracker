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
import React from 'react';
import { IProjectLocationForm } from './ProjectLocationForm';

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
}

export const ProjectLocationConservationAreasFormArrayItemInitialValues: IProjectLocationConservationAreasArrayItem =
  {
    conservationArea: '' as unknown as string
  };

/**
 * Create project - Conservation areas
 *
 * @return {*}
 */
const ProjectLocationConservationAreas: React.FC = () => {
  const { values, getFieldMeta, errors } = useFormikContext<IProjectLocationForm>();

  return (
    <>
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
                      <List>
                        <ListItem sx={pageStyles.customListItem}>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={10.5}>
                              <CustomTextField
                                name={`location.conservationAreas.[${index}].conservationArea`}
                                label="Conservation Area"
                                maxLength={100}
                                other={{
                                  disabled: values.location.is_within_overlapping !== 'true',
                                  required:
                                    values.location.is_within_overlapping === 'true' ? true : false,
                                  value: conservationArea.conservationArea,
                                  error:
                                    conservationAreaMeta.touched &&
                                    Boolean(conservationAreaMeta.error),
                                  helperText:
                                    conservationAreaMeta.touched && conservationAreaMeta.error
                                }}
                              />
                            </Grid>
                          </Grid>
                          {index >= 1 && (
                            <ListItemSecondaryAction>
                              <IconButton
                                disabled={values.location.is_within_overlapping !== 'true'}
                                color="primary"
                                data-testid="delete-icon"
                                aria-label="remove conservation area"
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
                    values.location.conservationAreas.length >= 5 ||
                    values.location.is_within_overlapping !== 'true'
                  }
                  type="button"
                  variant="outlined"
                  color="primary"
                  aria-label="add conservation area"
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
