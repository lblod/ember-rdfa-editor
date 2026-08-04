import { type ValueOf } from '@lblod/ember-rdfa-editor/utils/_private/types';
export declare const ROADSIGN_REGULATION_DECISION_TYPES: string[];
export declare const ZONALITY_OPTIONS: {
    readonly POTENTIALLY_ZONAL: "http://register.mobiliteit.vlaanderen.be/concepts/8f9367b2-c717-4be7-8833-4c75bbb4ae1f";
    readonly ZONAL: "http://register.mobiliteit.vlaanderen.be/concepts/c81c6b96-736a-48cf-b003-6f5cc3dbc55d";
    readonly NON_ZONAL: "http://register.mobiliteit.vlaanderen.be/concepts/b651931b-923c-477c-8da9-fc7dd841fdcc";
};
export declare const ZONALITY_OPTIONS_LEGACY: {
    readonly POTENTIALLY_ZONAL: "http://lblod.data.gift/concepts/8f9367b2-c717-4be7-8833-4c75bbb4ae1f";
    readonly ZONAL: "http://lblod.data.gift/concepts/c81c6b96-736a-48cf-b003-6f5cc3dbc55d";
    readonly NON_ZONAL: "http://lblod.data.gift/concepts/b651931b-923c-477c-8da9-fc7dd841fdcc";
};
export type ZonalityUri = ValueOf<typeof ZONALITY_OPTIONS>;
export type LegacyZonalityUri = ValueOf<typeof ZONALITY_OPTIONS_LEGACY>;
export declare function getLegacyZonalityUri(uri: ZonalityUri | LegacyZonalityUri): LegacyZonalityUri;
export declare function getNewZonalityUri(uri: ZonalityUri | LegacyZonalityUri): ZonalityUri;
export declare function isNewZonalityUri(uri: string): uri is ZonalityUri;
export declare function isLegacyZonalityUri(uri: string): uri is LegacyZonalityUri;
export type ZonalityOption = ValueOf<typeof ZONALITY_OPTIONS>;
export type ZonalOrNot = Exclude<ZonalityOption, typeof ZONALITY_OPTIONS.POTENTIALLY_ZONAL>;
export declare const TRAFFIC_SIGNAL_CONCEPT_TYPES: {
    readonly TRAFFIC_SIGNAL: "https://data.vlaanderen.be/ns/mobiliteit#Verkeerstekenconcept";
    readonly ROAD_SIGN: "https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept";
    readonly TRAFFIC_LIGHT: "https://data.vlaanderen.be/ns/mobiliteit#Verkeerslichtconcept";
    readonly ROAD_MARKING: "https://data.vlaanderen.be/ns/mobiliteit#Wegmarkeringconcept";
};
export declare const TRAFFIC_SIGNAL_TYPES: {
    readonly TRAFFIC_SIGNAL: "https://data.vlaanderen.be/ns/mobiliteit#Verkeersteken";
    readonly ROAD_SIGN: "https://data.vlaanderen.be/ns/mobiliteit#VerkeersbordVerkeersteken";
    readonly TRAFFIC_LIGHT: "https://data.vlaanderen.be/ns/mobiliteit#VerkeerslichtVerkeersteken";
    readonly ROAD_MARKING: "https://data.vlaanderen.be/ns/mobiliteit#WegmarkeringVerkeersteken";
};
export declare const TRAFFIC_SIGNAL_TYPE_MAPPING: {
    readonly "https://data.vlaanderen.be/ns/mobiliteit#Verkeerstekenconcept": "https://data.vlaanderen.be/ns/mobiliteit#Verkeersteken";
    readonly "https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept": "https://data.vlaanderen.be/ns/mobiliteit#VerkeersbordVerkeersteken";
    readonly "https://data.vlaanderen.be/ns/mobiliteit#Verkeerslichtconcept": "https://data.vlaanderen.be/ns/mobiliteit#VerkeerslichtVerkeersteken";
    readonly "https://data.vlaanderen.be/ns/mobiliteit#Wegmarkeringconcept": "https://data.vlaanderen.be/ns/mobiliteit#WegmarkeringVerkeersteken";
};
export declare const ROAD_SIGN_CATEGORIES: {
    XXBORD: string;
    'XX-AWVBORD': string;
    GEVAARSBORD: string;
    STILSTAANPARKEERBORD: string;
    VOORRANGSBORD: string;
    ZONEBORD: string;
    VERBODSBORD: string;
    ONDERBORD: string;
    GEBODSBORD: string;
    AANWIJSBORD: string;
};
