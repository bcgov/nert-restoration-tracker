import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { SystemRoleGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetDraftsListResponse } from 'interfaces/useDraftApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectPlanApi.interface';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import PlanListPage from '../projects/list/PlanListPage';
import ProjectsListPage from '../projects/list/ProjectsListPage';

const MyProjectsPlansListPage: React.FC = () => {
  const history = useHistory();

  const { keycloakWrapper } = useContext(AuthStateContext);

  const restorationTrackerApi = useRestorationTrackerApi();

  const [projects, setProjects] = useState<IGetProjectForViewResponse[]>([]);
  const [drafts, setDrafts] = useState<IGetDraftsListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  //projects and drafts
  useEffect(() => {
    const getProjects = async () => {
      if (!keycloakWrapper?.hasLoadedAllUserInfo) {
        return;
      }

      const projectsResponse = await restorationTrackerApi.project.getUserProjectsList(
        keycloakWrapper.systemUserId
      );

      setIsLoading(false);
      setProjects(projectsResponse);
    };

    const getDrafts = async () => {
      const draftsResponse = await restorationTrackerApi.draft.getDraftsList();

      setDrafts(() => {
        setIsLoading(false);
        return draftsResponse;
      });
    };

    if (isLoading) {
      getProjects();
      getDrafts();
    }
  }, [restorationTrackerApi, isLoading, keycloakWrapper]);

  return (
    <Container maxWidth="xl">
      <Box mb={2} display="flex" justifyContent="space-between">
        <Box mb={1}>
          <Typography variant="h1">My Projects</Typography>
          <Typography variant="body1" color="textSecondary">
            BC restoration projects and drafts.
          </Typography>
        </Box>
        <SystemRoleGuard
          validSystemRoles={[
            SYSTEM_ROLE.SYSTEM_ADMIN,
            SYSTEM_ROLE.DATA_ADMINISTRATOR,
            SYSTEM_ROLE.PROJECT_CREATOR
          ]}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Icon path={mdiPlus} size={1} />}
            onClick={() => history.push('/admin/projects/create')}
            data-testid="create-project-button">
            Create Project
          </Button>
        </SystemRoleGuard>
      </Box>

      <ProjectsListPage projects={projects} drafts={drafts} myproject={true} />

      <Box mt={5} mb={2} display="flex" justifyContent="space-between">
        <Box mb={1}>
          <Typography variant="h1">My Plans</Typography>
          <Typography variant="body1" color="textSecondary">
            BC restoration plans and drafts.
          </Typography>
        </Box>
        <SystemRoleGuard
          validSystemRoles={[
            SYSTEM_ROLE.SYSTEM_ADMIN,
            SYSTEM_ROLE.DATA_ADMINISTRATOR,
            SYSTEM_ROLE.PROJECT_CREATOR
          ]}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Icon path={mdiPlus} size={1} />}
            onClick={() => history.push('/admin/projects/create')}
            data-testid="create-project-button">
            Create Plan
          </Button>
        </SystemRoleGuard>
      </Box>

      <PlanListPage plans={projects} drafts={drafts} myplan={true} />
    </Container>
  );
};

export default MyProjectsPlansListPage;
