import { Component, OnInit, DoCheck, Input } from '@angular/core';

@Component({
  selector: 'app-time-counter',
  templateUrl: './time-counter.component.html',
  styleUrls: ['../../points.common.styles.scss', './time-counter.component.scss']
})
export class TimeCounterComponent implements OnInit, DoCheck {

  @Input('seconds') seconds: number;

  // the minutes and seconds that will show when the user is playing the game
  secondsValue: string;
  minutesValue: string;

  /**
   * constructor
   * init the values for minutes and seconds
   */
  constructor() {
    this.secondsValue = '00';
    this.minutesValue = '00';
  }

  /**
   * ngOnInit
   */
  ngOnInit(): void {
  }

  /**
   * ngDoCheck
   * updates the value for minutes and seconds
   */
  ngDoCheck(): void {
    
    if(this.seconds !== undefined) {
      this.minutesValue = `00${(Math.floor(this.seconds / 60)).toString()}`.substr(-2);
      this.secondsValue = `00${this.seconds % 60}`.substr(-2);
    }

  }

}
