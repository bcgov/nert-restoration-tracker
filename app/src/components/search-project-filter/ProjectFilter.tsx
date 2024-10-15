import { mdiClose, mdiMagnify, mdiMenuDown, mdiMenuUp } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteField';
import { useFormikContext } from 'formik';
import React, { useEffect, useState } from 'react';
import ProjectAdvancedFilters from './ProjectAdvancedFilters';

const pageStyles = {
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  },
  keywordSearch: {
    height: '42px',
    flex: '1 1 auto',
    paddingLeft: '1rem',
    display: 'flex',
    alignItems: 'center',
    border: '1px solid rgba(0, 0, 0, 0.23)',
    borderRadius: '4px 0 0 4px',
    backgroundColor: '#f6f6f6',
    transition: 'all ease-out 0.25s',
    '&:hover': {
      borderColor: 'darkblue',
      boxShadow: '0 0 0 1px #003366 inset'
    },
    '&:active': {
      borderColor: 'darkblue',
      boxShadow: '0 0 0 1px #003366 inset'
    },
    '&:focus': {
      borderColor: 'darkblue',
      boxShadow: '0 0 0 1px #003366 inset'
    }
  },
  filterToggleBtn: {
    height: '100%',
    flex: '0 0 auto',
    borderRadius: '0 4px 4px 0',
    marginLeft: '-1px'
  },
  filterApplyBtn: {
    height: '100%',
    minWidth: '8rem'
  },
  chipStyle: {
    color: 'white',
    backgroundColor: '#005980',
    textTransform: 'capitalize'
  }
};

export const ProjectAdvancedFiltersInitialValues: IProjectAdvancedFilters = {
  keyword: '',
  project_name: '',
  status: [],
  region: [],
  focus: [],
  start_date: '',
  end_date: '',
  actual_start_date: '',
  actual_end_date: '',
  objectives: '',
  organizations: '',
  funding_sources: '',
  ha_to: '',
  ha_from: '',
  authorization: ''
};

export interface IProjectAdvancedFilters {
  [key: string]: string | string[] | undefined;
  keyword?: string;
  project_name?: string;
  status?: string | string[];
  region?: string | string[];
  focus?: string | string[];
  start_date?: string;
  end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  objectives?: string;
  organizations?: string;
  funding_sources?: string;
  ha_to?: string;
  ha_from?: string;
  authorization?: string;
}

export const ProjectAdvancedFiltersKeyLabels: {
  [key: string]: { label: string; codeSet?: string };
} = {
  keyword: { label: 'Keyword' },
  project_name: { label: 'Project Name' },
  status: { label: 'Status', codeSet: 'status' },
  region: { label: 'Region', codeSet: 'region' },
  focus: { label: 'Focus', codeSet: 'focus' },
  start_date: { label: 'Start Date' },
  end_date: { label: 'End Date' },
  actual_start_date: { label: 'Actual Start Date' },
  actual_end_date: { label: 'Actual End Date' },
  objectives: { label: 'Objectives' },
  organizations: { label: 'Organization' },
  funding_sources: { label: 'Funding Sources' },
  ha_to: { label: 'Area To' },
  ha_from: { label: 'Area From' },
  authorization: { label: 'Authorization Reference' }
};

export interface IProjectAdvancedFiltersProps {
  filterChipParams: IProjectAdvancedFilters;
  region: IMultiAutocompleteFieldOption[];
  status: IMultiAutocompleteFieldOption[];
  focus: IMultiAutocompleteFieldOption[];
  [key: string]: any; // Add index signature
}

/**
 * Project - filters
 *
 * @return {*}
 */
