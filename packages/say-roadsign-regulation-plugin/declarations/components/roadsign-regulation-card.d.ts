import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor';
import { type RoadsignRegulationPluginOptions } from '#root/plugin/types.ts';
type Signature = {
    Args: {
        controller: SayController;
        options: RoadsignRegulationPluginOptions;
    };
};
export default class RoadsingRegulationCard extends Component<Signature> {
    modalOpen: boolean;
    openModal(): void;
    closeModal(): void;
    get controller(): SayController;
    get showCard(): boolean;
}
export {};
