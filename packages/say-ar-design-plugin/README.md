# @lblod/say-ar-design-plugin

[![Build Status](https://build.redpencil.io/api/badges/402/status.svg)](https://build.redpencil.io/repos/402)

A plugin for [say-editor](https://say-editor.com) RDFa aware text editor, which enables insertion of annotated "Aanvullend Reglementen" designs into Flemish municipality documents.

This documentation is incomplete, please use the [lblod-plugins page of the test-app](test-app/app/templates/lblod-plugins.gts) to see an example of integrating this plugin into an installation of say-editor.

### ArDesignQuery function

It is necessary to pass a function to the @designQuery argument of the SidebarWidget component to fetch AR design information.
This has the following signature:

```ts
type ArDesignQuery = (pagination: Pagination) => Promise<DesignInfo>;

type Pagination = {
  pageNumber: number;
  pageSize: number;
  sort?: "name" | "-name" | "date" | "-date";
  nameFilter?: string;
};

type DesignInfo = {
  /** the designs themselves */
  designs: ArDesign[];
  /**
   * for each design, a promise resolving to the number of documents this design is used in
   * (indexed by id)
   */
  inDocs: Record<string, Promise<number>>;
};

interface ArDesign {
  id: string | null;
  uri: string;
  name: string;
  date: Date;

  measureDesigns: AsyncHasMany<MeasureDesign> | Promise<MeasureDesign[]>;
}
interface MeasureDesign {
  id: string | null;
  uri: string;

  trafficSignals: HasMany<TrafficSignal> | TrafficSignal[];

  measureConcept: MeasureConcept;

  unusedSignalConcepts: HasMany<TrafficSignalConcept> | TrafficSignalConcept[];

  unIncludedSignalConcepts:
    | HasMany<TrafficSignalConcept>
    | TrafficSignalConcept[];

  variableInstances: HasMany<VariableInstance> | VariableInstance[];
}
interface TrafficSignal {
  id: string | null;
  uri: string;
  designStatus?: string;

  trafficSignalConcept: TrafficSignalConcept;
}
interface TrafficSignalConcept {
  id: string | null;
  uri: string;
  code: string;
  regulatoryNotation?: string;
  type: string;

  categories: RoadSignCategory[];
}
interface RoadSignCategory {
  id: string | null;
  uri: string;
  label: string;
}
interface MeasureConcept {
  id: string | null;
  uri: string;
  label: string;
  templateString: string;
  rawTemplateString: string;
}
interface VariableInstance {
  id: string | null;
  uri: string;
  value?: string;
  valueLabel?: string;

  variable: Variable;
}
export default interface Variable {
  id: string | null;
  type: "text" | "number" | "date" | "codelist" | "location";

  label: string;
  uri: string;
  source: string;
  codelist?: string;
}
```
