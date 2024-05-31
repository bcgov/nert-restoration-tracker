import Container from '@mui/material/Container';
import { AuthStateContext } from 'contexts/authStateContext';
import MyPlans from 'features/user/MyPlans';
import MyProjects from 'features/user/MyProjects';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetDraftsListResponse } from 'interfaces/useDraftApi.interface';
import { IGetPlanForViewResponse } from 'interfaces/usePlanApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useContext, useEffect, useState } from 'react';

const MyProjectsPlansListPage: React.FC = () => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  const restorationTrackerApi = useRestorationTrackerApi();

  const [projects, setProjects] = useState<IGetProjectForViewResponse[]>([]);
  const [plans, setPlans] = useState<IGetPlanForViewResponse[]>([]);
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

    const getPlans = async () => {
      const plansResponse = await restorationTrackerApi.plan.getPlansList();

      setIsLoading(false);
      setPlans(plansResponse);
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
      getPlans();
      getDrafts();
    }
  }, [restorationTrackerApi, isLoading, keycloakWrapper]);

  //TODO: add plans loading to list
  return (
    <Container maxWidth="xl">
      <MyProjects projects={projects} drafts={drafts} />
      <MyPlans plans={plans} drafts={drafts} />
    </Container>
  );
};

export default MyProjectsPlansListPage;
