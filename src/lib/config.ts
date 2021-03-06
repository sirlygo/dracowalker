import * as fs from 'fs';
import * as logger from 'winston';
import * as _ from 'lodash';
import * as moment from 'moment';

import { enums } from 'draconode';

const yaml = require('js-yaml');
const winstonCommon = require('winston/lib/winston/common');

function fixInventoryLimitConfig(config) {
    for (const item in config.inventory) {
        if (!Number.isInteger(+item)) {
            config.inventory[enums.ItemType[item]] = config.inventory[item];
            delete config.inventory[item];
        }
    }
}

module.exports.load = function() {
    let config: any = {
        credentials: {
            deviceid: '',
            userid: '',
            nickname: '',
        },
        pos: {
            lat: 48.8456222,
            lng: 2.3364526,
        },
        router: 'stops',
        speed: 5,
        gmapKey: '',
        ui: {
            enabled: true,
        },
        behavior: {
            catch: true,
            followroads: true,
            autorelease: true,
        },
        inventory: {

        },
        delay: {
            spin: 5,
            encounter: 1.5,
            catch: 3,
            incubator: 3,
            levelUp: 2,
            release: 0.1,
            evolve: 3,
            recycle: 0.5,
        },
        proxy: {
            checkip: true,
            url: null,
        },
        database: { },
        log: {
            level: 'info',
        },
    };

    try {
        fs.mkdirSync('data');
    } catch (e) {}

    if (fs.existsSync('data/config.yaml')) {
        const loaded = yaml.safeLoad(fs.readFileSync('data/config.yaml', 'utf8'));
        config = _.defaultsDeep(loaded, config);
    }

    logger.transports.Console.prototype.log = function (level, message, meta, callback) {
        const output = winstonCommon.log(Object.assign({}, this, {
            level,
            message,
            meta,
        }));
        console[level in console ? level : 'log'](output);
        setImmediate(callback, null, true);
    };

    logger.remove(logger.transports.Console);
    logger.add(logger.transports.Console, {
        'timestamp': () => moment().format('HH:mm:ss'),
        'colorize': true,
        'level': config.log.level,
    });

    logger.add(logger.transports.File, {
        'timestamp': () => moment().format('HH:mm:ss'),
        'filename': 'data/dracowalker.log',
        'json': false,
        'level': config.log.level,
    });

    fixInventoryLimitConfig(config);

    return config;
};
