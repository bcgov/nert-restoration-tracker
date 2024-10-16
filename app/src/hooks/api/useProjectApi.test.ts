import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  ICreateProjectRequest,
  IEditProjectRequest,
  IGetProjectForViewResponseContact,
  IGetProjectForViewResponseDetails,
  IGetProjectForViewResponseFundingData,
  IGetProjectForViewResponseLocation,
  IGetProjectForViewResponseObjectives,
  IGetProjectForViewResponsePartnerships,
  IGetProjectForViewResponsePermit,
  IGetProjectForViewResponseSpecies
} from 'interfaces/useProjectApi.interface';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import useProjectApi, { usePublicProjectApi } from './useProjectApi';
import { S3FileType } from 'constants/attachments';

describe('useProjectApi', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  const userId = 123;
  const projectId = 1;
  const attachmentId = 1;

  it('getAllUserProjectsParticipation works as expected', async () => {
    mock.onGet(`/api/user/${userId}/projects/participation/list`).reply(200, [
      {
        project_id: 321,
        name: 'test',
        system_user_id: 1,
        project_role_id: 2,
        project_participation_id: 3
      }
    ]);

    const result = await useProjectApi(axios).getAllUserProjectsParticipation(123);

    expect(result[0]).toEqual({
      project_id: 321,
      name: 'test',
      system_user_id: 1,
      project_role_id: 2,
      project_participation_id: 3
    });
  });

  it('getUserProjectsList works as expected', async () => {
    mock.onGet(`/api/user/${userId}/projects/list`).reply(200, [
      {
        project: {
          project_id: 1
        }
      }
    ]);

    const result = await useProjectApi(axios).getUserProjectsList(123);

    expect(result[0]).toEqual({
      project: {
        project_id: 1
      }
    });
  });

  it('deleteProject works as expected', async () => {
    mock.onDelete(`/api/project/${projectId}/delete`).reply(200, true);

    const result = await useProjectApi(axios).deleteProject(projectId);

    expect(result).toEqual(true);
  });

  it('deleteProjectAttachment works as expected', async () => {
    mock.onDelete(`/api/project/${projectId}/attachments/${attachmentId}/delete`).reply(200, 1);

    const result = await useProjectApi(axios).deleteProjectAttachment(projectId, attachmentId);

    expect(result).toEqual(1);
  });

  it('getProjectsList works as expected', async () => {
    const response = [
      {
        id: 1,
        name: 'project name',
        objectives: 'objectives',
        start_date: '2020/04/04',
        end_date: '2020/05/05',
        focal_species_name_list: 'focal'
      }
    ];

    mock.onGet(`/api/project/list`).reply(200, response);

    const result = await useProjectApi(axios).getProjectsList();

    expect(result).toEqual(response);
  });

  it('getProjectById works as expected', async () => {
    mock.onGet(`/api/project/${projectId}/view`).reply(200, getProjectForViewResponse);

    const result = await useProjectApi(axios).getProjectById(projectId);

    expect(result).toEqual(getProjectForViewResponse);
  });

  it('uploadProjectAttachments works as expected', async () => {
    const file = new File(['foo'], 'foo.txt', {
      type: 'text/plain'
    });

    mock.onPost(`/api/project/${projectId}/attachments/upload`).reply(200, 'result 1');

    const result = await useProjectApi(axios).uploadProjectAttachments(
      projectId,
      file,
      S3FileType.ATTACHMENTS
    );

    expect(result).toEqual('result 1');
  });

  it('createProject works as expected', async () => {
    const projectData = {
      project: { project_image: undefined, image_url: undefined, image_key: undefined }
    } as unknown as ICreateProjectRequest;

    mock.onPost('/api/project/create').reply(200, {
      id: 1
    });

    const result = await useProjectApi(axios).createProject(projectData);

    expect(result).toEqual({ id: 1 });
  });

  it('getProjectParticipants works as expected', async () => {
    const mockResponse = { participants: [] };
    mock.onGet(`/api/project/${projectId}/participants/get`).reply(200, mockResponse);

    const result = await useProjectApi(axios).getProjectParticipants(projectId);

    expect(result).toEqual(mockResponse);
  });

  it('addProjectParticipants works as expected', async () => {
    mock.onPost(`/api/project/${projectId}/participants/create`).reply(200);

    const result = await useProjectApi(axios).addProjectParticipants(projectId, [
      { userIdentifier: 'user1', identitySource: 'idir', roleId: 1 }
    ]);

    expect(result).toEqual(true);
  });

  it('removeProjectParticipant works as expected', async () => {
    const projectParticipationId = 1;

    mock
      .onDelete(`/api/project/${projectId}/participants/${projectParticipationId}/delete`)
      .reply(200);

    const result = await useProjectApi(axios).removeProjectParticipant(
      projectId,
      projectParticipationId
    );

    expect(result).toEqual(true);
  });

  it('removeProjectParticipant works as expected', async () => {
    const projectParticipationId = 1;
    const projectRoleId = 1;

    mock
      .onPut(`/api/project/${projectId}/participants/${projectParticipationId}/update`)
      .reply(200);

    const result = await useProjectApi(axios).updateProjectParticipantRole(
      projectId,
      projectParticipationId,
      projectRoleId
    );

    expect(result).toEqual(true);
  });

  it('updateProject works as expected', async () => {
    const mockResponse = [{ id: 1 }];
    mock.onPut(`/api/project/${projectId}/update`).reply(200, mockResponse);
    mock
      .onDelete(`/api/project/${projectId}/attachments/thumbnail/delete`)
      .reply(200, mockResponse);

    const newProjectData = {
      project: {} as IGetProjectForViewResponseDetails,
      species: {} as IGetProjectForViewResponseSpecies,
      permit: {} as IGetProjectForViewResponsePermit,
      location: {} as IGetProjectForViewResponseLocation,
      contact: {} as IGetProjectForViewResponseContact,
      funding: {} as IGetProjectForViewResponseFundingData,
      partnerships: {} as IGetProjectForViewResponsePartnerships,
      objectives: {} as IGetProjectForViewResponseObjectives
    } as unknown as IEditProjectRequest;

    const result = await useProjectApi(axios).updateProject(projectId, newProjectData);

    expect(result).toEqual([{ id: 1 }]);
  });
});

