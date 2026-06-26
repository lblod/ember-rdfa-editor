import { queryMobilityTemplates } from '../queries/mobility-template.ts';
import { queryVariables } from '../queries/variable.ts';
import { type Variable } from '../schemas/variable.ts';
import { type MobilityTemplate } from '../schemas/mobility-template.ts';

type ResolvedTemplate = {
  templateString: string;
  variables: Record<string, Exclude<Variable, { type: 'instruction' }>>;
};

export async function resolveTemplate(
  endpoint: string,
  template: MobilityTemplate,
  options: {
    abortSignal?: AbortSignal;
  } = {},
): Promise<ResolvedTemplate> {
  const { abortSignal } = options;
  const variablesArray = await queryVariables(endpoint, {
    templateUri: template.uri,
  });
  const variablesObject = variablesArray.reduce<
    Record<string, Exclude<Variable, { type: 'instruction' }>>
  >((result, item) => {
    if (item.type !== 'instruction') {
      return {
        ...result,
        [item.label]: item,
      };
    } else {
      return result;
    }
  }, {});
  if (!variablesArray.some((variable) => variable.type === 'instruction')) {
    return {
      templateString: template.value,
      variables: variablesObject,
    };
  } else {
    let templateString = template.value;
    for (const variable of variablesArray) {
      if (variable.type !== 'instruction') {
        continue;
      }
      const instructionTemplate = (
        await queryMobilityTemplates(endpoint, {
          instructionVariableUri: variable.uri,
          abortSignal,
        })
      )[0];
      const {
        templateString: instructionTemplateString,
        variables: instructionTemplateVariables,
      } = await resolveTemplate(endpoint, instructionTemplate, options);
      Object.assign(variablesObject, instructionTemplateVariables);
      templateString = templateString.replaceAll(
        `\${${variable.label}}`,
        instructionTemplateString,
      );
    }
    return {
      templateString,
      variables: variablesObject,
    };
  }
}
