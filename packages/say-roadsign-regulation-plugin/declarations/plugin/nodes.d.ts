import { type NodeSpec } from '@lblod/ember-rdfa-editor';
import { type ModelMigrationGenerator } from '@lblod/ember-rdfa-editor/core/rdfa-types';
export declare const roadsign_regulation: NodeSpec;
/**
 * Migrates documents from a data model featuring multiple nested inline_rdfa nodes to one that uses
 * namedNodes to encode everything in one inline_rdfa
 **/
export declare const trafficSignalMigration: ModelMigrationGenerator;
export declare const trafficMeasureModelMigration: ModelMigrationGenerator;
/**
 * @deprecated moved to trafficMeasureModelMigration
 */
export declare const trafficMeasureZonalityMigration: ModelMigrationGenerator;
