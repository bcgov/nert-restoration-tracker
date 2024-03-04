import CheckBox from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { ProjectStatusType } from 'constants/misc';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetProjectsListResponse } from 'interfaces/useProjectApi.interface';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
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

const PublicProjectsListPage = () => {
  const restorationTrackerApi = useRestorationTrackerApi();
  const history = useHistory();

  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<IGetProjectsListResponse[]>([]);

  useEffect(() => {
    const getProjects = async () => {
      const projectsResponse = await restorationTrackerApi.public.project.getProjectsList();

      setProjects(() => {
        setIsLoading(false);
        return projectsResponse;
      });
    };

    if (isLoading) {
      getProjects();
    }
  }, [restorationTrackerApi, isLoading]);

  const getProjectStatusType = (projectData: IGetProjectsListResponse): ProjectStatusType => {
    if (projectData.end_date && moment(projectData.end_date).endOf('day').isBefore(moment())) {
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

  const navigateToPublicProjectPage = (id: number) => {
    history.push(`/projects/${id}`);
  };

  return (
    <Card>
      <Box mt={1} mb={1} sx={{ paddingTop: '20px' }}>
        <Typography variant="h1">Projects</Typography>
        <Typography variant="body1" color="textSecondary">
          BC restoration projects and related data.
        </Typography>
      </Box>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project Name</TableCell>
                <TableCell>Authorization Ref.</TableCell>
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
              {!projects?.length && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box display="flex" justifyContent="center">
                      No Results
                    </Box>
                  </TableCell>
                </TableRow>
              )}
              {projects?.map((row) => (
                <TableRow key={row.id}>
                  <TableCell component="th" scope="row">
                    <Link
                      data-testid={row.name}
                      underline="always"
                      component="button"
                      sx={pageStyles.linkButton}
                      variant="body2"
                      onClick={() => navigateToPublicProjectPage(row.id)}>
                      {row.name}
                    </Link>
                  </TableCell>
                  <TableCell>{row.permits_list}</TableCell>
                  <TableCell>{row.contact_agency_list}</TableCell>
                  <TableCell>
                    {getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.start_date)}
                  </TableCell>
                  <TableCell>
                    {getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.end_date)}
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
      </Paper>
    </Card>
  );
};

export default PublicProjectsListPage;
