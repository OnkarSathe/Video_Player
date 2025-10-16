import { Component, ElementRef, ViewChild, computed, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

// TypeScript interfaces
interface ThumbnailData {
  time: number;
  thumbnail: string;
}

interface SpeedOption {
  value: number;
  label: string;
}

// Removed unused interface

// Configuration constants
const CONFIG = {
  THUMBNAIL: {
    COUNT: 6,
    WIDTH: 120,
    HEIGHT: 68,
    QUALITY: 0.8,
    GENERATION_DELAY: 500,
    METADATA_DELAY: 1000,
  },
  VIDEO: {
    SKIP_SECONDS: 10,
    DEFAULT_VOLUME: 0.5,
    CROSS_ORIGIN: 'anonymous' as const,
  },
  EXAMPLE_VIDEOS: {
    SINTEL: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    BIG_BUCK_BUNNY:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    TEARS_OF_STEEL:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  },
} as const;

@Component({
  selector: 'app-video-player',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './video-player.html',
  styleUrl: './video-player.css',
})
export class VideoPlayer implements OnDestroy {
  protected readonly CONFIG = CONFIG;
  protected readonly defaultUrl = CONFIG.EXAMPLE_VIDEOS.BIG_BUCK_BUNNY;
  protected readonly videoUrl = signal<string>(this.defaultUrl);
  protected urlInput: string = this.defaultUrl;

  @ViewChild('videoEl', { static: true })
  protected videoElRef!: ElementRef<HTMLVideoElement>;

  protected onLoadUrl(): void {
    const el = this.videoElRef?.nativeElement;
    if (!el) return;

    // Clear any previous errors
    this.errorMessage.set('');

    try {
      this.videoUrl.set(this.urlInput);
      el.pause();
      el.src = this.videoUrl();
      el.crossOrigin = CONFIG.VIDEO.CROSS_ORIGIN;
      el.load();

      // Add error event listeners
      el.onerror = () => {
        this.errorMessage.set('Failed to load video. Please check the URL and try again.');
        this.isVideoLoading.set(false);
      };

      void el.play().catch(() => {
        this.errorMessage.set(
          'Failed to play video. Please check if the video format is supported.',
        );
        this.isVideoLoading.set(false);
      });

      // Show placeholder thumbnails immediately
      const timeoutId = window.setTimeout(() => {
        this.showPlaceholderThumbnails();
      }, 100);
      this.timeouts.push(timeoutId);
    } catch {
      this.errorMessage.set('An error occurred while loading the video.');
      this.isVideoLoading.set(false);
    }
  }

  protected loadExampleVideo(url: string): void {
    this.urlInput = url;
    this.onLoadUrl();
  }

  // Player state
  protected readonly isPlaying = signal<boolean>(false);
  protected readonly duration = signal<number>(0);
  protected readonly currentTime = signal<number>(0);
  protected readonly isVideoLoading = signal<boolean>(false);
  protected readonly playbackRate = signal<number>(1);
  protected readonly volume = signal<number>(1);
  protected readonly isMuted = signal<boolean>(false);

  // Error handling
  protected readonly errorMessage = signal<string>('');
  protected readonly hasError = computed(() => this.errorMessage().length > 0);

  // Thumbnail strip feature
  protected readonly showThumbnailStrip = signal<boolean>(true);
  protected readonly thumbnailStripExpanded = signal<boolean>(true);
  protected readonly thumbnailData = signal<ThumbnailData[]>([]);

  // Cleanup tracking
  private readonly timeouts: number[] = [];
  private readonly intervals: number[] = [];

  protected readonly currentTimeLabel = computed(() => this.formatTime(this.currentTime()));
  protected readonly durationLabel = computed(() => this.formatTime(this.duration()));

  // Playback speed options
  protected readonly speedOptions: SpeedOption[] = [
    { value: 0.5, label: '0.5x' },
    { value: 0.75, label: '0.75x' },
    { value: 1, label: '1x' },
    { value: 1.25, label: '1.25x' },
    { value: 1.5, label: '1.5x' },
    { value: 2, label: '2x' },
  ];

  protected onVideoLoadStart(): void {
    this.isVideoLoading.set(true);
  }

  protected onVideoCanPlay(): void {
    this.isVideoLoading.set(false);
  }

  protected onLoadedMetadata(): void {
    const el = this.videoElRef?.nativeElement;
    if (!el) return;
    this.duration.set(isFinite(el.duration) ? el.duration : 0);

    // Show placeholder thumbnails immediately
    this.showPlaceholderThumbnails();

    // Generate thumbnail data when video loads
    const timeoutId = window.setTimeout(() => {
      this.generateThumbnailData();
    }, CONFIG.THUMBNAIL.METADATA_DELAY);
    this.timeouts.push(timeoutId);
  }

  protected onTimeUpdate(): void {
    const el = this.videoElRef?.nativeElement;
    if (!el) return;
    this.currentTime.set(el.currentTime || 0);
    this.isPlaying.set(!el.paused && !el.ended);
  }

  protected togglePlay(): void {
    const el = this.videoElRef?.nativeElement;
    if (!el) return;
    if (el.paused || el.ended) {
      void el
        .play()
        .then(() => this.isPlaying.set(true))
        .catch(() => {
          // Ignore play errors
        });
    } else {
      el.pause();
      this.isPlaying.set(false);
    }
  }

  protected onScrubChange(next: number): void {
    const el = this.videoElRef?.nativeElement;
    if (!el || !isFinite(next)) return;
    el.currentTime = Math.min(Math.max(next, 0), this.duration());
    this.currentTime.set(el.currentTime);
  }

  protected skipBackward(): void {
    const el = this.videoElRef?.nativeElement;
    if (!el) return;
    el.currentTime = Math.max(el.currentTime - CONFIG.VIDEO.SKIP_SECONDS, 0);
    this.currentTime.set(el.currentTime);
  }

  protected skipForward(): void {
    const el = this.videoElRef?.nativeElement;
    if (!el) return;
    el.currentTime = Math.min(el.currentTime + CONFIG.VIDEO.SKIP_SECONDS, this.duration());
    this.currentTime.set(el.currentTime);
  }

  protected onSpeedChange(speed: number): void {
    const el = this.videoElRef?.nativeElement;
    if (!el) return;
    el.playbackRate = speed;
    this.playbackRate.set(speed);
  }

  protected onVolumeChange(volume: number): void {
    const el = this.videoElRef?.nativeElement;
    if (!el) return;
    el.volume = volume;
    this.volume.set(volume);

    // Auto-mute when volume reaches 0
    if (volume === 0) {
      el.muted = true;
      this.isMuted.set(true);
    } else if (this.isMuted()) {
      // Unmute when volume is increased from 0
      el.muted = false;
      this.isMuted.set(false);
    }
  }

  protected toggleMute(): void {
    const el = this.videoElRef?.nativeElement;
    if (!el) return;
    const newMuted = !this.isMuted();

    if (newMuted) {
      // When muting, set volume to 0 and mute
      el.volume = 0;
      this.volume.set(0);
      el.muted = true;
      this.isMuted.set(true);
    } else {
      // When unmuting, restore to default volume and unmute
      el.volume = CONFIG.VIDEO.DEFAULT_VOLUME;
      this.volume.set(CONFIG.VIDEO.DEFAULT_VOLUME);
      el.muted = false;
      this.isMuted.set(false);
    }
  }

  // BREAKPOINT: Thumbnail strip methods - can be reverted if needed
  private generateThumbnailData(): void {
    const duration = this.duration();
    if (duration <= 0) {
      this.showPlaceholderThumbnails();
      return;
    }

    const thumbnails: ThumbnailData[] = [];
    const interval = Math.max(1, Math.floor(duration / CONFIG.THUMBNAIL.COUNT));

    this.generateThumbnailsAsync(thumbnails, duration, interval, 0);
  }

  private showPlaceholderThumbnails(): void {
    const thumbnails: ThumbnailData[] = [];

    for (let i = 0; i < CONFIG.THUMBNAIL.COUNT; i++) {
      const time = i * 10;
      const thumbnail = this.createEnhancedThumbnail(time);
      thumbnails.push({
        time: time,
        thumbnail: thumbnail,
      });
    }

    this.thumbnailData.set(thumbnails);
  }

  private generateThumbnailsAsync(
    thumbnails: ThumbnailData[],
    duration: number,
    interval: number,
    currentTime: number,
  ): void {
    if (currentTime >= duration) {
      this.thumbnailData.set(thumbnails);
      return;
    }

    const thumbnail = this.generateThumbnailAtTime(currentTime);
    thumbnails.push({
      time: currentTime,
      thumbnail: thumbnail,
    });

    const timeoutId = window.setTimeout(() => {
      this.generateThumbnailsAsync(thumbnails, duration, interval, currentTime + interval);
    }, CONFIG.THUMBNAIL.GENERATION_DELAY);
    this.timeouts.push(timeoutId);
  }

  private generateThumbnailAtTime(time: number): string {
    const video = this.videoElRef?.nativeElement;
    if (!video || video.readyState < 2) {
      return this.createPlaceholderThumbnail();
    }

    try {
      return this.tryCaptureActualFrame(video, time);
    } catch {
      return this.createEnhancedThumbnail(time);
    }
  }

  private tryCaptureActualFrame(video: HTMLVideoElement, time: number): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return this.createEnhancedThumbnail(time);

    canvas.width = CONFIG.THUMBNAIL.WIDTH;
    canvas.height = CONFIG.THUMBNAIL.HEIGHT;

    // Store current time
    const currentTime = video.currentTime;

    // Seek to target time
    video.currentTime = time;

    // Wait a moment for seek to complete
    setTimeout(() => {
      try {
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Try to export as data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

        if (dataUrl.length > 1000) {
          video.currentTime = currentTime;
          return dataUrl;
        } else {
          throw new Error('Invalid frame data');
        }
      } catch {
        video.currentTime = currentTime;
        return this.createEnhancedThumbnail(time);
      }
    }, 100);

    // Return enhanced thumbnail immediately
    return this.createEnhancedThumbnail(time);
  }

  private captureVideoFrameWithSeek(video: HTMLVideoElement, time: number): string {
    return this.createEnhancedThumbnail(time);
  }

  private createEnhancedThumbnail(time: number): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return this.createTimeBasedThumbnail(time);

    canvas.width = CONFIG.THUMBNAIL.WIDTH;
    canvas.height = CONFIG.THUMBNAIL.HEIGHT;

    // Create a more realistic video-like thumbnail
    const duration = this.duration();
    const progress = duration > 0 ? time / duration : 0;

    // Create a gradient background that looks more like a video frame
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    const hue = 200 + progress * 160;
    gradient.addColorStop(0, `hsl(${hue}, 60%, 25%)`);
    gradient.addColorStop(0.3, `hsl(${hue}, 70%, 20%)`);
    gradient.addColorStop(0.7, `hsl(${hue}, 80%, 15%)`);
    gradient.addColorStop(1, `hsl(${hue}, 90%, 10%)`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some "video content" patterns
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 3 + 1;
      ctx.fillRect(x, y, size, size);
    }

    // Add a "play" icon overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 8, canvas.height / 2 - 6);
    ctx.lineTo(canvas.width / 2 - 8, canvas.height / 2 + 6);
    ctx.lineTo(canvas.width / 2 + 4, canvas.height / 2);
    ctx.closePath();
    ctx.fill();

    // Add time text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeText(this.formatTime(time), canvas.width / 2, canvas.height - 8);
    ctx.fillText(this.formatTime(time), canvas.width / 2, canvas.height - 8);

    return canvas.toDataURL('image/jpeg', CONFIG.THUMBNAIL.QUALITY);
  }

  private createTimeBasedThumbnail(time: number): string {
    // Create a more realistic video-like thumbnail representation
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    canvas.width = CONFIG.THUMBNAIL.WIDTH;
    canvas.height = CONFIG.THUMBNAIL.HEIGHT;

    // Create a gradient based on time position
    const duration = this.duration();
    const progress = duration > 0 ? time / duration : 0;

    // Create a more video-like gradient (darker, more realistic)
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    const hue = 200 + progress * 160;
    gradient.addColorStop(0, `hsl(${hue}, 60%, 20%)`);
    gradient.addColorStop(0.5, `hsl(${hue}, 70%, 15%)`);
    gradient.addColorStop(1, `hsl(${hue}, 80%, 10%)`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some "video noise" effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 2;
      ctx.fillRect(x, y, size, size);
    }

    // Add time text with better styling
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.lineWidth = 2;
    ctx.strokeText(this.formatTime(time), canvas.width / 2, canvas.height - 8);
    ctx.fillText(this.formatTime(time), canvas.width / 2, canvas.height - 8);

    // Add a play icon overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 6, canvas.height / 2 - 4);
    ctx.lineTo(canvas.width / 2 - 6, canvas.height / 2 + 4);
    ctx.lineTo(canvas.width / 2 + 3, canvas.height / 2);
    ctx.closePath();
    ctx.fill();

    return canvas.toDataURL('image/jpeg', CONFIG.THUMBNAIL.QUALITY);
  }

  private createPlaceholderThumbnail(): string {
    // Create a simple placeholder thumbnail
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    canvas.width = CONFIG.THUMBNAIL.WIDTH;
    canvas.height = CONFIG.THUMBNAIL.HEIGHT;

    // Draw a simple placeholder
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Loading...', canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL('image/jpeg', 0.7);
  }

  protected toggleThumbnailStrip(): void {
    this.showThumbnailStrip.set(!this.showThumbnailStrip());
  }

  protected getCurrentTimePosition(): number {
    const duration = this.duration();
    const current = this.currentTime();
    if (duration <= 0) return 0;
    return Math.min(100, (current / duration) * 100);
  }

  protected toggleThumbnailExpansion(): void {
    this.thumbnailStripExpanded.set(!this.thumbnailStripExpanded());
  }

  protected onThumbnailClick(time: number): void {
    const el = this.videoElRef?.nativeElement;
    if (!el) return;

    // Pause video and seek to thumbnail time
    el.pause();
    el.currentTime = time;
    this.currentTime.set(time);
    this.isPlaying.set(false);
  }

  // BREAKPOINT: Made public for template access
  protected formatTime(totalSeconds: number): string {
    if (!isFinite(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const mm = hours > 0 ? String(minutes).padStart(2, '0') : String(minutes);
    const hh = hours > 0 ? String(hours) + ':' : '';
    const ss = String(seconds).padStart(2, '0');
    return `${hh}${mm}:${ss}`;
  }

  // Expose Math for template access
  protected readonly Math = Math;

  // Theme toggle
  protected darkMode = signal<boolean>(false);
  protected onToggleTheme(next: boolean): void {
    this.darkMode.set(next);
    const body = document.body;
    if (next) {
      body.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
    }
  }

  ngOnDestroy(): void {
    // Clear all timeouts
    this.timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    this.timeouts.length = 0;

    // Clear all intervals
    this.intervals.forEach((intervalId) => clearInterval(intervalId));
    this.intervals.length = 0;

    // Pause video and clear source
    const el = this.videoElRef?.nativeElement;
    if (el) {
      el.pause();
      el.src = '';
      el.load();
    }
  }
}
