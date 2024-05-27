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
import { ICONS, focusOptions, planStatusOptions } from 'constants/misc';
import { DialogContext } from 'contexts/dialogContext';
import { Formik, FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import useCodes from 'hooks/useCodes';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetPlanForViewResponse } from 'interfaces/useProjectApi.interface';
import PublicPlanListPage from 'pages/public/list/PublicPlansListPage';
import qs from 'qs';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useCollapse } from 'react-collapsed';
import { useLocation, useNavigate } from 'react-router-dom';

export default function PublicPlans() {
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse({ defaultExpanded: true });
  const history = useNavigate();
  const location = useLocation();
  const restorationTrackerApi = useRestorationTrackerApi();
  const dialogContext = useContext(DialogContext);
  const [isLoading, setIsLoading] = useState(true);

  const [plans, setPlans] = useState<IGetPlanForViewResponse[]>([]);

  const formikRef = useRef<FormikProps<IPlanAdvancedFilters>>(null);

  //collection of params from url location.search
  const collectFilterParams = useCallback((): IPlanAdvancedFilters => {
    if (location.search) {
      const urlParams = qs.parse(location.search.replace('?', ''));
      const values = {
        keyword: urlParams.keyword,
        contact_agency: urlParams.contact_agency,
        funding_agency: urlParams.funding_agency as unknown as number[],
        permit_number: urlParams.permit_number,
        start_date: urlParams.start_date,
        end_date: urlParams.end_date,
        region: urlParams.region,
        status: urlParams.status,
        focus: urlParams.focus
      } as IPlanAdvancedFilters;

      if (values.funding_agency === undefined) {
        values.funding_agency = [];
      }

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
    const plansResponse = await restorationTrackerApi.public.project.getProjectsList();
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

      const response = await restorationTrackerApi.public.project.getProjectsList(
        formikRef.current.values
      );

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

  const codes = useCodes();

  //plans
  useEffect(() => {
    const getFilteredPlans = async () => {
      const plansResponse =
        await restorationTrackerApi.public.project.getProjectsList(formikValues);

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

  if (!codes.isReady || !codes.codes) {
    return <CircularProgress data-testid="plans-loading" className="pageProgress" size={40} />;
  }

  return (
    <Card sx={{ backgroundColor: '#FFF4EB', marginBottom: '0.6rem' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography ml={1} variant="h1">
          <img src={ICONS.PLAN_ICON} width="20" height="32" alt="Plan" /> Plans
        </Typography>
        <Box my={1} mx={1}>
          <Button
            color="primary"
            variant="outlined"
            disableElevation
            data-testid="hide-plans-list-button"
            aria-label={'hide plans'}
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
          BC restoration plans and related data.
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
              contact_agency={
                codes.codes.coordinator_agency?.map((item: any) => {
                  return item.name;
                }) || []
              }
              funding_agency={
                codes.codes.funding_source.map((item: { id: any; name: any }) => {
                  return { value: item.id, label: item.name };
                }) || []
              }
              region={
                codes.codes.regions.map((item: { id: any; name: any }) => {
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
          <PublicPlanListPage plans={plans} />
        </Box>
      </Box>
    </Card>
  );
}
