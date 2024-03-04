import CheckBox from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { ProjectStatusType } from 'constants/misc';
import { IGetDraftsListResponse } from 'interfaces/useDraftApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import moment from 'moment';
import React from 'react';
import { useHistory } from 'react-router';
import { getFormattedDate } from 'utils/Utils';

const pageStyles = {
  linkButton: {
    textAlign: 'left'
  },
  chipActive: {
    color: 'white',
    fontWeight: 600,
    backgroundColor: '#A2B9E2'
  },
  chipPublishedCompleted: {
    color: 'white',
    backgroundColor: '#70AD47'
  },
  chipDraft: {
    color: 'white',
    backgroundColor: '#A6A6A6'
  }
};

export interface IProjectsListProps {
  projects: IGetProjectForViewResponse[];
  drafts?: IGetDraftsListResponse[];
}

const ProjectsListPage: React.FC<IProjectsListProps> = (props) => {
  const { projects, drafts } = props;

  const history = useHistory();

  const getProjectStatusType = (projectData: IGetProjectForViewResponse): ProjectStatusType => {
    if (
      projectData.project.end_date &&
      moment(projectData.project.end_date).endOf('day').isBefore(moment())
    ) {
      return ProjectStatusType.COMPLETED;
    }

    return ProjectStatusType.ACTIVE;
  };

  const getChipIcon = (statusType: ProjectStatusType) => {
    let chipLabel;
    let chipStatusClass;

    if (ProjectStatusType.ACTIVE === statusType) {
      chipLabel = 'Active';
      chipStatusClass = pageStyles.chipActive;
    } else if (ProjectStatusType.COMPLETED === statusType) {
      chipLabel = 'Completed';
      chipStatusClass = pageStyles.chipPublishedCompleted;
    } else if (ProjectStatusType.DRAFT === statusType) {
      chipLabel = 'Draft';
      chipStatusClass = pageStyles.chipDraft;
    }

    return <Chip size="small" sx={chipStatusClass} label={chipLabel} />;
  };

  /**
   * Displays project list.
   */
  return (
    <Card>
      <Box display="flex" alignItems="center" justifyContent="space-between" p={3}>
        <Typography variant="h2">
          Found {projects?.length} {projects?.length !== 1 ? 'projects' : 'project'}
        </Typography>
      </Box>
      <Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project Name</TableCell>
                <TableCell>Authorization ref.</TableCell>
                <TableCell>Organization</TableCell>
                <TableCell>Planned Start Date</TableCell>
                <TableCell>Planned End Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell width="105" align="left">
                  <FormControlLabel
                    control={
                      <Checkbox
                        id="select_all_projects_export"
                        name="is_select_all_projects_export"
                        aria-label="Select All Projects to Export"
                        icon={<CheckBoxOutlineBlank fontSize="small" />}
                        checkedIcon={<CheckBox fontSize="small" />}
                      />
                    }
                    label={
                      <Typography noWrap variant="inherit">
                        Select All
                      </Typography>
                    }
                  />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody data-testid="project-table">
              {!drafts?.length && !projects?.length && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box display="flex" justifyContent="center">
                      No Results
                    </Box>
                  </TableCell>
                </TableRow>
              )}
              {drafts?.map((row) => (
                <TableRow key={row.id}>
                  <TableCell component="th" scope="row">
                    <Link
                      data-testid={row.name}
                      underline="always"
                      component="button"
                      sx={pageStyles.linkButton}
                      variant="body2"
                      onClick={() => history.push(`/admin/projects/create?draftId=${row.id}`)}>
                      {row.name}
                    </Link>
                  </TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell>{getChipIcon(ProjectStatusType.DRAFT)}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))}
              {projects?.map((row) => (
                <TableRow key={row.project.project_id}>
                  <TableCell component="th" scope="row">
                    <Link
                      data-testid={row.project.project_name}
                      underline="always"
                      component="button"
                      variant="body2"
                      onClick={() => history.push(`/admin/projects/${row.project.project_id}`)}>
                      {row.project.project_name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {row.permit.permits.map((item) => item.permit_number).join(', ')}
                  </TableCell>
                  <TableCell>
                    {row.contact.contacts.map((item) => item.agency).join(', ')}
                  </TableCell>
                  <TableCell>
                    {getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.project.start_date)}
                  </TableCell>
                  <TableCell>
                    {getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.project.end_date)}
                  </TableCell>
                  <TableCell>{getChipIcon(getProjectStatusType(row))}</TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Checkbox
                          icon={<CheckBoxOutlineBlank fontSize="small" />}
                          checkedIcon={<CheckBox fontSize="small" />}
                        />
                      }
                      label={<Typography variant="inherit">Export</Typography>}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Card>
  );
};

export default ProjectsListPage;
