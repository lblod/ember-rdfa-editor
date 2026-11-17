import { MOBILITEIT } from '@lblod/ember-rdfa-editor/utils/_private/lblod-utils/constants';

// From https://github.com/Informatievlaanderen/OSLOthema-lokaleBesluiten/blob/feature%2Fbestaande-signalisatie/codelijsten%2Fverkeersbordontwerpstatus.ttl
export const TRAFFIC_SIGNAL_DESIGN_STATUSES = {
  IN_VOORONTWERP:
    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/13fc4b70-2d88-4d11-a512-b36bce2d0fbf',
  VERWIJDERING_GEWEIGERD:
    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/1a902ca6-4611-46a8-be8a-13e997820ce0',
  BESTAAND_GEWEIGERD:
    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/1b20f33b-c04a-4e3b-b608-9991c3142d65',
  BESTAAND_IN_VOORONTWERP:
    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/1c6b6dae-8ffc-4a1b-97a9-b6f2cd943cf8',
  VERWIJDERING_UITGEVOERD:
    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/2826e311-ce64-417c-be93-29a2516e81e1',
  ONTWERP_TER_GOEDKEURING:
    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/3447a138-87d6-4745-b081-2faf02aed3f1',
  GOEDGEKEURD:
    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/3e869c24-2777-4e95-87a3-f97cd2f7289a',
  BESTAAND_AFGESLOTEN:
    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/3f4fc0f2-d039-491c-9cdf-a1db31860d05',
  IN_ONTWERP:
    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/467e89ae-0cfc-4a91-b29f-82c3cfc2bc6a',
  GEWEIGERD:
    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/49e1818b-af6d-438c-9d90-886d8eb372fb',
  BESTAAND_UITGEVOERD:
    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/4ed63f9b-f195-46f0-8d17-d3c682e771f6',
  BESTAAND_TER_GOEDKEURING:
    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/56bf79cd-0b9d-4658-a394-5e56077729b0',
  VERWIJDERING_TER_GOEDKEURING:
    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/5eb131f1-06f6-473d-b18a-9ab6b4470810',
  AFGESLOTEN:
    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/64e54352-de4e-4a5b-9322-79c5f8010620',
  BESTAAND_GOEDGEKEURD:
    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/7bf5dad3-244a-4cc3-9a2b-b96ac656f4b6',
  VERWIJDERING_IN_ONTWERP:
    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/9b0b6915-1ad5-4eff-90f0-0486a3562493',
  VERWIJDERING_IN_VOORONTWERP:
    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/b42c1cf8-0cb4-4faa-a740-f073a3ed3a0c',
  VERWIJDERING_AFGESLOTEN:
    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/c6bcbe00-54b8-45cd-a52a-29228db371dd',
  VERWIJDERING_GOEDGEKEURD:
    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/ca7a6ea2-3a07-4de3-87d5-0f9295fbf0bd',
  BESTAAND_IN_ONTWERP:
    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/e3b880ac-8186-4c0f-9ab3-439cab4ec130',
  UITGEVOERD:
    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/fc1036e7-703b-4290-b732-49abb39d0588',
};

export const TRAFFIC_SIGNAL_EXISTING_STATUSES = [
  TRAFFIC_SIGNAL_DESIGN_STATUSES.BESTAAND_UITGEVOERD,
  TRAFFIC_SIGNAL_DESIGN_STATUSES.VERWIJDERING_UITGEVOERD,
  TRAFFIC_SIGNAL_DESIGN_STATUSES.UITGEVOERD,
];

export const TRAFFIC_SIGNAL_CONCEPT_TYPES = {
  TRAFFIC_SIGNAL: MOBILITEIT('Verkeerstekenconcept').full,
  ROAD_SIGN: MOBILITEIT('Verkeersbordconcept').full,
  TRAFFIC_LIGHT: MOBILITEIT('Verkeerslichtconcept').full,
  ROAD_MARKING: MOBILITEIT('Wegmarkeringconcept').full,
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
