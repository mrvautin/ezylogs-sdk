// require any modules
const axios = require('axios');
const os = require('os');
const pidusage = require('pidusage');
const request = require('sync-request');
const server = 'https://ezylogs.com';
const minMonitoringInterval = 300000;
const configuration = {};

function config(obj){
    if(!obj.apiKey){
        console.log('ERROR with configuration object. Missing "apiKey"');
        return;
    }
    if(!obj.system){
        console.log('ERROR with configuration object. Missing unique "system" value');
        return;
    }

    // set the config
    configuration.apiKey = obj.apiKey;
    configuration.system = obj.system;

    // Check the supplied apiKey is valid
    const apiKeyCheck = request('POST', `${server}/account/auth`, {
        json: { apiKey: configuration.apiKey }
    });

    // API check failed, print the error and return
    if(apiKeyCheck.statusCode !== 200){
        configuration.setup = false;
        console.log(JSON.parse(apiKeyCheck.getBody('utf8')));
        return;
    }

    // API check passed, continue with setup
    configuration.setup = true;
}

function monitor(interval = minMonitoringInterval){
    if(interval < minMonitoringInterval){
        console.log(`ERROR with interval. Needs to be "${minMonitoringInterval}" or greater`);
        return;
    }
    setInterval(() => { 
        sendUpMonitoring();
    }, interval);
};

async function sendUpMonitoring() {
    if(configuration.setup){
        const monitorData = await pidusage(process.pid);
        const content = {
            pid: monitorData.pid,
            cpu: monitorData.cpu,
            load: os.loadavg()[0],
            platform: os.platform(),
            processMemory: process.memoryUsage().rss,
            processUptime: monitorData.elapsed,
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            serverUptime: os.uptime() * 1000
        }

        axios.post(`${server}/monitor`, {
            apiKey: configuration.apiKey, 
            system: configuration.system,
            data: content, 
            timestamp: new Date()
        })
        .catch(() => {
            console.log('err');
        });
    }
}

function sendUp(content, level){
    if(configuration.setup){
        axios.post(`${server}/log`, {
            apiKey: configuration.apiKey, 
            system: configuration.system,
            data: content, 
            level: level,
            timestamp: new Date()
        })
        .catch(() => {
            console.log('err');
        });
    }
}

function debug(){
    sendUp(arguments, 'debug');
}

function error(){
    sendUp(arguments, 'error');
}

function info(){
    sendUp(arguments, 'info');
}

function log(){
    sendUp(arguments, 'log');
}

function warn(){
    sendUp(arguments, 'warn');
}

function trace(){
    sendUp(arguments, 'trace');
}

module.exports = {
    config,
    log,
    info,
    debug,
    error,
    warn,
    trace,
    monitor
}
