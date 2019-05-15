import Controller from '@ember/controller';

export default Controller.extend({
  isEditable: true,
  value: `
  <div resource="#"
       typeof="foaf:Document">
    <div typeof="Zitting" resource="#Zitting">
      <span property="heeftNotulen" resource="#"></span>
      <h1 class="h1">Agenda</h1>
      <span property="dc:title">Dit is een titel</span>
      <div>Gelet op <span>het gemeentedecreet</span></div>
      <div property="behandelt" resource="#Agendapunt1" typeof="Agendapunt">
        <span property="geplandOpenbaar" datatype="xsd:boolean" content="true">Gepland openbaar:</span>
        <span property="dc:title">
          <span property="Agendapunt.type" resource="Kennisname">Kennisname</span> ontslag burgemeester
        </span>
      </div>
      <i><b>foo </b> </i>
      <div> no rdfa here
         <span> a nested span no rdfa here </span>
      </div>
      <span> a non-nested span without rdfa</span>
        <ul class="bullet-list">
          <li>List Item 1</li>
          <li>List Item 2</li>
          <li>List Item 3</li>
        </ul>
        <h4 class="h4">Hello world</h4>
        <ul>
          <li style="display: inline;">Inline list Item 1,</li>
          <li style="display: inline;">Inline list Item 2,</li>
          <li style="display: inline;" resource="#Baz" typeof="mandaat:Baz">Inline list Item 3 with different context</li>
        </ul>
        <div>
          <div>Div item 1</div>
          <div>Div item 2</div>
          <div>Div item 3</div>
        </div>
        <div>
          <div style="display: inline;">
            <div style="display: inline;">Nested Inline Div item 1</div>
          </div>
          <div style="display: inline;">Inline Div item 2</div>
          <div style="display: inline;">Inline Div item 3</div>
        </div>
      <div property="behandelt" resource="#Agendapunt5" typeof="Agendapunt AgendapuntOverKennisname">
        <meta property="aangebrachtNa" resource="#Agendapunt1" /> <!-- We hebben de andere agendapunten niet -->
        <span property="geplandOpenbaar" datatype="xsd:boolean" content="true">Gepland openbaar:</span>
        <span property="dc:title">
          <span property="Agendapunt.type" resource="Kennisname">Mededeling</span> benoeming en eedaflegging burgemeester
        </span>
      </div>
    </div>
    <hr />
    <div typeof="BehandelingVanAgendapunt" resource="#Behandeling1">
      <meta property="dc:subject" resource="#Agendapunt1" typeof="Agendapunt" />
      <span property="openbaar" datatype="xsd:boolean" content="true">De gemeenteraad in openbare vergadering,</span>
      <div property="prov:generated" resource="#Besluit1" typeof="Besluit">
        <meta property="eli:realizes" resource="#Rechtsgrond1" typeof="eli:LegalResource" />
        <span property="eli:title">Kennisname ontslag burgemeester</span>, <!-- Should be higher up? -->
        <meta property="eli:language" resource="http://publications.europa.eu/resource/authority/language/NLD" />
        <div property="motivering" xml:lang="nl">
          <div>
            <ul class="bullet-list" about="#Rechtsgrond1">
              <li>Gelet op <span property="eli:cites" href="http://data.vlaanderen.be/id/9823">het Gemeentedecreet</span>;</li>
              <li>Gelet op het schrijven van 17 januari 2017 van de heer <a href="http://data.vlaanderen.be/id/mandataris_Roger%20Gabriëls">Alfons(??) Gabriëls</a> aan de Vlaams Minister van Binnenlands Bestuur, Inburgering, Wonen, Gelijke Kansen en Armoedebestrijding, mevrouw Liesbeth Homans, waarbij de heer Gabriëls zijn ontslag indient als burgemeester met ingang van 1 april 2017;</li>
              <li>Gelet op <a property="eli:cites" href="http://data.vlaanderen.be/id/1223">het ministerieel besluit van 8 maart 2017</a> van de Vlaamse minister van Binnenlands Bestuur, Inburgering, Wonen, Gelijke Kansen en Armoedebestrijding, mevrouw Liesbeth Homans, houdende aanvaarding van het ontslag van de heer <a href="http://data.vlaanderen.be/id/mandataris_Roger%20Gabriëls">Alfons Gabriëls</a> als burgemeester van de gemeente Herenthout;</li>
              <li>Gelet op het schrijven van de heer <a href="http://data.vlaanderen.be/id/mandataris_Alfons%20Gabriëls">Roger Gabriëls</a> aan de voorzitter van de gemeenteraad waarbij hij vanaf 1 april 2017 tevens zijn ontslag aanbiedt als gemeenteraadslid;</li>
            </ul>
          </div>
        </div>
        <!-- De beoogde rechtsgevolgen staan los van de beslissingen die genomen worden.  Het lijkt dat deze moeten passen in LegaleVerschijningsvorm#inhoud (prov:value).  Dit lijkt echter ook gebruikt te worden voor de specifieke beslissing (met de inhoud en de artikelen). -->
        Besluit:
        <div property="prov:value">
          Enig artikel.
          <span resource="#Besluit1_Artikel1" typeof="Artikel">
            <div property="eli:realizes" resource="#Rechtsgrond1_Artikel1" typeof="eli:LegalResourceSubdivision mandaat:RechtsgrondBeeindiging">
              <meta property="eli:is_part_of" resource="#Rechtsgrond1" />
            </div>
            <div property="prov:value">
              De gemeenteraad neemt kennis van het ontslag van <span about="http://data.vlaanderen.be/id/mandataris_Roger%20Gabriëls"><span property="mandaat:isOntslagenDoor" resource="#Rechtsgrond1">de heer Alfons Gabriëls als burgemeester en gemeenteraadslid van de gemeente Herenthout</span></span> met ingang van <span about="http://data.vlaanderen.be/id/mandataris_Roger%20Gabriëls"><span property="mandaat:einde"  datatype="xsd:date" content="2017-04-01">1 april 2017</span></span>.
            </div>
          </span>
        </div>
      </div>
    </div>
    <div typeof="BehandelingVanAgendapunt" resource="#Behandeling5">
      <meta property="dc:subject" resource="#Agendapunt5" />
      <div property="prov:generated" resource="#Besluit5" typeof="Besluit">
        <h1 property="eli:title">Mededeling benoeming en eedaflegging burgemeester</h1>
        <div about="#Behandeling5">
          <!-- niet-geannoteerde content van behandeling agendapunt -->
          <p>De burgemeester dankt zijn voorganger en geeft toelichting bij de nieuwe verdeling van de bevoegdheden binnen het college.</p>
          <!-- niet-geannotteerde content van behandeling agendapunt -->
          <p>Hij spreekt zijn hoop uit dat in een constructieve geest en met respect voor elkaar kan samengewerkt worden binnen de raad.</p>
          <span property="openbaar" datatype="xsd:boolean" content="true">De gemeenteraad in openbare vergadering,</span>
        </div>
        <meta property="eli:realizes" resource="#Rechtsgrond5" typeof="eli:LegalResource" />
        <meta property="eli:language" resource="http://publications.europa.eu/resource/authority/language/NLD" /> <!-- redundant voor Vlaanderen -->
        <div property="motivering" xml:lang="nl">
          <ul class="bullet-list" about="#Rechtsgrond5">
            <!-- Binnen de motivering is veel inhoud niet semantisch geannoteerd :/ -->
            <li>Gelet op <a property="eli:cites" href="http://data.vlaanderen.be/id/9823">het Gemeentedecreet van 15 juli 2005 en latere wijzigingen</a>;</li>
            <li>Gelet op <a property="eli:cites" href="#Rechtsgrond1_Artikel1">het besluit van onze raad van heden houdende kennisname van het ontslag van de heer Roger Gabriëls als burgemeester</a>;</li>
            <li>Gelet op de akte van voordracht, die werd ingediend bij de Gouverneur van de provincie Antwerpen met brief van 3 februari 2017, op grond waarvan de heer Patrick Heremans wordt voorgedragen voor het ambt van burgemeester van de gemeente Herenthout;</li>
            <li>Overwegende dat de akte van voordracht ontvankelijk is;</li>
            <li>Overwegende dat uit het advies van de Procureur-generaal van het Hof van Beroep te Antwerpen, uitgebracht op 3 maart 2017, blijkt dat er geen belemmering is voor de benoeming van de heer Patrick Heremans;</li>
            <li>Gelet op <a property="eli:cites" href="http://data.vlaanderen.be/id/3409">het ministerieel besluit van 16 maart 2017 van de Vlaamse minister van Binnenlands Bestuur, Inburgering, Wonen, Gelijke Kansen en Armoedebestrijding, mevrouw Liesbeth Homans, houdende de benoeming van de heer Patrick Heremans tot burgemeester van de gemeente Herenthout</a>;</li>
            <li>Gelet op de eedaflegging door de heer Patrick Heremans in handen van de Gouverneur van de provincie Antwerpen op 20 maart 2017, zoals bevestigd in de berichtgeving van de Gouverneur op datum van 20 maart 2017 met kenmerk KG/307/benoeming bgm Herenthout;</li>
          </ul>
        </div>
        Besluit:
        <div property="prov:value">
          Enig artikel.
          <span resource="#Besluit5_Artikel1" typeof="Artikel">
            <div property="eli:realizes" resource="#Rechtsgrond5_Artikel1" typeof="eli:LegalResourceSubdivision mandaat:RechtsgrondAanstelling">
              <meta property="eli:is_part_of" resource="#Rechtsgrond5" />
            </div>
            De gemeenteraad neemt kennis van de eedaflegging door en benoeming van <span about="#Rechtsgrond5_Artikel1"><span property="mandaat:bekrachtigtAanstellingVan" resource="http://data.vlaanderen.be/id/mandataris_Patrick%20Heremans">de heer Patrick Heremans als burgemeester van de gemeente Herenthout</span></span> met ingang van <span about="http://data.vlaanderen.be/id/mandataris_Patrick%20Heremans"><span property="mandaat:start" datatype="xsd:dateTime" content="2017-04-01T00:00:00+01:00">1 april 2017</span></span>.
          </span>
        </div>
      </div>
    </div>
  </div>`,
  actions: {
    debug(info) {
      this.set('debug', info);
    },
    rdfaEditorInit(rawEditor) {
      this.set('rawEditor', rawEditor);
    }
  }
});