describe('usePublicProjectApi', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  const projectId = 1;

  it('getProjectsList works as expected', async () => {
    const response = [
      {
        id: 1,
        name: 'project name',
        objectives: 'objectives',
        start_date: '2020/04/04',
        end_date: '2020/05/05',
        focal_species_name_list: 'focal'
      }
    ];

    mock.onGet(`/api/public/projects`).reply(200, response);

    const result = await usePublicProjectApi(axios).getProjectsList();

    expect(result).toEqual(response);
  });

  it.skip('getProjectById works as expected', async () => {
    mock.onGet(`/api/public/project/${projectId}/view`).reply(200, getProjectForViewResponse);

    const result = await usePublicProjectApi(axios).getProjectPlanForView(projectId);

    expect(result).toEqual(getProjectForViewResponse);
  });

  it('getProjectAttachments works as expected', async () => {
    mock.onGet(`/api/public/project/${projectId}/attachments/list`).reply(200, {
      attachmentsList: [
        {
          id: 1,
          fileName: 'filename',
          lastModified: '2020/04/04',
          size: 3028
        }
      ]
    });

    const result = await usePublicProjectApi(axios).getProjectAttachments(projectId);

    expect(result.attachmentsList).toEqual([
      {
        id: 1,
        fileName: 'filename',
        lastModified: '2020/04/04',
        size: 3028
      }
    ]);
  });

  it('getProjectAttachments works as expected with fileType', async () => {
    mock.onGet(`/api/project/${projectId}/attachments/list`).reply(200, {
      attachmentsList: [
        {
          id: 1,
          fileName: 'filename',
          lastModified: '2020/04/04',
          size: 3028
        }
      ]
    });

    const result = await useProjectApi(axios).getProjectAttachments(
      projectId,
      S3FileType.ATTACHMENTS
    );

    expect(result.attachmentsList).toEqual([
      {
        id: 1,
        fileName: 'filename',
        lastModified: '2020/04/04',
        size: 3028
      }
    ]);
  });
});
