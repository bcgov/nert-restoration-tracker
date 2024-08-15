import { expect } from 'chai';
import { doAllProjectsHaveAProjectLead, doAllProjectsHaveAProjectLeadIfUserIsRemoved } from './user-utils';

describe('doAllProjectsHaveAProjectLeadIfUserIsRemoved', () => {
  describe('user has Project Lead role', () => {
    describe('user is on 1 project', () => {
      it('should return false if the user is not the only Project Lead role', () => {
        const userId = 10;

        const rows = [
          {
            project_participation_id: 1,
            project_id: 1,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Project Lead'
          },
          {
            project_participation_id: 2,
            project_id: 1,
            system_user_id: 20,
            project_role_id: 1,
            project_role_name: 'Project Lead'
          }
        ];

        const result = doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows, userId);

        expect(result).to.equal(true);
      });

      it('should return true if the user is the only Project Lead role', () => {
        const userId = 10;

        const rows = [
          {
            project_participation_id: 1,
            project_id: 1,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Project Lead' // Only Project Lead on project 1
          },
          {
            project_participation_id: 2,
            project_id: 1,
            system_user_id: 20,
            project_role_id: 2,
            project_role_name: 'Editor'
          }
        ];

        const result = doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows, userId);

        expect(result).to.equal(false);
      });
    });

    describe('user is on multiple projects', () => {
      it('should return true if the user is not the only Project Lead on all projects', () => {
        const userId = 10;

        const rows = [
          {
            project_participation_id: 1,
            project_id: 1,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Project Lead'
          },
          {
            project_participation_id: 2,
            project_id: 1,
            system_user_id: 2,
            project_role_id: 1,
            project_role_name: 'Project Lead'
          },
          {
            project_participation_id: 1,
            project_id: 2,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Project Lead'
          },
          {
            project_participation_id: 2,
            project_id: 2,
            system_user_id: 2,
            project_role_id: 1,
            project_role_name: 'Project Lead'
          }
        ];

        const result = doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows, userId);

        expect(result).to.equal(true);
      });

      it('should return false if the user the only Project Lead on any project', () => {
        const userId = 10;

        // User is on 1 project, and is not the only Project Lead
        const rows = [
          {
            project_participation_id: 1,
            project_id: 1,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Project Lead'
          },
          {
            project_participation_id: 2,
            project_id: 1,
            system_user_id: 2,
            project_role_id: 1,
            project_role_name: 'Project Lead'
          },
          {
            project_participation_id: 1,
            project_id: 2,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Project Lead' // Only Project Lead on project 2
          },
          {
            project_participation_id: 2,
            project_id: 2,
            system_user_id: 2,
            project_role_id: 1,
            project_role_name: 'Editor'
          }
        ];

        const result = doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows, userId);

        expect(result).to.equal(false);
      });
    });
  });

  describe('user does not have Project Lead role', () => {
    describe('user is on 1 project', () => {
      it('should return true', () => {
        const userId = 10;

        const rows = [
          {
            project_participation_id: 1,
            project_id: 1,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Editor'
          },
          {
            project_participation_id: 2,
            project_id: 1,
            system_user_id: 20,
            project_role_id: 1,
            project_role_name: 'Project Lead'
          }
        ];

        const result = doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows, userId);

        expect(result).to.equal(true);
      });
    });

    describe('user is on multiple projects', () => {
      it('should return true', () => {
        const userId = 10;

        const rows = [
          {
            project_participation_id: 1,
            project_id: 1,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Editor'
          },
          {
            project_participation_id: 2,
            project_id: 1,
            system_user_id: 2,
            project_role_id: 1,
            project_role_name: 'Project Lead'
          },
          {
            project_participation_id: 1,
            project_id: 2,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Viewer'
          },
          {
            project_participation_id: 2,
            project_id: 2,
            system_user_id: 2,
            project_role_id: 1,
            project_role_name: 'Project Lead'
          }
        ];

        const result = doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows, userId);

        expect(result).to.equal(true);
      });
    });
  });

  describe('user is on no projects', () => {
    it('should return false', () => {
      const userId = 10;

      const rows = [
        {
          project_participation_id: 1,
          project_id: 1,
          system_user_id: 20,
          project_role_id: 1,
          project_role_name: 'Editor'
        },
        {
          project_participation_id: 2,
          project_id: 1,
          system_user_id: 30,
          project_role_id: 1,
          project_role_name: 'Project Lead'
        }
      ];

      const result = doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows, userId);

      expect(result).to.equal(true);
    });
  });
});

describe('doAllProjectsHaveAProjectLead', () => {
  it('should return false if no user has Project Lead role', () => {
    const rows = [
      {
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 10,
        project_role_id: 2,
        project_role_name: 'Editor'
      },
      {
        project_participation_id: 2,
        project_id: 1,
        system_user_id: 20,
        project_role_id: 2,
        project_role_name: 'Editor'
      }
    ];

    const result = doAllProjectsHaveAProjectLead(rows);

    expect(result).to.equal(false);
  });

  it('should return true if one Project Lead role exists per project', () => {
    const rows = [
      {
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 12,
        project_role_id: 1,
        project_role_name: 'Project Lead' // Only Project Lead on project 1
      },
      {
        project_participation_id: 2,
        project_id: 1,
        system_user_id: 20,
        project_role_id: 2,
        project_role_name: 'Editor'
      }
    ];

    const result = doAllProjectsHaveAProjectLead(rows);

    expect(result).to.equal(true);
  });

  it('should return true if one Project Lead exists on all projects', () => {
    const rows = [
      {
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 10,
        project_role_id: 1,
        project_role_name: 'Project Lead'
      },
      {
        project_participation_id: 2,
        project_id: 1,
        system_user_id: 2,
        project_role_id: 2,
        project_role_name: 'Editor'
      },
      {
        project_participation_id: 1,
        project_id: 2,
        system_user_id: 10,
        project_role_id: 1,
        project_role_name: 'Project Lead'
      },
      {
        project_participation_id: 2,
        project_id: 2,
        system_user_id: 2,
        project_role_id: 2,
        project_role_name: 'Editor'
      }
    ];

    const result = doAllProjectsHaveAProjectLead(rows);

    expect(result).to.equal(true);
  });

  it('should return false if no Project Lead exists on any one project', () => {
    const rows = [
      {
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 10,
        project_role_id: 1,
        project_role_name: 'Project Lead'
      },
      {
        project_participation_id: 2,
        project_id: 1,
        system_user_id: 20,
        project_role_id: 2,
        project_role_name: 'Editor'
      },
      {
        project_participation_id: 1,
        project_id: 2,
        system_user_id: 10,
        project_role_id: 2,
        project_role_name: 'Editor'
      },
      {
        project_participation_id: 2,
        project_id: 2,
        system_user_id: 20,
        project_role_id: 2,
        project_role_name: 'Editor'
      }
    ];

    const result = doAllProjectsHaveAProjectLead(rows);

    expect(result).to.equal(false);
  });
});
