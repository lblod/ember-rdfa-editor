import { namespace } from '#root/utils/namespace.ts';

export const SAY = namespace('https://say.data.gift/ns/', 'say');
export const RDF = namespace(
  'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  'rdf',
);
export const RDFS = namespace('http://www.w3.org/2000/01/rdf-schema#', 'rdfs');

export const ELI = namespace('http://data.europa.eu/eli/ontology#', 'eli');
export const XSD = namespace('http://www.w3.org/2001/XMLSchema#', 'xsd');
export const EXT = namespace('http://mu.semte.ch/vocabularies/ext/', 'ext');
export const BESLUIT = namespace(
  'http://data.vlaanderen.be/ns/besluit#',
  'besluit',
);
export const PROV = namespace('http://www.w3.org/ns/prov#', 'prov');
export const SKOS = namespace('http://www.w3.org/2004/02/skos/core#', 'skos');
export const DCT = namespace('http://purl.org/dc/terms/', 'dct');
export const MOBILITEIT = namespace(
  'https://data.vlaanderen.be/ns/mobiliteit#',
  'mobiliteit',
);

export const ADRES_TYPO = namespace(
  'https://data.vlaanderen.be/ns/adres/',
  'adres',
);
export const ADRES = namespace('https://data.vlaanderen.be/ns/adres#', 'adres');
export const GENERIEK = namespace(
  'https://data.vlaanderen.be/ns/generiek/#',
  'generiek',
);
export const GEO = namespace('http://www.w3.org/2003/01/geo/wgs84_pos#', 'geo');
export const GEOSPARQL = namespace(
  'http://www.opengis.net/ont/geosparql#',
  'geosparql',
);
export const MANDAAT = namespace(
  'http://data.vlaanderen.be/ns/mandaat#',
  'mandaat',
);
export const FOAF = namespace('http://xmlns.com/foaf/0.1/', 'foaf');
export const LOCN = namespace('http://www.w3.org/ns/locn#', 'locn');
export const SRO = namespace(
  'https://data.vlaanderen.be/ns/slimmeraadpleegomgeving#',
  'sro',
);
export const PERSOON = namespace(
  'http://data.vlaanderen.be/ns/persoon#',
  'persoon',
);
export const PERSON = namespace('http://www.w3.org/ns/person#', 'person');

export const VARIABLES = namespace(
  'http://lblod.data.gift/vocabularies/variables/',
  'variables',
);
export const BESTUURSPERIODES = {
  '2012-2019':
    'http://data.lblod.info/id/concept/Bestuursperiode/845dbc7f-139e-4632-b200-f90e180f1dba',
  '2019-2024':
    'http://data.lblod.info/id/concept/Bestuursperiode/a2b977a3-ce68-4e42-80a6-4397f66fc5ca',
  '2024-heden':
    'http://data.lblod.info/id/concept/Bestuursperiode/96efb929-5d83-48fa-bfbb-b98dfb1180c7',
};
export type BestuursperiodeLabel = keyof typeof BESTUURSPERIODES;
export type BestuursperiodeURI =
  (typeof BESTUURSPERIODES)[BestuursperiodeLabel];
export const ONDERDEEL = namespace(
  'https://wegenenverkeer.data.vlaanderen.be/ns/onderdeel#',
  'onderdeel',
);
