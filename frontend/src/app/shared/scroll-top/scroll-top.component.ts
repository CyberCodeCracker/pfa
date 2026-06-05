import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-scroll-top',
  templateUrl: './scroll-top.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollTopComponent implements OnInit, OnDestroy {
  visible = false;
  private threshold = 400;
  private container: HTMLElement | Window = window;
  private listener = () => this.onScroll();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // The authenticated layout main scrolls the page, not the window — find it.
    // Fallback to window if no scrollable main element is available.
    const main = document.querySelector('main');
    if (main && main.scrollHeight > main.clientHeight) {
      this.container = main as HTMLElement;
    }
    (this.container as any).addEventListener('scroll', this.listener, { passive: true });
    this.onScroll();
  }

  ngOnDestroy(): void {
    (this.container as any).removeEventListener('scroll', this.listener);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const y = this.container === window
      ? window.scrollY
      : (this.container as HTMLElement).scrollTop;
    const next = y > this.threshold;
    if (next !== this.visible) {
      this.visible = next;
      this.cdr.markForCheck();
    }
  }

  scrollToTop(): void {
    if (this.container === window) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      (this.container as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
