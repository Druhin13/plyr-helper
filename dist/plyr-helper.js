/*!
 * plyr-helper v1.0.0
 * A lightweight helper package that enhances video embedding using the Plyr.io media player
 * (c) 2025 Druhin Tarafder
 * Released under the MIT License
 */
(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  document.addEventListener("DOMContentLoaded", function () {
    // Track videos waiting to be initialized (for lazy loading)
    const pendingPlyrVideos = [];

    function loadCSS(url, callback) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      link.onload = callback || function () {};
      document.head.appendChild(link);
    }

    function loadScript(url, callback) {
      var script = document.createElement("script");
      script.src = url;
      script.onload = callback;
      document.head.appendChild(script);
    }

    // Video type detection and ID extraction
    function detectVideoType(url) {
      if (!url) return { type: null, id: null };

      // YouTube detection
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        return {
          type: "youtube",
          id: getYouTubeId(url),
        };
      }

      // Vimeo detection
      if (url.includes("vimeo.com")) {
        return {
          type: "vimeo",
          id: getVimeoId(url),
        };
      }

      // Direct video file detection
      if (url.match(/\.(mp4|webm|ogg|mov)($|\?)/i)) {
        return {
          type: "video",
          id: url, // For direct videos, the ID is just the URL
        };
      }

      // Unknown type
      return { type: null, id: null };
    }

    function getYouTubeId(url) {
      // Handle youtu.be format
      if (url.includes("youtu.be/")) {
        return url.split("youtu.be/")[1].split(/[?&#]/)[0];
      }

      // Handle youtube.com format
      var match = url.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      );
      return match ? match[1] : null;
    }

    function getVimeoId(url) {
      // Handle various Vimeo URL formats
      var match = url.match(
        /(?:vimeo\.com\/(?:video\/|channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)(?:$|\/|\?))/
      );
      return match ? match[1] : null;
    }

    // Parse custom controls list
    function parseCustomControls(controlsStr) {
      if (!controlsStr) return null;

      const validControls = [
        "play-large",
        "play",
        "progress",
        "current-time",
        "mute",
        "volume",
        "captions",
        "settings",
        "pip",
        "airplay",
        "fullscreen",
        "restart",
        "fast-forward",
      ];

      const requestedControls = controlsStr.split(",").map((c) => c.trim());
      return requestedControls.filter((control) =>
        validControls.includes(control)
      );
    }

    // Helper function to determine video MIME type from URL
    function getVideoMimeType(url) {
      const extension = url.split(".").pop().split("?")[0].toLowerCase();
      switch (extension) {
        case "mp4":
          return "video/mp4";
        case "webm":
          return "video/webm";
        case "ogg":
          return "video/ogg";
        case "mov":
          return "video/quicktime";
        default:
          return "video/mp4"; // Default fallback
      }
    }

    // Helper function to convert HEX to RGB
    function hexToRgb(hex) {
      // Remove # if present
      hex = hex.replace(/^#/, "");

      // Parse r, g, b values
      let r, g, b;
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      }

      return { r, g, b };
    }

    // Load dependencies in sequence
    loadCSS("https://cdn.plyr.io/3.7.8/plyr.css", function () {
      loadScript("https://cdn.plyr.io/3.7.8/plyr.js", initializePlyr);
    });

    function initializePlyr() {
      if (typeof Plyr === "undefined") {
        console.error("Plyr library not loaded properly");
        return;
      }

      // Create a registry to track all video players
      var videoPlayers = [];

      // Add custom CSS with dynamic cover behavior for all video types
      var styleSheet = document.createElement("style");
      styleSheet.textContent = `
      .dt-video-container {
        position: relative !important;
        overflow: hidden !important;
      }
      
      /* Base Plyr elements */
      .dt-video-container .plyr {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
      }
      
      /* Video embed containers */
      .dt-video-container .plyr__video-embed,
      .dt-video-container .plyr__video-wrapper {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
      }
      
      /* YouTube and Vimeo iframe scaling */
      .dt-video-container .plyr__video-embed iframe {
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) scale(var(--plyr-video-scale, 1.0)) !important;
        width: 100% !important;
        height: 100% !important;
      }
      
      /* HTML5 video scaling for direct video files */
      .dt-video-container video,
      .dt-video-container .plyr__video-wrapper video,
      .dt-video-container .plyr--video video {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        object-position: center !important;
      }
      
      /* Controls should be visible */
      .dt-video-container .plyr__controls {
        z-index: 10 !important;
      }
      
      .dt-video-container .plyr__control--overlaid {
        z-index: 10 !important;
      }
      
      /* Fix for poster/thumbnail to use object-fit: cover */
      .dt-video-container .plyr__poster {
        background-size: cover !important;
        background-position: center center !important;
        opacity: 1 !important;
      }
      
      /* Hide poster when video is playing in autoplay mode */
      .dt-video-container.autoplay-active .plyr__poster,
      .dt-video-container.autoplay-active .custom-poster {
        display: none !important;
      }
      
      /* Custom poster styling */
      .custom-poster {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background-size: cover !important;
        background-position: center center !important;
        z-index: 1 !important;
      }
      
      /* Lazy loading container */
      .dt-video-lazy-container {
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .dt-video-lazy-placeholder {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        cursor: pointer;
      }
      
      .dt-video-lazy-placeholder::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.2);
        opacity: 0;
        transition: opacity 0.3s;
      }
      
      .dt-video-lazy-placeholder:hover::before {
        opacity: 1;
      }
      
      .dt-video-lazy-placeholder .lazy-play-button {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80px;
        height: 80px;
        background-color: rgba(0,0,0,0.7);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.3s, background-color 0.3s;
        z-index: 2;
      }
      
      .dt-video-lazy-placeholder:hover .lazy-play-button {
        transform: translate(-50%, -50%) scale(1.1);
        background-color: var(--plyr-color-main, rgba(0,0,0,0.8));
      }
      
      .dt-video-lazy-placeholder .lazy-play-button::after {
        content: "";
        width: 0;
        height: 0;
        border-top: 15px solid transparent;
        border-bottom: 15px solid transparent;
        border-left: 25px solid white;
        margin-left: 5px;
      }
    `;
      document.head.appendChild(styleSheet);

      // Initialize Intersection Observer for lazy loading
      const lazyLoadObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const lazyVideo = entry.target;
              const videoIndex = parseInt(lazyVideo.dataset.videoIndex, 10);

              if (!isNaN(videoIndex) && pendingPlyrVideos[videoIndex]) {
                // Initialize this video player
                const videoData = pendingPlyrVideos[videoIndex];
                initializeSingleVideo(
                  videoData.img,
                  videoData.wrapper,
                  videoData.referenceImg
                );

                // Remove from pending
                pendingPlyrVideos[videoIndex] = null;

                // Unobserve
                lazyLoadObserver.unobserve(lazyVideo);
              }
            }
          });
        },
        {
          root: null,
          rootMargin: "200px", // Load when within 200px of viewport
          threshold: 0,
        }
      );

      var images = document.querySelectorAll('img[data-dt-video="true"]');

      images.forEach(function (img, index) {
        // Get attributes from the image
        img.getAttribute("data-dt-video-url");
        img.getAttribute("data-dt-video-controls") === "true";
        img.getAttribute("data-dt-video-mute") === "true";
        parseFloat(img.getAttribute("data-dt-video-playback-rate")) || 1;
        img.getAttribute("data-dt-video-loop") === "true";
        var poster = img.getAttribute("src");
        var autoplay = img.getAttribute("data-dt-video-autoplay") === "true";

        // New options
        var themeColor = img.getAttribute("data-dt-video-theme-color");
        img.getAttribute("data-dt-video-custom-controls");
        parseFloat(img.getAttribute("data-dt-video-start-time")) || 0;
        parseFloat(img.getAttribute("data-dt-video-end-time")) || 0;
        img.getAttribute("data-dt-video-quality") || "default";
        img.getAttribute("data-dt-video-pause-on-blur") === "true";
        img.getAttribute("data-dt-video-play-on-hover") === "true";
        var lazyLoad = img.getAttribute("data-dt-video-lazy-load") === "true";

        // Create a wrapper element that will inherit all styles
        var wrapper = document.createElement("div");

        // Store original image class list for responsive behavior
        var originalClasses = img.className;
        wrapper.className =
          originalClasses +
          " dt-video-container" +
          (autoplay ? " autoplay-active" : "");

        // Copy all attributes except class (already handled) and specific ones we're processing
        Array.from(img.attributes).forEach(function (attr) {
          if (
            attr.name !== "class" &&
            !attr.name.startsWith("data-dt-video") &&
            attr.name !== "src" &&
            attr.name !== "loading" &&
            attr.name !== "alt"
          ) {
            wrapper.setAttribute(attr.name, attr.value);
          }
        });

        // Keep the original image in memory for style reference
        // Create a clone to avoid DOM removal issues
        var referenceImg = img.cloneNode(true);
        document.body.appendChild(referenceImg);
        referenceImg.style.position = "absolute";
        referenceImg.style.opacity = "0";
        referenceImg.style.pointerEvents = "none";
        referenceImg.style.left = "-9999px";

        // Apply initial computed styles
        var computedStyle = window.getComputedStyle(img);

        // Copy aspect ratio, dimensions, and border-radius
        wrapper.style.width = computedStyle.width;
        wrapper.style.height = computedStyle.height;
        wrapper.style.maxWidth = computedStyle.maxWidth;
        wrapper.style.maxHeight = computedStyle.maxHeight;
        wrapper.style.borderRadius = computedStyle.borderRadius;

        if (computedStyle.aspectRatio && computedStyle.aspectRatio !== "auto") {
          wrapper.style.aspectRatio = computedStyle.aspectRatio;
        }

        // If lazy loading is enabled, create placeholder and prepare for delayed initialization
        if (lazyLoad) {
          // Create placeholder element
          var placeholderDiv = document.createElement("div");
          placeholderDiv.className = "dt-video-lazy-placeholder";
          placeholderDiv.style.borderRadius = computedStyle.borderRadius;

          // Create backdrop with poster image
          placeholderDiv.style.backgroundImage = `url(${poster})`;
          placeholderDiv.style.backgroundSize = "cover";
          placeholderDiv.style.backgroundPosition = "center";

          // Create play button
          var playButton = document.createElement("div");
          playButton.className = "lazy-play-button";

          // Apply theme color if provided
          if (themeColor) {
            playButton.style.setProperty("--plyr-color-main", themeColor);
          }

          placeholderDiv.appendChild(playButton);
          wrapper.appendChild(placeholderDiv);

          // Store info for later initialization
          pendingPlyrVideos[index] = {
            img: img,
            wrapper: wrapper,
            referenceImg: referenceImg,
          };

          // Add data attribute for the observer to identify
          wrapper.dataset.videoIndex = index;

          // Click handler to manually initialize
          placeholderDiv.addEventListener("click", function () {
            if (pendingPlyrVideos[index]) {
              initializeSingleVideo(img, wrapper, referenceImg);
              pendingPlyrVideos[index] = null;
              lazyLoadObserver.unobserve(wrapper);
            }
          });

          // Replace the image with our placeholder
          img.parentNode.replaceChild(wrapper, img);

          // Start observing
          lazyLoadObserver.observe(wrapper);
        } else {
          // Initialize video immediately
          initializeSingleVideo(img, wrapper, referenceImg);
          img.parentNode.replaceChild(wrapper, img);
        }
      });

      function initializeSingleVideo(img, wrapper, referenceImg) {
        // Get attributes from the image
        var videoUrl = img.getAttribute("data-dt-video-url");
        var controls = img.getAttribute("data-dt-video-controls") === "true";
        var mute = img.getAttribute("data-dt-video-mute") === "true";
        var playbackRate =
          parseFloat(img.getAttribute("data-dt-video-playback-rate")) || 1;
        var loop = img.getAttribute("data-dt-video-loop") === "true";
        var poster = img.getAttribute("src");
        var autoplay = img.getAttribute("data-dt-video-autoplay") === "true";

        // New options
        var themeColor = img.getAttribute("data-dt-video-theme-color");
        var customControlsStr = img.getAttribute("data-dt-video-custom-controls");
        var startTime =
          parseFloat(img.getAttribute("data-dt-video-start-time")) || 0;
        var endTime = parseFloat(img.getAttribute("data-dt-video-end-time")) || 0;
        var quality = img.getAttribute("data-dt-video-quality") || "default";
        var pauseOnBlur =
          img.getAttribute("data-dt-video-pause-on-blur") === "true";
        var playOnHover =
          img.getAttribute("data-dt-video-play-on-hover") === "true";

        // For autoplay to work reliably in most browsers, we need muted audio
        if (autoplay) {
          mute = true;
        }

        // Parse custom controls if specified
        var customControls = parseCustomControls(customControlsStr);

        // Apply theme color if provided
        if (themeColor) {
          // Create a style element for this specific player
          var videoStyleId =
            "plyr-theme-" + Math.random().toString(36).substring(2, 9);
          var videoStyle = document.createElement("style");
          videoStyle.id = videoStyleId;

          // Extract RGB components from hex color
          var rgbColor;
          try {
            rgbColor = hexToRgb(themeColor.replace("#", ""));
          } catch (e) {
            // Default to blue if parsing fails
            rgbColor = { r: 0, g: 138, b: 255 };
          }

          // Apply theme color styles
          videoStyle.textContent = `
          .${videoStyleId} .plyr__control--overlaid,
          .${videoStyleId} .plyr--video .plyr__control.plyr__tab-focus,
          .${videoStyleId} .plyr--video .plyr__control:hover,
          .${videoStyleId} .plyr--video .plyr__control[aria-expanded=true],
          .${videoStyleId} .plyr--audio .plyr__control.plyr__tab-focus,
          .${videoStyleId} .plyr--audio .plyr__control:hover,
          .${videoStyleId} .plyr--audio .plyr__control[aria-expanded=true] {
            background: ${themeColor} !important;
          }

          .${videoStyleId} .plyr--full-ui input[type=range] {
            color: ${themeColor} !important;
          }

          .${videoStyleId} .plyr__control--overlaid:hover {
            background: rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.85) !important;
          }

          .${videoStyleId} .plyr__menu__container .plyr__control[role=menuitemradio][aria-checked=true]::before {
            background: ${themeColor} !important;
          }
        `;
          document.head.appendChild(videoStyle);
          wrapper.classList.add(videoStyleId);
        }

        // Detect video type and ID
        var videoData = detectVideoType(videoUrl);

        if (!videoData.type || !videoData.id) {
          console.error(
            "Unsupported video URL or could not extract video ID:",
            videoUrl
          );
          return;
        }

        // Remove any existing lazy-load placeholder
        var placeholder = wrapper.querySelector(".dt-video-lazy-placeholder");
        if (placeholder) {
          wrapper.removeChild(placeholder);
        }

        // Create the appropriate container based on video type
        var playerContainer;
        var videoElement;

        if (videoData.type === "youtube" || videoData.type === "vimeo") {
          // For YouTube and Vimeo, use the embed container
          playerContainer = document.createElement("div");
          playerContainer.className = "plyr__video-embed";

          // Create the iframe element
          var iframe = document.createElement("iframe");

          if (videoData.type === "youtube") {
            // YouTube iframe src with start and end parameters
            var youtubeSrc = `https://www.youtube.com/embed/${
            videoData.id
          }?origin=${encodeURIComponent(
            window.location.origin
          )}&enablejsapi=1&widgetid=1&modestbranding=1&playsinline=1&showinfo=0&rel=0&iv_load_policy=3&fs=0&autohide=0`;

            // Add time parameters
            if (startTime > 0) {
              youtubeSrc += `&start=${Math.floor(startTime)}`;
            }

            if (endTime > 0) {
              youtubeSrc += `&end=${Math.floor(endTime)}`;
            }

            // Add autoplay parameter if needed
            if (autoplay) {
              youtubeSrc += "&autoplay=1&mute=1";
            }

            iframe.src = youtubeSrc;
          } else {
            // Vimeo iframe src
            var vimeoSrc = `https://player.vimeo.com/video/${videoData.id}?byline=0&portrait=0&title=0`;

            // Add time parameter
            if (startTime > 0) {
              vimeoSrc += `#t=${startTime}s`;
            }

            // Add autoplay parameter if needed
            if (autoplay) {
              vimeoSrc += "&autoplay=1&muted=1";
            }

            iframe.src = vimeoSrc;
          }

          iframe.allowFullscreen = true;
          iframe.allow = "autoplay; fullscreen; picture-in-picture";

          playerContainer.appendChild(iframe);
          videoElement = iframe;
        } else {
          // For direct video files, use regular video element
          playerContainer = document.createElement("div");
          playerContainer.className = "plyr__video-wrapper";

          // Create the video element
          var videoEl = document.createElement("video");
          videoEl.className = "plyr__video";
          videoEl.controls = controls;
          videoEl.muted = mute;
          videoEl.loop = loop;
          videoEl.autoplay = autoplay;
          videoEl.poster = poster;
          videoEl.playbackRate = playbackRate;
          videoEl.playsInline = true;

          // Set start time if specified for HTML5 video
          if (startTime > 0) {
            videoEl.currentTime = startTime;
          }

          // Explicitly set styles for the video element
          videoEl.style.position = "absolute";
          videoEl.style.top = "0";
          videoEl.style.left = "0";
          videoEl.style.width = "100%";
          videoEl.style.height = "100%";
          videoEl.style.objectFit = "cover";
          videoEl.style.objectPosition = "center";

          // Add source element
          var source = document.createElement("source");
          source.src = videoData.id;
          source.type = getVideoMimeType(videoData.id);

          videoEl.appendChild(source);
          playerContainer.appendChild(videoEl);
          videoElement = videoEl;

          // Add special handling for HTML5 video to ensure it covers properly
          playerContainer.style.width = "100%";
          playerContainer.style.height = "100%";
          playerContainer.style.position = "absolute";
          playerContainer.style.top = "0";
          playerContainer.style.left = "0";
        }

        // Apply container styling
        playerContainer.style.position = "absolute";
        playerContainer.style.top = "0";
        playerContainer.style.left = "0";
        playerContainer.style.width = "100%";
        playerContainer.style.height = "100%";
        playerContainer.style.overflow = "hidden";

        // Assemble the DOM structure
        wrapper.appendChild(playerContainer);

        // Preload the poster image to ensure it's ready
        if (poster && !autoplay) {
          var preloadPoster = new Image();
          preloadPoster.src = poster;
        }

        // Configure Plyr options based on video type
        var plyrOptions = {
          controls:
            customControls ||
            (controls
              ? [
                  "play-large",
                  "play",
                  "progress",
                  "current-time",
                  "mute",
                  "volume",
                  "captions",
                  "settings",
                  "fullscreen",
                ]
              : []),
          muted: mute,
          autoplay: autoplay,
          loop: { active: loop },
          speed: {
            selected: playbackRate,
            options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
          },
          poster: autoplay ? null : poster,
          clickToPlay: !autoplay,
          resetOnEnd: loop ? true : false,
        };

        // Add provider-specific options
        if (videoData.type === "youtube") {
          plyrOptions.youtube = {
            noCookie: false,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            autoplay: autoplay ? 1 : 0,
            start: startTime > 0 ? Math.floor(startTime) : 0,
            end: endTime > 0 ? Math.floor(endTime) : undefined,
          };
        } else if (videoData.type === "vimeo") {
          plyrOptions.vimeo = {
            byline: false,
            portrait: false,
            title: false,
            speed: true,
            transparent: false,
            autoplay: autoplay ? 1 : 0,
            // Note: Vimeo start time is handled in the URL with #t parameter
          };
        }

        // Initialize Plyr
        var player = new Plyr(playerContainer, plyrOptions);

        // Store player and reference elements for resize handling
        videoPlayers.push({
          player: player,
          wrapper: wrapper,
          referenceImg: referenceImg,
          autoplay: autoplay,
          videoElement: videoElement,
          videoType: videoData.type,
          startTime: startTime,
          endTime: endTime,
          quality: quality,
        });

        // Calculate proper scale factor for object-fit: cover behavior
        function updateVideoScale() {
          // For direct video files, we use native object-fit: cover
          if (videoData.type === "video") {
            // For direct video files, make sure the video element fills the container
            const videoEl = wrapper.querySelector("video");
            if (videoEl) {
              videoEl.style.position = "absolute";
              videoEl.style.top = "0";
              videoEl.style.left = "0";
              videoEl.style.width = "100%";
              videoEl.style.height = "100%";
              videoEl.style.objectFit = "cover";
              videoEl.style.objectPosition = "center";
            }
            return;
          }

          // For YouTube and Vimeo - calculate aspect ratio
          // Standard YouTube/Vimeo aspect ratio is 16:9
          const videoAspectRatio = 16 / 9;

          // Get container dimensions
          const containerWidth = wrapper.offsetWidth;
          const containerHeight = wrapper.offsetHeight;

          if (containerWidth === 0 || containerHeight === 0) return;

          const containerAspectRatio = containerWidth / containerHeight;

          // Calculate the scale factor needed to cover the container
          let scale;
          if (containerAspectRatio > videoAspectRatio) {
            // Container is wider than video - scale based on width
            scale = containerAspectRatio / videoAspectRatio;
          } else {
            // Container is taller than video - scale based on height
            scale = videoAspectRatio / containerAspectRatio;
          }

          // Apply the scale to video element via CSS variable
          wrapper.style.setProperty("--plyr-video-scale", Math.max(1, scale));

          // Apply scale directly to iframe for browsers that don't support CSS variables well
          const iframeElement = wrapper.querySelector("iframe");
          if (iframeElement) {
            if (containerAspectRatio > videoAspectRatio) {
              // Container is wider - scale width to 100% and height to overflow
              iframeElement.style.width = "100%";
              iframeElement.style.height = 100 * scale + "%";
            } else {
              // Container is taller - scale height to 100% and width to overflow
              iframeElement.style.width = 100 * scale + "%";
              iframeElement.style.height = "100%";
            }
          }
        }

        // Helper function to fix poster styles
        function fixPosterStyles() {
          var posterElement = wrapper.querySelector(".plyr__poster");
          if (posterElement) {
            posterElement.style.backgroundSize = "cover";
            posterElement.style.backgroundPosition = "center center";
            posterElement.style.opacity = "1";
            posterElement.style.width = "100%";
            posterElement.style.height = "100%";
            posterElement.style.borderRadius = wrapper.style.borderRadius;
            posterElement.style.zIndex = "1";
          }
        }

        // Helper function to create custom poster if needed
        function createCustomPoster() {
          if (!poster) return;

          // Check if Plyr's poster is working correctly
          var plyrElement = wrapper.querySelector(".plyr");
          var existingPoster = wrapper.querySelector(".plyr__poster");

          // If Plyr's poster is not displaying properly, create our own
          if (
            !existingPoster ||
            getComputedStyle(existingPoster).backgroundImage === "none"
          ) {
            // Remove existing poster if any
            if (existingPoster) {
              existingPoster.parentNode.removeChild(existingPoster);
            }

            // Create a custom poster element
            var customPoster = document.createElement("div");
            customPoster.className = "plyr__poster custom-poster";
            customPoster.style.position = "absolute";
            customPoster.style.top = "0";
            customPoster.style.left = "0";
            customPoster.style.width = "100%";
            customPoster.style.height = "100%";
            customPoster.style.backgroundImage = `url(${poster})`;
            customPoster.style.backgroundSize = "cover";
            customPoster.style.backgroundPosition = "center center";
            customPoster.style.borderRadius = wrapper.style.borderRadius;
            customPoster.style.zIndex = "1";

            if (plyrElement) {
              plyrElement.appendChild(customPoster);

              // Hide the custom poster when video starts playing
              plyrElement.addEventListener("play", function () {
                customPoster.style.display = "none";
              });
            }
          }
        }

        // Apply styles to Plyr elements
        function applyComputedStyles() {
          var computedStyle = window.getComputedStyle(referenceImg);
          var borderRadius = computedStyle.borderRadius;

          // Apply border radius to all Plyr elements
          var plyrElements = wrapper.querySelectorAll(
            ".plyr, .plyr__video-wrapper, .plyr__video-embed, .plyr--video, .plyr__poster, video"
          );
          plyrElements.forEach(function (el) {
            el.style.borderRadius = borderRadius;
          });

          // Fix poster styles after resize (only for non-autoplay videos)
          if (!autoplay) {
            fixPosterStyles();
          }
        }

        // Set playback rate and handle autoplay
        player.once("ready", function () {
          player.speed = playbackRate;
          applyComputedStyles();
          updateVideoScale();

          // Apply quality settings if specified
          if (quality !== "default" && videoData.type === "youtube") {
            // YouTube quality options: hd1080, hd720, large, medium, small, tiny, auto
            player.quality = quality;
          } else if (quality !== "default" && videoData.type === "vimeo") {
            // Vimeo quality options: 4k, 2k, 1080p, 720p, 540p, 360p, auto
            player.quality = quality;
          }

          // Handle start time for HTML5 video
          if (videoData.type === "video" && startTime > 0) {
            player.currentTime = startTime;
          }

          // Handle end time for HTML5 video
          if (videoData.type === "video" && endTime > 0) {
            player.on("timeupdate", function () {
              if (player.currentTime >= endTime) {
                if (loop) {
                  player.currentTime = startTime;
                  player.play();
                } else {
                  player.pause();
                }
              }
            });
          }

          // For direct video files, make sure it covers the container
          if (videoData.type === "video") {
            const videoEl = wrapper.querySelector("video");
            if (videoEl) {
              videoEl.style.position = "absolute";
              videoEl.style.top = "0";
              videoEl.style.left = "0";
              videoEl.style.width = "100%";
              videoEl.style.height = "100%";
              videoEl.style.objectFit = "cover";
              videoEl.style.objectPosition = "center";
            }
          }

          // Handle autoplay
          if (autoplay) {
            // For browsers that block autoplay, force play after ready
            player.play().catch(function (error) {
              console.warn(
                "Autoplay was prevented by browser. Attempting muted autoplay.",
                error
              );

              // Try again with muted (this often works with browser restrictions)
              player.muted = true;
              player.play().catch(function (err) {
                console.error("Autoplay was blocked even with muted audio:", err);
              });
            });
          } else {
            // Fix poster size and position
            fixPosterStyles();

            // Create a custom poster element if needed for better control
            createCustomPoster();
          }
        });

        // For autoplay videos, make sure we properly hide the poster after playback starts
        if (autoplay) {
          player.once("playing", function () {
            wrapper.classList.add("autoplay-active");
          });
        }

        // Handle play on hover
        if (playOnHover) {
          let hoverTimeout;

          wrapper.addEventListener("mouseenter", function () {
            // Add a slight delay to prevent accidental hovering
            hoverTimeout = setTimeout(() => {
              player.play().catch(function (err) {
                // If autoplay fails, try with mute
                player.muted = true;
                player.play();
              });
            }, 200);
          });

          wrapper.addEventListener("mouseleave", function () {
            clearTimeout(hoverTimeout);
            if (!autoplay) {
              player.pause();
            }
          });
        }

        // Handle pause on blur
        if (pauseOnBlur) {
          document.addEventListener("visibilitychange", function () {
            if (document.hidden) {
              player.pause();
            } else if (autoplay) {
              player.play();
            }
          });
        }

        // Update scaling when video metadata is loaded
        player.on("loadedmetadata", updateVideoScale);

        // Additional event for HTML5 video to ensure proper sizing
        if (videoData.type === "video") {
          player.on("ready canplay playing loadeddata", function () {
            const videoEl = wrapper.querySelector("video");
            if (videoEl) {
              videoEl.style.position = "absolute";
              videoEl.style.top = "0";
              videoEl.style.left = "0";
              videoEl.style.width = "100%";
              videoEl.style.height = "100%";
              videoEl.style.objectFit = "cover";
              videoEl.style.objectPosition = "center";

              // Force Plyr wrapper to 100% dimensions
              const plyrWrapper = wrapper.querySelector(".plyr__video-wrapper");
              if (plyrWrapper) {
                plyrWrapper.style.width = "100%";
                plyrWrapper.style.height = "100%";
                plyrWrapper.style.position = "absolute";
                plyrWrapper.style.top = "0";
                plyrWrapper.style.left = "0";
              }
            }
          });
        }
      }

      // Resize handler with dynamic aspect ratio calculations
      function handleResize() {
        videoPlayers.forEach(function (item) {
          if (!item) return; // Skip deleted players

          // Get updated styles from reference image
          var computedStyle = window.getComputedStyle(item.referenceImg);

          // Apply critical styles to wrapper
          var wrapper = item.wrapper;

          // Copy aspect ratio, dimensions, and border-radius
          wrapper.style.width = computedStyle.width;
          wrapper.style.height = computedStyle.height;
          wrapper.style.maxWidth = computedStyle.maxWidth;
          wrapper.style.maxHeight = computedStyle.maxHeight;
          wrapper.style.borderRadius = computedStyle.borderRadius;

          if (computedStyle.aspectRatio && computedStyle.aspectRatio !== "auto") {
            wrapper.style.aspectRatio = computedStyle.aspectRatio;
          }

          // Apply border radius to all Plyr elements
          var plyrElements = wrapper.querySelectorAll(
            ".plyr, .plyr__video-wrapper, .plyr__video-embed, .plyr--video, .plyr__poster, .custom-poster, video"
          );
          plyrElements.forEach(function (el) {
            el.style.borderRadius = computedStyle.borderRadius;
          });

          // Fix poster styles after resize (only for non-autoplay videos)
          if (!item.autoplay) {
            var posterElement = wrapper.querySelector(".plyr__poster");
            if (posterElement) {
              posterElement.style.borderRadius = computedStyle.borderRadius;
            }

            var customPoster = wrapper.querySelector(".custom-poster");
            if (customPoster) {
              customPoster.style.borderRadius = computedStyle.borderRadius;
            }
          }

          // Handle HTML5 video special case
          if (item.videoType === "video") {
            const videoEl = wrapper.querySelector("video");
            if (videoEl) {
              videoEl.style.position = "absolute";
              videoEl.style.top = "0";
              videoEl.style.left = "0";
              videoEl.style.width = "100%";
              videoEl.style.height = "100%";
              videoEl.style.objectFit = "cover";
              videoEl.style.objectPosition = "center";

              // Force Plyr wrapper to 100% dimensions
              const plyrWrapper = wrapper.querySelector(".plyr__video-wrapper");
              if (plyrWrapper) {
                plyrWrapper.style.width = "100%";
                plyrWrapper.style.height = "100%";
                plyrWrapper.style.position = "absolute";
                plyrWrapper.style.top = "0";
                plyrWrapper.style.left = "0";
              }
            }
            return;
          }

          // Recalculate video scaling for YouTube and Vimeo
          if (item.videoType === "youtube" || item.videoType === "vimeo") {
            // Standard YouTube/Vimeo aspect ratio is 16:9
            const videoAspectRatio = 16 / 9;

            // Get container dimensions
            const containerWidth = wrapper.offsetWidth;
            const containerHeight = wrapper.offsetHeight;

            if (containerWidth === 0 || containerHeight === 0) return;

            const containerAspectRatio = containerWidth / containerHeight;

            // Calculate the scale factor needed to cover the container
            let scale;
            if (containerAspectRatio > videoAspectRatio) {
              // Container is wider than video - scale based on width
              scale = containerAspectRatio / videoAspectRatio;
            } else {
              // Container is taller than video - scale based on height
              scale = videoAspectRatio / containerAspectRatio;
            }

            // Apply the scale to video element via CSS variable
            wrapper.style.setProperty("--plyr-video-scale", Math.max(1, scale));

            // Apply scale directly to iframe for browsers that don't support CSS variables well
            const iframeElement = wrapper.querySelector("iframe");
            if (iframeElement) {
              if (containerAspectRatio > videoAspectRatio) {
                // Container is wider - scale width to 100% and height to overflow
                iframeElement.style.width = "100%";
                iframeElement.style.height = 100 * scale + "%";
              } else {
                // Container is taller - scale height to 100% and width to overflow
                iframeElement.style.width = 100 * scale + "%";
                iframeElement.style.height = "100%";
              }
            }
          }
        });
      }

      // Initial resize to set proper styles
      handleResize();

      // Add window resize listener for responsive behavior with debouncing
      let resizeTimeout;
      window.addEventListener("resize", function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 100);
      });

      // Process media query changes
      const mediaQueryLists = [
        window.matchMedia("(max-width: 991px)"),
        window.matchMedia("(max-width: 479px)"),
      ];

      mediaQueryLists.forEach(function (mql) {
        mql.addEventListener("change", handleResize);
      });
    }
  });

}));
