import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
// import PlanFilter, {
//   IPlanAdvancedFilters
//   // PlanAdvancedFiltersInitialValues
// } from 'components/search-plan-filter/PlanFilter';
import ProjectFilter, {
  IProjectAdvancedFilters,
  ProjectAdvancedFiltersInitialValues
} from 'components/search-project-filter/ProjectFilter';
import { DialogContext } from 'contexts/dialogContext';
import { Formik, FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import useCodes from 'hooks/useCodes';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import qs from 'qs';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router';
// import PlanListPage from './list/PlanListPage';
import ProjectsListPage from './list/ProjectsListPage';

/**
 * Main Project Page
 */
const ProjectsPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const restorationTrackerApi = useRestorationTrackerApi();
  const dialogContext = useContext(DialogContext);
  const [isLoading, setIsLoading] = useState(true);

  const [projects, setProjects] = useState<IGetProjectForViewResponse[]>([]);

  const formikRef = useRef<FormikProps<IProjectAdvancedFilters>>(null);

  //collection of params from url location.search
  const collectFilterParams = useCallback((): IProjectAdvancedFilters => {
    if (location.search) {
      const urlParams = qs.parse(location.search.replace('?', ''));
      const values = {
        keyword: urlParams.keyword,
        contact_agency: urlParams.contact_agency,
        funding_agency: urlParams.funding_agency as unknown as number[],
        permit_number: urlParams.permit_number,
        species: urlParams.species,
        start_date: urlParams.start_date,
        end_date: urlParams.end_date,
        ranges: urlParams.ranges,
        region: urlParams.region
      } as IProjectAdvancedFilters;

      if (values.funding_agency === undefined) {
        values.funding_agency = [];
      }

      if (values.species === undefined) {
        values.species = [];
      }

      return values;
    }
    return ProjectAdvancedFiltersInitialValues;
  }, [location.search]);

  const [formikValues, setFormikValues] = useState<IProjectAdvancedFilters>(collectFilterParams);
  const [filterChipValues, setFilterChipValues] =
    useState<IProjectAdvancedFilters>(collectFilterParams);

  //push params to url
  const handleFilterParams = () => {
    const urlParams = qs.stringify(formikRef.current?.values);
    history.push({
      search: `?${urlParams}`
    });
  };

  const handleResetFilterParams = () => {
    history.push({
      search: ``
    });
  };

  const handleReset = async () => {
    const projectsResponse = await restorationTrackerApi.project.getProjectsList();
    setProjects(projectsResponse);
    setFormikValues(ProjectAdvancedFiltersInitialValues);
    setFilterChipValues(ProjectAdvancedFiltersInitialValues);
    handleResetFilterParams();
  };

  const handleSubmit = async () => {
    if (!formikRef?.current) {
      return;
    }

    //empty Filters
    if (
      JSON.stringify(formikRef.current.values) ===
      JSON.stringify(ProjectAdvancedFiltersInitialValues)
    ) {
      return;
    }

    try {
      setFilterChipValues(formikRef.current.values);

      const response = await restorationTrackerApi.project.getProjectsList(
        formikRef.current.values
      );

      if (!response) {
        return;
      }

      setProjects(response);
      handleFilterParams();
    } catch (error) {
      const apiError = error as APIError;
      showFilterErrorDialog({
        dialogTitle: 'Error Filtering Projects',
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

  //projects
  useEffect(() => {
    const getFilteredProjects = async () => {
      const projectsResponse = await restorationTrackerApi.project.getProjectsList(formikValues);

      setIsLoading(false);
      setProjects(projectsResponse);
    };

    if (isLoading) {
      getFilteredProjects();
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
    return <CircularProgress data-testid="project-loading" className="pageProgress" size={40} />;
  }

  return (
    <Container maxWidth="xl">
      <Box mb={2}>
        <Typography variant="h1">Projects</Typography>
        <Typography variant="body1" color="textSecondary">
          BC restoration projects and related data.
        </Typography>
      </Box>

      <Box mb={3}>
        <Formik<IProjectAdvancedFilters>
          innerRef={formikRef}
          initialValues={formikValues}
          onSubmit={handleSubmit}
          onReset={handleReset}
          enableReinitialize={true}>
          <ProjectFilter
            contact_agency={
              codes.codes.coordinator_agency?.map((item: any) => {
                return item.name;
              }) || []
            }
            funding_agency={
              codes.codes.funding_source.map((item) => {
                return { value: item.id, label: item.name };
              }) || []
            }
            ranges={
              codes.codes.ranges.map((item) => {
                return { value: item.id, label: item.name };
              }) || []
            }
            region={
              codes.codes.regions.map((item) => {
                return { value: item.id, label: item.name };
              }) || []
            }
            filterChipParams={filterChipValues}
          />
        </Formik>
      </Box>

      <ProjectsListPage projects={projects} />

      {/* <Box mt={5} mb={2}>
        <Typography variant="h1">Plans</Typography>
        <Typography variant="body1" color="textSecondary">
          BC restoration plans and related data.
        </Typography>
      </Box>

      <Box mb={3}>
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
              codes.codes.funding_source.map((item) => {
                return { value: item.id, label: item.name };
              }) || []
            }
            ranges={
              codes.codes.ranges.map((item) => {
                return { value: item.id, label: item.name };
              }) || []
            }
            region={
              codes.codes.regions.map((item) => {
                return { value: item.id, label: item.name };
              }) || []
            }
            filterChipParams={filterChipValues}
          />
        </Formik>
      </Box>

      <PlanListPage projects={projects} /> */}
    </Container>
  );
};

export default ProjectsPage;
