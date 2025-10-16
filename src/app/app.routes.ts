import { Routes } from '@angular/router';
import { VideoPlayer } from './features/video-player/video-player';

export const routes: Routes = [
  { path: '', redirectTo: 'video', pathMatch: 'full' },
  { path: 'video', component: VideoPlayer },
  { path: '**', redirectTo: 'video' },
];
