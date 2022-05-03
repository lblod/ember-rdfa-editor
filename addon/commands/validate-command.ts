import Command from '@lblod/ember-rdfa-editor/commands/command';
import Model from '@lblod/ember-rdfa-editor/model/model';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import Controller from '../model/controller';
import { DataFactory } from 'rdf-data-factory';
import dataset, { FastDataset } from '@graphy/memory.dataset.fast';
import rdflib from "rdflib";
import SHACLValidator from 'rdf-validate-shacl';

const file = `@prefix sh:      <http://www.w3.org/ns/shacl#> .
    @prefix qb:      <http://purl.org/linked-data/cube#> .
    <https://data.vlaanderen.be/shacl/besluit-publicatie#ZittingShape>
      a sh:NodeShape ;
      sh:targetClass <http://data.vlaanderen.be/ns/besluit#Zitting> ;
        sh:property [
        sh:name "behandelt" ;
        sh:description "Een formeel vastgelegd agendapunt van de zitting." ;
        sh:path <http://data.vlaanderen.be/ns/besluit#behandelt> ;
        sh:class <http://data.vlaanderen.be/ns/besluit#Agendapunt> ;
        sh:minCount 1 ;
      ] ;
      sh:property [
        sh:name "start" ;
        sh:description "Tijdstip waarop de zitting begint." ;
        sh:path <http://www.w3.org/ns/prov#startedAtTime> ;
        sh:datatype <http://www.w3.org/2001/XMLSchema#dateTime> ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
      ] ;
      sh:property [
        sh:name "eind" ;
        sh:description "Tijdstip waarop de zitting eindigt." ;
        sh:path <http://www.w3.org/ns/prov#endedAtTime> ;
        sh:datatype <http://www.w3.org/2001/XMLSchema#dateTime> ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
      ] ;
      sh:property [
        sh:name "geplandeStart" ;
        sh:description "Het tijdstip waarop de zitting gepland is om te beginnen." ;
        sh:path <http://data.vlaanderen.be/ns/besluit#geplandeStart> ;
        sh:datatype <http://www.w3.org/2001/XMLSchema#dateTime> ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
      ] ;
        sh:property [
        sh:name "isGehoudenDoor" ;
        sh:description "Duidt aan door welk orgaan de zitting is gehouden." ;
        sh:path <http://data.vlaanderen.be/ns/besluit#isGehoudenDoor> ;
        sh:class <http://data.vlaanderen.be/ns/besluit#Bestuursorgaan> ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
      ] ;
        sh:closed false .
    <https://data.vlaanderen.be/shacl/besluit-publicatie#BehandelingVanAgendapuntShape>
      a sh:NodeShape ;
      sh:targetClass <http://data.vlaanderen.be/ns/besluit#BehandelingVanAgendapunt> ;
      sh:property [
        sh:name "heeftOnderwerp" ;
        sh:description "Het onderwerp van de activiteit." ;
        sh:path <http://purl.org/dc/terms/subject> ;
        sh:class <http://data.vlaanderen.be/ns/besluit#Agendapunt> ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
      ] ;
      sh:property [
        sh:name "gebeurtNa" ;
        sh:description "Verwijzing naar het voorgaand behandeld agendapunt binnen dezelfde zitting. Laat toe om de volgorde van de behandelingen op te bouwen." ;
        sh:path <http://data.vlaanderen.be/ns/besluit#gebeurtNa> ;
        sh:class <http://data.vlaanderen.be/ns/besluit#BehandelingVanAgendapunt> ;
        sh:maxCount 1 ;
      ] ;
      sh:property [
        sh:name "geeftAanleidingTot" ;
        sh:description "Een besluit dat is opgemaakt naar aanleiding van de behandeling van het agendapunt." ;
        sh:path <http://www.w3.org/ns/prov#generated> ;
        sh:class <http://data.vlaanderen.be/ns/besluit#Besluit> ;
        sh:minCount 1 ;
      ] ;
      sh:property [
        sh:name "heeftStemming" ;
        sh:description "Een stemming die plaatsvond tijdens de behandeling van het agendapunt." ;
        sh:path <http://data.vlaanderen.be/ns/besluit#heeftStemming> ;
        sh:class <http://data.vlaanderen.be/ns/besluit#Stemming> ;
      ] ;
      sh:property [
        sh:name "openbaar" ;
        sh:description "Geeft aan of de bespreking effectief openbaar verlopen is." ;
        sh:path <http://data.vlaanderen.be/ns/besluit#openbaar> ;
        sh:datatype <http://www.w3.org/2001/XMLSchema#boolean> ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
      ] ;
      sh:closed false .
      <https://data.vlaanderen.be/shacl/besluit-publicatie#BesluitShape>
      a sh:NodeShape ;
      sh:targetClass <http://data.vlaanderen.be/ns/besluit#Besluit> ;
      sh:property [
        sh:name "beschrijving" ;
        sh:description "Een beknopte beschrijving van het besluit." ;
        sh:path <http://data.europa.eu/eli/ontology#description> ;
        sh:datatype <http://www.w3.org/2001/XMLSchema#string> ;
        sh:maxCount 1 ;
      ] ;
      sh:property [
        sh:name "citeeropschrift" ;
        sh:description "De beknopte titel of officiële korte naam van een decreet, wet, besluit... Deze wordt officieel vastgelegd. Deze benaming wordt in de praktijk gebruikt om naar de rechtsgrond te verwijzen." ;
        sh:path <http://data.europa.eu/eli/ontology#title_short> ;
        sh:datatype <http://www.w3.org/2001/XMLSchema#string> ;
        sh:maxCount 1 ;
      ] ;
      sh:property [
        sh:name "titel" ;
        sh:description "Titel van de legale verschijningsvorm." ;
        sh:path <http://data.europa.eu/eli/ontology#title> ;
        sh:datatype <http://www.w3.org/2001/XMLSchema#string> ;
        sh:minCount 1 ;
      ] ;
      sh:property [
        sh:name "taal" ;
        sh:description "De taal van de verschijningsvorm." ;
        sh:path <http://data.europa.eu/eli/ontology#language> ;
        sh:class <http://www.w3.org/2004/02/skos/core#Concept> ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
        qb:codeList <http://publications.europa.eu/mdr/authority/language/index.html> ;
      ] ;
      sh:closed false .`;

