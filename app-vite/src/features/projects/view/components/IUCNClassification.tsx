import Typography from '@mui/material/Typography';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

const pageStyles = {
  projectIucnList: {
    margin: 0,
    padding: 0
  }
};

export interface IIUCNClassificationProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * IUCN Classification content for a project.
 *
 * @return {*}
 */
const IUCNClassification: React.FC<IIUCNClassificationProps> = (props) => {
  const {
    projectForViewData: { iucn }
  } = props;

  const hasIucnClassifications =
    iucn.classificationDetails && iucn.classificationDetails.length > 0;
  return (
    <ul style={pageStyles.projectIucnList}>
      {hasIucnClassifications &&
        iucn.classificationDetails.map((classificationDetail: any, index: number) => {
          const iucn1_name = props.codes.iucn_conservation_action_level_1_classification.find(
            (code) => code.id === classificationDetail.classification
          )?.name;

          const iucn2_name = props.codes.iucn_conservation_action_level_2_subclassification.find(
            (code) => code.id === classificationDetail.subClassification1
          )?.name;

          const iucn3_name = props.codes.iucn_conservation_action_level_3_subclassification.find(
            (code) => code.id === classificationDetail.subClassification2
          )?.name;

          return (
            <li key={index} data-testid="iucn_data">
              <Typography variant="body2" color="textSecondary">
                {iucn1_name} &gt; {iucn2_name} &gt; {iucn3_name}
              </Typography>
            </li>
          );
        })}

      {!hasIucnClassifications && (
        <li>
          <Typography variant="body2" color="textSecondary" data-testid="no_classification">
            No Classifications
          </Typography>
        </li>
      )}
    </ul>
  );
};

export default IUCNClassification;
