import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MovesCounterComponent } from './moves-counter.component';

describe('MovesCounterComponent', () => {
  let component: MovesCounterComponent;
  let fixture: ComponentFixture<MovesCounterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovesCounterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovesCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
