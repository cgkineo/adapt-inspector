import { describe, whereFromPlugin, whereContent, mutateContent, checkContent, updatePlugin, getConfig, testStopWhere, testSuccessWhere } from 'adapt-migrations';
import _ from 'lodash';
describe('Inspector - v1.0.1 to v1.0.2', async () => {
  whereFromPlugin('Inspector - from v1.0.1', { name: 'adapt-inspector', version: '<1.0.2' });
  let config, configInspector;
  
  whereContent('Inspector - where config', async (content) => {
    config = getConfig();
    return config;
  });
  
  mutateContent('Inspector - add config _inspector if missing', async (content) => {
    if (!_.has(config, '_inspector')) {
      _.set(config, '_inspector', {});
    }
    configInspector = config._inspector;
    return true;
  });
  
  mutateContent('Inspector - add _isDisabledOnTouch', async (content) => {
    if (_.has(configInspector, '_isDisabledOnTouch')) return true;
    _.set(configInspector, '_isDisabledOnTouch', true);
    return true;
  });
  
  checkContent('Inspector - check config _inspector attribute', async content => {
    if (!_.has(config, '_inspector')) throw new Error('Inspector - config _inspector invalid');
    return true;
  });
  
  checkContent('Inspector - check _isDisabledOnTouch value', async content => {
    if (configInspector._isDisabledOnTouch !== true) throw new Error('Inspector - config _isDisabledOnTouch invalid');
    return true;
  });

  updatePlugin('Inspector - update to v1.0.2', { name: 'adapt-inspector', version: '1.0.2', framework: '>=2.0.16' });

  testSuccessWhere('Inspector with empty config', {
    fromPlugins: [{ name: 'adapt-inspector', version: '1.0.1' }],
    content: [
      { _type: 'config' }
    ]
  });

  testSuccessWhere('Inspector with empty config _inspector', {
    fromPlugins: [{ name: 'adapt-inspector', version: '1.0.1' }],
    content: [
      { _type: 'config', _inspector: {} }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-inspector', version: '1.0.2' }]
  });
  
  testStopWhere('no config', {
    content: [{ _type: 'course' }]
  });
});
