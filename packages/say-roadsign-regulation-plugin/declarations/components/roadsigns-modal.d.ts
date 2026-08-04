import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor';
import { type RoadsignRegulationPluginOptions } from '#root/plugin/types.ts';
import { type MobilityMeasureConcept } from '#root/plugin/schemas/mobility-measure-concept.ts';
import { type Select } from 'ember-power-select/components/power-select';
import { type TaskInstance } from 'reactiveweb/ember-concurrency';
import { ZONALITY_OPTIONS, type ZonalOrNot } from '#root/plugin/constants.ts';
type Option = {
    uri: string;
    label: string;
};
type Zonality = {
    uri: (typeof ZONALITY_OPTIONS)[keyof typeof ZONALITY_OPTIONS];
    label: string;
};
type TypeOption = Option;
type Code = Option;
type Category = Option;
type Signature = {
    Args: {
        modalOpen?: boolean;
        closeModal: () => void;
        controller: SayController;
        options: RoadsignRegulationPluginOptions;
    };
};
export default class RoadsignsModal extends Component<Signature> {
    pageSize: number;
    pageNumber: number;
    selectedZonality?: Zonality;
    selectedCode?: Code;
    selectedCodeCombination?: Code[];
    selectedType?: TypeOption;
    selectedCategory?: Category;
    searchQuery?: string;
    zonalityOptions: Zonality[];
    get endpoint(): string;
    get imageBaseUrl(): string;
    get controller(): SayController;
    get decisionLocation(): {
        node: import("prosemirror-model").Node;
        pos: number;
    } | null;
    changeTypeOrCategory(option: Option): void;
    changeCode(value: Code): void;
    changeCodeCombination(value: Code[]): void;
    changeZonality(value: Zonality): void;
    handleSearch(event: InputEvent): void;
    closeModal(): void;
    doFirstCodeSearch(select: Select): boolean;
    searchCodes: import("ember-concurrency").TaskForAsyncTaskFunction<unknown, (term: string) => Promise<{
        uri: string;
        label: string;
    }[]>>;
    codeCombinationOptionsQuery: import("reactiveweb/function").State<Promise<{
        uri: string;
        label: string;
    }[]>>;
    get codeCombinationOptions(): {
        uri: string;
        label: string;
    }[];
    classificationsQuery: import("reactiveweb/function").State<Promise<{
        uri: string;
        label: string;
    }[]>>;
    get classifications(): {
        uri: string;
        label: string;
    }[];
    trafficSignalConceptTypes: ({
        label: string;
        uri: "https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept";
    } | {
        label: string;
        uri: "https://data.vlaanderen.be/ns/mobiliteit#Wegmarkeringconcept";
    } | {
        label: string;
        uri: "https://data.vlaanderen.be/ns/mobiliteit#Verkeerslichtconcept";
    })[];
    get typeOptions(): {
        groupName: string;
        options: TypeOption[];
    }[];
    measureConceptsTask: import("ember-concurrency").TaskForAsyncTaskFunction<unknown, () => Promise<{
        concepts: {
            uri: string;
            label: string;
            preview: string;
            zonality: "http://register.mobiliteit.vlaanderen.be/concepts/8f9367b2-c717-4be7-8833-4c75bbb4ae1f" | "http://register.mobiliteit.vlaanderen.be/concepts/c81c6b96-736a-48cf-b003-6f5cc3dbc55d" | "http://register.mobiliteit.vlaanderen.be/concepts/b651931b-923c-477c-8da9-fc7dd841fdcc";
            variableSignage: boolean;
            trafficSignalConcepts: ({
                uri: string;
                code: string;
                image: string;
                position: number;
                regulatoryNotation?: string | undefined;
            } & ({
                type: "https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept";
                categories: {
                    uri: string;
                    label: string;
                }[];
            } | {
                type: "https://data.vlaanderen.be/ns/mobiliteit#Verkeerslichtconcept" | "https://data.vlaanderen.be/ns/mobiliteit#Wegmarkeringconcept";
            }))[];
        }[];
        count: number;
    }>>;
    measureConceptsQuery: TaskInstance<{
        concepts: MobilityMeasureConcept[];
        count: number;
    }>;
    get measureConcepts(): {
        uri: string;
        label: string;
        preview: string;
        zonality: "http://register.mobiliteit.vlaanderen.be/concepts/8f9367b2-c717-4be7-8833-4c75bbb4ae1f" | "http://register.mobiliteit.vlaanderen.be/concepts/c81c6b96-736a-48cf-b003-6f5cc3dbc55d" | "http://register.mobiliteit.vlaanderen.be/concepts/b651931b-923c-477c-8da9-fc7dd841fdcc";
        variableSignage: boolean;
        trafficSignalConcepts: ({
            uri: string;
            code: string;
            image: string;
            position: number;
            regulatoryNotation?: string | undefined;
        } & ({
            type: "https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept";
            categories: {
                uri: string;
                label: string;
            }[];
        } | {
            type: "https://data.vlaanderen.be/ns/mobiliteit#Verkeerslichtconcept" | "https://data.vlaanderen.be/ns/mobiliteit#Wegmarkeringconcept";
        }))[];
    }[] | undefined;
    get measureConceptCount(): number | undefined;
    insertMeasure: import("ember-concurrency").TaskForAsyncTaskFunction<unknown, (concept: MobilityMeasureConcept, zonality: ZonalOrNot, temporal: boolean, position?: number) => Promise<void>>;
    resetPagination(): void;
    goToPreviousPage(): void;
    goToNextPage(): void;
    goToPage(pageNumber: number): void;
    get articleNodes(): import("prosemirror-model").Node[];
}
export {};
