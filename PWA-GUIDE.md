# OpenVetAI Progressive Web App (PWA) Guide

## 🎯 Why PWA?

The PWA version of OpenVetAI solves the critical **mixed content security issue** that prevents HTTPS sites from connecting to HTTP services (like your local Ollama instance). This makes OpenVetAI truly user-friendly for veterinarians.

## 🚀 Installation

### **Mobile Devices (iOS/Android)**

#### **Chrome/Edge (Android):**
1. Visit `https://jydvm.github.io/OpenVetAI/`
2. Tap the **"Install"** banner at the top
3. Or: Menu (⋮) → **"Add to Home screen"**
4. Confirm installation

#### **Safari (iOS):**
1. Visit `https://jydvm.github.io/OpenVetAI/`
2. Tap **Share button** (□↗)
3. Scroll down → **"Add to Home Screen"**
4. Tap **"Add"**

#### **Samsung Internet:**
1. Visit `https://jydvm.github.io/OpenVetAI/`
2. Menu → **"Add page to"** → **"Home screen"**

### **Desktop (Windows/Mac/Linux)**

#### **Chrome/Edge:**
1. Visit `https://jydvm.github.io/OpenVetAI/`
2. Address bar → **Install icon** (⊕)
3. Click **"Install"**

#### **Firefox:**
1. Visit `https://jydvm.github.io/OpenVetAI/`
2. Address bar → **Install icon**
3. Click **"Install"**

## ✨ PWA Features

### **Security Benefits**
- ✅ **Bypasses mixed content restrictions** - connects to HTTP Ollama from HTTPS site
- ✅ **Service Worker proxy** - handles CORS automatically
- ✅ **No browser security warnings** - seamless connection experience

### **User Experience**
- ✅ **App-like interface** - full screen, no browser UI
- ✅ **Home screen icon** - quick access like any app
- ✅ **Offline functionality** - review notes without internet
- ✅ **Background sync** - processes requests when connection restored

### **Performance**
- ✅ **Faster loading** - cached resources load instantly
- ✅ **Reduced data usage** - only downloads updates
- ✅ **Better responsiveness** - optimized for mobile devices

## 🔧 Technical Details

### **Service Worker Features**
- **CORS Proxy:** Automatically handles cross-origin requests to Ollama
- **Offline Cache:** Stores app files for offline use
- **Background Sync:** Queues SOAP generation requests when offline
- **Auto-Updates:** Downloads new versions automatically

### **Manifest Features**
- **Shortcuts:** Quick access to Record and Notes functions
- **Display Modes:** Standalone app experience
- **Theme Colors:** Matches OpenVetAI branding
- **Icon Sizes:** Optimized for all devices and screen densities

## 🩺 Veterinary Workflow

### **Typical Use Case:**
1. **Exam Room:** Use mobile device (tablet/phone) to record consultation
2. **PWA Connection:** Connects to home PC running Ollama via Tailscale
3. **Generate SOAP:** AI processes recording on powerful home PC
4. **Copy Notes:** Copy generated SOAP notes to practice management software

### **Network Setup:**
- **Home PC:** Runs Ollama with proper CORS configuration
- **Mobile Device:** Runs OpenVetAI PWA
- **Connection:** Tailscale provides secure remote access
- **No Clinic IT:** No software installation required on clinic computers

## 🛠️ Troubleshooting

### **Installation Issues**

#### **"Install" button not appearing:**
- Ensure you're using a supported browser (Chrome, Edge, Safari)
- Check that you're on HTTPS (GitHub Pages)
- Try refreshing the page
- Clear browser cache

#### **Installation fails:**
- Check available storage space
- Ensure browser is up to date
- Try incognito/private mode first

### **Connection Issues**

#### **Still getting CORS errors:**
- Verify PWA is installed (not just bookmarked)
- Check Ollama CORS configuration: `OLLAMA_ORIGINS="*"`
- Restart Ollama after changing environment variables
- Test direct API access: `http://[ip]:11434/api/tags`

#### **Service Worker not working:**
- Check browser console for service worker errors
- Try uninstalling and reinstalling PWA
- Clear all site data and reinstall

### **Performance Issues**

#### **Slow loading:**
- Check network connection
- Clear PWA cache: Settings → Storage → Clear Data
- Reinstall PWA for fresh cache

#### **Offline features not working:**
- Ensure service worker is registered (check console)
- Test offline mode: disconnect internet and try using app
- Check browser supports service workers

## 📱 Device-Specific Notes

### **iOS Safari:**
- PWA support is excellent in iOS 14.3+
- Earlier versions may have limited functionality
- Use "Add to Home Screen" for best experience

### **Android Chrome:**
- Full PWA support with all features
- WebAPK installation provides native app experience
- Automatic updates work seamlessly

### **Desktop Browsers:**
- Chrome/Edge: Full PWA support
- Firefox: Good PWA support, some limitations
- Safari: Limited PWA support on macOS

## 🔄 Updates

### **Automatic Updates:**
- PWA checks for updates automatically
- New versions download in background
- Refresh app to apply updates
- No manual update process required

### **Manual Update:**
- Force refresh: Ctrl+Shift+R (desktop) or pull-to-refresh (mobile)
- Clear cache: Browser settings → Storage → Clear Data
- Reinstall: Uninstall PWA and install again

## 🎉 Benefits for Veterinarians

### **Simplicity:**
- **One-click install** from browser
- **No app store approval** or downloads
- **Works on any device** with modern browser
- **Automatic updates** without user intervention

### **Security:**
- **Bypasses browser restrictions** that block HTTP connections
- **Private data stays local** - no cloud processing
- **Secure remote access** via Tailscale
- **No third-party dependencies**

### **Reliability:**
- **Works offline** for note review and editing
- **Cached resources** load instantly
- **Background processing** handles network interruptions
- **Consistent experience** across devices

## 🚀 Getting Started

1. **Install PWA** on your mobile device
2. **Set up Ollama** on your home PC
3. **Configure Tailscale** for remote access
4. **Test connection** from PWA to Ollama
5. **Start recording** consultations!

**The PWA version makes OpenVetAI truly accessible for veterinary professionals - no technical expertise required!** 🎉
