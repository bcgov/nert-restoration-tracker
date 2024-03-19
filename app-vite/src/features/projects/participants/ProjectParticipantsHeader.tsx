import { mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import EditDialog from "../../../components/dialog/EditDialog";
import { IErrorDialogProps } from "../../../components/dialog/ErrorDialog";
import { ProjectParticipantsI18N } from "../../../constants/i18n";
import { DialogContext } from "../../../contexts/dialogContext";
import { APIError } from "../../../hooks/api/useAxios";
import { useRestorationTrackerApi } from "../../../hooks/useRestorationTrackerApi";
import { IGetAllCodeSetsResponse } from "../../../interfaces/useCodesApi.interface";
import { IGetProjectForViewResponse } from "../../../interfaces/useProjectApi.interface";
import React, { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router";
import AddProjectParticipantsForm, {
  AddProjectParticipantsFormInitialValues,
  AddProjectParticipantsFormYupSchema,
  IAddProjectParticipantsForm,
} from "./AddProjectParticipantsForm";

export interface IProjectParticipantsHeaderProps {
  projectWithDetails: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * Project Participant header for a single-project view.
 *
 * @param {*} props
 * @return {*}
 */
const ProjectParticipantsHeader: React.FC<IProjectParticipantsHeaderProps> = (
  props
) => {
  const navigate = useNavigate();
  const urlParams = useParams();
  const dialogContext = useContext(DialogContext);
  const restorationTrackerApi = useRestorationTrackerApi();

  const [openAddParticipantsDialog, setOpenAddParticipantsDialog] =
    useState(false);

  const projectId = urlParams["id"];

  const defaultErrorDialogProps: Partial<IErrorDialogProps> = {
    onClose: () => dialogContext.setErrorDialog({ open: false }),
    onOk: () => dialogContext.setErrorDialog({ open: false }),
  };

  const openErrorDialog = (errorDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      ...defaultErrorDialogProps,
      ...errorDialogProps,
      open: true,
    });
  };

  const handleAddProjectParticipantsSave = async (
    values: IAddProjectParticipantsForm
  ) => {
    try {
      const response =
        await restorationTrackerApi.project.addProjectParticipants(
          projectId,
          values.participants
        );

      if (!response) {
        openErrorDialog({
          dialogTitle: ProjectParticipantsI18N.addParticipantsErrorTitle,
          dialogText: ProjectParticipantsI18N.addParticipantsErrorText,
        });
        return;
      }

      props.refresh();
    } catch (error) {
      openErrorDialog({
        dialogTitle: ProjectParticipantsI18N.addParticipantsErrorTitle,
        dialogText: ProjectParticipantsI18N.addParticipantsErrorText,
        dialogError: (error as APIError).message,
      });
    }
  };

  return (
    <>
      <Container maxWidth="xl">
        <Box pb={3}>
          <Breadcrumbs>
            <Link
              color="primary"
              onClick={() => navigate("/admin/projects")}
              aria-current="page"
            >
              <Typography variant="body2">Projects</Typography>
            </Link>
            <Link
              color="primary"
              onClick={() =>
                navigate(
                  `/admin/projects/${props.projectWithDetails.project.project_id}`
                )
              }
              aria-current="page"
            >
              <Typography variant="body2">
                {props.projectWithDetails.project.project_name}
              </Typography>
            </Link>
            <Typography variant="body2">Project Team</Typography>
          </Breadcrumbs>
        </Box>

        <Box display="flex" justifyContent="space-between" mb={5}>
          <Typography variant="h1">Project Team</Typography>
          <Box ml={4}>
            <Button
              color="primary"
              variant="contained"
              data-testid="invite-project-users-button"
              aria-label={"Add Team Members"}
              startIcon={<Icon path={mdiPlus} size={1} />}
              onClick={() => setOpenAddParticipantsDialog(true)}
            >
              Add Team Members
            </Button>
          </Box>
        </Box>
      </Container>

      <EditDialog
        dialogTitle={"Add Team Members"}
        open={openAddParticipantsDialog}
        dialogSaveButtonLabel={"Add"}
        component={{
          element: (
            <AddProjectParticipantsForm
              project_roles={
                props.codes?.project_roles?.map((item) => {
                  return { value: item.id, label: item.name };
                }) || []
              }
            />
          ),
          initialValues: AddProjectParticipantsFormInitialValues,
          validationSchema: AddProjectParticipantsFormYupSchema,
        }}
        onCancel={() => setOpenAddParticipantsDialog(false)}
        onSave={(values) => {
          handleAddProjectParticipantsSave(values);
          setOpenAddParticipantsDialog(false);
          dialogContext.setSnackbar({
            open: true,
            snackbarMessage: (
              <Typography variant="body2" component="div">
                {values.participants.length} team{" "}
                {values.participants.length > 1 ? "members" : "member"} added.
              </Typography>
            ),
          });
        }}
      />
    </>
  );
};

export default ProjectParticipantsHeader;
