import { ComponentFixture, TestBed } from '@angular/core/testing';

import TodoSkeletonComponent from './todo-skeleton.component';

describe('TodoSkeletonComponent', () => {
  let component: TodoSkeletonComponent;
  let fixture: ComponentFixture<TodoSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoSkeletonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodoSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
