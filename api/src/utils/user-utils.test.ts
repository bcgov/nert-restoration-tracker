import { expect } from 'chai';
import { doAllProjectsHaveAProjectLead, doAllProjectsHaveAProjectLeadIfUserIsRemoved } from './user-utils';

describe('doAllProjectsHaveAProjectLeadIfUserIsRemoved', () => {
  describe('user has Lead Editor role', () => {
    describe('user is on 1 project', () => {
      it('should return false if the user is not the only Lead Editor role', () => {
        const userId = 10;

        const rows = [
          {
            project_participation_id: 1,
            project_id: 1,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Lead Editor'
          },
          {
            project_participation_id: 2,
            project_id: 1,
            system_user_id: 20,
            project_role_id: 1,
            project_role_name: 'Lead Editor'
          }
        ];

        const result = doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows, userId);

        expect(result).to.equal(true);
      });

      it('should return true if the user is the only Lead Editor role', () => {
        const userId = 10;

        const rows = [
          {
            project_participation_id: 1,
            project_id: 1,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Lead Editor' // Only Lead Editor on project 1
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
      it('should return true if the user is not the only Lead Editor on all projects', () => {
        const userId = 10;

        const rows = [
          {
            project_participation_id: 1,
            project_id: 1,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Lead Editor'
          },
          {
            project_participation_id: 2,
            project_id: 1,
            system_user_id: 2,
            project_role_id: 1,
            project_role_name: 'Lead Editor'
          },
          {
            project_participation_id: 1,
            project_id: 2,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Lead Editor'
          },
          {
            project_participation_id: 2,
            project_id: 2,
            system_user_id: 2,
            project_role_id: 1,
            project_role_name: 'Lead Editor'
          }
        ];

        const result = doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows, userId);

        expect(result).to.equal(true);
      });

      it('should return false if the user the only Lead Editor on any project', () => {
        const userId = 10;

        // User is on 1 project, and is not the only Lead Editor
        const rows = [
          {
            project_participation_id: 1,
            project_id: 1,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Lead Editor'
          },
          {
            project_participation_id: 2,
            project_id: 1,
            system_user_id: 2,
            project_role_id: 1,
            project_role_name: 'Lead Editor'
          },
          {
            project_participation_id: 1,
            project_id: 2,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Lead Editor' // Only Lead Editor on project 2
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

  describe('user does not have Lead Editor role', () => {
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
            project_role_name: 'Lead Editor'
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
            project_role_name: 'Lead Editor'
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
            project_role_name: 'Lead Editor'
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
          project_role_name: 'Lead Editor'
        }
      ];

      const result = doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows, userId);

      expect(result).to.equal(true);
    });
  });
});

describe('doAllProjectsHaveAProjectLead', () => {
  it('should return false if no user has Lead Editor role', () => {
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

  it('should return true if one Lead Editor role exists per project', () => {
    const rows = [
      {
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 12,
        project_role_id: 1,
        project_role_name: 'Lead Editor' // Only Lead Editor on project 1
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

  it('should return true if one Lead Editor exists on all projects', () => {
    const rows = [
      {
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 10,
        project_role_id: 1,
        project_role_name: 'Lead Editor'
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
        project_role_name: 'Lead Editor'
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

  it('should return false if no Lead Editor exists on any one project', () => {
    const rows = [
      {
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 10,
        project_role_id: 1,
        project_role_name: 'Lead Editor'
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