const ProjectFilter: React.FC<IProjectAdvancedFiltersProps> = (props) => {
  const { filterChipParams, region, status, focus } = props;

  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [isFiltersChipsOpen, setIsFiltersChipsOpen] = useState(false);

  const formikProps = useFormikContext<IProjectAdvancedFilters>();
  const { handleSubmit, handleChange, handleReset, values, setFieldValue } = formikProps;

  const handleDelete = (key: string, value: string | number) => {
    if (Array.isArray(values[key]) && values[key].length !== 1) {
      //check if chip is part of an array and deletes single array item if true
      const index = values[key].indexOf(String(value));
      values[key].splice(index, 1);
    } else {
      values[key] = ProjectAdvancedFiltersInitialValues[key];
    }

    setFieldValue(key, values[key]);

    if (JSON.stringify(values) === JSON.stringify(ProjectAdvancedFiltersInitialValues)) {
      //if current filters are equal to initial values, then no filters are set ....
      //then reset filter chips to closed
      handleFilterReset();
    } else {
      handleSubmit();
    }
  };

  const handleFilterReset = () => {
    setIsFiltersChipsOpen(false);
    handleReset();
  };

  const handleFilterUpdate = async () => {
    if (JSON.stringify(values) === JSON.stringify(ProjectAdvancedFiltersInitialValues)) {
      return;
    }

    await handleSubmit();
    setIsAdvancedFiltersOpen(false);
    setIsFiltersChipsOpen(true);
  };

  //Filter chip collection
  useEffect(() => {
    const setInitialFilterChips = () => {
      if (filterChipParams !== ProjectAdvancedFiltersInitialValues) {
        setIsFiltersChipsOpen(true);
      }
    };

    setInitialFilterChips();
  }, [filterChipParams]);

  const isFilterValueNotEmpty = (value: any): boolean => {
    if (Array.isArray(value)) {
      return !!value.length;
    }
    return !!value;
  };

  const getChipLabel = (key: string, value: string) => {
    const filterKeyLabel = ProjectAdvancedFiltersKeyLabels[key].label;
    let filterValueLabel = '';

    if (ProjectAdvancedFiltersKeyLabels[key]?.codeSet) {
      const filterKeyCodeSet = props[ProjectAdvancedFiltersKeyLabels[key].codeSet];

      const filterValueObject = filterKeyCodeSet.filter(
        (item: IMultiAutocompleteFieldOption) => String(item.value) === String(value)
      );

      filterValueLabel = filterValueObject[0]?.label || '';
    } else {
      filterValueLabel = value;
    }

    return (
      <>
        <strong>{filterKeyLabel}:</strong> {filterValueLabel}
      </>
    );
  };

  const getFilterChips = (key: string, value: string) => {
    const ChipArray = [];
    const filterChip = (chipValue: string) => {
      return (
        <Grid item xs="auto" key={`${key}${chipValue}`}>
          <Chip
            label={getChipLabel(key, chipValue)}
            sx={pageStyles.chipStyle}
            clickable={false}
            onDelete={() => handleDelete(key, chipValue)}
            deleteIcon={<Icon path={mdiClose} color="white" size={1} />}
            role="button"
            aria-label={`Remove filter ${getChipLabel(key, chipValue)}`}
          />
        </Grid>
      );
    };
    //TODO: Fix this function: handleDelete
    if (Array.isArray(value)) {
      value.forEach((item) => ChipArray.push(filterChip(item)));
    } else {
      ChipArray.push(filterChip(value));
    }
    return ChipArray;
  };

  return (
    <form onSubmit={handleSubmit} role="form" aria-labelledby="filter-projects-form">
      <Card>
        <Box my={2} mx={3}>
          <Box mb={2}>
            <Typography variant="h2" id="filter-projects-form">
              Filter Projects
            </Typography>
          </Box>
          <Box display="flex">
            <Box flex="1 1 auto" display="flex">
              <Input
                tabIndex={0}
                sx={pageStyles.keywordSearch}
                name="keyword"
                fullWidth
                startAdornment={
                  <InputAdornment position="start">
                    <Icon path={mdiMagnify} size={1} />
                  </InputAdornment>
                }
                disableUnderline={true}
                placeholder="Enter Keywords"
                onChange={handleChange}
                value={values.keyword}
                aria-label="Keyword search"
              />
              <Button
                sx={pageStyles.filterToggleBtn}
                size="large"
                variant="outlined"
                disableRipple={true}
                endIcon={
                  (!isAdvancedFiltersOpen && <Icon path={mdiMenuDown} size={1} />) ||
                  (isAdvancedFiltersOpen && <Icon path={mdiMenuUp} size={1} />)
                }
                onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
                aria-expanded={isAdvancedFiltersOpen}
                aria-controls="advanced-filters"
                aria-label="Toggle advanced filters">
                Advanced
              </Button>
            </Box>
            <Box flex="0 0 auto" ml={1}>
              <Button
                type="submit"
                size="large"
                variant="contained"
                color="primary"
                sx={pageStyles.filterApplyBtn}
                onClick={handleFilterUpdate}
                aria-label="Apply filters">
                Apply
              </Button>
            </Box>
          </Box>

          {isFiltersChipsOpen && (
            <Box my={2}>
              <Grid
                container
                direction="row"
                justifyContent="flex-start"
                alignItems="center"
                spacing={1}>
                <Grid item>
                  <Typography variant="h4">Filters </Typography>
                </Grid>
                {Object.entries(filterChipParams).map(
                  ([key, value]) =>
                    isFilterValueNotEmpty(value) && getFilterChips(key, value as string)
                )}
                <Grid item>
                  <Chip
                    label={'Clear all'}
                    onClick={handleFilterReset}
                    role="button"
                    aria-label="Clear all filters"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {isAdvancedFiltersOpen && (
            <Box my={5} id="advanced-filters">
              <ProjectAdvancedFilters region={region} status={status} focus={focus} />

              <Box textAlign="right" mt={3}>
                <Button
                  type="reset"
                  variant="outlined"
                  color="primary"
                  size="medium"
                  sx={pageStyles.actionButton}
                  onClick={handleFilterReset}
                  aria-label="Reset filters">
                  Reset
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Card>
    </form>
  );
};

export default ProjectFilter;
