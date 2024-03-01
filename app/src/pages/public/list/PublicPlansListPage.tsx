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
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { ProjectStatusType } from 'constants/misc';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetProjectsListResponse } from 'interfaces/useProjectApi.interface';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { getFormattedDate } from 'utils/Utils';

const useStyles = makeStyles(() => ({
  linkButton: {
    textAlign: 'left'
  },
  chip: {
    color: 'white'
  },
  chipActive: {
    backgroundColor: '#A2B9E2'
  },
  chipPublishedCompleted: {
    backgroundColor: '#70AD47'
  },
  chipDraft: {
    backgroundColor: '#A6A6A6'
  }
}));

const PublicPlansListPage = () => {
  const restorationTrackerApi = useRestorationTrackerApi();
  const classes = useStyles();
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

  const getChipIcon = (status_name: string) => {
    let chipLabel;
    let chipStatusClass;

    if (ProjectStatusType.ACTIVE === status_name) {
      chipLabel = 'Active';
      chipStatusClass = classes.chipActive;
    } else if (ProjectStatusType.COMPLETED === status_name) {
      chipLabel = 'Completed';
      chipStatusClass = classes.chipPublishedCompleted;
    }

    return <Chip size="small" className={clsx(classes.chip, chipStatusClass)} label={chipLabel} />;
  };

  const navigateToPublicProjectPage = (id: number) => {
    history.push(`/projects/${id}`);
  };

  return (
    <Card>
      <Box mt={1} mb={1}>
        <Typography variant="h1">Plans</Typography>
        <Typography variant="body1" color="textSecondary">
          BC restoration plans and related data.
        </Typography>
      </Box>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Plan Name</TableCell>
                <TableCell>Term</TableCell>
                <TableCell>Organization</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell width="105" align="left">
                  <FormControlLabel
                    control={
                      <Checkbox
                        id="select_all_plans_export"
                        name="is_select_all_plans_export"
                        aria-label="Select All Plans to Export"
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
                      variant="body2"
                      onClick={() => navigateToPublicProjectPage(row.id)}>
                      {row.name}
                    </Link>
                  </TableCell>
                  <TableCell>{row.permits_list}</TableCell>
                  <TableCell>{row.contact_agency_list}</TableCell>
                  <TableCell>{getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.start_date)}</TableCell>
                  <TableCell>{getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.end_date)}</TableCell>
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

export default PublicPlansListPage;
