import { mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from "@mdi/js";
import Icon from "@mdi/react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Paper from "@mui/material/Paper";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import EditDialog from "../../../components/dialog/EditDialog";
import { IMultiAutocompleteFieldOption } from "../../../components/fields/MultiAutocompleteFieldVariableSize";
import { DATE_FORMAT } from "../../../constants/dateTimeFormats";
import { AddFundingI18N } from "../../../constants/i18n";
import { FieldArray, useFormikContext } from "formik";
import React, { useState } from "react";
import {
  getFormattedAmount,
  getFormattedDateRangeString,
} from "../../../utils/Utils";
import yup from "../../../utils/YupSchema";
import ProjectFundingItemForm, {
  IProjectFundingFormArrayItem,
  ProjectFundingFormArrayItemInitialValues,
  ProjectFundingFormArrayItemYupSchema,
} from "./ProjectFundingItemForm";

export interface IProjectFundingForm {
  funding: {
    fundingSources: IProjectFundingFormArrayItem[];
  };
}

export const ProjectFundingFormInitialValues: IProjectFundingForm = {
  funding: {
    fundingSources: [],
  },
};

export const ProjectFundingFormYupSchema = yup.object().shape({
  funding: yup.object().shape({
    fundingSources: yup.array().of(ProjectFundingFormArrayItemYupSchema),
  }),
});

export interface IInvestmentActionCategoryOption
  extends IMultiAutocompleteFieldOption {
  fs_id: number;
}

export interface IProjectFundingFormProps {
  fundingSources: IMultiAutocompleteFieldOption[];
  investment_action_category: IInvestmentActionCategoryOption[];
}

const pageStyles = {
  title: {
    flexGrow: 1,
    marginRight: "1rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontWeight: 700,
  },
  titleDesc: {
    marginLeft: "0.5rem",
    fontWeight: 400,
  },
  fundingListItem: {
    padding: 0,
    "& + li": {
      marginTop: "1rem",
    },
  },
  fundingListItemInner: {
    flexGrow: 1,
    flexShrink: 1,
    overflow: "hidden",
  },
  fundingListItemToolbar: {
    paddingRight: "1rem",
  },
};

/**
 * Create project - Funding section
 *
 * @return {*}
 */
const ProjectFundingForm: React.FC<IProjectFundingFormProps> = (props) => {
  const { values } = useFormikContext<IProjectFundingForm>();

  // Tracks information about the current funding source item that is being added/edited
  const [
    currentProjectFundingFormArrayItem,
    setCurrentProjectFundingFormArrayItem,
  ] = useState({
    index: 0,
    values: ProjectFundingFormArrayItemInitialValues,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Typography component="legend">Funding Sources</Typography>

      <Box mb={3} maxWidth={"72ch"}>
        <Typography variant="body1" color="textSecondary">
          Specify all funding sources for the project.
        </Typography>
      </Box>

      <Box>
        <FieldArray
          name="funding.fundingSources"
          render={(arrayHelpers) => (
            <Box mb={2}>
              <EditDialog
                dialogTitle={AddFundingI18N.addTitle}
                open={isModalOpen}
                component={{
                  element: (
                    <ProjectFundingItemForm
                      fundingSources={props.fundingSources}
                      investment_action_category={
                        props.investment_action_category
                      }
                    />
                  ),
                  initialValues: currentProjectFundingFormArrayItem.values,
                  validationSchema: ProjectFundingFormArrayItemYupSchema,
                }}
                onCancel={() => setIsModalOpen(false)}
                onSave={(projectFundingItemValues) => {
                  if (
                    currentProjectFundingFormArrayItem.index <
                    values.funding.fundingSources.length
                  ) {
                    // Update an existing item
                    arrayHelpers.replace(
                      currentProjectFundingFormArrayItem.index,
                      projectFundingItemValues
                    );
                  } else {
                    // Add a new item
                    arrayHelpers.push(projectFundingItemValues);
                  }

                  // Close the modal
                  setIsModalOpen(false);
                }}
              />
              <List dense disablePadding>
                {!values.funding.fundingSources.length && (
                  <ListItem dense component={Paper}>
                    <Box
                      display="flex"
                      flexGrow={1}
                      justifyContent="center"
                      alignContent="middle"
                      p={2}
                    >
                      <Typography variant="subtitle2">
                        No Funding Sources
                      </Typography>
                    </Box>
                  </ListItem>
                )}
                {values.funding.fundingSources.map((fundingSource, index) => {
                  const investment_action_category_label =
                    (fundingSource.agency_id === 1 && "Investment Action") ||
                    (fundingSource.agency_id === 2 && "Investment Category") ||
                    null;

                  const investment_action_category_value =
                    props.investment_action_category.filter(
                      (item) =>
                        item.value === fundingSource.investment_action_category
                    )?.[0]?.label;

                  return (
                    <ListItem dense sx={pageStyles.fundingListItem} key={index}>
                      <Paper sx={pageStyles.fundingListItemInner}>
                        <Toolbar sx={pageStyles.fundingListItemToolbar}>
                          <Typography sx={pageStyles.title}>
                            {getCodeValueNameByID(
                              props.fundingSources,
                              fundingSource.agency_id
                            )}
                            {investment_action_category_label && (
                              <span style={pageStyles.titleDesc}>
                                ({investment_action_category_value})
                              </span>
                            )}
                          </Typography>

                          <IconButton
                            color="primary"
                            data-testid={"edit-button-" + index}
                            title="Edit Funding Source"
                            aria-label="Edit Funding Source"
                            onClick={() => {
                              setCurrentProjectFundingFormArrayItem({
                                index: index,
                                values: values.funding.fundingSources[index],
                              });
                              setIsModalOpen(true);
                            }}
                            size="large"
                          >
                            <Icon path={mdiPencilOutline} size={1} />
                          </IconButton>
                          <IconButton
                            color="primary"
                            data-testid={"delete-button-" + index}
                            title="Remove Funding Source"
                            aria-label="Remove Funding Source"
                            onClick={() => arrayHelpers.remove(index)}
                            size="large"
                          >
                            <Icon path={mdiTrashCanOutline} size={1} />
                          </IconButton>
                        </Toolbar>
                        <Divider />
                        <Box py={2} px={3}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={4}>
                              <Typography variant="body2" color="textSecondary">
                                Agency Project ID
                              </Typography>
                              <Typography variant="body1">
                                {fundingSource.agency_project_id}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                              <Typography variant="body2" color="textSecondary">
                                Funding Amount
                              </Typography>
                              <Typography variant="body1">
                                {getFormattedAmount(
                                  fundingSource.funding_amount
                                )}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                              <Typography variant="body2" color="textSecondary">
                                Start / End Date
                              </Typography>
                              <Typography variant="body1">
                                {getFormattedDateRangeString(
                                  DATE_FORMAT.ShortMediumDateFormat,
                                  fundingSource.start_date,
                                  fundingSource.end_date
                                )}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      </Paper>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          )}
        />
      </Box>

      <Button
        variant="outlined"
        color="primary"
        title="Add Funding Source"
        aria-label="Add Funding Source"
        startIcon={<Icon path={mdiPlus} size={1}></Icon>}
        data-testid="add-funding-source-button"
        onClick={() => {
          setCurrentProjectFundingFormArrayItem({
            index: values.funding.fundingSources.length,
            values: ProjectFundingFormArrayItemInitialValues,
          });
          setIsModalOpen(true);
        }}
      >
        Add Funding Source
      </Button>
    </>
  );
};

export default ProjectFundingForm;

export const getCodeValueNameByID = (
  codeSet: IMultiAutocompleteFieldOption[],
  codeValueId: number
): string => {
  if (!codeSet?.length || !codeValueId) {
    return "";
  }

  return codeSet.find((item) => item.value === codeValueId)?.label || "";
};
