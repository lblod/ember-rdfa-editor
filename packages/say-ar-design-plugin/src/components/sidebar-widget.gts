import { on } from '@ember/modifier';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { tracked } from 'tracked-built-ins';
import t from 'ember-intl/helpers/t';
import type IntlService from 'ember-intl/services/intl';
import { task } from 'ember-concurrency';
import { getPromiseState } from 'reactiveweb/get-promise-state';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import type { SayController } from '@lblod/ember-rdfa-editor';
import ArWidgetContents from '#root/components/widget-contents.gts';
import InsertControls from '#root/components/insert-controls.gts';
import type ArDesign from '#root/plugin/models/ar-design.ts';
import type ArImporterService from '#root/services/ar-importer.ts';
import type { GenerateImportResult } from '#root/services/ar-importer.ts';
import generateDesignSignTree from '#root/plugin/utils/generate-design-sign-tree.ts';
import generateMeasureTemplate from '#root/plugin/utils/generate-measure-template.ts';
import { getCurrentBesluitRange } from '@lblod/ember-rdfa-editor/utils/_private/lblod-utils/decision-utils';
import { getArticleNodes } from '@lblod/ember-rdfa-editor/utils/_private/lblod-utils/document-structure-utils';
import { ROADSIGN_REGULATION_DECISION_TYPES } from '@lblod/say-roadsign-regulation-plugin/plugin/constants';
import {
  afterLastArticle,
  ArticleInsertPosition,
  beforeFirstArticle,
} from '#root/plugin/utils/article-insert-position.ts';
import type {
  ArDesignQuery,
  ArticlePosition,
  InsertPositionOption,
  InstructionVariableQuery,
  ProcessDocumentHeadlessly,
} from '#root/plugin/types.ts';
import { ArrowLeftIcon } from '@appuniversum/ember-appuniversum/components/icons/arrow-left';

export type ArDesignSidebarWidgetSig = {
  Args: {
    controller: SayController;
    designQuery: ArDesignQuery;
    instructionVariableQuery: InstructionVariableQuery;
    processDocumentHeadlessly: ProcessDocumentHeadlessly;
    /** Instead of finding a decision node in the document, pass the relevant URI and type */
    decisionContext?: {
      decisionUri: string;
      decisionType?: string;
    };
    regulatoryStatementMode?: boolean;
  };
  Element: HTMLLIElement;
};

export default class ArDesignSidebarWidget extends Component<ArDesignSidebarWidgetSig> {
  @service declare arImporter: ArImporterService;
  @service declare intl: IntlService;

  @tracked modalOpen = false;
  @tracked articles: ArticlePosition[] = [];
  @tracked selectedDesign?: ArDesign | null;
  @tracked _insertPosition: InsertPositionOption | null = null;
  openModal = () => {
    this.articles = getArticleNodes(this.args.controller.mainEditorState);
    this.modalOpen = true;
  };
  closeModal = () => {
    this.modalOpen = false;
    this.selectedDesign = null;
  };
  get disableInsert() {
    if (this.args.regulatoryStatementMode) return false;
    const decisionContext = this.args.decisionContext;
    return decisionContext
      ? !!decisionContext.decisionType &&
          ROADSIGN_REGULATION_DECISION_TYPES.includes(
            decisionContext.decisionType,
          )
      : !getCurrentBesluitRange(this.args.controller);
  }

  selectDesign = (design: ArDesign) => {
    this.selectedDesign = design;
    this._insertPosition = null;
  };

  returnToOverview = () => {
    this.selectedDesign = null;
  };

  @cached
  get measureDesignSignTree() {
    return generateDesignSignTree(this.selectedDesign as ArDesign);
  }

  get measureDesigns() {
    return getPromiseState(this.measureDesignSignTree);
  }

  get measureTemplates(): string[] | undefined {
    return this.measureDesigns.resolved?.map((signTree) =>
      generateMeasureTemplate(signTree.signs),
    );
  }

  get allInstructionsSelected() {
    const measureDesigns = this.measureDesigns.resolved
    if(!measureDesigns) return false;
    for(const signTree of measureDesigns) {
      const signs = signTree.signs
      for (const sign of signs) {
        if(!sign.mainSign.selectedInstruction) return false;
        for (const subSign of sign.subSigns) {
          if (!subSign.selectedInstruction) return false
        }
      }
    }
    return true;
  }

