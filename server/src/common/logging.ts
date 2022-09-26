import config from 'config';

const LOG_LEVELS: {[level: string]: number} = {
  'error': 40,
  'warning': 30,
  'info': 20,
  'debug': 10,
  // Support for console.log.
  'log': 20,
}

interface LoggingConfig {
  level: string;
}


export function initLogging() {
  let logConfig = config.get('logging') as LoggingConfig;
  if (logConfig.level === undefined) {
    return;
  }
  if (LOG_LEVELS[logConfig.level] === undefined) {
    console.error(`Unknown log level "${logConfig.level}"`);
    return
  }
  let levelValue: number = LOG_LEVELS[logConfig.level];
  for (const [level, value] of Object.entries(LOG_LEVELS)) {
    if (value < levelValue) {
      (console as any)[level] = function () {};
    }
  }
}
