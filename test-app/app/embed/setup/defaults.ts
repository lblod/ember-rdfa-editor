// import merge from 'lodash.mergewith';
function merge(one, two, three) {
  return Object.assign({}, one, two)
}

const mergeCustomizer = (
  objValue: unknown,
  srcValue: unknown,
): Array<unknown> | undefined => {
  // if the src provides an array, overwrite instead of merging
  if (Array.isArray(objValue) && Array.isArray(srcValue)) {
    return srcValue as unknown[];
  }
};

/**
 * If the user config is present, merge it with the default config.
 * Otherwise return the default config.
 */
export const mergeConfigs = <C, U extends Partial<C>>(
  defaultConfig: C,
  userConfig?: U,
): C => {
  if (userConfig) {
    return merge(defaultConfig, userConfig, mergeCustomizer);
  }

  return defaultConfig;
};
