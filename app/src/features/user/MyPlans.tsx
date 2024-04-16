import { mdiArrowCollapseVertical, mdiArrowExpandVertical, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { SystemRoleGuard } from 'components/security/Guards';
import { ICONS } from 'constants/misc';
import { SYSTEM_ROLE } from 'constants/roles';
import PlanListPage from 'features/projects/list/PlanListPage';
import { IPlansListProps } from 'interfaces/useProjectPlanApi.interface';
import React from 'react';
import { useCollapse } from 'react-collapsed';
import { useHistory } from 'react-router';

const MyPlans: React.FC<IPlansListProps> = (props) => {
  const { plans, drafts } = props;
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse({ defaultExpanded: true });
  const history = useHistory();

  return (
    <Card sx={{ backgroundColor: '#FFF4EB', marginBottom: '0.6rem' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography ml={1} variant="h1">
          <img src={ICONS.PLAN_ICON} width="20" height="32" alt="Plan" /> My Plans
        </Typography>
        <Box my={1} mx={1}>
          <SystemRoleGuard
            validSystemRoles={[
              SYSTEM_ROLE.SYSTEM_ADMIN,
              SYSTEM_ROLE.DATA_ADMINISTRATOR,
              SYSTEM_ROLE.PROJECT_CREATOR
            ]}>
            {isExpanded && (
              <Button
                sx={{ mr: '1rem' }}
                variant="contained"
                color="primary"
                startIcon={<Icon path={mdiPlus} size={1} />}
                onClick={() => history.push('/admin/projects/create')}
                data-testid="create-project-button">
                Create Plan
              </Button>
            )}
          </SystemRoleGuard>
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
          My BC restoration plans and related data.
        </Typography>
      </Box>

      <Box {...getCollapseProps()}>
        <Box m={1}>
          <PlanListPage plans={plans} drafts={drafts} myplan={true} />
        </Box>
      </Box>
    </Card>
  );
};

export default MyPlans;
