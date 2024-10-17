import { expect } from 'chai';
import { describe } from 'mocha';
import {
  GetReportLast,
  GetReportLastData,
  GetReportPlanData,
  GetReportProjectData,
  GetReportUserData
} from './report-view';

describe('GetReportProjectData', () => {
  describe('No values provided', () => {
    let data: GetReportProjectData;

    before(() => {
      data = new GetReportProjectData(null as unknown as any[]);
    });

    it('sets reports', function () {
      expect(data.published_projects).to.eql(null);
      expect(data.draft_projects).to.eql(null);
      expect(data.archived_projects).to.eql(null);
    });
  });

  describe('All values provided', () => {
    let data: GetReportProjectData;

    const reports = { published_projects: 1, draft_projects: 2, archived_projects: 3 };

    before(() => {
      data = new GetReportProjectData(reports);
    });

    it('sets reports', function () {
      expect(data).to.eql(reports);
    });
  });
});

describe('GetReportPlanData', () => {
  describe('No values provided', () => {
    let data: GetReportPlanData;

    before(() => {
      data = new GetReportPlanData(null as unknown as any[]);
    });

    it('sets reports', function () {
      expect(data.published_plans).to.eql(null);
      expect(data.draft_plans).to.eql(null);
      expect(data.archived_plans).to.eql(null);
    });
  });

  describe('All values provided', () => {
    let data: GetReportPlanData;

    const reports = { published_plans: 1, draft_plans: 2, archived_plans: 3 };

    before(() => {
      data = new GetReportPlanData(reports);
    });

    it('sets reports', function () {
      expect(data).to.eql(reports);
    });
  });
});

describe('GetReportUserData', () => {
  describe('No values provided', () => {
    let data: GetReportUserData;

    before(() => {
      data = new GetReportUserData(null as unknown as any[]);
    });

    it('sets reports', function () {
      expect(data.admins).to.eql(null);
      expect(data.maintainers).to.eql(null);
      expect(data.creators).to.eql(null);
    });
  });

  describe('All values provided', () => {
    let data: GetReportUserData;

    const reports = { admins: 1, maintainers: 2, creators: 3 };

    before(() => {
      data = new GetReportUserData(reports);
    });

    it('sets reports', function () {
      expect(data).to.eql(reports);
    });
  });
});

describe('GetReportLastData', () => {
  describe('No values provided', () => {
    let data: GetReportLastData;

    before(() => {
      data = { project: new GetReportLast(null), plan: new GetReportLast(null) };
    });

    it('sets reports', function () {
      expect(data.project).to.eql({ id: null, name: null, datetime: null });
      expect(data.plan).to.eql({ id: null, name: null, datetime: null });
    });
  });

  describe('All values provided', () => {
    let data: GetReportLastData;

    const reports = {
      project: { id: 1, name: 'name 1', datetime: 'datetime 1' },
      plan: { id: 2, name: 'name 2', datetime: 'datetime 2' }
    };

    before(() => {
      data = { project: new GetReportLast(reports.project), plan: new GetReportLast(reports.plan) };
    });

    it('sets reports', function () {
      expect(data).to.eql(reports);
    });
  });
});
