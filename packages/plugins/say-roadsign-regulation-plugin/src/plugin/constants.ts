import { MOBILITEIT } from '@lblod/ember-rdfa-editor/utils/_private/lblod-utils/constants';
import { type ValueOf } from '@lblod/ember-rdfa-editor/utils/_private/types';

export const ROADSIGN_REGULATION_DECISION_TYPES = [
  'https://data.vlaanderen.be/id/concept/BesluitType/4d8f678a-6fa4-4d5f-a2a1-80974e43bf34',
  'https://data.vlaanderen.be/id/concept/BesluitType/7d95fd2e-3cc9-4a4c-a58e-0fbc408c2f9b',
  'https://data.vlaanderen.be/id/concept/BesluitType/3bba9f10-faff-49a6-acaa-85af7f2199a3',
  'https://data.vlaanderen.be/id/concept/BesluitType/0d1278af-b69e-4152-a418-ec5cfd1c7d0b',
  'https://data.vlaanderen.be/id/concept/BesluitType/e8afe7c5-9640-4db8-8f74-3f023bec3241',
  'https://data.vlaanderen.be/id/concept/BesluitType/256bd04a-b74b-4f2a-8f5d-14dda4765af9',
  'https://data.vlaanderen.be/id/concept/BesluitType/67378dd0-5413-474b-8996-d992ef81637a',
];

export const ZONALITY_OPTIONS = {
  POTENTIALLY_ZONAL:
    'http://register.mobiliteit.vlaanderen.be/concepts/8f9367b2-c717-4be7-8833-4c75bbb4ae1f',
  ZONAL:
    'http://register.mobiliteit.vlaanderen.be/concepts/c81c6b96-736a-48cf-b003-6f5cc3dbc55d',
  NON_ZONAL:
    'http://register.mobiliteit.vlaanderen.be/concepts/b651931b-923c-477c-8da9-fc7dd841fdcc',
} as const;

export const ZONALITY_OPTIONS_LEGACY = {
  POTENTIALLY_ZONAL:
    'http://lblod.data.gift/concepts/8f9367b2-c717-4be7-8833-4c75bbb4ae1f',
  ZONAL: 'http://lblod.data.gift/concepts/c81c6b96-736a-48cf-b003-6f5cc3dbc55d',
  NON_ZONAL:
    'http://lblod.data.gift/concepts/b651931b-923c-477c-8da9-fc7dd841fdcc',
} as const;

export type ZonalityUri = ValueOf<typeof ZONALITY_OPTIONS>;
export type LegacyZonalityUri = ValueOf<typeof ZONALITY_OPTIONS_LEGACY>;

export function getLegacyZonalityUri(uri: ZonalityUri | LegacyZonalityUri) {
  if (isLegacyZonalityUri(uri)) {
    return uri;
  }
  const key = (
    Object.keys(ZONALITY_OPTIONS) as (keyof typeof ZONALITY_OPTIONS)[]
  ).find((k) => ZONALITY_OPTIONS[k] === uri) as keyof typeof ZONALITY_OPTIONS;
  return ZONALITY_OPTIONS_LEGACY[key];
}

export function getNewZonalityUri(uri: ZonalityUri | LegacyZonalityUri) {
  if (isNewZonalityUri(uri)) {
    return uri;
  }
  const key = (
    Object.keys(ZONALITY_OPTIONS_LEGACY) as (keyof typeof ZONALITY_OPTIONS)[]
  ).find(
    (k) => ZONALITY_OPTIONS_LEGACY[k] === uri,
  ) as keyof typeof ZONALITY_OPTIONS_LEGACY;
  return ZONALITY_OPTIONS[key];
}

export function isNewZonalityUri(uri: string): uri is ZonalityUri {
  // @ts-expect-error not sure how to handle this correctly
  return Object.values(ZONALITY_OPTIONS).includes(uri);
}

export function isLegacyZonalityUri(uri: string): uri is LegacyZonalityUri {
  // @ts-expect-error not sure how to handle this correctly
  return Object.values(ZONALITY_OPTIONS_LEGACY).includes(uri);
}

