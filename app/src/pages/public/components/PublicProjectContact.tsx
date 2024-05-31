import { mdiAccountCircleOutline, mdiDomain } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { IGetPlanForViewResponse } from 'interfaces/usePlanApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

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
} as const;

export interface IPublicProjectContactProps {
  projectForViewData: IGetProjectForViewResponse | IGetPlanForViewResponse;
  refresh: () => void;
}

/**
 * Project contact content for a public (published) project.
 *
 * @return {*}
 */
const PublicProjectContact: React.FC<IPublicProjectContactProps> = ({ projectForViewData }) => {
  const { contact } = projectForViewData;

  const hasContacts = contact.contacts && contact.contacts.length > 0;

  return (
    <>
      <ul style={pageStyles.projectContactList}>
        {hasContacts &&
          contact.contacts.map((contactDetails, index) => (
            <Box
              component="li"
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              key={index}
              sx={
                !contactDetails.is_public
                  ? {
                      alignItems: 'center',
                      fontWeight: 700,
                      '& .contactName, .contactEmail': {
                        display: 'none'
                      }
                    }
                  : {}
              }>
              <Box
                display="flex"
                pl={1}
                sx={
                  !contactDetails.is_public
                    ? {
                        alignItems: 'center',
                        fontWeight: 700,
                        '& .contactName, .contactEmail': {
                          display: 'none'
                        }
                      }
                    : {}
                }>
                <Icon
                  color={pageStyles.contactIcon.color}
                  path={JSON.parse(contactDetails.is_public) ? mdiAccountCircleOutline : mdiDomain}
                  size={1}
                />
                <Box ml={2}>
                  <div className="contactName">
                    <strong data-testid="contact_name">
                      {contactDetails.first_name} {contactDetails.last_name}
                    </strong>
                  </div>
                  <div className="contactEmail">
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

export default PublicProjectContact;
