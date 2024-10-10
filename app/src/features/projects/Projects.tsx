import { mdiArrowCollapseVertical, mdiArrowExpandVertical } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import ProjectFilter, {
  IProjectAdvancedFilters,
  ProjectAdvancedFiltersInitialValues
} from 'components/search-project-filter/ProjectFilter';
import { focusOptions, ICONS, projectStatusOptions } from 'constants/misc';
import { DialogContext } from 'contexts/dialogContext';
import { Formik, FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useNertApi } from 'hooks/useNertApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import qs from 'qs';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useCollapse } from 'react-collapsed';
import { useLocation, useNavigate } from 'react-router-dom';
import ProjectsListPage from './list/ProjectsListPage';
import { ProjectTableI18N } from 'constants/i18n';
import { useCodesContext } from 'hooks/useContext';

export default function Projects() {
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse({ defaultExpanded: false });
  const history = useNavigate();
  const location = useLocation();
  const restorationTrackerApi = useNertApi();
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
        project_name: urlParams.project_name,
        status: urlParams.status,
        region: urlParams.region,
        focus: urlParams.focus,
        start_date: urlParams.start_date,
        end_date: urlParams.end_date,
        actual_start_date: urlParams.actual_start_date,
        actual_end_date: urlParams.actual_end_date,
        objectives: urlParams.objectives,
        organizations: urlParams.organizations,
        funding_sources: urlParams.funding_sources,
        ha_to: urlParams.ha_to,
        ha_from: urlParams.ha_from,
        authorization: urlParams.authorization
      } as IProjectAdvancedFilters;

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

  const codes = useCodesContext().codesDataLoader;

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

  if (!codes.isReady || !codes.data) {
    return <CircularProgress data-testid="project-loading" className="pageProgress" size={40} />;
  }

  return (
    <Card sx={{ backgroundColor: '#E9FBFF', marginBottom: '0.6rem' }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        data-testid="projects-list-header">
        <Typography ml={1} variant="h1">
          <img src={ICONS.PROJECT_ICON} width="20" height="32" alt="Project" /> Projects
        </Typography>
        <Box my={1} mx={1}>
          <Button
            color="primary"
            variant="outlined"
            disableElevation
            data-testid="hide-projects-list-button"
            aria-label={'hide projects'}
            startIcon={
              <Icon
                path={isExpanded ? mdiArrowCollapseVertical : mdiArrowExpandVertical}
                size={1}
              />
            }
            {...getToggleProps()}>
            <strong>{isExpanded ? 'Collapse Projects' : 'Expand Projects'}</strong>
          </Button>
        </Box>
      </Box>
      <Box>
        <Typography ml={1} variant="body1" color="textSecondary">
          {ProjectTableI18N.projectDefinition}
        </Typography>
      </Box>

      <Box {...getCollapseProps()}>
        <Box m={1}>
          <Formik<IProjectAdvancedFilters>
            innerRef={formikRef}
            initialValues={formikValues}
            onSubmit={handleSubmit}
            onReset={handleReset}
            enableReinitialize={true}>
            <ProjectFilter
              region={
                codes.data.regions.map((item: { id: number; name: string }) => {
                  return { value: item.id, label: item.name };
                }) || []
              }
              status={projectStatusOptions}
              focus={focusOptions}
              filterChipParams={filterChipValues}
            />
          </Formik>
        </Box>
        <Box m={1}>
          <ProjectsListPage projects={projects} />
        </Box>
      </Box>
    </Card>
  );
}
