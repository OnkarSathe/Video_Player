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

describe('Thumbnail Generation', () => {
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
  });

  it('should create enhanced thumbnails for CORS videos', () => {
    const time = 30;
    const thumbnail = component['createEnhancedThumbnail'](time);

    expect(thumbnail).toBeDefined();
    expect(thumbnail).toContain('data:image/jpeg');
    expect(thumbnail.length).toBeGreaterThan(100);
  });

  it('should create placeholder thumbnails', () => {
    const thumbnail = component['createPlaceholderThumbnail']();

    expect(thumbnail).toBeDefined();
    expect(thumbnail).toContain('data:image/jpeg');
  });

  it('should generate thumbnail data for valid duration', () => {
    component['duration'].set(100);
    const generateSpy = spyOn(component as any, 'generateThumbnailsAsync');

    component['generateThumbnailData']();

    expect(generateSpy).toHaveBeenCalled();
  });

  it('should show placeholder thumbnails for zero duration', () => {
    component['duration'].set(0);
    const showPlaceholderSpy = spyOn(component as any, 'showPlaceholderThumbnails');

    component['generateThumbnailData']();

    expect(showPlaceholderSpy).toHaveBeenCalled();
  });

  it('should generate correct number of thumbnails', () => {
    component['duration'].set(120);
    component['showPlaceholderThumbnails']();

    const thumbnails = component['thumbnailData']();
    expect(thumbnails.length).toBe(6);
  });

  it('should have correct thumbnail intervals', () => {
    component['duration'].set(120);
    component['showPlaceholderThumbnails']();

    const thumbnails = component['thumbnailData']();
    expect(thumbnails[0]?.time).toBe(0);
    expect(thumbnails[1]?.time).toBe(10);
    expect(thumbnails[5]?.time).toBe(50);
  });

  it('should handle thumbnail click events', () => {
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
  });

  it('should create time-based thumbnails', () => {
    const time = 60;
    const thumbnail = component['createTimeBasedThumbnail'](time);

    expect(thumbnail).toBeDefined();
    expect(thumbnail).toContain('data:image/jpeg');
  });

  it('should handle thumbnail generation errors', () => {
    spyOn(component as any, 'createEnhancedThumbnail').and.returnValue(
      'data:image/jpeg;base64,fallback-thumbnail',
    );

    const result = component['generateThumbnailAtTime'](30);

    expect(result).toContain('data:image/jpeg');
  });

  it('should toggle thumbnail strip visibility', () => {
    const initialValue = component['showThumbnailStrip']();

    component['toggleThumbnailStrip']();

    expect(component['showThumbnailStrip']()).toBe(!initialValue);
  });

  it('should calculate current time position correctly', () => {
    component['duration'].set(100);
    component['currentTime'].set(25);

    const position = component['getCurrentTimePosition']();

    expect(position).toBe(25);
  });

  it('should handle zero duration in position calculation', () => {
    component['duration'].set(0);
    component['currentTime'].set(25);

    const position = component['getCurrentTimePosition']();

    expect(position).toBe(0);
  });

  it('should cap position at 100%', () => {
    component['duration'].set(100);
    component['currentTime'].set(150);

    const position = component['getCurrentTimePosition']();

    expect(position).toBe(100);
  });
});
