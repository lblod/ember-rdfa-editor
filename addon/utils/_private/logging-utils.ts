import { isDevelopingApp, macroCondition } from '@embroider/macros';
import { debug } from 'debug';

/**
 * Create a diary logger with a default reporter if none provided.
 * This default reporter sets up the level-based filtering capabilities so care
 * should be taken when overriding it.
 * @param scope
 * @param onEmit
 */
export function createLogger(scope: string): Logger {
  return debug(`ember-rdfa-editor:${scope}`);
}

export interface Logger {
  (...args: unknown[]): void;
}

/**
 * Convenience method to easily set the log filter string
 * @param filter
 */
function setLogFilter(filter: string) {
  localStorage.setItem('debug', filter);
}

window.setLogFilter = setLogFilter;

// Setup default loglevel based on environment.
if (!localStorage.getItem('debug')) {
  if (macroCondition(isDevelopingApp())) {
    setLogFilter('ember-rdfa-editor:*');
  } else {
    setLogFilter('');
  }
}

// ---- DECORATORS ----

type MethodMessageFunc<T extends unknown[] = unknown[]> = (
  methodName: string,
  ...args: T
) => string | [string, ...unknown[]];

const defaultLogMethodMessage: MethodMessageFunc = (
  methodname: string,
  ...args: unknown[]
) => {
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
}

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
export function logMethod(
  message: string | MethodMessageFunc = defaultLogMethodMessage,
  { scopePrefix, scopeSuffix, scope }: LogMethodConfig,
) {
  return function (
    target: Record<never, never>,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: unknown[]) => unknown>,
  ) {
    const prefix = scopePrefix ? `${scopePrefix}:` : '';
    const suffix = scopeSuffix ? `:${scopeSuffix}` : '';
    const finalScope =
      scope ?? `${prefix}${target.constructor.name}:${propertyKey}${suffix}`;
    const doLog = createLogger(finalScope);
    if (!descriptor.value) {
      return;
    }
    const orig = descriptor.value;
    descriptor.value = function (...args: unknown[]) {
      if (typeof message === 'string') {
        doLog(message);
      } else {
        const compiledMessage: string | [string, ...unknown[]] = message(
          propertyKey,
          ...args,
        );
        if (typeof compiledMessage === 'string') {
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
