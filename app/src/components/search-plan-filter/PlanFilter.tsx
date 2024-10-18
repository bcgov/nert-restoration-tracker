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
import PlanAdvancedFilters from './PlanAdvancedFilters';

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
    backgroundColor: '#38598a',
    textTransform: 'capitalize'
  }
};

export const PlanAdvancedFiltersInitialValues: IPlanAdvancedFilters = {
  plan_keyword: '',
  plan_name: '',
  plan_status: [],
  plan_region: [],
  plan_focus: [],
  plan_start_date: '',
  plan_end_date: '',
  plan_organizations: '',
  plan_ha_to: '',
  plan_ha_from: ''
};

export interface IPlanAdvancedFilters {
  [key: string]: string | string[] | undefined;
  plan_keyword?: string;
  plan_name?: string;
  plan_status?: string | string[];
  plan_region?: string | string[];
  plan_focus?: string | string[];
  plan_start_date?: string;
  plan_end_date?: string;
  plan_organizations?: string;
  plan_ha_to?: string;
  plan_ha_from?: string;
}

export const PlanAdvancedFiltersKeyLabels: {
  [key: string]: { label: string; codeSet?: string };
} = {
  plan_keyword: { label: 'Keyword' },
  plan_name: { label: 'Plan Name' },
  plan_status: { label: 'Status', codeSet: 'status' },
  plan_region: { label: 'Region', codeSet: 'region' },
  plan_focus: { label: 'Focus', codeSet: 'focus' },
  plan_start_date: { label: 'Start Date' },
  plan_end_date: { label: 'End Date' },
  plan_organizations: { label: 'Organization' },
  plan_ha_to: { label: 'Area To' },
  plan_ha_from: { label: 'Area From' }
};

export interface IPlanAdvancedFiltersProps {
  filterChipParams: IPlanAdvancedFilters;
  region: IMultiAutocompleteFieldOption[];
  status: IMultiAutocompleteFieldOption[];
  focus: IMultiAutocompleteFieldOption[];
  [key: string]: any; // Add index signature
}

/**
 * Plan - filters
 *
 * @return {*}
 */
const PlanFilter: React.FC<IPlanAdvancedFiltersProps> = (props) => {
  const { filterChipParams, region, status, focus } = props;

  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [isFiltersChipsOpen, setIsFiltersChipsOpen] = useState(false);

  const formikProps = useFormikContext<IPlanAdvancedFilters>();
  const { handleSubmit, handleChange, handleReset, values, setFieldValue } = formikProps;

  const handleDelete = (key: string, value: string | number) => {
    if (Array.isArray(values[key]) && values[key].length !== 1) {
      //check if chip is part of an array and deletes single array item if true
      const index = values[key].indexOf(String(value));
      values[key].splice(index, 1);
    } else {
      values[key] = PlanAdvancedFiltersInitialValues[key];
    }

    setFieldValue(key, values[key]);

    if (JSON.stringify(values) === JSON.stringify(PlanAdvancedFiltersInitialValues)) {
      //if current filters are equal to inital values, then no filters are set ....
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
    if (JSON.stringify(values) === JSON.stringify(PlanAdvancedFiltersInitialValues)) {
      return;
    }

    await handleSubmit();
    setIsAdvancedFiltersOpen(false);
    setIsFiltersChipsOpen(true);
  };

  //Filter chip collection
  useEffect(() => {
    const setInitialFilterChips = () => {
      if (filterChipParams !== PlanAdvancedFiltersInitialValues) {
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
    const filterKeyLabel = PlanAdvancedFiltersKeyLabels[key].label;
    let filterValueLabel = '';

    if (PlanAdvancedFiltersKeyLabels[key]?.codeSet) {
      const filterKeyCodeSet = props[PlanAdvancedFiltersKeyLabels[key].codeSet];

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
    <form onSubmit={handleSubmit} aria-labelledby="filter-plans-form">
      <Card role="region" aria-labelledby="filter-plans-header">
        <Box my={2} mx={3}>
          <Box mb={2}>
            <Typography variant="h2" id="filter-plans-header">
              Filter Plans
            </Typography>
          </Box>
          <Box display="flex">
            <Box flex="1 1 auto" display="flex">
              <Input
                tabIndex={0}
                sx={pageStyles.keywordSearch}
                name="plan_keyword"
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
                aria-label="Enter Keywords"
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
                aria-controls="advanced-filters">
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
                aria-label="Apply Filters">
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
                    aria-label="Clear all filters"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {isAdvancedFiltersOpen && (
            <Box my={5} id="advanced-filters">
              <PlanAdvancedFilters region={region} status={status} focus={focus} />

              <Box textAlign="right" mt={3}>
                <Button
                  type="reset"
                  variant="outlined"
                  color="primary"
                  size="medium"
                  sx={pageStyles.actionButton}
                  onClick={handleFilterReset}
                  aria-label="Reset Filters">
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

export default PlanFilter;
