import { mdiArrowCollapseVertical, mdiArrowExpandVertical } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import PlanFilter, {
  IPlanAdvancedFilters,
  PlanAdvancedFiltersInitialValues
} from 'components/search-plan-filter/PlanFilter';
import { focusOptions, ICONS, planStatusOptions } from 'constants/misc';
import { DialogContext } from 'contexts/dialogContext';
import { Formik, FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useNertApi } from 'hooks/useNertApi';
import { IGetPlanForViewResponse } from 'interfaces/usePlanApi.interface';
import qs from 'qs';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useCollapse } from 'react-collapsed';
import { useLocation, useNavigate } from 'react-router-dom';
import PlanListPage from 'features/plans/PlanListPage';
import { PlanTableI18N } from 'constants/i18n';
import { useCodesContext } from 'hooks/useContext';

export default function Plans() {
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse({ defaultExpanded: false });
  const history = useNavigate();
  const location = useLocation();
  const restorationTrackerApi = useNertApi();
  const dialogContext = useContext(DialogContext);
  const [isLoading, setIsLoading] = useState(true);

  const [plans, setPlans] = useState<IGetPlanForViewResponse[]>([]);

  const formikRef = useRef<FormikProps<IPlanAdvancedFilters>>(null);

  //collection of params from url location.search
  const collectFilterParams = useCallback((): IPlanAdvancedFilters => {
    if (location.search) {
      const urlParams = qs.parse(location.search.replace('?', ''));
      const values = {
        plan_keyword: urlParams.plan_keyword,
        plan_name: urlParams.plan_name,
        plan_status: urlParams.plan_status,
        plan_region: urlParams.plan_region,
        plan_focus: urlParams.plan_focus,
        plan_start_date: urlParams.plan_start_date,
        plan_end_date: urlParams.plan_end_date,
        plan_organizations: urlParams.plan_organizations,
        plan_ha_to: urlParams.plan_ha_to,
        plan_ha_from: urlParams.plan_ha_from
      } as IPlanAdvancedFilters;

      return values;
    }
    return PlanAdvancedFiltersInitialValues;
  }, [location.search]);

  const [formikValues, setFormikValues] = useState<IPlanAdvancedFilters>(collectFilterParams);
  const [filterChipValues, setFilterChipValues] =
    useState<IPlanAdvancedFilters>(collectFilterParams);

  //push params to url
  const handleFilterParams = () => {
    const urlParams = qs.stringify(formikRef.current?.values);
    history({
      search: `?${urlParams}`
    });
  };

  const handleResetFilterParams = () => {
    history({
      search: ``
    });
  };

  const handleReset = async () => {
    const plansResponse = await restorationTrackerApi.plan.getPlansList();
    setPlans(plansResponse);
    setFormikValues(PlanAdvancedFiltersInitialValues);
    setFilterChipValues(PlanAdvancedFiltersInitialValues);
    handleResetFilterParams();
  };

  const handleSubmit = async () => {
    if (!formikRef?.current) {
      return;
    }

    //empty Filters
    if (
      JSON.stringify(formikRef.current.values) === JSON.stringify(PlanAdvancedFiltersInitialValues)
    ) {
      return;
    }

    try {
      setFilterChipValues(formikRef.current.values);

      const response = await restorationTrackerApi.plan.getPlansList(formikRef.current.values);

      if (!response) {
        return;
      }

      setPlans(response);
      handleFilterParams();
    } catch (error) {
      const apiError = error as APIError;
      showFilterErrorDialog({
        dialogTitle: 'Error Filtering Plans',
        dialogError: apiError?.message,
        dialogErrorDetails: apiError?.errors
      });
    }
  };

  const showFilterErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      onClose: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      onOk: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      ...textDialogProps,
      open: true
    });
  };

  const codes = useCodesContext().codesDataLoader;

  //plans
  useEffect(() => {
    const getFilteredPlans = async () => {
      const plansResponse = await restorationTrackerApi.plan.getPlansList(formikValues);

      setIsLoading(false);
      setPlans(plansResponse);
    };

    if (isLoading) {
      getFilteredPlans();
    }
  }, [restorationTrackerApi, isLoading, formikValues]);

  //Search Params
  useEffect(() => {
    const getParams = async () => {
      const params = await collectFilterParams();
      setFormikValues(params);
    };

    if (isLoading) {
      setIsLoading(false);
      getParams();
    }
  }, [isLoading, location.search, formikValues, collectFilterParams]);

  if (!codes.isReady || !codes.data) {
    return (
      <CircularProgress
        data-testid="plans-loading"
        className="pageProgress"
        size={40}
        role="status"
        aria-label="Loading plans"
      />
    );
  }

  return (
    <Card
      sx={{ backgroundColor: '#FFF4EB', marginBottom: '0.6rem' }}
      role="region"
      aria-labelledby="plans-list-header">
      <Box display="flex" alignItems="center" justifyContent="space-between" id="plans-list-header">
        <Typography ml={1} variant="h1">
          <img src={ICONS.PLAN_ICON} width="20" height="32" alt="Plan" /> Plans
        </Typography>
        <Box my={1} mx={1}>
          <Button
            color="primary"
            variant="outlined"
            disableElevation
            data-testid="hide-plans-list-button"
            aria-label={isExpanded ? 'Collapse plans' : 'Expand plans'}
            startIcon={
              <Icon
                path={isExpanded ? mdiArrowCollapseVertical : mdiArrowExpandVertical}
                size={1}
              />
            }
            {...getToggleProps()}>
            <strong>{isExpanded ? 'Collapse Plans' : 'Expand Plans'}</strong>
          </Button>
        </Box>
      </Box>
      <Box>
        <Typography ml={1} variant="body1" color="textSecondary">
          {PlanTableI18N.planDefinition}
        </Typography>
      </Box>

      <Box {...getCollapseProps()}>
        <Box m={1}>
          <Formik<IPlanAdvancedFilters>
            innerRef={formikRef}
            initialValues={formikValues}
            onSubmit={handleSubmit}
            onReset={handleReset}
            enableReinitialize={true}>
            <PlanFilter
              region={
                codes.data.regions.map((item: { id: string | number; name: string }) => {
                  return { value: item.id, label: item.name };
                }) || []
              }
              status={planStatusOptions}
              focus={focusOptions}
              filterChipParams={filterChipValues}
            />
          </Formik>
        </Box>
        <Box m={1}>
          <PlanListPage plans={plans} />
        </Box>
      </Box>
    </Card>
  );
}
