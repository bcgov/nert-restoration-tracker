import { TableI18N } from 'constants/i18n';
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

  return { changeStateCode };
};

export default useProjectPlanTableUtils;
