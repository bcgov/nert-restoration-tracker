import Chip, { ChipProps } from "@mui/material/Chip";
import { AdministrativeActivityStatusType } from "../../constants/misc";
import React from "react";

const pageStyles = {
  chipPending: {
    color: "white",
    fontWeight: 600,
    letterSpacing: "0.02rem",
    backgroundColor: "gray",
  },
  chipActioned: {
    color: "white",
    fontWeight: 600,
    letterSpacing: "0.02rem",
    backgroundColor: "green",
  },
  chipRejected: {
    color: "white",
    fontWeight: 600,
    letterSpacing: "0.02rem",
    backgroundColor: "orange",
  },
};

export const AccessStatusChip: React.FC<{
  status: string;
  chipProps?: Partial<ChipProps>;
}> = (props) => {
  let chipLabel;
  let chipStatusClass;

  if (props.status === AdministrativeActivityStatusType.REJECTED) {
    chipLabel = "Denied";
    chipStatusClass = pageStyles.chipRejected;
  } else if (props.status === AdministrativeActivityStatusType.ACTIONED) {
    chipLabel = "Approved";
    chipStatusClass = pageStyles.chipActioned;
  } else {
    chipLabel = "Pending";
    chipStatusClass = pageStyles.chipPending;
  }

  return (
    <Chip
      size="small"
      sx={chipStatusClass}
      label={chipLabel}
      {...props.chipProps}
    />
  );
};
