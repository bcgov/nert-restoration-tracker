import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { RoleGuard } from 'components/security/Guards';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import ProjectContact from 'features/projects/view/components/ProjectContact';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetPlanForViewResponse } from 'interfaces/usePlanApi.interface';
import PublicProjectContact from 'pages/public/components/PublicProjectContact';
import React from 'react';
import PlanGeneralInformation from './components/PlanGeneralInformation';

export interface IPlanDetailsProps {
  planForViewData: IGetPlanForViewResponse;
  codes: IGetAllCodeSetsResponse;
}

const pageStyles = {
  projectMetadata: {
    '& section': {
      marginBottom: '3rem'
    },
    '& section:last-child': {
      marginBottom: 0
    },
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
      width: '33.333%'
    },
    '& dd': {
      width: '66.666%'
    },
    '& dd span': {
      display: 'inline'
    },
    '& h3': {
      marginBottom: '0.5rem',
      fontSize: '15px',
      fontWeight: 700,
      textTransform: 'uppercase'
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
const PlanDetailsPage: React.FC<IPlanDetailsProps> = (props) => {
  const { planForViewData, codes } = props;
  const refresh = () => {};

  return (
    <Box sx={pageStyles.projectMetadata} p={3}>
      <Box mb={3}>
        <Typography variant="h2">Plan Details</Typography>
      </Box>

      <Box component="section">
        <Typography variant="body1" component={'h3'} data-testid="GeneralInfoTitle">
          General Information
        </Typography>
        <PlanGeneralInformation planForViewData={planForViewData} codes={codes} />
      </Box>

      <Box component="section">
        <Typography variant="body1" component={'h3'} data-testid="ContactsTitle">
          Plan Contacts
        </Typography>
        <RoleGuard
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}
          validProjectRoles={[
            PROJECT_ROLE.PROJECT_LEAD,
            PROJECT_ROLE.PROJECT_EDITOR,
            PROJECT_ROLE.PROJECT_VIEWER
          ]}
          fallback={
            <PublicProjectContact projectForViewData={planForViewData} refresh={refresh} />
          }>
          <ProjectContact projectForViewData={planForViewData} refresh={refresh} />
        </RoleGuard>
      </Box>
    </Box>
  );
};

export default PlanDetailsPage;
