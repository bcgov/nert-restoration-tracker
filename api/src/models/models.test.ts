import { expect } from 'chai';
import { models } from './models';

describe('models', () => {
  it('should have project', () => {
    expect(models.project).to.exist;
  });

  it('should have user', () => {
    expect(models.user).to.exist;
  });

  it('should have gcnotify', () => {
    expect(models.gcnotify).to.exist;
  });
});
