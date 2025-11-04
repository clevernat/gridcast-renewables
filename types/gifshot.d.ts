declare module "gifshot" {
  interface GifShotOptions {
    images?: string[];
    gifWidth?: number;
    gifHeight?: number;
    interval?: number;
    numFrames?: number;
    frameDuration?: number;
    sampleInterval?: number;
    numWorkers?: number;
  }

  interface GifShotCallback {
    (obj: { error: boolean | string; image?: string }): void;
  }

  interface GifShot {
    createGIF(options: GifShotOptions, callback: GifShotCallback): void;
  }

  const gifshot: GifShot;
  export default gifshot;
}

