/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { VideoPlayer } from './video-player';

describe('VideoPlayerComponent', () => {
  let component: VideoPlayer;
  let fixture: ComponentFixture<VideoPlayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        VideoPlayer,
        FormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatSliderModule,
        MatSlideToggleModule,
        BrowserAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VideoPlayer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component['defaultUrl']).toBeDefined();
    expect(component['urlInput']).toBeDefined();
    expect(component['isPlaying']()).toBeFalse();
    expect(component['duration']()).toBe(0);
    expect(component['currentTime']()).toBe(0);
  });

  it('should load video from URL', () => {
    const testUrl = 'https://example.com/test-video.mp4';
    component['urlInput'] = testUrl;

    const mockVideo = {
      pause: jasmine.createSpy('pause'),
      load: jasmine.createSpy('load'),
      play: jasmine.createSpy('play').and.returnValue(Promise.resolve()),
      onerror: null,
    };

    component['videoElRef'] = { nativeElement: mockVideo } as any;

    component['onLoadUrl']();

    expect(component['videoUrl']()).toBe(testUrl);
    expect(mockVideo.pause).toHaveBeenCalled();
    expect(mockVideo.load).toHaveBeenCalled();
  });

  it('should handle play/pause correctly', async () => {
    const mockVideo = {
      paused: true,
      ended: false,
      play: jasmine.createSpy('play').and.returnValue(Promise.resolve()),
      pause: jasmine.createSpy('pause'),
      src: '',
      load: jasmine.createSpy('load'),
    };

    component['videoElRef'] = { nativeElement: mockVideo } as any;

    component['togglePlay']();

    expect(mockVideo.play).toHaveBeenCalled();

    // Wait for async operation to complete
    await mockVideo.play();
    expect(component['isPlaying']()).toBeTrue();
  });

  it('should seek to correct time', () => {
    const mockVideo = {
      currentTime: 0,
      duration: 100,
      pause: jasmine.createSpy('pause'),
      src: '',
      load: jasmine.createSpy('load'),
    };

    component['videoElRef'] = { nativeElement: mockVideo } as any;
    component['duration'].set(100);

    component['onScrubChange'](50);

    expect(mockVideo.currentTime).toBe(50);
    expect(component['currentTime']()).toBe(50);
  });

  it('should skip backward correctly', () => {
    const mockVideo = {
      currentTime: 20,
      pause: jasmine.createSpy('pause'),
      src: '',
      load: jasmine.createSpy('load'),
    };

    component['videoElRef'] = { nativeElement: mockVideo } as any;

    component['skipBackward']();

    expect(mockVideo.currentTime).toBe(10);
  });

  it('should skip forward correctly', () => {
    const mockVideo = {
      currentTime: 20,
      pause: jasmine.createSpy('pause'),
      src: '',
      load: jasmine.createSpy('load'),
    };

    component['videoElRef'] = { nativeElement: mockVideo } as any;
    component['duration'].set(100);

    component['skipForward']();

    expect(mockVideo.currentTime).toBe(30);
  });

  it('should change playback speed', () => {
    const mockVideo = {
      playbackRate: 1,
      pause: jasmine.createSpy('pause'),
      src: '',
      load: jasmine.createSpy('load'),
    };

    component['videoElRef'] = { nativeElement: mockVideo } as any;

    component['onSpeedChange'](1.5);

    expect(mockVideo.playbackRate).toBe(1.5);
    expect(component['playbackRate']()).toBe(1.5);
  });

  it('should handle volume changes', () => {
    const mockVideo = {
      volume: 1,
      muted: false,
      pause: jasmine.createSpy('pause'),
      src: '',
      load: jasmine.createSpy('load'),
    };

    component['videoElRef'] = { nativeElement: mockVideo } as any;

    component['onVolumeChange'](0.5);

    expect(mockVideo.volume).toBe(0.5);
    expect(component['volume']()).toBe(0.5);
  });

  it('should toggle mute correctly', () => {
    const mockVideo = {
      volume: 1,
      muted: false,
      pause: jasmine.createSpy('pause'),
      src: '',
      load: jasmine.createSpy('load'),
    };

    component['videoElRef'] = { nativeElement: mockVideo } as any;
    component['isMuted'].set(false);

    component['toggleMute']();

    expect(mockVideo.volume).toBe(0);
    expect(mockVideo.muted).toBeTrue();
    expect(component['isMuted']()).toBeTrue();
  });

  it('should format time correctly', () => {
    expect(component['formatTime'](0)).toBe('0:00');
    expect(component['formatTime'](65)).toBe('1:05');
    expect(component['formatTime'](3661)).toBe('1:01:01');
  });

  it('should handle thumbnail clicks', () => {
    const mockVideo = {
      pause: jasmine.createSpy('pause'),
      currentTime: 0,
      src: '',
      load: jasmine.createSpy('load'),
    };

    component['videoElRef'] = { nativeElement: mockVideo } as any;

    component['onThumbnailClick'](50);

    expect(mockVideo.pause).toHaveBeenCalled();
    expect(mockVideo.currentTime).toBe(50);
    expect(component['currentTime']()).toBe(50);
    expect(component['isPlaying']()).toBeFalse();
  });

  it('should toggle thumbnail strip', () => {
    const initialValue = component['showThumbnailStrip']();

    component['toggleThumbnailStrip']();

    expect(component['showThumbnailStrip']()).toBe(!initialValue);
  });

  it('should toggle thumbnail expansion', () => {
    const initialValue = component['thumbnailStripExpanded']();

    component['toggleThumbnailExpansion']();

    expect(component['thumbnailStripExpanded']()).toBe(!initialValue);
  });

  it('should calculate current time position', () => {
    component['duration'].set(100);
    component['currentTime'].set(25);

    const position = component['getCurrentTimePosition']();

    expect(position).toBe(25);
  });

  it('should load example videos', () => {
    const testUrl = 'https://example.com/test.mp4';
    const onLoadUrlSpy = spyOn(component as any, 'onLoadUrl');

    component['loadExampleVideo'](testUrl);

    expect(component['urlInput']).toBe(testUrl);
    expect(onLoadUrlSpy).toHaveBeenCalled();
  });

  it('should handle video loading states', () => {
    component['onVideoLoadStart']();
    expect(component['isVideoLoading']()).toBeTrue();

    component['onVideoCanPlay']();
    expect(component['isVideoLoading']()).toBeFalse();
  });

  it('should update time on timeupdate event', () => {
    const mockVideo = {
      currentTime: 30,
      paused: false,
      ended: false,
      pause: jasmine.createSpy('pause'),
      src: '',
      load: jasmine.createSpy('load'),
    };

    component['videoElRef'] = { nativeElement: mockVideo } as any;

    component['onTimeUpdate']();

    expect(component['currentTime']()).toBe(30);
    expect(component['isPlaying']()).toBeTrue();
  });

  it('should toggle dark mode', () => {
    const initialValue = component['darkMode']();

    component['onToggleTheme'](!initialValue);

    expect(component['darkMode']()).toBe(!initialValue);
  });

  it('should clean up resources on destroy', () => {
    const mockVideo = {
      pause: jasmine.createSpy('pause'),
      src: '',
      load: jasmine.createSpy('load'),
    };

    component['videoElRef'] = { nativeElement: mockVideo } as any;

    component.ngOnDestroy();

    expect(mockVideo.pause).toHaveBeenCalled();
    expect(mockVideo.src).toBe('');
    expect(mockVideo.load).toHaveBeenCalled();
  });
});
