import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-moves-counter',
  templateUrl: './moves-counter.component.html',
  styleUrls: ['../../points.common.styles.scss', './moves-counter.component.scss']
})
export class MovesCounterComponent implements OnInit {

  @Input('moves') moves: number = 0;

  constructor() { }

  ngOnInit() {
  }

}
