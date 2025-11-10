import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stefanosolidoro.corevisitor.kiosk',
  appName: 'CoreVisitor Kiosk',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'localhost',
      '192.168.*',
      '10.*',
      '172.*'
    ],
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a1a',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      splashFullScreen: true,
      splashImmersive: true
    },
    BarcodeScanner: {
      cameraDirection: 'back'
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
