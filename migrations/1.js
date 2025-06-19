import { describe, whereFromPlugin, mutateContent, checkContent, updatePlugin, getCourse, testStopWhere, testSuccessWhere } from 'adapt-migrations';
import _ from 'lodash';
describe('Inspector - v1.0.1 to v1.0.2', async () => {
  whereFromPlugin('Inspector - from v1.0.1', { name: 'adapt-inspector', version: '<1.0.2' });
  let course, courseInspector;
  mutateContent('Inspector - add course _inspector if missing', async (content) => {
    course = getCourse();
    if (!_.has(course, '_inspector')) _.set(course, '_inspector', {});
    courseInspector = course._inspector;
    return true;
  });
  mutateContent('Inspector - add _isDisabledOnTouch if missing', async (content) => {
    _.set(courseInspector, '_isDisabledOnTouch', true);
    return true;
  });
  checkContent('Inspector - check course _inspector attribute', async content => {
    if (!_.has(course, '_inspector')) throw new Error('Inspector - course _inspector invalid');
    return true;
  });
  checkContent('Inspector - check _isDisabledOnTouch value', async content => {
    if (courseInspector._isDisabledOnTouch !== true) throw new Error('Inspector - course _isDisabledOnTouch invalid');
    return true;
  });

  updatePlugin('Inspector - update to v1.0.2', { name: 'adapt-inspector', version: '1.0.2', framework: '>=2.0.16' });

  testSuccessWhere('Inspector with empty course', {
    fromPlugins: [{ name: 'adapt-inspector', version: '1.0.1' }],
    content: [
      { _id: 'c-100', _component: 'mcq' },
      { _type: 'course' }
    ]
  });

  testSuccessWhere('Inspector with empty course config', {
    fromPlugins: [{ name: 'adapt-inspector', version: '1.0.1' }],
    content: [
      { _id: 'c-100', _component: 'mcq' },
      { _type: 'course', _inspector: {} }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-inspector', version: '1.0.2' }]
  });
});
