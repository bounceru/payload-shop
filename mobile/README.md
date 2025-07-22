# StagePass Mobile Scanner

This Expo app allows employees to scan ticket barcodes and check them in using the existing StagePass backend.

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```
   (inside the `mobile` directory)

2. Run the app:
   ```bash
   pnpm start
   ```

You can also use `pnpm android` or `pnpm ios` if you have the platforms set up.

The app expects the StagePass backend to be running locally at `http://localhost:3000`. You can override this by setting
the `EXPO_PUBLIC_API_URL` environment variable when starting Expo.

If Metro is stuck on the loading screen, ensure the `babel.config.js` file is present in this folder.
