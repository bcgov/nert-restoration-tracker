import Icon from '@mdi/react';
import { mdiArrowDownBoldOutline } from '@mdi/js';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import React, { Fragment } from 'react';
import { ProjectTableI18N, PlanTableI18N } from 'constants/i18n';
import { getStateCodeFromLabel, getStatusStyle, states } from 'components/workflow/StateMachine';
import { focus } from 'constants/misc';

interface IPublicInfoContentProps {
  isProject: boolean;
  contentIndex: string;
}

const PublicInfoContent: React.FC<IPublicInfoContentProps> = (props) => {
  const { isProject, contentIndex } = props;

  let infoContent = null;
  if (isProject) {
    switch (contentIndex) {
      case ProjectTableI18N.focusInfo:
        infoContent = (
          <Fragment>
            <Typography mb={1}>
              For Indigenous led projects, the focus can be "Healing the Land", "Healing the People"
              or both. For other projects, the focus can be "Land Based Restoration Initiative" or
              "Cultural or Community Investment Initiative".
            </Typography>
            <Typography>
              A project requires at least 1 focus option selected and can have up to 4 options
              selected.
            </Typography>
            <TableContainer sx={{ maxHeight: 270 }}>
              <Table stickyHeader aria-label="table with sticky header">
                <TableHead>
                  <TableRow>
                    <TableCell align="left">Options</TableCell>
                    <TableCell align="left">Definition</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow hover role="checkbox" tabIndex={-1}>
                    <TableCell align="left">{focus.HEALING_THE_LAND}</TableCell>
                    <TableCell align="left">
                      Projects or activities with a primary focus in repairing / rejuvenating /
                      restoring ecosystems, plant and animal communities and the physical
                      environment, from an Indigenous perspective, that support a way of life.
                    </TableCell>
                  </TableRow>
                  <TableRow hover role="checkbox" tabIndex={-1}>
                    <TableCell align="left">{focus.HEALING_THE_PEOPLE}</TableCell>
                    <TableCell align="left">
                      Projects or activities with a primary focus in repairing / rejuvenating /
                      restoring the culture within a First Nation, including practices, ways of
                      knowing, physical and spiritual, in an individual or communal setting, which
                      are Indigenous led.
                    </TableCell>
                  </TableRow>
                  <TableRow hover role="checkbox" tabIndex={-1}>
                    <TableCell align="left">{focus.LAND_BASED_RESTOTRATION_INITIATIVE}</TableCell>
                    <TableCell align="left">
                      Projects or activities with a primary focus in repairing / rejuvenating /
                      restoring ecosystems, plant and animal communities and the physical
                      environment, which are not primarily Indigenous led.
                    </TableCell>
                  </TableRow>
                  <TableRow hover role="checkbox" tabIndex={-1}>
                    <TableCell align="left">
                      {focus.CULTURAL_OR_COMMUNITY_INVESTMENT_INITIATIVE}
                    </TableCell>
                    <TableCell align="left">
                      Projects or activities with a primary focus in supporting community and
                      cultural wellbeing, which are not primarily Indigenous led.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Fragment>
        );
        break;
      case ProjectTableI18N.statusInfo:
        infoContent = (
          <Fragment>
            <Typography mb={1}>
              Project Status is the step in the restoration project lifecycle (workflow).
            </Typography>
            <TableContainer sx={{ maxHeight: 270 }}>
              <Table stickyHeader aria-label="table with sticky header">
                <TableHead>
                  <TableRow>
                    <TableCell align="left">Lifecycle Steps</TableCell>
                    <TableCell align="left">Definitions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow hover role="checkbox" tabIndex={-1}>
                    <TableCell align="center">
                      <Box mb={1}>
                        <Chip
                          size="small"
                          sx={getStatusStyle(getStateCodeFromLabel(states.PLANNING))}
                          label={states.PLANNING}
                        />
                      </Box>
                      <Icon path={mdiArrowDownBoldOutline} size={1.4} color={'lightblue'} />
                      <Box mb={1}>
                        <Chip
                          size="small"
                          sx={getStatusStyle(getStateCodeFromLabel(states.AUTHORIZATION))}
                          label={states.AUTHORIZATION}
                        />
                      </Box>
                      <Icon path={mdiArrowDownBoldOutline} size={1.4} color={'lightblue'} />
                      <Box mb={1}>
                        <Chip
                          size="small"
                          sx={getStatusStyle(getStateCodeFromLabel(states.ACTIVE))}
                          label={states.ACTIVE}
                        />
                      </Box>
                      <Icon path={mdiArrowDownBoldOutline} size={1.4} color={'lightblue'} />
                      <Box mb={1}>
                        <Chip
                          size="small"
                          sx={getStatusStyle(getStateCodeFromLabel(states.REPORTING))}
                          label={states.REPORTING}
                        />
                      </Box>
                      <Icon path={mdiArrowDownBoldOutline} size={1.4} color={'lightblue'} />
                      <Box mb={1}>
                        <Chip
                          size="small"
                          sx={getStatusStyle(getStateCodeFromLabel(states.MONITORING))}
                          label={states.MONITORING}
                        />
                      </Box>
                      <Icon path={mdiArrowDownBoldOutline} size={1.4} color={'lightblue'} />
                      <Box mb={1}>
                        <Chip
                          size="small"
                          sx={getStatusStyle(getStateCodeFromLabel(states.REPORTING2))}
                          label={states.REPORTING2}
                        />
                      </Box>
                      <Icon path={mdiArrowDownBoldOutline} size={1.4} color={'lightblue'} />
                      <Box mb={1}>
                        <Chip
                          size="small"
                          sx={getStatusStyle(getStateCodeFromLabel(states.COMPLETED))}
                          label={states.COMPLETED}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="left">
                      <Box>
                        <Chip
                          size="small"
                          sx={getStatusStyle(getStateCodeFromLabel(states.PLANNING))}
                          label={states.PLANNING}
                        />
                        <Typography ml={0.5} variant="inherit" display="inline">
                          status, users plan/scope/design the project and edit as necessary.
                          Proposed Actual Start Date is required. Project Planning and any
                          subsequent states are visible to all users.
                        </Typography>
                      </Box>
                      <Box mt={1}>
                        <Chip
                          size="small"
                          sx={getStatusStyle(getStateCodeFromLabel(states.AUTHORIZATION))}
                          label={states.AUTHORIZATION}
                        />
                        <Typography ml={0.5} variant="inherit" display="inline">
                          status, users are getting permits and securing founds for the project.
                          Once all necessary permits and funds are secured, project is edited
                          accordingly and then moved to Active state. For flexibility this state is
                          treated as any other state, users can move the project to Active state any
                          time. The Authorization state is used only by projects tagged with the
                          “Healing the Land” decorator.
                        </Typography>
                      </Box>
                      <Box mt={1}>
                        <Chip
                          size="small"
                          sx={getStatusStyle(getStateCodeFromLabel(states.ACTIVE))}
                          label={states.ACTIVE}
                        />
                        <Typography ml={0.5} variant="inherit" display="inline">
                          status, is the start of restoration activities. Gathering relevant field
                          data to be reported.
                        </Typography>
                      </Box>
                      <Box mt={1}>
                        <Chip
                          size="small"
                          sx={getStatusStyle(getStateCodeFromLabel(states.REPORTING))}
                          label={states.REPORTING}
                        />
                        <Typography ml={0.5} variant="inherit" display="inline">
                          status, gathered field data (spatial files, images, videos, and docs) are
                          uploaded to the project.
                        </Typography>
                      </Box>
                      <Box mt={1}>
                        <Chip
                          size="small"
                          sx={getStatusStyle(getStateCodeFromLabel(states.MONITORING))}
                          label={states.MONITORING}
                        />
                        <Typography ml={0.5} variant="inherit" display="inline">
                          status, project progress is assessed, and issues are identified. Users
                          upload doc and edit project with pertinent information. If project needs
                          some repairs, touch-ups or changes it moves back to Active state with a
                          new proposed End Date for another iteration of work or moves forward to
                          Reporting2.
                        </Typography>
                      </Box>
                      <Box mt={1}>
                        <Chip
                          size="small"
                          sx={getStatusStyle(getStateCodeFromLabel(states.REPORTING2))}
                          label={states.REPORTING2}
                        />
                        <Typography ml={0.5} variant="inherit" display="inline">
                          status, is the final reporting, all project field work is done, and data
                          is consolidated via reports, docs, and maps. User moves project to
                          Completed state.
                        </Typography>
                      </Box>
                      <Box mt={1}>
                        <Chip
                          size="small"
                          sx={getStatusStyle(getStateCodeFromLabel(states.COMPLETED))}
                          label={states.COMPLETED}
                        />
                        <Typography ml={0.5} variant="inherit" display="inline">
                          status, all project work has been completed user shall enter the project
                          Actual End Date.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Fragment>
        );
        break;
      default:
        infoContent = (
          <Typography m={2} p={2}>
            Unable to find the information for project "{contentIndex}"
          </Typography>
        );
        break;
    }
  } // info for Plan
  else {
    switch (contentIndex) {
      case PlanTableI18N.focusInfo:
        infoContent = (
          <Fragment>
            <Typography mb={1}>
              For Indigenous led plans, the focus can be "Healing the Land", "Healing the People" or
              both. For other plans, the focus can be "Land Based Restoration Initiative" or
              "Cultural or Community Investment Initiative".
            </Typography>
            <Typography>
              A plan requires at least 1 focus option selected and can have up to 4 options
              selected.
            </Typography>
            <TableContainer sx={{ maxHeight: 270 }}>
              <Table stickyHeader aria-label="table with sticky header">
                <TableHead>
                  <TableRow>
                    <TableCell align="left">Options</TableCell>
                    <TableCell align="left">Definition</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow hover role="checkbox" tabIndex={-1}>
                    <TableCell align="left">{focus.HEALING_THE_LAND}</TableCell>
                    <TableCell align="left">
                      Plans or activities with a primary focus in repairing / rejuvenating /
                      restoring ecosystems, plant and animal communities and the physical
                      environment, from an Indigenous perspective, that support a way of life.
                    </TableCell>
                  </TableRow>
                  <TableRow hover role="checkbox" tabIndex={-1}>
                    <TableCell align="left">{focus.HEALING_THE_PEOPLE}</TableCell>
                    <TableCell align="left">
                      Plans or activities with a primary focus in repairing / rejuvenating /
                      restoring the culture within a First Nation, including practices, ways of
                      knowing, physical and spiritual, in an individual or communal setting, which
                      are Indigenous led.
                    </TableCell>
                  </TableRow>
                  <TableRow hover role="checkbox" tabIndex={-1}>
                    <TableCell align="left">{focus.LAND_BASED_RESTOTRATION_INITIATIVE}</TableCell>
                    <TableCell align="left">
                      Plans or activities with a primary focus in repairing / rejuvenating /
                      restoring ecosystems, plant and animal communities and the physical
                      environment, which are not primarily Indigenous led.
                    </TableCell>
                  </TableRow>
                  <TableRow hover role="checkbox" tabIndex={-1}>
                    <TableCell align="left">
                      {focus.CULTURAL_OR_COMMUNITY_INVESTMENT_INITIATIVE}
                    </TableCell>
                    <TableCell align="left">
                      Plans or activities with a primary focus in supporting community and cultural
                      wellbeing, which are not primarily Indigenous led.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Fragment>
        );
        break;
      default:
        infoContent = (
          <Typography m={2} p={2}>
            Unable to find the information for plan "{contentIndex}"
          </Typography>
        );
        break;
    }
  }

  return <Paper sx={{ overflow: 'hide' }}>{infoContent}</Paper>;
};

export default PublicInfoContent;
