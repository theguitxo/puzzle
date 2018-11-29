import { Component, OnInit, OnDestroy, Inject, Renderer2, Output, EventEmitter, ViewChild, ElementRef, Input } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-pop-up',
  templateUrl: './pop-up.component.html',
  styleUrls: ['./pop-up.component.scss']
})
export class PopUpComponent implements OnInit, OnDestroy {

  @Input('title') title: string;
  @Input('message') message: string;
  @Input('type') type: string;
  
  /**
   * OUTPUTS
   *   - close: behaviour to execute when the player closes the popup
   *   - confirm: what to do when the player says yes to a confirm popup
   */
  @Output('close') close: EventEmitter<void> = new EventEmitter<void>();
  @Output('confirm') confirm: EventEmitter<void> = new EventEmitter<void>();

  // VIEWS: used for add and remove classes for fades when the player closes the popup
  @ViewChild('contentPopUp') contentPopUp: ElementRef;
  @ViewChild('shadowPopUp') shadowPopUp: ElementRef;
  
  constructor(@Inject(DOCUMENT) document,
              private renderer: Renderer2) { }

  /**
   * @name ngOnInit
   */
  ngOnInit(): void {
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
  }

  /**
   * @name ngOnDestroy
   */
  ngOnDestroy(): void {
    this.renderer.setStyle(document.body, 'overflow', 'visible');
  }

  /**
   * @name closePopUp
   * @param cancelButton 
   */
  closePopUp(cancelButton:boolean = false): void {

    let timeOutFadeOut: any = null;
    let timeOutFadeOutBackground: any = null;

    this.renderer.addClass(this.contentPopUp.nativeElement, "fade-out");
    timeOutFadeOut = setTimeout(() => {

      this.renderer.addClass(this.shadowPopUp.nativeElement, "fade-out-background");
      timeOutFadeOutBackground = setTimeout(() => {

        if (this.type === 'alert' || cancelButton) {
          this.close.emit();
        } else if (this.type === 'confirm') {
          this.confirm.emit();
        }

        clearTimeout(timeOutFadeOut);
        clearTimeout(timeOutFadeOutBackground);
        timeOutFadeOut = null;
        timeOutFadeOutBackground = null;

      }, 500);

    }, 1000);

  }

}
