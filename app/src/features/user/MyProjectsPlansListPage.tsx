import Container from '@mui/material/Container';
import { AuthStateContext } from 'contexts/authStateContext';
import MyPlans from 'features/user/MyPlans';
import MyProjects from 'features/user/MyProjects';
import { useAuthStateContext } from 'hooks/useAuthStateContext';
import { useNertApi } from 'hooks/useNertApi';
import { IGetDraftsListResponse } from 'interfaces/useDraftApi.interface';
import { IGetPlanForViewResponse } from 'interfaces/usePlanApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useEffect, useState } from 'react';

const MyProjectsPlansListPage: React.FC = () => {
  const authStateContext = useAuthStateContext();
  const restorationTrackerApi = useNertApi();

  const [projects, setProjects] = useState<IGetProjectForViewResponse[]>([]);
  const [plans, setPlans] = useState<IGetPlanForViewResponse[]>([]);
  const [drafts, setDrafts] = useState<IGetDraftsListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  //projects and drafts
  useEffect(() => {
    const getProjects = async () => {
      if (
        authStateContext.nertUserWrapper.isLoading ||
        !authStateContext.nertUserWrapper.systemUserId
      ) {
        return;
      }

      const projectsResponse = await restorationTrackerApi.project.getUserProjectsList(
        authStateContext.nertUserWrapper.systemUserId
      );

      setIsLoading(false);
      setProjects(projectsResponse);
    };

    const getPlans = async () => {
      if (
        authStateContext.nertUserWrapper.isLoading ||
        !authStateContext.nertUserWrapper.systemUserId
      ) {
        return;
      }

      const plansResponse = await restorationTrackerApi.plan.getUserPlansList(
        authStateContext.nertUserWrapper.systemUserId
      );

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
  }, [restorationTrackerApi, isLoading, authStateContext]);

  //TODO: add plans loading to list
  return (
    <Container maxWidth="xl">
      <MyProjects projects={projects} drafts={drafts} />
      <MyPlans plans={plans} drafts={drafts} />
    </Container>
  );
};

export default MyProjectsPlansListPage;
