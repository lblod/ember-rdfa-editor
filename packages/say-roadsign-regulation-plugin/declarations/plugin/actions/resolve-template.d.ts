import { type Variable } from '../schemas/variable.ts';
import { type MobilityTemplate } from '../schemas/mobility-template.ts';
type ResolvedTemplate = {
    templateString: string;
    variables: Record<string, Exclude<Variable, {
        type: 'instruction';
    }>>;
};
export declare function resolveTemplate(endpoint: string, template: MobilityTemplate, options?: {
    abortSignal?: AbortSignal;
}): Promise<ResolvedTemplate>;
export {};
