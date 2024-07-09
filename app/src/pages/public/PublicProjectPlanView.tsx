import CircularProgress from '@mui/material/CircularProgress';
import useCodes from 'hooks/useCodes';
import { useNertApi } from 'hooks/useNertApi';
import { IGetPlanForViewResponse } from 'interfaces/usePlanApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import PublicPlanView from 'pages/public/PublicPlanView';
import PublicProjectView from 'pages/public/PublicProjectView';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

/**
 * Determine if it is a project or a plan. If project render PublicProjectsView, if plan render PublicPlansView
 *
 * @return {*}
 */
export default function PublicProjectPlanView() {
  const urlParams: Record<string, string | number | undefined> = useParams();
  const projectPlanId = Number(urlParams['id']);

  const restorationTrackerApi = useNertApi();
  const [isLoadingProjectPlan, setIsLoadingProjectPlan] = useState(false);
  const [projectPlanDetails, setProjectPlanDetails] = useState<
    (IGetProjectForViewResponse & IGetPlanForViewResponse) | null
  >(null);

  const codes = useCodes();

  const getProjectPlan = useCallback(async () => {
    const projectPlanDetailsResponse =
      await restorationTrackerApi.public.project.getProjectPlanForView(projectPlanId);

    if (!projectPlanDetailsResponse) {
      // TODO error handling/messaging
      return;
    }

    setProjectPlanDetails(projectPlanDetailsResponse);
  }, [restorationTrackerApi.public.project, projectPlanId]);

  useEffect(() => {
    if (!isLoadingProjectPlan && !projectPlanDetails) {
      getProjectPlan();
      setIsLoadingProjectPlan(true);
    }
  }, [isLoadingProjectPlan, projectPlanDetails, getProjectPlan]);

  if (!codes.codes || !projectPlanDetails) {
    return <CircularProgress className="pageProgress" size={40} data-testid="loading_spinner" />;
  }

  const isProject = projectPlanDetails.project.is_project as boolean;

  return (
    <>
      {!isProject ? (
        <PublicPlanView plan={projectPlanDetails} codes={codes.codes} />
      ) : (
        <PublicProjectView project={projectPlanDetails} codes={codes.codes} />
      )}
    </>
  );
}
