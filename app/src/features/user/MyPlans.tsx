import React from 'react';
import Icon from '@mdi/react';
import { mdiArrowCollapseVertical, mdiArrowExpandVertical, mdiPlus } from '@mdi/js';
import { Box, Button, Card, Typography } from '@mui/material';
import { SystemRoleGuard } from 'components/security/Guards';
import { ICONS } from 'constants/misc';
import { SYSTEM_ROLE } from 'constants/roles';
import PlanListPage from 'features/plans/PlanListPage';
import { IGetDraftsListResponse } from 'interfaces/useDraftApi.interface';
import { IGetPlanForViewResponse } from 'interfaces/usePlanApi.interface';
import { useCollapse } from 'react-collapsed';
import { useNavigate } from 'react-router-dom';
import { PlanTableI18N } from 'constants/i18n';
import { getStateCodeFromLabel, states } from 'components/workflow/StateMachine';

export interface IPlansListProps {
  plans: IGetPlanForViewResponse[];
  drafts?: IGetDraftsListResponse[];
  myplan?: boolean;
  isUserCreator?: boolean;
}

const MyPlans: React.FC<IPlansListProps> = (props) => {
  const { plans, drafts, isUserCreator } = props;
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse({ defaultExpanded: true });
  const history = useNavigate();

  let rowsPlanFilterOutArchived = plans;
  if (isUserCreator) {
    if (rowsPlanFilterOutArchived && isUserCreator) {
      rowsPlanFilterOutArchived = plans.filter(
        (plan) => plan.project.state_code != getStateCodeFromLabel(states.ARCHIVED)
      );
    }
  }

  return (
    <Card sx={{ backgroundColor: '#FFF4EB', marginBottom: '0.6rem' }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        data-testid="my_plan_header"
        role="region"
        aria-labelledby="my-plans-header">
        <Typography ml={1} variant="h1" id="my-plans-header">
          <img src={ICONS.PLAN_ICON} width="20" height="32" alt="Plan" /> My Plans
        </Typography>
        <Box my={1} mx={1}>
          <SystemRoleGuard
            validSystemRoles={[
              SYSTEM_ROLE.SYSTEM_ADMIN,
              SYSTEM_ROLE.MAINTAINER,
              SYSTEM_ROLE.PROJECT_CREATOR
            ]}>
            {isExpanded && (
              <Button
                sx={{ mr: '1rem' }}
                variant="contained"
                color="primary"
                startIcon={<Icon path={mdiPlus} size={1} aria-label="Create Plan Icon" />}
                onClick={() => history('/admin/plans/create')}
                data-testid="create-plan-button"
                aria-label="Create Plan">
                Create Plan
              </Button>
            )}
          </SystemRoleGuard>
          <Button
            color="primary"
            variant="outlined"
            disableElevation
            data-testid="hide-plans-list-button"
            aria-label={isExpanded ? 'Collapse Plans' : 'Expand Plans'}
            startIcon={
              <Icon
                path={isExpanded ? mdiArrowCollapseVertical : mdiArrowExpandVertical}
                size={1}
                aria-label={isExpanded ? 'Collapse Plans Icon' : 'Expand Plans Icon'}
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
          <PlanListPage plans={rowsPlanFilterOutArchived} drafts={drafts} myplan={true} />
        </Box>
      </Box>
    </Card>
  );
};

export default MyPlans;
