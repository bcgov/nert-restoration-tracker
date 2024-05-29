import { mdiAccountCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { IGetPlanForViewResponse } from 'interfaces/usePlanApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

export interface IProjectContactProps {
  projectForViewData: IGetProjectForViewResponse | IGetPlanForViewResponse;
  refresh: () => void;
}

const pageStyles = {
  projectContactList: {
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    padding: 0
  },
  contactIcon: {
    color: '#575759'
  }
};
/**
 * Project contact content for a project.
 *
 * @return {*}
 */
const ProjectContact: React.FC<IProjectContactProps> = ({ projectForViewData }) => {
  const { contact } = projectForViewData;

  const hasContacts = contact.contacts && contact.contacts.length > 0;

  return (
    <>
      <ul style={pageStyles.projectContactList}>
        {contact.contacts.map((contactDetails, index) => (
          <Box component="li" key={index} display="flex" justifyContent="space-between">
            <Box display="flex" pl={1}>
              <Icon color={pageStyles.contactIcon.color} path={mdiAccountCircleOutline} size={1} />
              <Box ml={2}>
                <div>
                  <strong data-testid="contact_name">
                    {contactDetails.first_name} {contactDetails.last_name}
                  </strong>
                </div>
                <div>
                  <Link href={'mailto:' + contactDetails.email_address}>
                    {contactDetails.email_address}
                  </Link>
                </div>
                <div>{contactDetails.agency}</div>
              </Box>
            </Box>
            <Box>
              {JSON.parse(contactDetails.is_primary) && <Chip size="small" label="PRIMARY" />}
            </Box>
          </Box>
        ))}

        {!hasContacts && (
          <li>
            <Typography variant="body2" color="textSecondary" data-testid="no_contacts">
              No Contacts
            </Typography>
          </li>
        )}
      </ul>
    </>
  );
};

export default ProjectContact;
