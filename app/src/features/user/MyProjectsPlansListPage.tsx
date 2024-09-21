import Container from '@mui/material/Container';
import MyPlans from 'features/user/MyPlans';
import MyProjects from 'features/user/MyProjects';
import { SYSTEM_ROLE } from 'constants/roles';
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

  const isUserCreator =
    authStateContext.nertUserWrapper.roleNames &&
    authStateContext.nertUserWrapper.roleNames.includes(SYSTEM_ROLE.PROJECT_CREATOR)
      ? true
      : false;

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

  return (
    <Container maxWidth="xl">
      <MyProjects projects={projects} drafts={drafts} isUserCreator={isUserCreator} />
      <MyPlans plans={plans} drafts={drafts} isUserCreator={isUserCreator} />
    </Container>
  );
};

export default MyProjectsPlansListPage;
