import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';
import { tracked } from 'tracked-built-ins';

export default class ResponsiveToolbar extends Component {
  toolbar?: HTMLElement;
  toolbarMain?: HTMLElement;
  toolbarSide?: HTMLElement;

  setUpMainToolbar = modifier(
    (element: HTMLElement) => {
      const observer = new IntersectionObserver(
        this.handleToolbarIntersection.bind(this),
        {
          root: element,
          threshold: 1,
        }
      );
      for (const child of element.children) {
        child.setAttribute('data-index', '');
        observer.observe(child);
      }
      this.toolbarMain = tracked(element);
    },
    { eager: false }
  );

  setUpSideToolbar = modifier(
    (element: HTMLElement) => {
      const observer = new IntersectionObserver(
        this.handleToolbarIntersection.bind(this),
        {
          root: element,
          threshold: 1,
        }
      );
      for (const child of element.children) {
        child.setAttribute('data-index', '');
        observer.observe(child);
      }
      this.toolbarSide = element;
    },
    { eager: false }
  );

  get showMainToolbarOptions() {
    console.log('get');
    return this.toolbarMain?.querySelector("[data-hidden='true']");
  }

  handleToolbarIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.setAttribute('data-hidden', 'false');
      } else {
        entry.target.setAttribute('data-hidden', 'true');
      }
    });
  }
}
