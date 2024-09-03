import SQL from 'sql-template-strings';
import { getKnex } from '../database/db';
import { DBService } from './service';

export type ProjectSearchCriteria = {
  keyword?: string;
  project_name?: string;
  status?: string | string[];
  region?: string | string[];
  focus?: string | string[];
  start_date?: string;
  end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  objectives?: string;
  organizations?: string;
  funding_sources?: string;
  ha_from?: string;
  ha_to?: string;
  authorization?: string;
};

export type PlanSearchCriteria = {
  plan_keyword?: string;
  plan_name?: string;
  plan_status?: string | string[];
  plan_region?: string | string[];
  plan_focus?: string | string[];
  plan_start_date?: string;
  plan_end_date?: string;
  plan_organizations?: string;
  plan_ha_to?: string;
  plan_ha_from?: string;
};

export class SearchService extends DBService {
  /**
   * Returns project ids based on search criteria.
   *
   * @param {ProjectSearchCriteria} criteria
   * @return {*}  {Promise<{ project_id: number }[]>}
   * @memberof SearchService
   */
  async findProjectIdsByCriteria(criteria: ProjectSearchCriteria): Promise<{ project_id: number }[]> {
    console.log('criteria', criteria);
    // track which tables we have joined with already
    const joins: string[] = [];

    const queryBuilder = getKnex<any, { project_id: number }>().select('project.project_id').from('project');

    if (criteria.keyword) {
      !joins.includes('nrm_region') &&
        queryBuilder.leftJoin('nrm_region', 'project.project_id', 'nrm_region.project_id');
      !joins.includes('objective') && queryBuilder.leftJoin('objective', 'project.project_id', 'objective.project_id');
      !joins.includes('project_contact') &&
        queryBuilder.leftJoin('project_contact', 'project.project_id', 'project_contact.project_id');
      !joins.includes('project_funding_source') &&
        queryBuilder.leftJoin('project_funding_source', 'project.project_id', 'project_funding_source.project_id');
      !joins.includes('project_spatial_component') &&
        queryBuilder.leftJoin(
          'project_spatial_component',
          'project.project_id',
          'project_spatial_component.project_id'
        );
      !joins.includes('conservation_area') &&
        queryBuilder.leftJoin('conservation_area', 'project.project_id', 'conservation_area.project_id');
      !joins.includes('permit') && queryBuilder.leftJoin('permit', 'project.project_id', 'permit.project_id');
      !joins.includes('project_partnership') &&
        queryBuilder.leftJoin('project_partnership', 'project.project_id', 'project_partnership.project_id');
      !joins.includes('partnerships') &&
        queryBuilder.leftJoin('partnerships', 'project_partnership.partnerships_id', 'partnerships.partnerships_id');
      !joins.includes('first_nations') &&
        queryBuilder.leftJoin(
          'first_nations',
          'project_partnership.first_nations_id',
          'first_nations.first_nations_id'
        );
      !joins.includes('partnership_type') &&
        queryBuilder.leftJoin(
          'partnership_type',
          'partnerships.partnership_type_id',
          'partnership_type.partnership_type_id'
        );

      joins.push(
        'nrm_region',
        'objective',
        'project_contact',
        'project_funding_source',
        'project_spatial_component',
        'conservation_area',
        'permit',
        'project_partnership',
        'partnerships',
        'first_nations',
        'partnership_type'
      );

      queryBuilder.and.where(function () {
        this.or.whereILike('project.name', `%${criteria.keyword}%`);
        this.or.whereILike('project.brief_desc', `%${criteria.keyword}%`);

        this.or.whereILike('permit.type', `%${criteria.keyword}%`);
        this.or.whereILike('permit.number', `%${criteria.keyword}%`);
        this.or.whereILike('permit.description', `%${criteria.keyword}%`);

        this.or.whereILike('project_contact.first_name', `%${criteria.keyword}%`);
        this.or.whereILike('project_contact.last_name', `%${criteria.keyword}%`);
        this.or.whereILike('project_contact.organization', `%${criteria.keyword}%`);

        this.or.whereILike('partnership_type.name', `%${criteria.keyword}%`);
        this.or.whereILike('partnerships.name', `%${criteria.keyword}%`);
        this.or.whereILike('first_nations.name', `%${criteria.keyword}%`);

        this.or.whereILike('first_nations.name', `%${criteria.keyword}%`);

        this.or.whereILike('objective.objective', `%${criteria.keyword}%`);

        this.or.whereILike('project_funding_source.organization_name', `%${criteria.keyword}%`);
        this.or.whereILike('project_funding_source.description', `%${criteria.keyword}%`);

        this.or.whereILike('conservation_area.conservation_area', `%${criteria.keyword}%`);
      });
    }

    if (criteria.project_name) {
      queryBuilder.and.whereILike('project.name', `%${criteria.project_name}%`);
    }

    if (criteria.status) {
      queryBuilder.and.whereIn(
        'project.state_code',
        (Array.isArray(criteria.status) && criteria.status.map((val) => Number(val))) || [Number(criteria.status)]
      );
    }

    if (criteria.region) {
      !joins.includes('nrm_region') &&
        queryBuilder.leftJoin('nrm_region', 'project.project_id', 'nrm_region.project_id');
      queryBuilder.and.whereIn(
        'nrm_region.name',
        (Array.isArray(criteria.region) && criteria.region) || [criteria.region]
      );

      joins.push('nrm_region');
    }

    if (criteria.focus) {
      const focusSwitch = (val: string) => {
        switch (Number(val)) {
          case 1:
            // is_healing_land = true;
            queryBuilder.and.where('project.is_healing_land', true);
            break;
          case 2:
            // is_healing_people = true;
            queryBuilder.and.where('project.is_healing_people', true);
            break;
          case 3:
            // is_land_initiative = true;
            queryBuilder.and.where('project.is_land_initiative', true);
            break;
          case 4:
            // is_cultural_initiative = true;
            queryBuilder.and.where('project.is_cultural_initiative', true);
            break;
        }
      };
      if (Array.isArray(criteria.focus)) {
        criteria.focus.map((val) => {
          focusSwitch(val);
        });
      } else {
        focusSwitch(criteria.focus);
      }
    }

    if (criteria.start_date) {
      queryBuilder.and.where('project.start_date', '>=', criteria.start_date);
    }

    if (criteria.end_date) {
      queryBuilder.and.where('project.end_date', '<=', criteria.end_date);
    }

    if (criteria.actual_start_date) {
      queryBuilder.and.where('project.actual_start_date', '>=', criteria.actual_start_date);
    }

    if (criteria.actual_end_date) {
      queryBuilder.and.where('project.actual_end_date', '<=', criteria.actual_end_date);
    }

    if (criteria.objectives) {
      !joins.includes('objective') && queryBuilder.leftJoin('objective', 'project.project_id', 'objective.project_id');
      joins.push('objective');

      queryBuilder.and.whereILike('objective.objective', `%${criteria.objectives}%`);
    }

    if (criteria.organizations) {
      !joins.includes('project_contact') &&
        queryBuilder.leftJoin('project_contact', 'project.project_id', 'project_contact.project_id');
      !joins.includes('project_partnership') &&
        queryBuilder.leftJoin('project_partnership', 'project.project_id', 'project_partnership.project_id');
      !joins.includes('partnerships') &&
        queryBuilder.leftJoin('partnerships', 'project_partnership.partnerships_id', 'partnerships.partnerships_id');
      !joins.includes('partnership_type') &&
        queryBuilder.leftJoin(
          'partnership_type',
          'partnerships.partnership_type_id',
          'partnership_type.partnership_type_id'
        );
      !joins.includes('first_nations') &&
        queryBuilder.leftJoin(
          'first_nations',
          'project_partnership.first_nations_id',
          'first_nations.first_nations_id'
        );

      queryBuilder.and.where(function () {
        this.or.whereILike('project_contact.organization', `%${criteria.organizations}%`);
        this.or.whereILike('partnership_type.name', `%${criteria.organizations}%`);
        this.or.whereILike('project_partnership.name', `%${criteria.organizations}%`);
        this.or.whereILike('partnerships.name', `%${criteria.organizations}%`);
        this.or.whereILike('first_nations.name', `%${criteria.organizations}%`);
      });

      joins.push('project_contact', 'project_partnership', 'partnerships', 'first_nations', 'partnership_type');
    }

    if (criteria.funding_sources) {
      !joins.includes('project_funding_source') &&
        queryBuilder.leftJoin('project_funding_source', 'project.project_id', 'project_funding_source.project_id');
      joins.push('project_funding_source');

      queryBuilder.and.whereILike('project_funding_source.organization_name', `%${criteria.funding_sources}%`);
    }

    if (criteria.ha_from) {
      !joins.includes('project_spatial_component') &&
        queryBuilder.leftJoin(
          'project_spatial_component',
          'project.project_id',
          'project_spatial_component.project_id'
        );
      joins.push('project_spatial_component');

      queryBuilder.and.where('project_spatial_component.size_ha', '>=', criteria.ha_from);
    }

    if (criteria.ha_to) {
      !joins.includes('project_spatial_component') &&
        queryBuilder.leftJoin(
          'project_spatial_component',
          'project.project_id',
          'project_spatial_component.project_id'
        );
      joins.push('project_spatial_component');

      queryBuilder.and.where('project_spatial_component.size_ha', '<=', criteria.ha_to);
    }

    if (criteria.authorization) {
      !joins.includes('permit') && queryBuilder.leftJoin('permit', 'project.project_id', 'permit.project_id');
      joins.push('permit');

      queryBuilder.and.whereILike('permit.description', `%${criteria.authorization}%`);
    }

    queryBuilder.groupBy('project.project_id');
    console.log('queryBuilder', queryBuilder.toSQL());

    const response = await this.connection.knex<{ project_id: number }>(queryBuilder);

    return response.rows;
  }

