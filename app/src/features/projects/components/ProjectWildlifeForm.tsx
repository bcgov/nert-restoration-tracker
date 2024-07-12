import { mdiArrowRight, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import ComponentDialog from 'components/dialog/ComponentDialog';
import MultiAutocompleteFieldVariableSize, {
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import { ICUN_CONSERVATION_CLASSIFICATION_REFERENCE_URL } from 'constants/misc';
import { FieldArray, useFormikContext } from 'formik';
import { useNertApi } from 'hooks/useNertApi';
import { debounce } from 'lodash-es';
import React, { useCallback, useState } from 'react';
import yup from 'utils/YupSchema';

const pageStyles = {
  iucnInputContainer: {
    overflow: 'hidden'
  },
  iucnInput: {
    width: '250px'
  },
  learnMoreBtn: {
    textDecoration: 'underline',
    lineHeight: 'auto',
    '&:hover': {
      textDecoration: 'underline'
    }
  }
};

export interface IProjectIUCNFormArrayItem {
  classification: number | null;
  subClassification1: number | null;
  subClassification2: number | null;
}

export interface IProjectWildlifeForm {
  species: {
    focal_species: number[];
  };
  iucn: {
    classificationDetails: IProjectIUCNFormArrayItem[];
  };
}

export const ProjectIUCNFormArrayItemInitialValues: IProjectIUCNFormArrayItem = {
  classification: null,
  subClassification1: null,
  subClassification2: null
};

export const ProjectWildlifeFormInitialValues: IProjectWildlifeForm = {
  species: {
    focal_species: []
  },
  iucn: {
    classificationDetails: [ProjectIUCNFormArrayItemInitialValues]
  }
};

export interface IIUCNSubClassification1Option extends IMultiAutocompleteFieldOption {
  iucn1_id: number;
}

export interface IIUCNSubClassification2Option extends IMultiAutocompleteFieldOption {
  iucn2_id: number;
}

export const ProjectIUCNFormYupSchema = yup.object().shape({
  iucn: yup.object().shape({
    classificationDetails: yup
      .array()
      .min(0)
      .of(
        yup.object().shape({
          classification: yup.number().nullable(),
          subClassification1: yup.number().nullable(),
          subClassification2: yup.number().nullable()
        })
      )
      .isUniqueIUCNClassificationDetail('IUCN Classifications must be unique')
  })
});

export interface IProjectIUCNFormProps {
  classifications: IMultiAutocompleteFieldOption[];
  subClassifications1: IIUCNSubClassification1Option[];
  subClassifications2: IIUCNSubClassification2Option[];
}

/**
 * Create project - IUCN classification section
 *
 * @return {*}
 */
const ProjectWildlifeForm: React.FC<IProjectIUCNFormProps> = (props) => {
  const { values, handleChange, getFieldMeta, errors } = useFormikContext<IProjectWildlifeForm>();

  const [openDialog, setOpenDialog] = useState(false);
  const openAttachment = async (attachment: string) => window.open(attachment);

  const restorationTrackerApi = useNertApi();

  const convertOptions = (value: any): IMultiAutocompleteFieldOption[] =>
    value.map((item: any) => {
      return { value: parseInt(item.id), label: item.label };
    });

  const handleGetInitList = async (initialvalues: number[]) => {
    const response = await restorationTrackerApi.taxonomy.getSpeciesFromIds(initialvalues);
    return convertOptions(response.searchResponse);
  };

  const handleSearch = useCallback(
    debounce(
      async (
        inputValue: string,
        existingValues: (string | number)[],
        callback: (searchedValues: IMultiAutocompleteFieldOption[]) => void
      ) => {
        const response = await restorationTrackerApi.taxonomy.searchSpecies(inputValue);
        const newOptions = convertOptions(response.searchResponse).filter(
          (item) => !existingValues.includes(item.value)
        );
        callback(newOptions);
      },
      500
    ),
    []
  );

  return (
    <>
      <Typography component="legend">Wildlife and/or Fish to Benefit from Project</Typography>
      <Box mb={3} maxWidth={'72ch'}>
        <MultiAutocompleteFieldVariableSize
          id="species.focal_species"
          label="Focal Species"
          required={false}
          type="api-search"
          getInitList={handleGetInitList}
          search={handleSearch}
        />
      </Box>

      <Typography component="legend">IUCN Conservation Actions Classifications</Typography>

      <Box mb={3} maxWidth={'72ch'}>
        <Typography variant="body1" color="textSecondary">
          Conservation actions are specific actions or sets of tasks undertaken by project staff
          designed to reach each of the project's objectives.
          <Button
            color="primary"
            sx={pageStyles.learnMoreBtn}
            data-testid="prop-dialog-btn"
            onClick={() => setOpenDialog(true)}>
            <Typography component="span">Learn more.</Typography>
          </Button>
        </Typography>
      </Box>

      <FieldArray
        name="iucn.classificationDetails"
        render={(arrayHelpers: any) => (
          <Box>
            {values.iucn.classificationDetails.map((classificationDetail, index) => {
              const classificationMeta = getFieldMeta(
                `iucn.classificationDetails.[${index}].classification`
              );
              const subClassification1Meta = getFieldMeta(
                `iucn.classificationDetails.[${index}].subClassification1`
              );
              const subClassification2Meta = getFieldMeta(
                `iucn.classificationDetails.[${index}].subClassification2`
              );

              return (
                <Box
                  display="flex"
                  alignItems="center"
                  mt={-1}
                  mb={1}
                  data-testid="iucn-classification-grid"
                  key={index}>
                  <Box display="flex" alignItems="center" sx={pageStyles.iucnInputContainer} mr={1}>
                    <Box sx={pageStyles.iucnInput} py={1}>
                      <FormControl variant="outlined" fullWidth size="small" required={false}>
                        <InputLabel id="classification">Classification</InputLabel>
                        <Select
                          id={`iucn.classificationDetails.[${index}].classification`}
                          name={`iucn.classificationDetails.[${index}].classification`}
                          labelId="classification"
                          label="Classification"
                          value={classificationDetail.classification ?? ''}
                          onChange={(e: any) => {
                            classificationDetail.subClassification1 = null;
                            classificationDetail.subClassification2 = null;
                            handleChange(e);
                          }}
                          error={classificationMeta.touched && Boolean(classificationMeta.error)}
                          inputProps={{ 'aria-label': 'Classification' }}>
                          {props.classifications.map((item: any) => (
                            <MenuItem key={item.value} value={item.value}>
                              {item.label}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText error={true}>
                          {classificationMeta.touched && classificationMeta.error}
                        </FormHelperText>
                      </FormControl>
                    </Box>

                    <Box mx={1}>
                      <Icon path={mdiArrowRight} size={0.75}></Icon>
                    </Box>

                    <Box sx={pageStyles.iucnInput} py={1}>
                      <FormControl variant="outlined" fullWidth size="small" required={false}>
                        <InputLabel id="subClassification1">Sub-classification</InputLabel>
                        <Select
                          id={`iucn.classificationDetails.[${index}].subClassification1`}
                          name={`iucn.classificationDetails.[${index}].subClassification1`}
                          labelId="subClassification1"
                          label="Sub-classification"
                          value={classificationDetail.subClassification1 ?? ''}
                          onChange={(e: any) => {
                            classificationDetail.subClassification2 = null;
                            handleChange(e);
                          }}
                          disabled={!classificationDetail.classification}
                          error={
                            subClassification1Meta.touched && Boolean(subClassification1Meta.error)
                          }
                          inputProps={{ 'aria-label': 'subClassification1' }}>
                          {props.subClassifications1
                            // Only show the sub-classification 1 categories whose iucn1_id matches the classification id
                            .filter(
                              (item: any) => item.iucn1_id === classificationDetail.classification
                            )
                            .map((item: any) => (
                              <MenuItem key={item.value} value={item.value}>
                                {item.label}
                              </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText error={true}>
                          {subClassification1Meta.touched && subClassification1Meta.error}
                        </FormHelperText>
                      </FormControl>
                    </Box>

                    <Box mx={1}>
                      <Icon path={mdiArrowRight} size={0.75}></Icon>
                    </Box>

                    <Box sx={pageStyles.iucnInput} py={1}>
                      <FormControl variant="outlined" fullWidth size="small" required={false}>
                        <InputLabel id="subClassification2">Sub-classification</InputLabel>
                        <Select
                          id={`iucn.classificationDetails.[${index}].subClassification2`}
                          name={`iucn.classificationDetails.[${index}].subClassification2`}
                          labelId="subClassification2"
                          label="Sub-classification2"
                          value={classificationDetail.subClassification2 ?? ''}
                          onChange={handleChange}
                          disabled={!classificationDetail.subClassification1}
                          error={
                            subClassification2Meta.touched && Boolean(subClassification2Meta.error)
                          }
                          inputProps={{ 'aria-label': 'subClassification2' }}>
                          {props.subClassifications2
                            // Only show the sub-classification 2 categories whose iucn1_id matches the sub-classification 1 iucn2_id
                            .filter(
                              (item: any) =>
                                item.iucn2_id === classificationDetail.subClassification1
                            )
                            .map((item: any) => (
                              <MenuItem key={item.value} value={item.value}>
                                {item.label}
                              </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText error={true}>
                          {subClassification2Meta.touched && subClassification2Meta.error}
                        </FormHelperText>
                      </FormControl>
                    </Box>
                  </Box>
                  {index >= 1 && (
                    <Box ml={0.5}>
                      <IconButton
                        data-testid="delete-icon"
                        color="primary"
                        aria-label="delete"
                        onClick={() => arrayHelpers.remove(index)}
                        size="large">
                        <Icon path={mdiTrashCanOutline} size={1} />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              );
            })}

            {errors.iucn?.classificationDetails &&
              !Array.isArray(errors.iucn?.classificationDetails) && (
                <Box pb={2}>
                  <Typography style={{ fontSize: '12px', color: '#f44336' }}>
                    {errors.iucn.classificationDetails}
                  </Typography>
                </Box>
              )}

            <Box mt={-0.5}>
              <Button
                type="button"
                variant="outlined"
                color="primary"
                startIcon={<Icon path={mdiPlus} size={1} />}
                aria-label="Add Another"
                onClick={() => arrayHelpers.push(ProjectIUCNFormArrayItemInitialValues)}>
                Add Classification
              </Button>
            </Box>
          </Box>
        )}
      />

      <ComponentDialog
        open={openDialog}
        dialogTitle="IUCN Information"
        onClose={() => setOpenDialog(false)}>
        <Typography variant="body1">
          The taxonomies presented here began with a collaborative effort between the World
          Conservation Union (IUCN) and CMP to create standard classifications of the conservation
          actions biologist and other conservation actors can take to counter threats to species and
          ecosystem conservation.
          <br></br>
          <br></br>
          This classification is designed to provide a simple, hierarchical, comprehensive,
          consistent, expandable, exclusive, and scalable classification of all conservation
          actions.
          <br></br>
          <br></br>
          The classifications are intended to:
          <ul>
            <li>Help conservation teams describe what is happening at their site.</li>
            <li>
              A common classification of conservation actions which enables practitioners to search
              a database of conservation projects and find projects using similar actions.
            </li>
            <li>
              Create general summaries or “roll-ups” for broader organizational purposes and/or use
              by senior managers, researcher, NGOs, etc. Summaries can tally the frequency of
              actions across projects at various organizational scales or be combined with other
              information for more detailed summaries.
            </li>
          </ul>
          For a detailed explanation about each classification:
          <Button
            color="primary"
            sx={pageStyles.learnMoreBtn}
            data-testid="prop-dialog-btn"
            onClick={() => openAttachment(ICUN_CONSERVATION_CLASSIFICATION_REFERENCE_URL)}>
            <Typography component="span">Download CMP Classificiations</Typography>
          </Button>
        </Typography>
      </ComponentDialog>
    </>
  );
};

export default ProjectWildlifeForm;
