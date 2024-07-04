import { mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import { FieldArray, useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

const pageStyles = {
  customListItem: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: '5rem'
  }
};

export interface IProjectAuthorizationFormArrayItem {
  authorization_ref: string;
  authorization_type: string;
  authorization_desc: string;
}

export interface IProjectAuthorizationForm {
  authorization: {
    authorizations: IProjectAuthorizationFormArrayItem[];
  };
}

export const ProjectAuthorizationFormArrayItemInitialValues: IProjectAuthorizationFormArrayItem = {
  authorization_ref: '' as string,
  authorization_type: '' as string,
  authorization_desc: '' as string
};

export const ProjectAuthorizationFormInitialValues: IProjectAuthorizationForm = {
  authorization: {
    authorizations: [ProjectAuthorizationFormArrayItemInitialValues]
  }
};

export const ProjectAuthorizationFormYupSchema = yup.object().shape({
  authorization: yup.object().shape({
    authorizations: yup
      .array()
      .of(
        yup.object().shape({
          authorization_ref: yup
            .string()
            .nullable()
            .transform((value, orig) => (orig.trim() === '' ? null : value))
            .max(100, 'Cannot exceed 100 characters'),
          authorization_type: yup
            .string()
            .nullable()
            .transform((value, orig) => (orig.trim() === '' ? null : value))
            .max(100, 'Cannot exceed 100 characters'),
          authorization_desc: yup
            .string()
            .nullable()
            .transform((value, orig) => (orig.trim() === '' ? null : value))
            .max(200, 'Cannot exceed 200 characters')
        })
      )
      .nullable()

    // .isUniquePermitNumber('Authorization reference must be unique')
  })
});

/**
 * Create project - Authorization section
 *
 * @return {*}
 */
const ProjectAuthorizationForm: React.FC = () => {
  const { values, handleChange, getFieldMeta, errors } =
    useFormikContext<IProjectAuthorizationForm>();

  const authorizationTypes = [
    'Forestry License to Cut',
    'Heritage Inspection Permit',
    'License of Occupation',
    'Occupant License to Cut under the Forest Act',
    'Park Use Permit',
    'Road Use Permit',
    'Special Use Permit',
    'Other'
  ];

  return (
    <>
      <FieldArray
        name="authorization.authorizations"
        render={(arrayHelpers) => (
          <>
            {values.authorization &&
              values.authorization.authorizations &&
              values.authorization.authorizations?.map((authorization, index) => {
                const authorizationRefMeta = getFieldMeta(
                  `authorization.authorizations.[${index}].authorization_ref`
                );
                const authorizationTypeMeta = getFieldMeta(
                  `authorization.authorizations.[${index}].authorization_type`
                );
                const authorizationDescMeta = getFieldMeta(
                  `authorization.authorizations.[${index}].authorization_desc`
                );

                return (
                  /* authorization List List */
                  <Grid container spacing={3} key={index}>
                    <Grid item xs={12}>
                      <List>
                        <ListItem sx={pageStyles.customListItem}>
                          <Grid container spacing={3}>
                            <Grid item xs={4}>
                              <FormControl fullWidth size="small" variant="outlined">
                                <InputLabel id="authorization-type-label">
                                  Authorization Type
                                </InputLabel>
                                <Select
                                  id="authorization-type-select"
                                  name={`authorization.authorizations.[${index}].authorization_type`}
                                  labelId="authorization-type-label"
                                  label="Authorization Type"
                                  value={authorization.authorization_type}
                                  onChange={handleChange}
                                  error={
                                    authorizationTypeMeta.touched &&
                                    Boolean(authorizationTypeMeta.error)
                                  }
                                  inputProps={{ 'aria-label': 'Authorization Type' }}>
                                  {authorizationTypes.map((authorizationType, index2) => (
                                    <MenuItem key={index2} value={authorizationType}>
                                      {authorizationType}
                                    </MenuItem>
                                  ))}
                                </Select>
                                <FormHelperText error={true}>
                                  {authorizationTypeMeta.touched && authorizationTypeMeta.error}
                                </FormHelperText>
                              </FormControl>
                            </Grid>
                            <Grid item xs={4}>
                              <CustomTextField
                                name={`authorization.authorizations.[${index}].authorization_ref`}
                                label="Authorization Reference"
                                other={{
                                  disabled: !authorization.authorization_type,
                                  value: authorization.authorization_ref,
                                  error:
                                    authorizationRefMeta.touched &&
                                    Boolean(authorizationRefMeta.error),
                                  helperText:
                                    authorizationRefMeta.touched && authorizationRefMeta.error
                                }}
                              />
                            </Grid>
                            <Grid item xs={4}>
                              <CustomTextField
                                name={`authorization.authorizations.[${index}].authorization_desc`}
                                label="Authorization Description"
                                other={{
                                  disabled: !authorization.authorization_type,
                                  required: !(authorization.authorization_type != 'Other'),
                                  value: authorization.authorization_desc,
                                  error:
                                    authorizationDescMeta.touched &&
                                    Boolean(authorizationDescMeta.error),
                                  helperText:
                                    authorizationDescMeta.touched && authorizationDescMeta.error
                                }}
                              />
                            </Grid>
                            {index >= 1 && (
                              <Grid item xs={2} mt={-3}>
                                <ListItemSecondaryAction>
                                  <IconButton
                                    color="primary"
                                    data-testid="delete-icon"
                                    aria-label="remove authorization"
                                    onClick={() => arrayHelpers.remove(index)}
                                    edge="end"
                                    size="large">
                                    <Icon path={mdiTrashCanOutline} size={1}></Icon>
                                  </IconButton>
                                </ListItemSecondaryAction>
                              </Grid>
                            )}
                          </Grid>
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                );
              })}
            <Box pt={0.5}>
              <Button
                disabled={
                  !values.authorization.authorizations[
                    values.authorization.authorizations.length - 1
                  ].authorization_type.trim() || values.authorization.authorizations.length >= 5
                }
                type="button"
                variant="outlined"
                color="primary"
                aria-label="add authorization"
                startIcon={<Icon path={mdiPlus} size={1}></Icon>}
                onClick={() => arrayHelpers.push(ProjectAuthorizationFormArrayItemInitialValues)}>
                Add New Authorization
              </Button>
            </Box>
          </>
        )}
      />
      <Box>
        {errors.authorization?.authorizations &&
          !Array.isArray(errors.authorization?.authorizations) && (
            <Box pt={2}>
              <Typography style={{ fontSize: '12px', color: '#f44336' }}>
                {errors.authorization.authorizations}
              </Typography>
            </Box>
          )}
      </Box>
    </>
  );
};

export default ProjectAuthorizationForm;