export type ZonalityOption = ValueOf<typeof ZONALITY_OPTIONS>;
export type ZonalOrNot = Exclude<
  ZonalityOption,
  typeof ZONALITY_OPTIONS.POTENTIALLY_ZONAL
>;

export const TRAFFIC_SIGNAL_CONCEPT_TYPES = {
  TRAFFIC_SIGNAL: MOBILITEIT('Verkeerstekenconcept').full,
  ROAD_SIGN: MOBILITEIT('Verkeersbordconcept').full,
  TRAFFIC_LIGHT: MOBILITEIT('Verkeerslichtconcept').full,
  ROAD_MARKING: MOBILITEIT('Wegmarkeringconcept').full,
} as const;

export const TRAFFIC_SIGNAL_TYPES = {
  TRAFFIC_SIGNAL: MOBILITEIT('Verkeersteken').full,
  ROAD_SIGN: MOBILITEIT('VerkeersbordVerkeersteken').full,
  TRAFFIC_LIGHT: MOBILITEIT('VerkeerslichtVerkeersteken').full,
  ROAD_MARKING: MOBILITEIT('WegmarkeringVerkeersteken').full,
} as const;

export const TRAFFIC_SIGNAL_TYPE_MAPPING = {
  [TRAFFIC_SIGNAL_CONCEPT_TYPES.TRAFFIC_SIGNAL]:
    TRAFFIC_SIGNAL_TYPES.TRAFFIC_SIGNAL,
  [TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN]: TRAFFIC_SIGNAL_TYPES.ROAD_SIGN,
  [TRAFFIC_SIGNAL_CONCEPT_TYPES.TRAFFIC_LIGHT]:
    TRAFFIC_SIGNAL_TYPES.TRAFFIC_LIGHT,
  [TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_MARKING]:
    TRAFFIC_SIGNAL_TYPES.ROAD_MARKING,
} as const;

export const ROAD_SIGN_CATEGORIES = {
  XXBORD:
    'https://data.vlaanderen.be/id/concept/Verkeersbordcategorie/ae1b7231-1f31-492d-947a-25fc5d114492',
  'XX-AWVBORD':
    'https://data.vlaanderen.be/id/concept/Verkeersbordcategorie/8e302648-0eca-478b-8b48-67c3b0e39c0a',
  GEVAARSBORD:
    'http://data.vlaanderen.be/id/concept/Verkeersbordcategorie/2982567006d9e19f04063df73123f56f40e3a28941031a7ba6e6667f64740fa9',
  STILSTAANPARKEERBORD:
    'http://data.vlaanderen.be/id/concept/Verkeersbordcategorie/29ea3335e357e414d07229242607b352941c0c21e78760600cc0f5270f18c38b',
  VOORRANGSBORD:
    'http://data.vlaanderen.be/id/concept/Verkeersbordcategorie/737da5751bc7f311398a834f34df310dd95255a0b62afa2db2882c72d54b47d2',
  ZONEBORD:
    'http://data.vlaanderen.be/id/concept/Verkeersbordcategorie/86a67f3cba6512ae10c4b9b09ba35d8c80109189b44d37e848858af9efb37019',
  VERBODSBORD:
    'http://data.vlaanderen.be/id/concept/Verkeersbordcategorie/955a9adc73d076a2a424754cd540b73da8d15fb002ab6c9f115d080edddb57e8',
  ONDERBORD:
    'http://data.vlaanderen.be/id/concept/Verkeersbordcategorie/991b04b477b77bc7cf1414fb5d255cc4435dd9c1681e8de66f770710c1c83ad0',
  GEBODSBORD:
    'http://data.vlaanderen.be/id/concept/Verkeersbordcategorie/9d84069e70f192b7a474d02f07687bc3343ee324207ad9e093c0b2f5def647f8',
  AANWIJSBORD:
    'http://data.vlaanderen.be/id/concept/Verkeersbordcategorie/9ea8f8b421343370d20a8bd45d6226aadc48125bda8ddbbeeb53d99f181ee05a',
};
