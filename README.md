# Plyr Helper

A comprehensive JavaScript library that enhances HTML images with advanced video player functionality using Plyr.js. This library allows you to easily convert static images into responsive, feature-rich video players supporting YouTube, Vimeo, and direct video files.

## Features

- Multiple Video Sources : Support for YouTube, Vimeo, and direct video files (MP4, WebM, OGG, MOV)
- Responsive Design : Automatically adapts to container size and maintains aspect ratio
- Lazy Loading : Optimize page load performance with on-demand video initialization
- Custom Controls : Configurable player controls with theme customization

- Advanced Playback Options :

  - Autoplay support
  - Loop functionality
  - Custom playback rates
  - Start/end time specification
  - Quality selection
  - Play on hover
  - Pause on page blur

- Styling Options :

  - Custom theme colors
  - Maintains original image styling (border-radius, dimensions, etc.)
  - Object-fit: cover behavior for all video types

- Performance Optimized :
  - Efficient resource loading
  - Minimal DOM manipulation
  - Intersection Observer for lazy loading

## Installation

Simply include the script in your HTML file:

```html
<script src="path/to/vjs-helper.js"></script>
```

The library will automatically initialize when the DOM is loaded.

## Usage

### Basic Usage

Convert any image to a video player by adding the data-dt-video="true" attribute and specifying the video URL:

```html
<img
  src="poster-image.jpg"
  data-dt-video="true"
  data-dt-video-url="https://www.youtube.com/watch?v=VIDEO_ID"
  width="640"
  height="360"
/>
```

### Configuration Options

All options are specified as data attributes on the image element:

| Attribute                     | Type    | Default | Description                                                 |
| ----------------------------- | ------- | ------- | ----------------------------------------------------------- |
| data-dt-video                 | boolean | -       | Required. Set to "true" to enable video functionality       |
| data-dt-video-url             | string  | -       | Required. URL of the video (YouTube, Vimeo, or direct file) |
| data-dt-video-controls        | boolean | false   | Show player controls                                        |
| data-dt-video-mute            | boolean | false   | Mute video audio                                            |
| data-dt-video-loop            | boolean | false   | Loop the video                                              |
| data-dt-video-autoplay        | boolean | false   | Automatically play video when loaded                        |
| data-dt-video-playback-rate   | number  | 1       | Playback speed (0.5-2)                                      |
| data-dt-video-start-time      | number  | 0       | Start time in seconds                                       |
| data-dt-video-end-time        | number  | 0       | End time in seconds (0 = play to end)                       |
| data-dt-video-theme-color     | string  | -       | Custom theme color (hex code)                               |
| data-dt-video-custom-controls | string  | -       | Comma-separated list of controls to display                 |
| data-dt-video-quality         | string  | default | Video quality setting                                       |
| data-dt-video-pause-on-blur   | boolean | false   | Pause when page is not visible                              |
| data-dt-video-play-on-hover   | boolean | false   | Play when mouse hovers over video                           |
| data-dt-video-lazy-load       | boolean | false   | Enable lazy loading                                         |

### Custom Controls

Customize which controls appear in the player interface using the data-dt-video-custom-controls attribute with a comma-separated list:

```html
<img
  data-dt-video="true"
  data-dt-video-url="https://example.com/video.mp4"
  data-dt-video-controls="true"
  data-dt-video-custom-controls="play-large,play,progress,current-time,mute,fullscreen"
  src="poster.jpg"
/>
```

#### Available controls:

- play-large - The large play button in the center
- play - Play/pause button
- progress - The progress bar and scrubber
- current-time - The current time display
- mute - Mute toggle button
- volume - Volume control
- captions - Captions toggle button
- settings - Settings menu button
- pip - Picture-in-picture toggle
- airplay - Airplay control
- fullscreen - Fullscreen toggle
- restart - Restart playback button
- fast-forward - Fast-forward button

### Examples

#### YouTube Video with Custom Theme

```html
<img
  src="thumbnail.jpg"
  data-dt-video="true"
  data-dt-video-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  data-dt-video-controls="true"
  data-dt-video-theme-color="#FF0000"
  width="640"
  height="360"
  class="rounded-corners"
/>
```

#### Vimeo Video with Custom Start Time

```html
<img
  src="poster.jpg"
  data-dt-video="true"
  data-dt-video-url="https://vimeo.com/123456789"
  data-dt-video-controls="true"
  data-dt-video-start-time="30"
  data-dt-video-mute="true"
  width="100%"
/>
```

#### Direct Video File with Autoplay and Loop

```html
<img
  src="poster.jpg"
  data-dt-video="true"
  data-dt-video-url="video.mp4"
  data-dt-video-autoplay="true"
  data-dt-video-loop="true"
  data-dt-video-mute="true"
  data-dt-video-controls="false"
  class="hero-video"
/>
```

#### Lazy-Loaded Video with Play on Hover

```html
<img
  src="thumbnail.jpg"
  data-dt-video="true"
  data-dt-video-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  data-dt-video-controls="true"
  data-dt-video-lazy-load="true"
  data-dt-video-play-on-hover="true"
  width="320"
  height="180"
/>
```

## Browser Compatibility

This library is compatible with all modern browsers:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)
  Internet Explorer is not supported.

## Dependencies

This library depends on:

- Plyr.js (v3.7.8 or later)
  The dependencies are automatically loaded by the library.

## Performance Considerations

- Lazy Loading : Enable data-dt-video-lazy-load="true" for videos below the fold to improve page load performance
- Autoplay Limitations : Browser autoplay policies may require videos to be muted for autoplay to work
- Mobile Considerations : Some mobile browsers have restrictions on video autoplay and interaction

## Advanced Usage

### Responsive Videos

The library automatically maintains the aspect ratio and styling of the original image. Use standard CSS for responsive behavior:

```html
<img
  src="poster.jpg"
  data-dt-video="true"
  data-dt-video-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  style="width: 100%; max-width: 800px; border-radius: 10px;"
/>
```

### Video Quality Control

For YouTube videos, you can specify the quality:

```html
<img
  src="poster.jpg"
  data-dt-video="true"
  data-dt-video-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  data-dt-video-quality="hd1080"
/>
```

```
Available YouTube quality options: hd1080 , hd720 , large , medium , small , tiny , auto
```

For Vimeo videos:

```html
<img
  src="poster.jpg"
  data-dt-video="true"
  data-dt-video-url="https://vimeo.com/123456789"
  data-dt-video-quality="1080p"
/>
```

```
Available Vimeo quality options: 4k , 2k , 1080p , 720p , 540p , 360p , auto
```

## Troubleshooting

### Video Not Playing

- Check if the video URL is correct and accessible
- For autoplay issues, ensure the video is muted ( data-dt-video-mute="true" )
- Verify that the Plyr.js library is loading correctly

### Styling Issues

- If videos don't maintain the correct aspect ratio, ensure the original image has proper dimensions
- For border-radius issues, apply the border-radius to the image element

### Performance Issues

- Use lazy loading for videos not immediately visible
- Limit the number of videos on a single page
- Ensure images have proper dimensions specified to avoid layout shifts

## License

MIT License

## Credits

This library uses Plyr.js for the video player functionality.