  /**
   * Returns project ids based on a user's project participation.
   *
   * @param {number} systemUserId
   * @return {*}  {Promise<{ project_id: number }[]>}
   * @memberof SearchService
   */
  async findProjectIdsByProjectParticipation(systemUserId: number): Promise<{ project_id: number }[]> {
    const sqlStatement = SQL`
      SELECT
        project.project_id
      FROM
        project
      LEFT JOIN
        project_participation
      ON
        project.project_id = project_participation.project_id
      WHERE
        project_participation.system_user_id = ${systemUserId};
    `;

    const response = await this.connection.sql<{ project_id: number }>(sqlStatement);

    return response.rows;
  }

  /**
   * Returns project ids based on a user's plan participation.
   *
   * @param {number} systemUserId
   * @return {*}  {Promise<{ project_id: number }[]>}
   * @memberof SearchService
   */
  async findProjectIdsByPlanParticipation(systemUserId: number): Promise<{ project_id: number }[]> {
    const sqlStatement = SQL`
      SELECT
        project.project_id
      FROM
        project
      LEFT JOIN
        project_participation
      ON
        project.project_id = project_participation.project_id
      WHERE
        project_participation.system_user_id = ${systemUserId}
      AND
        project.is_project = false;
    `;

    const response = await this.connection.sql<{ project_id: number }>(sqlStatement);

    return response.rows;
  }
}
