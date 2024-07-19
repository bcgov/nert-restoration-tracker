import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import IUCNClassification from 'features/projects/view/components/IUCNClassification';
import Partnerships from 'features/projects/view/components/Partnerships';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import PublicProjectContact from 'pages/public/components/PublicProjectContact';
import React from 'react';
import FundingSource from './components/FundingSource';
import GeneralInformation from './components/GeneralInformation';
import ProjectAuthorizations from './components/ProjectAuthorizations';
import ProjectContact from './components/ProjectContact';
import { ProjectRoleGuard } from 'components/security/Guards';

export interface IProjectDetailsProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
}

const pageStyles = {
  secTitle: {
    fontSize: '14px',
    fontWeight: 700,
    textTransform: 'uppercase',
    width: '100%',
    justifyContent: 'left'
  },
  projectMetadata: {
    '& dl, ul': {
      marginTop: '0.5rem',
      marginBottom: 0,
      borderTop: '1px solid #dddddd'
    },
    '& dl div, li': {
      paddingTop: '0.5rem',
      paddingBottom: '0.5rem',
      borderBottom: '1px solid #dddddd'
    },
    '& dd, dt': {
      display: 'inline-block',
      verticalAlign: 'top'
    },
    '& dt': {
      width: '30%'
    },
    '& dd': {
      width: '70%'
    },
    '& dd span': {
      display: 'inline'
    },
    '& ul': {
      listStyleType: 'none',
      '& dl': {
        marginTop: 0
      },
      '& dl div:last-child': {
        borderBottom: 'none'
      }
    }
  }
};

/**
 * Project details content for a project.
 *
 * @return {*}
 */
const ProjectDetailsPage: React.FC<IProjectDetailsProps> = (props) => {
  const { projectForViewData, codes } = props;
  const refresh = () => {};

  return (
    <Box sx={pageStyles.projectMetadata} pt={1} px={2}>
      <Box mb={2}>
        <Typography variant="h2">Additional Project Details</Typography>
      </Box>

      <Box mt={2}>
        <Chip
          sx={pageStyles.secTitle}
          label="General Information"
          size="medium"
          data-testid="GeneralInfoTitle"
        />
        <GeneralInformation
          projectForViewData={projectForViewData}
          codes={codes}
          refresh={refresh}
        />
      </Box>
      <Divider />
      <Box mt={2}>
        <Chip
          sx={pageStyles.secTitle}
          label="Project Contacts"
          size="medium"
          data-testid="ContactsTitle"
        />
        <ProjectRoleGuard
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}
          validProjectRoles={[
            PROJECT_ROLE.PROJECT_LEAD,
            PROJECT_ROLE.PROJECT_EDITOR,
            PROJECT_ROLE.PROJECT_VIEWER
          ]}
          validProjectPermissions={[]}
          fallback={
            <PublicProjectContact projectForViewData={projectForViewData} refresh={refresh} />
          }>
          <ProjectContact projectForViewData={projectForViewData} refresh={refresh} />
        </ProjectRoleGuard>
      </Box>
      <Divider />
      <ProjectRoleGuard
        validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}
        validProjectRoles={[
          PROJECT_ROLE.PROJECT_LEAD,
          PROJECT_ROLE.PROJECT_EDITOR,
          PROJECT_ROLE.PROJECT_VIEWER
        ]}
        validProjectPermissions={[]}>
        <Box mt={2}>
          <Chip
            sx={pageStyles.secTitle}
            label="Authorizations"
            size="medium"
            data-testid="AuthorizationsTitle"
          />
          <ProjectAuthorizations projectForViewData={projectForViewData} refresh={refresh} />
        </Box>
      </ProjectRoleGuard>
      <Divider />
      <Box mt={2}>
        <Chip
          sx={pageStyles.secTitle}
          label="Funding Sources"
          size="medium"
          data-testid="FundingSourceTitle"
        />
        <FundingSource projectForViewData={projectForViewData} />
      </Box>
      <Divider />
      <Box mt={2}>
        <Chip
          sx={pageStyles.secTitle}
          label="Partnerships"
          size="medium"
          data-testid="PartnershipTitle"
        />
        <Partnerships projectForViewData={projectForViewData} refresh={refresh} />
      </Box>
      <Divider />
    </Box>
  );
};

export default ProjectDetailsPage;
