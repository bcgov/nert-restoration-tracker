import { TableI18N, ProjectTableI18N, PlanTableI18N } from 'constants/i18n';
import { useNertApi } from 'hooks/useNertApi';
import { DialogContext } from 'contexts/dialogContext';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { useContext } from 'react';
import { APIError } from 'hooks/api/useAxios';

const useProjectPlanTableUtils = function () {
  const restorationTrackerApi = useNertApi();
  const dialogContext = useContext(DialogContext);

  const changeStateCode = async (isProject: boolean, projectId: number, stateCode: number) => {
    const errorDialogProps = {
      dialogTitle: isProject ? 'Project: ' : 'Plan: ' + TableI18N.updateStateCodeErrorTitle,
      dialogText: TableI18N.updateStateCodeErrorText,
      open: false,
      onClose: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      onOk: () => {
        dialogContext.setErrorDialog({ open: false });
      }
    };

    const displayErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
      dialogContext.setErrorDialog({ ...errorDialogProps, ...textDialogProps, open: true });
    };

    try {
      let response = null;
      if (isProject) {
        response = await restorationTrackerApi.project.updateProjectStateCode(projectId, stateCode);
        return;
      }

      response = await restorationTrackerApi.plan.updatePlanStateCode(projectId, stateCode);

      if (!response) {
        displayErrorDialog();
        return;
      }
    } catch (error) {
      displayErrorDialog({
        dialogTitle: TableI18N.updateStateCodeErrorTitle,
        dialogText: TableI18N.updateStateCodeErrorText,
        dialogError: (error as APIError).message,
        dialogErrorDetails: (error as APIError).errors
      });
    }
  };

  const deleteDraft = async (isProject: boolean, draftId: number) => {
    const errorDialogProps = {
      dialogTitle: isProject ? 'Project: ' : 'Plan: ' + TableI18N.deleteDraftErrorTitle,
      dialogText: TableI18N.deleteDraftErrorText,
      open: false,
      onClose: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      onOk: () => {
        dialogContext.setErrorDialog({ open: false });
      }
    };

    const displayErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
      dialogContext.setErrorDialog({ ...errorDialogProps, ...textDialogProps, open: true });
    };

    try {
      const response = await restorationTrackerApi.draft.deleteDraft(draftId);

      if (!response) {
        displayErrorDialog();
        return;
      }
    } catch (error) {
      displayErrorDialog({
        dialogTitle: TableI18N.deleteDraftErrorTitle,
        dialogText: TableI18N.deleteDraftErrorText,
        dialogError: (error as APIError).message,
        dialogErrorDetails: (error as APIError).errors
      });
    }
  };

  const deleteProjectOrPlan = async (isProject: boolean, projectId: number) => {
    const errorDialogProps = {
      dialogTitle: isProject ? ProjectTableI18N.deleteErrorTitle : PlanTableI18N.deleteErrorTitle,
      dialogText: isProject ? ProjectTableI18N.deleteErrorText : PlanTableI18N.deleteErrorText,
      open: false,
      onClose: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      onOk: () => {
        dialogContext.setErrorDialog({ open: false });
      }
    };

    const displayErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
      dialogContext.setErrorDialog({ ...errorDialogProps, ...textDialogProps, open: true });
    };

    try {
      const response = await restorationTrackerApi.project.deleteProject(projectId);

      if (!response) {
        displayErrorDialog();
        return;
      }
    } catch (error) {
      displayErrorDialog({
        dialogTitle: isProject ? ProjectTableI18N.deleteErrorTitle : PlanTableI18N.deleteErrorTitle,
        dialogText: isProject ? ProjectTableI18N.deleteErrorText : PlanTableI18N.deleteErrorText,
        dialogError: (error as APIError).message,
        dialogErrorDetails: (error as APIError).errors
      });
    }
  };

  return { changeStateCode, deleteDraft, deleteProjectOrPlan };
};

export default useProjectPlanTableUtils;
