/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { App } from './app';

describe('AppComponent', () => {
  let component: App;
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, MatToolbarModule, MatSlideToggleModule, BrowserAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with light theme', () => {
    expect(component['themeMode']()).toBe('light');
    expect(component['darkMode']()).toBeFalse();
  });

  it('should toggle theme correctly', () => {
    component['onToggleTheme'](true);

    expect(component['themeMode']()).toBe('dark');
    expect(component['darkMode']()).toBeTrue();
  });

  it('should toggle back to light theme', () => {
    component['onToggleTheme'](true);
    expect(component['themeMode']()).toBe('dark');

    component['onToggleTheme'](false);

    expect(component['themeMode']()).toBe('light');
    expect(component['darkMode']()).toBeFalse();
  });

  it('should add dark theme class to body when toggled', () => {
    const body = document.body;
    const classListSpy = spyOn(body.classList, 'add');
    const removeSpy = spyOn(body.classList, 'remove');

    component['onToggleTheme'](true);
    expect(classListSpy).toHaveBeenCalledWith('dark-theme');

    component['onToggleTheme'](false);
    expect(removeSpy).toHaveBeenCalledWith('dark-theme');
  });

  it('should have correct computed dark mode value', () => {
    component['themeMode'].set('dark' as any);
    expect(component['darkMode']()).toBeTrue();

    component['themeMode'].set('light' as any);
    expect(component['darkMode']()).toBeFalse();
  });

  it('should maintain theme state consistency', () => {
    component['onToggleTheme'](true);

    expect(component['themeMode']()).toBe('dark');
    expect(component['darkMode']()).toBeTrue();
    expect(document.body.classList.contains('dark-theme')).toBeTrue();

    component['onToggleTheme'](false);

    expect(component['themeMode']()).toBe('light');
    expect(component['darkMode']()).toBeFalse();
    expect(document.body.classList.contains('dark-theme')).toBeFalse();
  });
});
