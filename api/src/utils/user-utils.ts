import { PROJECT_ROLE } from '../constants/roles';

/**
 * Given an array of project participation role objects, return true if any project has no Lead Editor role after
 * removing all rows associated with the provided `userId`. Return false otherwise.
 *
 * @param {any[]} rows
 * @param {number} userId
 * @return {*}  {boolean}
 */
export const doAllProjectsHaveAProjectLeadIfUserIsRemoved = (rows: any[], userId: number): boolean => {
  // No project with Lead Editor
  if (!rows.length) {
    return false;
  }

  const projectLeadsPerProject: { [key: string]: any } = {};

  // count how many Lead Editor roles there are per project
  rows.forEach((row) => {
    const key = row.project_id;

    if (!projectLeadsPerProject[key]) {
      projectLeadsPerProject[key] = 0;
    }

    if (row.system_user_id !== userId && row.project_role_name === PROJECT_ROLE.PROJECT_LEAD) {
      projectLeadsPerProject[key] += 1;
    }
  });

  const projectLeadCounts = Object.values(projectLeadsPerProject);

  // check if any projects would be left with no Lead Editor
  for (const count of projectLeadCounts) {
    if (!count) {
      // found a project with no Lead Editor
      return false;
    }
  }

  // all projects have a Lead Editor
  return true;
};

/**
 * Given an array of project participation role objects, return false if any project has no Lead Editor role. Return
 * true otherwise.
 *
 * @param {any[]} rows
 * @return {*}  {boolean}
 */
export const doAllProjectsHaveAProjectLead = (rows: any[]): boolean => {
  // No project with Lead Editor
  if (!rows.length) {
    return false;
  }

  const projectLeadsPerProject: { [key: string]: any } = {};

  // count how many Lead Editor roles there are per project
  rows.forEach((row) => {
    const key = row.project_id;

    if (!projectLeadsPerProject[key]) {
      projectLeadsPerProject[key] = 0;
    }

    if (row.project_role_name === PROJECT_ROLE.PROJECT_LEAD) {
      projectLeadsPerProject[key] += 1;
    }
  });

  const projectLeadCounts = Object.values(projectLeadsPerProject);

  // check if any projects would be left with no Lead Editor
  for (const count of projectLeadCounts) {
    if (!count) {
      // found a project with no Lead Editor
      return false;
    }
  }

  // all projects have a Lead Editor
  return true;
};
