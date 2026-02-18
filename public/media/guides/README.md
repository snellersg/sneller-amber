# Guide Media Files

This directory contains images and videos for the guide system.

## Directory Structure

- `images/` - Screenshots, diagrams, and other images
- `videos/` - Tutorial videos and screen recordings

## File Organization

Organize files by guide slug for easy maintenance:

```
images/
├── meeting-agenda/
│   ├── template-example.png
│   └── filled-agenda.png
├── priority-calls/
│   └── dashboard-screenshot.png
└── client-engagement/
    └── workflow-diagram.png

videos/
├── meeting-agenda/
│   └── template-walkthrough.mp4
└── priority-calls/
    └── demo-call.mp4
```

## Usage in Guides

Add images and videos to any section:

```typescript
{
  title: "Section Title",
  content: "Section description...",
  images: [
    {
      src: "/media/guides/images/guide-name/image.png",
      alt: "Descriptive alt text",
      caption: "Optional image caption"
    }
  ],
  videos: [
    {
      src: "/media/guides/videos/guide-name/video.mp4",
      title: "Video Title",
      description: "Optional video description"
    }
  ],
  steps: ["Step 1", "Step 2"]
}
```

## Best Practices

1. Use descriptive filenames
2. Optimize images for web (WebP preferred, PNG/JPG acceptable)
3. Keep video files under 50MB when possible
4. Use MP4 format for videos (H.264 codec for best compatibility)
5. Always provide alt text for accessibility
6. Add captions for context when helpful
