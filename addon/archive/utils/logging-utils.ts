import config from 'ember-get-config';
import {defaultReporter, Diary, diary, LogEvent, LogLevels, Reporter} from 'diary';
import {compare} from 'diary/utils';
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";

// this array is sorted from lowest to highest "level"
// aka setting loglevel to "info" will include info and everything to the right of it
const LOGLEVELS = ["log", "debug", "info", "warn", "error", "fatal"];

export type Logger = Diary;

/**
 * Create a diary logger with a default reporter if none provided.
 * This default reporter sets up the level-based filtering capabilities so care
 * should be taken when overriding it.
 * @param scope
 * @param onEmit
 */
export function createLogger(scope: string, onEmit?: Reporter) {
  return diary(scope, onEmit ?? logLevelReporter);
}

/**
 * Convenient debug logger for console.log style debugging, for when you don't want to think about what logger to use.
 */
export const debug = createLogger("debug");

/**
 * Convenience method to easily set the log filter string
 * @param filter
 */
function setLogFilter(filter: string) {
  localStorage.setItem("DEBUG", filter);
}

/**
 * Convenience method to easily set the loglevel
 * @param level
 */
function setLogLevel(level: LogLevels) {
  localStorage.setItem("LOGLEVEL", level);
}

window.setLogLevel = setLogLevel;
window.setLogFilter = setLogFilter;

// Setup default loglevel based on environment.
if (!localStorage.getItem("LOGLEVEL")) {
  if (config.environment === "development") {
    setLogLevel("log");
  } else {
    setLogLevel("warn");
  }
}

function isLogLevel(level: string | null): level is LogLevels {
  if (!level) {
    return false;
  }
  return LOGLEVELS.includes(level);
}

/**
 * Reporter which filters out messages based on the loglevel in localstorage.
 * @param event
 */
function logLevelReporter(event: LogEvent) {
  const configuredLogLevel = localStorage.getItem("LOGLEVEL");
  const loglevel: LogLevels = isLogLevel(configuredLogLevel) ? configuredLogLevel : "info";

  if (compare(event.level, loglevel) >= 0) {
    defaultReporter(event);
  }
}

// ---- DECORATORS ----

type MethodMessageFunc<T extends unknown[] = unknown[]> = (methodName: string, ...args: T) => string | [string, ...unknown[]];

const defaultLogMethodMessage: MethodMessageFunc = (methodname: string, ...args: unknown[]) => {
  if (args.length) {
    return [`Calling ${methodname} with args: `, ...args];
  } else {
    return `Calling ${methodname} without args.`;
  }
};

interface LogMethodConfig {
  scopePrefix?: string;
  scopeSuffix?: string;
  scope?: string;
  level?: LogLevels;
}

const defaultLogMethodConfig: LogMethodConfig = {
  level: "log"
};

/**
 * Logs a message when the decorated method is called.
 * You can optionally provide a message in the following ways:
 * - a string: the string will simply be printed
 * - a function: the function receives the method name as its first argument,
 * and the parameters as its rest argument. Its return value will be passed verbatim
 * to the appropriate logger.
 * This means it can either be a string or an array with a string as its first element (the message)
 * and any amount of arbitrary objects (which will be passed to the console logging method)
 * @param message
 * @param config
 */
export function logMethod(message: string | MethodMessageFunc = defaultLogMethodMessage,
                          {scopePrefix, scopeSuffix, scope, level = "log"}: LogMethodConfig = defaultLogMethodConfig) {
  return function (target: Record<never, never>,
                   propertyKey: string,
                   descriptor: TypedPropertyDescriptor<(...args: unknown[]) => unknown>) {
    const prefix = scopePrefix ? `${scopePrefix}:` : '';
    const suffix = scopeSuffix ? `:${scopeSuffix}` : '';
    const finalScope = scope ?? `${prefix}${target.constructor.name}:${propertyKey}${suffix}`;
    const logger = createLogger(finalScope);
    const doLog = logger[level];
    if (!descriptor.value) {
      return;
    }
    const orig = descriptor.value;
    descriptor.value = function (...args: unknown[]) {
      if (typeof message === "string") {
        doLog(message);
      } else {
        const compiledMessage: string | [string, ...unknown[]] = message(propertyKey, ...args);
        if (typeof compiledMessage === "string") {
          doLog(compiledMessage);
        } else {
          doLog(...compiledMessage);
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return orig.apply(this, args);
    };
  };
}

export const logExecute = logMethod(
  (_methodName: string, ...args) => {
    const mappedArgs = args.map(arg => {
        if (arg instanceof ModelRange) {
          return arg.toString();
        }
        if (typeof arg === "string") {
          return `string<"${arg}", ${arg.length}>`;
        } else {
          return arg;
        }
      }
    );
    return ["Executing with args:", ...mappedArgs];

  }, {scopePrefix: "command"});

