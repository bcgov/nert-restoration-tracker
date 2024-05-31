import Typography from '@mui/material/Typography';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

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
    <>
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
            <Typography key={index} variant="body2" color="textSecondary" data-testid="iucn_data">
              {iucn1_name} &gt; {iucn2_name} &gt; {iucn3_name}
            </Typography>
          );
        })}

      {!hasIucnClassifications && (
        <Typography variant="body2" color="textSecondary" data-testid="no_classification">
          No Classifications
        </Typography>
      )}
    </>
  );
};

export default IUCNClassification;
