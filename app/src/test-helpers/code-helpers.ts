import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';

export const codes: IGetAllCodeSetsResponse = {
  first_nations: [{ id: 1, name: 'First nations code' }],
  funding_source: [{ id: 1, name: 'Funding source code' }],
  investment_action_category: [{ id: 1, fs_id: 1, name: 'Investment action category' }],
  regions: [
    { id: 1, name: 'Region code' },
    { id: 2, name: 'Region code' }
  ],
  species: [{ id: 1, name: 'Species code' }],
  system_roles: [
    { id: 1, name: 'Role 1' },
    { id: 2, name: 'Role 2' }
  ],
  project_roles: [
    { id: 1, name: 'Project Role 1' },
    { id: 2, name: 'Project Role 2' }
  ],
  administrative_activity_status_type: [
    { id: 1, name: 'Pending' },
    { id: 2, name: 'Actioned' },
    { id: 3, name: 'Rejected' }
  ]
};
