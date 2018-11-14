const ezylogs = require('./index');

ezylogs.config({
    apiKey: 'api-test-key',
    system: 'test-system'
});

ezylogs.log({
    this: 'this',
    is: 'is',
    a: 'a',
    large: 'large',
    object: 'object'
});

ezylogs.monitor();