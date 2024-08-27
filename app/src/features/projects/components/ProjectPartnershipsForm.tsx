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
import {
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select
} from '@mui/material';
import { useCodesContext } from 'hooks/useContext';
import { handleGetPartnershipRefList } from 'utils/Utils';
import { PartnershipTypes } from 'constants/misc';

const pageStyles = {
  customListItem: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: '5rem'
  }
};

export interface IProjectPartnershipsFormArrayItem {
  partnership_type: string;
  partnership_ref: string;
  partnership_name: string;
}

export interface IProjectPartnershipsForm {
  partnership: {
    partnerships: IProjectPartnershipsFormArrayItem[];
  };
}

export const ProjectPartnershipsFormArrayItemInitialValues: IProjectPartnershipsFormArrayItem = {
  partnership_type: '' as string,
  partnership_ref: '' as string,
  partnership_name: '' as string
};

export const ProjectPartnershipFormInitialValues: IProjectPartnershipsForm = {
  partnership: {
    partnerships: [ProjectPartnershipsFormArrayItemInitialValues]
  }
};

export const ProjectPartnershipFormYupSchema = yup.object().shape({
  partnership: yup.object().shape({
    partnerships: yup.array().of(
      yup.object().shape({
        partnership_type: yup.string().required('Partnership Type is required.'),
        partnership_ref: yup
          .string()
          .test(
            'required-if-partnership-type',
            'Partnership Ref is required.',
            function (value: string | undefined) {
              if (
                this.parent.partnership_type === PartnershipTypes.FEDERAL_GOVERNMENT_PARTNER ||
                this.parent.partnership_type === PartnershipTypes.BC_GOVERNMENT_PARTNER
              ) {
                return true;
              }

              if (this.parent.partnership_type === null) {
                return false;
              }

              return value !== undefined && value.trim() !== '';
            }
          ),
        // required if partnership_type is not null
        partnership_name: yup
          .string()
          .test(
            'required-if-partnership-type',
            'Partnership is required.',
            function (value: string | undefined) {
              if (
                this.parent.partnership_type === PartnershipTypes.FEDERAL_GOVERNMENT_PARTNER ||
                this.parent.partnership_type === PartnershipTypes.BC_GOVERNMENT_PARTNER
              ) {
                return value !== undefined && value.trim() !== '';
              }

              if (this.parent.partnership_ref === 'Other - please specify') {
                return value !== undefined && value.trim() !== '';
              } else {
                return true;
              }
            }
          )
          .max(100, 'Cannot exceed 100 characters.')
      })
    )
  })
});

/**
 * Create project - Partnerships form
 *
 * @return {*}
 */
const ProjectPartnershipsForm: React.FC = () => {
  const { values, getFieldMeta, errors, handleChange } =
    useFormikContext<IProjectPartnershipsForm>();

  const codesContext = useCodesContext();
  const codes = codesContext.codesDataLoader.data;

  const [infoOpen, setInfoOpen] = useState(false);
  const handleClickOpen = () => {
    setInfoOpen(true);
  };

  if (!codes) {
    return <CircularProgress />;
  }

  const partnershipTypes = codes.partnership_type;

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
                const partnershipTypeMeta = getFieldMeta(
                  `partnership.partnerships.[${index}].partnership_type`
                );
                const partnershipRefMeta = getFieldMeta(
                  `partnership.partnerships.[${index}].partnership_ref`
                );
                const partnershipNameMeta = getFieldMeta(
                  `partnership.partnerships.[${index}].partnership_name`
                );

                return (
                  /* partnerships List */
                  <Grid container spacing={3} key={index}>
                    <Grid item xs={12} md={12}>
                      <List>
                        <ListItem sx={pageStyles.customListItem}>
                          <Grid container spacing={3}>
                            <Grid item xs={4} md={4}>
                              <FormControl fullWidth size="small" variant="outlined">
                                <InputLabel id="partnerships-type-label">
                                  Partnership Type
                                </InputLabel>
                                <Select
                                  id="partnerships-type-select"
                                  name={`partnership.partnerships.[${index}].partnership_type`}
                                  labelId="partnerships-type-label"
                                  label="Partnership Type"
                                  value={partnership.partnership_type}
                                  onChange={handleChange}
                                  error={
                                    partnershipTypeMeta.touched &&
                                    Boolean(partnershipTypeMeta.error)
                                  }
                                  inputProps={{ 'aria-label': 'Partnership Type' }}>
                                  {partnershipTypes.map((code, index2) => (
                                    <MenuItem key={index2} value={code.name}>
                                      {code.name}
                                    </MenuItem>
                                  ))}
                                </Select>
                                <FormHelperText error={true}>
                                  {partnershipTypeMeta.touched && partnershipTypeMeta.error}
                                </FormHelperText>
                              </FormControl>
                            </Grid>
                            {
                              /* Partnership Name */
                              handleGetPartnershipRefList(partnership.partnership_type, codes)
                                .length > 1 ? (
                                <Grid item xs={4} md={4}>
                                  <FormControl fullWidth size="small" variant="outlined">
                                    <InputLabel id="partnership-ref-label">
                                      Partnership Ref
                                    </InputLabel>
                                    <Select
                                      id="partnership-ref-select"
                                      name={`partnership.partnerships.[${index}].partnership_ref`}
                                      labelId="partnership-ref-label"
                                      label="Partnership Ref"
                                      value={partnership.partnership_ref}
                                      onChange={handleChange}
                                      disabled={!partnership.partnership_type}
                                      error={
                                        partnershipRefMeta.touched &&
                                        Boolean(partnershipRefMeta.error)
                                      }
                                      required={true}
                                      inputProps={{ 'aria-label': 'Partnership Ref' }}>
                                      {handleGetPartnershipRefList(
                                        partnership.partnership_type,
                                        codes
                                      ).map((code, index2) => (
                                        <MenuItem key={index2} value={code.name}>
                                          {code.name}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                    <FormHelperText error={true}>
                                      {partnershipRefMeta.touched && partnershipRefMeta.error}
                                    </FormHelperText>
                                  </FormControl>
                                </Grid>
                              ) : (
                                <Grid item xs={4} md={4}>
                                  <CustomTextField
                                    name={`partnership.partnerships.[${index}].partnership_name`}
                                    label="Partnership"
                                    maxLength={300}
                                    other={{
                                      value: partnership.partnership_name,
                                      error:
                                        partnershipNameMeta.touched &&
                                        Boolean(partnershipNameMeta.error),
                                      helperText:
                                        partnershipNameMeta.touched && partnershipNameMeta.error,
                                      required: partnership.partnership_type !== '' ? true : false
                                    }}
                                  />
                                </Grid>
                              )
                            }

                            {partnership.partnership_ref === 'Other - please specify' && (
                              <Grid item xs={4} md={4}>
                                <CustomTextField
                                  name={`partnership.partnerships.[${index}].partnership_name`}
                                  label="Partnership"
                                  maxLength={300}
                                  other={{
                                    value: partnership.partnership_name,
                                    error:
                                      partnershipNameMeta.touched &&
                                      Boolean(partnershipNameMeta.error),
                                    helperText:
                                      partnershipNameMeta.touched && partnershipNameMeta.error,
                                    required: partnership.partnership_type !== '' ? true : false
                                  }}
                                />
                              </Grid>
                            )}
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
                    .partnership_type ||
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