  get beforeFirst(): InsertPositionOption {
    return {
      value: beforeFirstArticle,
      label: this.intl.t('ar-importer.controls.first'),
    };
  }
  get afterLast(): InsertPositionOption {
    return {
      value: afterLastArticle,
      label: this.intl.t('ar-importer.controls.last'),
    };
  }

  get onCursor(): InsertPositionOption {
    return {
      value: false,
      label: this.intl.t('ar-importer.controls.on-cursor'),
    };
  }

  get articleOptions(): InsertPositionOption[] {
    return this.articles.map((_, i) => ({
      value: new ArticleInsertPosition(i),
      label: this.intl.t('ar-importer.controls.after-article-x', {
        articleNumber: i + 1,
      }),
    }));
  }

  get options(): InsertPositionOption[] {
    if (this.args.regulatoryStatementMode) {
      return [this.onCursor];
    } else {
      return [
        this.afterLast,
        this.beforeFirst,
        this.onCursor,
        ...this.articleOptions,
      ];
    }
  }

  get insertPosition(): InsertPositionOption {
    if (this._insertPosition) {
      return this._insertPosition;
    } else {
      return this.args.regulatoryStatementMode ? this.onCursor : this.afterLast;
    }
  }

  setInsertPosition = (val: InsertPositionOption | null) => {
    this._insertPosition = val;
  };

  doInsert = (monads: GenerateImportResult['result']) => {
    const isSuccess = this.arImporter.insertAr(this.args.controller, monads);
    if (isSuccess) {
      this.closeModal();
    }
  };

  insertAr = task(
    async (
      design: ArDesign,
      insertPos: ArticleInsertPosition,
      skipWarnings?: boolean,
    ) => {
      const monadsResult = await this.arImporter.generateInsertionMonads(
        design,
        insertPos,
        this.args.controller,
        this.args.decisionContext?.decisionUri,
        this.args.regulatoryStatementMode,
        this.measureTemplates,
        this.args.instructionVariableQuery,
      );
      if (skipWarnings || monadsResult.warnings.length === 0) {
        this.doInsert(monadsResult.result);
      }
    },
  );
  returnToOverView() {
    this.resetVariables()
  }
  resetVariables() {
    this.selectedDesign = undefined;
  }

  <template>
    <li class="au-c-list__item" ...attributes>
      <AuButton
        @icon="add"
        @iconAlignment="left"
        @skin="link"
        @disabled={{this.disableInsert}}
        {{on "click" this.openModal}}
      >
        {{t "ar-importer.sidebar-widget.label"}}
      </AuButton>
    </li>
    <AuModal
      @size="large"
      @modalOpen={{this.modalOpen}}
      @closeModal={{this.closeModal}}
      @title={{t "ar-importer.modal.title"}}
      @padding="none"
      as |modal|
    >
      <modal.Body>
        <ArWidgetContents
          @designQuery={{@designQuery}}
          @onSelectDesign={{this.selectDesign}}
          @selectedDesign={{this.selectedDesign}}
          @onReturnToOverview={{this.returnToOverview}}
          @processDocumentHeadlessly={{@processDocumentHeadlessly}}
          @measureDesigns={{this.measureDesigns}}
          @measureTemplates={{this.measureTemplates}}
          @options={{this.options}}
          @insertPosition={{this.insertPosition}}
          @setInsertPosition={{this.setInsertPosition}}
        />
      </modal.Body>
      {{#if this.selectedDesign}}
        <modal.Footer>
          <div class='au-u-flex au-u-flex--between au-u-flex--vertical-center'>
            <AuButton @skin="link"
                @icon={{ArrowLeftIcon}} {{on "click" this.returnToOverview}}> {{t "ar-importer.controls.go-back"}} </AuButton>
            <InsertControls
              @arDesign={{this.selectedDesign}}
              @onInsertAr={{this.insertAr.perform}}
              @insertLoading={{this.insertAr.isRunning}}
              @articles={{this.articles}}
              @regulatoryStatementMode={{@regulatoryStatementMode}}
              @insertPosition={{this.insertPosition.value}}
              @closeModal={{this.closeModal}}
              @insertEnabled={{this.allInstructionsSelected}}
            />
          </div>
        </modal.Footer>
      {{/if}}
    </AuModal>
  </template>
}
