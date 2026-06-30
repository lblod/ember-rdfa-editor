import { Schema } from '@lblod/ember-rdfa-editor';
import { type IncomingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { type VariableInstance } from './schemas/variable-instance.ts';
import { createTextVariable } from '@lblod/ember-rdfa-editor/utils/_private/lblod-utils/create-text-variable';
import { createNumberVariable } from '@lblod/ember-rdfa-editor/utils/_private/lblod-utils/create-number-variable';
import { createDateVariable } from '@lblod/ember-rdfa-editor/utils/_private/lblod-utils/create-date-variable';
import { createClassicLocationVariable } from '@lblod/ember-rdfa-editor/utils/_private/lblod-utils/create-classic-location-variable';
import { createCodelistVariable } from '@lblod/ember-rdfa-editor/utils/_private/lblod-utils/create-codelist-variable';

export function constructMeasureFragment(
  templateString: string,
  variables: Record<string, VariableInstance>,
  schema: Schema,
  backlinks?: IncomingTriple[],
) {
  // TODO: extract this functionality of parsing a text with "variable" placeholders into a fragment to a more general place
  const parts = templateString.split(/(\$\{[^{}$]+\})/);
  const fragment = [];
  let currentParagraphContent = [];
  for (const part of parts) {
    if (!part) {
      continue;
    }
    const match = /^\$\{([^{}$]+)\}$/.exec(part);
    if (match) {
      const variableName = match[1];
      const matchedVariable = variables[variableName];
      if (matchedVariable) {
        const node = constructVariableNode(matchedVariable, schema, backlinks);
        if (node.type.isBlock) {
          if (currentParagraphContent.length > 0) {
            fragment.push(
              schema.nodes['paragraph'].create({}, currentParagraphContent),
            );
            currentParagraphContent = [];
          }
          fragment.push(node);
        } else {
          currentParagraphContent.push(node);
        }
      } else {
        currentParagraphContent.push(schema.text(part));
      }
    } else {
      currentParagraphContent.push(schema.text(part));
    }
  }

  if (currentParagraphContent.length > 0) {
    fragment.push(
      schema.nodes['paragraph'].create({}, currentParagraphContent),
    );
  }

  return fragment;
}

function constructVariableNode(
  variableInstance: VariableInstance,
  schema: Schema,
  backlinks?: IncomingTriple[],
) {
  const variable = variableInstance.variable;
  const valueStr =
    variableInstance.value instanceof Date
      ? variableInstance.value.toISOString()
      : variableInstance.value?.toString();
  const args = {
    schema,
    backlinks,
    variable: variable.uri,
    variableInstance: variableInstance.uri,
    __rdfaId: variableInstance.__rdfaId,
    value: valueStr,
    valueLabel:
      'valueLabel' in variableInstance
        ? variableInstance.valueLabel
        : undefined,
    label: variable.label,
  };
  switch (variable.type) {
    case 'text':
      return createTextVariable(args);
    case 'number':
      return createNumberVariable(args);
    case 'date':
      return createDateVariable(args);
    case 'codelist':
      return createCodelistVariable({
        ...args,
        source: variable.source,
        codelist: variable.codelistUri,
      });
    case 'location':
      return createClassicLocationVariable({
        ...args,
        source: variable.source,
      });
  }
}
