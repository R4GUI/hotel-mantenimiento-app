import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParaHoyComponent } from './para-hoy.component';

describe('ParaHoyComponent', () => {
  let component: ParaHoyComponent;
  let fixture: ComponentFixture<ParaHoyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParaHoyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParaHoyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
