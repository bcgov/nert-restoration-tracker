import { mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Grid, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import CustomTextField from 'components/fields/CustomTextField';
import { SYSTEM_IDENTITY_SOURCE } from 'constants/auth';
import { FieldArray, useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IAddPlanParticipantsFormArrayItem {
  userIdentifier: string;
  identitySource: string;
  roleId: number;
}

export interface IAddPlanParticipantsForm {
  participants: IAddPlanParticipantsFormArrayItem[];
}

export const AddProjectParticipantsFormArrayItemInitialValues: IAddPlanParticipantsFormArrayItem = {
  userIdentifier: '',
  identitySource: '',
  roleId: '' as unknown as number
};

export const AddProjectParticipantsFormInitialValues: IAddPlanParticipantsForm = {
  participants: [AddProjectParticipantsFormArrayItemInitialValues]
};

export const AddProjectParticipantsFormYupSchema = yup.object().shape({
  participants: yup.array().of(
    yup.object().shape({
      userIdentifier: yup.string().required('Username is required'),
      identitySource: yup.string().required('Login Method is required'),
      roleId: yup.number().required('Role is required')
    })
  )
});

export interface AddProjectParticipantsFormProps {
  project_roles: { value: number; label: string }[];
}

const AddProjectParticipantsForm: React.FC<AddProjectParticipantsFormProps> = (props) => {
  const { values, handleChange, handleSubmit, getFieldMeta } =
    useFormikContext<IAddPlanParticipantsForm>();

  return (
    <form onSubmit={handleSubmit} role="form" aria-labelledby="add-participants-form-title">
      <Typography variant="h6" id="add-participants-form-title" component="h2">
        Add Participants
      </Typography>
      <FieldArray
        name="participants"
        render={(arrayHelpers) => (
          <Box my={1}>
            <Box>
              {values.participants?.map((participant, index) => {
                const userIdentifierMeta = getFieldMeta(`participants.[${index}].userIdentifier`);
                const identitySourceMeta = getFieldMeta(`participants.[${index}].identitySource`);
                const roleIdMeta = getFieldMeta(`participants.[${index}].roleId`);

                return (
                  <Box key={index}>
                    <Grid container spacing={2}>
                      <Grid item xs={3.5} display={'flex'} alignItems={'stretch'}>
                        <Box flex={1}>
                          <CustomTextField
                            name={`participants.[${index}].userIdentifier`}
                            label="Username"
                            other={{
                              size: 'large',
                              required: true,
                              value: participant.userIdentifier,
                              error:
                                userIdentifierMeta.touched && Boolean(userIdentifierMeta.error),
                              helperText: userIdentifierMeta.touched && userIdentifierMeta.error,
                              'aria-label': `Username for participant ${index + 1}`
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={3.5}>
                        <FormControl
                          fullWidth
                          variant="outlined"
                          required={true}
                          error={identitySourceMeta.touched && Boolean(identitySourceMeta.error)}>
                          <InputLabel id={`loginMethod-${index}`} required={false}>
                            Login Method
                          </InputLabel>
                          <Select
                            id={`participants.[${index}].identitySource`}
                            name={`participants.[${index}].identitySource`}
                            labelId={`loginMethod-${index}`}
                            label="Login Method"
                            value={participant.identitySource}
                            onChange={handleChange}
                            inputProps={{
                              'aria-label': `Login Method for participant ${index + 1}`
                            }}>
                            <MenuItem
                              key={SYSTEM_IDENTITY_SOURCE.IDIR}
                              value={SYSTEM_IDENTITY_SOURCE.IDIR}>
                              IDIR
                            </MenuItem>
                            <MenuItem
                              key={SYSTEM_IDENTITY_SOURCE.BCEID_BASIC}
                              value={SYSTEM_IDENTITY_SOURCE.BCEID_BASIC}>
                              BCeID Basic
                            </MenuItem>
                            <MenuItem
                              key={SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS}
                              value={SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS}>
                              BCeID Business
                            </MenuItem>
                          </Select>
                          <FormHelperText>
                            {identitySourceMeta.touched && identitySourceMeta.error}
                          </FormHelperText>
                        </FormControl>
                      </Grid>
                      <Grid item xs={3.5}>
                        <FormControl
                          fullWidth
                          variant="outlined"
                          required={true}
                          error={roleIdMeta.touched && Boolean(roleIdMeta.error)}>
                          <InputLabel id={`roleId-${index}`} required={false}>
                            Project Role
                          </InputLabel>
                          <Select
                            id={`participants.[${index}].roleId`}
                            name={`participants.[${index}].roleId`}
                            labelId={`roleId-${index}`}
                            label="Project Role"
                            value={participant.roleId}
                            onChange={handleChange}
                            inputProps={{
                              'aria-label': `Project Role for participant ${index + 1}`
                            }}>
                            {props.project_roles.map((item) => (
                              <MenuItem key={item.value} value={item.value}>
                                {item.label}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>{roleIdMeta.touched && roleIdMeta.error}</FormHelperText>
                        </FormControl>
                      </Grid>
                      <Grid item xs={1.5} textAlign={'center'}>
                        <IconButton
                          data-testid="delete-icon"
                          aria-label={`remove participant ${index + 1}`}
                          onClick={() => arrayHelpers.remove(index)}
                          size="large">
                          <Icon path={mdiTrashCanOutline} size={1} />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                );
              })}
            </Box>
            <Box mt={1}>
              <Button
                type="button"
                variant="text"
                color="primary"
                aria-label="add new team member"
                data-testid="add-participant-button"
                startIcon={<Icon path={mdiPlus} size={1} />}
                onClick={() => arrayHelpers.push(AddProjectParticipantsFormArrayItemInitialValues)}>
                <strong>Add New</strong>
              </Button>
            </Box>
          </Box>
        )}
      />
    </form>
  );
};

export default AddProjectParticipantsForm;
