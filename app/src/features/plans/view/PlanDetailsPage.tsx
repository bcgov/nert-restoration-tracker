import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import ProjectContact from 'features/projects/view/components/ProjectContact';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetPlanForViewResponse } from 'interfaces/usePlanApi.interface';
import PublicProjectContact from 'pages/public/components/PublicProjectContact';
import React from 'react';
import PlanGeneralInformation from './components/PlanGeneralInformation';
import { ProjectRoleGuard } from 'components/security/Guards';

export interface IPlanDetailsProps {
  planForViewData: IGetPlanForViewResponse;
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
  planMetadata: {
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
      }
    }
  }
};

/**
 * Additional plan details content.
 *
 * @return {*}
 */
const PlanDetailsPage: React.FC<IPlanDetailsProps> = (props) => {
  const { planForViewData, codes } = props;
  const refresh = () => {};

  return (
    <Box sx={pageStyles.planMetadata} py={1} px={2}>
      <Box mb={2}>
        <Typography variant="h2">Additional Plan Details</Typography>
      </Box>

      <Box mt={2}>
        <Chip
          sx={pageStyles.secTitle}
          label="General Information"
          size="medium"
          data-testid="PlanGeneralInfoTitle"
        />
        <PlanGeneralInformation planForViewData={planForViewData} codes={codes} />
      </Box>
      <Divider />
      <Box mt={2}>
        <Chip
          sx={pageStyles.secTitle}
          label="Plan Contacts"
          size="medium"
          data-testid="PlanContactsTitle"
        />
        <ProjectRoleGuard
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.MAINTAINER]}
          validProjectRoles={[
            PROJECT_ROLE.PROJECT_LEAD,
            PROJECT_ROLE.PROJECT_EDITOR,
            PROJECT_ROLE.PROJECT_VIEWER
          ]}
          validProjectPermissions={[]}
          fallback={
            <PublicProjectContact projectForViewData={planForViewData} refresh={refresh} />
          }>
          <ProjectContact projectForViewData={planForViewData} refresh={refresh} />
        </ProjectRoleGuard>
      </Box>
    </Box>
  );
};

export default PlanDetailsPage;
