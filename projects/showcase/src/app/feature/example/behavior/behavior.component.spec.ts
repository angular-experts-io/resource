import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BehaviorComponent } from './behavior.component';

describe('BehaviorComponent', () => {
  let component: BehaviorComponent;
  let fixture: ComponentFixture<BehaviorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BehaviorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BehaviorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
