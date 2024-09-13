import React from 'react';
import Icon from '@mdi/react';
import { mdiArrowCollapseVertical, mdiArrowExpandVertical, mdiPlus } from '@mdi/js';
import { Box, Button, Card, Typography } from '@mui/material';
import { SystemRoleGuard } from 'components/security/Guards';
import { ICONS } from 'constants/misc';
import { SYSTEM_ROLE } from 'constants/roles';
import ProjectsListPage from 'features/projects/list/ProjectsListPage';
import { IProjectsListProps } from 'interfaces/useProjectApi.interface';
import { useCollapse } from 'react-collapsed';
import { useNavigate } from 'react-router-dom';
import { ProjectTableI18N } from 'constants/i18n';
import { getStateCodeFromLabel, states } from 'components/workflow/StateMachine';

const MyProjects: React.FC<IProjectsListProps> = (props) => {
  const { projects, drafts, isUserCreator } = props;
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse({ defaultExpanded: true });
  const history = useNavigate();

  let rowsProjectFilterOutArchived = projects;
  if (isUserCreator) {
    if (rowsProjectFilterOutArchived && isUserCreator) {
      rowsProjectFilterOutArchived = projects.filter(
        (proj) => proj.project.state_code != getStateCodeFromLabel(states.ARCHIVED)
      );
    }
  }

  return (
    <Card sx={{ backgroundColor: '#E9FBFF', marginBottom: '0.6rem' }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        data-testid="my_projects_header">
        <Typography ml={1} variant="h1">
          <img src={ICONS.PROJECT_ICON} width="20" height="32" alt="Project" /> My Projects
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
                startIcon={<Icon path={mdiPlus} size={1} />}
                onClick={() => history('/admin/projects/create')}
                data-testid="create-project-button">
                Create Project
              </Button>
            )}
          </SystemRoleGuard>

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
          <ProjectsListPage
            projects={rowsProjectFilterOutArchived}
            drafts={drafts}
            myproject={true}
          />
        </Box>
      </Box>
    </Card>
  );
};

export default MyProjects;
