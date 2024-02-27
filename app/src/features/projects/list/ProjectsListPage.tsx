import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import { Theme } from '@mui/material/styles';
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
import { DownloadEMLI18N } from 'constants/i18n';
import { ProjectStatusType } from 'constants/misc';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetDraftsListResponse } from 'interfaces/useDraftApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import moment from 'moment';
import React, { useContext } from 'react';
import { useHistory } from 'react-router';
import { getFormattedDate, triggerFileDownload } from 'utils/Utils';

const useStyles = makeStyles((theme: Theme) => ({
  linkButton: {
    textAlign: 'left'
  },
  chip: {
    color: 'white'
  },
  chipActive: {
    backgroundColor: theme.palette.success.main
  },
  chipPublishedCompleted: {
    backgroundColor: theme.palette.success.main
  },
  chipDraft: {
    backgroundColor: theme.palette.info.main
  }
}));

export interface IProjectsListProps {
  projects: IGetProjectForViewResponse[];
  drafts?: IGetDraftsListResponse[];
}

const ProjectsListPage: React.FC<IProjectsListProps> = (props) => {
  const { projects, drafts } = props;

  const history = useHistory();
  const classes = useStyles();

  const dialogContext = useContext(DialogContext);

  const restorationTrackerApi = useRestorationTrackerApi();

  const getProjectStatusType = (projectData: IGetProjectForViewResponse): ProjectStatusType => {
    if (projectData.project.end_date && moment(projectData.project.end_date).endOf('day').isBefore(moment())) {
      return ProjectStatusType.COMPLETED;
    }

    return ProjectStatusType.ACTIVE;
  };

  const getChipIcon = (statusType: ProjectStatusType) => {
    let chipLabel;
    let chipStatusClass;

    if (ProjectStatusType.ACTIVE === statusType) {
      chipLabel = 'Active';
      chipStatusClass = classes.chipActive;
    } else if (ProjectStatusType.COMPLETED === statusType) {
      chipLabel = 'Completed';
      chipStatusClass = classes.chipPublishedCompleted;
    } else if (ProjectStatusType.DRAFT === statusType) {
      chipLabel = 'Draft';
      chipStatusClass = classes.chipDraft;
    }

    return <Chip size="small" className={clsx(classes.chip, chipStatusClass)} label={chipLabel} />;
  };

  const handleDownloadProjectEML = async (projectId: number) => {
    let response;

    try {
      response = await restorationTrackerApi.project.downloadProjectEML(projectId);
    } catch (error) {
      dialogContext.setErrorDialog({
        dialogTitle: DownloadEMLI18N.errorTitle,
        dialogText: DownloadEMLI18N.errorText,
        dialogError: (error as APIError).message,
        dialogErrorDetails: (error as APIError).errors,
        open: true,
        onClose: () => {
          dialogContext.setErrorDialog({ open: false });
        },
        onOk: () => {
          dialogContext.setErrorDialog({ open: false });
        }
      });

      return;
    }

    triggerFileDownload(response.fileData, response.fileName);
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
                <TableCell>Permits</TableCell>
                <TableCell>Contact Agencies</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell width="105" align="left">
                  Actions
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
                      className={classes.linkButton}
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
                  <TableCell>{row.permit.permits.map((item) => item.permit_number).join(', ')}</TableCell>
                  <TableCell>{row.contact.contacts.map((item) => item.agency).join(', ')}</TableCell>
                  <TableCell>{getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.project.start_date)}</TableCell>
                  <TableCell>{getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.project.end_date)}</TableCell>
                  <TableCell>{getChipIcon(getProjectStatusType(row))}</TableCell>
                  <TableCell align="center">
                    <Box my={-1}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        title="Download project metadata"
                        aria-label="download project metadata"
                        data-testid="project-table-download-eml"
                        onClick={() => handleDownloadProjectEML(row.project.project_id)}>
                        Download
                      </Button>
                    </Box>
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
