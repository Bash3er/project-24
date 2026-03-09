import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

// Directive: Highlights popular courses with a glowing border
@Directive({
  selector: '[appHighlightPopular]',
  standalone: true,
})
export class HighlightPopularDirective implements OnInit {
  @Input() appHighlightPopular: boolean = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    if (this.appHighlightPopular) {
      this.renderer.setStyle(this.el.nativeElement, 'border', '2px solid #f59e0b');
      this.renderer.setStyle(this.el.nativeElement, 'box-shadow', '0 0 0 4px rgba(245,158,11,0.15)');
    }
  }
}

// Directive: Adds a "NEW" badge indicator for new courses
@Directive({
  selector: '[appNewBadge]',
  standalone: true,
})
export class NewBadgeDirective implements OnInit {
  @Input() appNewBadge: boolean = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    if (this.appNewBadge) {
      this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
      const badge = this.renderer.createElement('span');
      this.renderer.setStyle(badge, 'position', 'absolute');
      this.renderer.setStyle(badge, 'top', '-8px');
      this.renderer.setStyle(badge, 'right', '-8px');
      this.renderer.setStyle(badge, 'background', '#10b981');
      this.renderer.setStyle(badge, 'color', '#fff');
      this.renderer.setStyle(badge, 'font-size', '9px');
      this.renderer.setStyle(badge, 'font-weight', '700');
      this.renderer.setStyle(badge, 'padding', '2px 6px');
      this.renderer.setStyle(badge, 'border-radius', '20px');
      this.renderer.setStyle(badge, 'letter-spacing', '0.5px');
      const text = this.renderer.createText('NEW');
      this.renderer.appendChild(badge, text);
      this.renderer.appendChild(this.el.nativeElement, badge);
    }
  }
}