export default class ValidateCommand extends Command {
  name = 'validate';

  constructor(model: Model) {
    super(model);
  }

  canExecute(): boolean {
    return true;
  }

  async loadDataset (filePath) {
    console.log('parsing')
    var uri = 'https://example.org/resource.ttl'
    var mimeType = 'text/turtle'
    var store = rdflib.graph()
    rdflib.parse(file, store, uri, mimeType)
    return store.statements;
  }

  @logExecute
  async execute(controller: Controller, range: ModelRange | null = this.model.selection.lastRange): void {

    console.log(controller.datastore.dataset);
    const shapes = await this.loadDataset('/decision-list.ttl')
    const data = controller.datastore.dataset;
    console.log(data)
    console.log('validating')
    const factory = new DataFactory()
    factory.dataset = dataset
    console.log(shapes)
    console.log(factory)
    const validator = new SHACLValidator(shapes, { factory });
    const report = await validator.validate(data);
    console.log(report);
    // Check conformance: `true` or `false`
    console.log(report.conforms);
    for (const result of report.results) {
      // See https://www.w3.org/TR/shacl/#results-validation-result for details
      // about each property
      console.log(result.message);
      console.log(result.path);
      console.log(result.focusNode);
      console.log(result.severity);
      console.log(result.sourceConstraintComponent);
      console.log(result.sourceShape);
    }

    // Validation report as RDF dataset
    console.log(report.dataset);
    return;
  }
}
