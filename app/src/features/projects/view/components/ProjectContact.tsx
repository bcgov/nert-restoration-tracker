import { Grid } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
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
      {hasContacts &&
        contact.contacts.map((contactDetails, index) => (
          <Box my={1} key={index}>
            <Card
              sx={{ borderRadius: '10px' }}
              data-testid={'contact-card'}
              role="listitem"
              aria-label={`Contact ${index + 1}: ${contactDetails.first_name} ${contactDetails.last_name}`}>
              <CardHeader
                avatar={<Avatar aria-label="contact" />}
                title={`${contactDetails.first_name} ${contactDetails.last_name}`}
                subheader={
                  <Grid container>
                    <Grid item xs={6}>
                      <Link href={'mailto:' + contactDetails.email_address}>
                        {contactDetails.email_address}
                      </Link>
                      <Box>{contactDetails.phone_number}</Box>
                    </Grid>
                    <Grid item xs={6} textAlign={'center'}>
                      {contactDetails.is_primary === 'true' ? (
                        <Box>
                          <Chip size="small" label="PRIMARY" aria-label="Primary Contact" />
                        </Box>
                      ) : (
                        <></>
                      )}
                    </Grid>
                  </Grid>
                }
                data-testid="contact_name"
              />
              <CardContent sx={{ my: -2 }}>
                <Typography variant="body2" color="text.secondary">
                  <b>Organization:</b> {contactDetails.organization}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}

      {!hasContacts && (
        <Typography
          variant="body2"
          color="textSecondary"
          data-testid="no_contacts"
          aria-label="No Contacts">
          No Contacts
        </Typography>
      )}
    </>
  );
};

export default ProjectContact;
