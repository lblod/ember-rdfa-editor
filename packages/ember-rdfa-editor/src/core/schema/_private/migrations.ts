import {
  type ModelMigrationGenerator,
  type RdfaAttrs,
} from '../../rdfa-types.ts';
import { getRdfaAttrs, getRdfaContentElement } from '../../schema.ts';

export function getAttrsWithMigrations(
  modelMigrations: ModelMigrationGenerator[],
  attrs: Record<string, string>,
  element: HTMLElement,
) {
  const migration = modelMigrations.find((migration) =>
    migration(attrs as unknown as RdfaAttrs),
  )?.(attrs as unknown as RdfaAttrs);
  if (migration && migration.getAttrs) {
    return migration.getAttrs(element);
  }
  return attrs;
}

export function contentElementWithMigrations(
  modelMigrations: ModelMigrationGenerator[],
  rdfaAware: boolean,
  element: HTMLElement,
) {
  if (rdfaAware && modelMigrations.length > 0) {
    const attrs = getRdfaAttrs(element, { rdfaAware });
    if (attrs) {
      const migration = modelMigrations.find((migration) =>
        migration(attrs as unknown as RdfaAttrs),
      )?.(attrs as unknown as RdfaAttrs);
      if (migration && migration.contentElement) {
        return migration.contentElement(element);
      }
    }
  }
  return getRdfaContentElement(element);
}
