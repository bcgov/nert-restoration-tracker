import Typography from '@mui/material/Typography';
import { PartnershipTypes } from 'constants/misc';
import { useCodesContext } from 'hooks/useContext';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

export interface IPartnershipsProps {
  projectForViewData: IGetProjectForViewResponse;
  refresh: () => void;
}

/**
 * Partnerships content for a project.
 *
 * @return {*}
 */
const Partnerships: React.FC<IPartnershipsProps> = (props) => {
  const {
    projectForViewData: {
      partnership: { partnerships }
    }
  } = props;

  const codesContext = useCodesContext();

  const hasPartnerships = partnerships && partnerships.length > 0;

  if (!hasPartnerships) {
    return (
      <Typography variant="body2" color="textSecondary" data-testid="no_partnerships_data">
        No Partnerships
      </Typography>
    );
  }

  const getTypeAndName = (typeId: string, partnershipId: string) => {
    if (!codesContext.codesDataLoader.data) {
      return '';
    }

    const type = codesContext.codesDataLoader.data.partnership_type.find(
      (x) => x.id === Number(typeId)
    );

    switch (type?.name) {
      case PartnershipTypes.INDIGENOUS_PARTNER: {
        const partner = codesContext.codesDataLoader.data.first_nations.find(
          (x) => x.id === Number(partnershipId)
        );

        if (!partner) {
          return `${type?.name} - Other`;
        }

        return `${type?.name} - ${partner.name}`;
      }
      case PartnershipTypes.STAKEHOLDER_PROPONENT_PARTNER: {
        const partner = codesContext.codesDataLoader.data.partnerships.find(
          (x) => x.id === Number(partnershipId)
        );

        return `${type?.name} - ${partner?.name}`;
      }
      case PartnershipTypes.NON_GOVERNMENTAL_ORGANIZATION_PARTNER:
        return `${type?.name}`;
      default:
        return `${type?.name}`;
    }
  };

  return (
    <>
      {partnerships?.map((data, index: number) => {
        return (
          <Typography
            key={index}
            variant="body2"
            color="textSecondary"
            data-testid="partnerships_data">
            {getTypeAndName(data.partnership_type, data.partnership_ref)}{' '}
            {data.partnership_name ? `: (${data.partnership_name})` : ''}
          </Typography>
        );
      })}
    </>
  );
};

export default Partnerships;
