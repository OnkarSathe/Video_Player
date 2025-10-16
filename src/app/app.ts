import { Component, computed, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ThemeMode } from './shared/enums/theme-mode.enum';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule, MatSlideToggleModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('prasanna-assignment');
  protected themeMode = signal<ThemeMode>(ThemeMode.Light);
  protected darkMode = computed<boolean>(() => this.themeMode() === ThemeMode.Dark);

  protected onToggleTheme(next: boolean): void {
    this.themeMode.set(next ? ThemeMode.Dark : ThemeMode.Light);
    const body = document.body;
    if (next) {
      body.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
    }
  }
}
