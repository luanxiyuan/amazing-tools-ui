import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FaviconService {
  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  setFavicon(url: string): void {
    const link: HTMLLinkElement = this.renderer.createElement('link');
    link.rel = 'icon';
    link.href = url;

    const head = this.renderer.selectRootElement('head', true);
    const existingLink = head.querySelector('link[rel="icon"]');
    if (existingLink) {
      this.renderer.removeChild(head, existingLink);
    }
    this.renderer.appendChild(head, link);
  }
}