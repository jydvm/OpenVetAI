# OpenVetAI Troubleshooting Guide

## 🎯 Quick Problem Solver for Veterinarians

This guide solves **90% of common OpenVetAI issues** in under 5 minutes. Perfect for busy veterinarians who need quick solutions.

## 🚨 Emergency Quick Fixes

### **"Nothing is working at all"**
1. **Refresh the page** (Ctrl+F5 or Cmd+Shift+R)
2. **Check internet connection**
3. **Verify home PC is on** and Ollama is running
4. **Test with:** `http://localhost:11434/api/tags` in browser

### **"Can't record anything"**
1. **Grant microphone permission** when browser asks
2. **Check microphone is connected** and working
3. **Try different browser** (Chrome works best)
4. **Restart browser** completely

### **"SOAP notes won't generate"**
1. **Check Ollama connection** in Settings
2. **Verify AI model is loaded** in Ollama
3. **Test connection** button should be green
4. **Try recording a shorter test** first

## 🔧 Connection Issues

### **"Can't connect to Ollama"**

#### **Symptoms:**
- Red connection status
- "Connection failed" errors
- Settings test shows ❌

#### **Solutions:**
1. **Check Ollama is running:**
   - Open Command Prompt on home PC
   - Run: `ollama serve`
   - Should show "Listening on 0.0.0.0:11434"

2. **Verify endpoint URL:**
   - Local use: `http://localhost:11434`
   - Remote use: `http://[YOUR-IP]:11434`
   - Tailscale: `http://[TAILSCALE-IP]:11434`

3. **Test in browser first:**
   - Go to: `http://[YOUR-ENDPOINT]/api/tags`
   - Should show JSON data about your models
   - If this fails, Ollama isn't accessible

4. **Check firewall:**
   - Windows might be blocking Ollama
   - Allow Ollama through Windows Firewall
   - Check OLLAMA_HOST environment variable

### **"Connection works at home but not at clinic"**

#### **For Tailscale Users:**
1. **Check Tailscale is connected** on clinic device
2. **Verify green Tailscale icon** in system tray
3. **Get current Tailscale IP** from home PC
4. **Update VetScribe settings** with correct IP

#### **For Direct IP Users:**
1. **Verify home PC is accessible** from clinic network
2. **Check router port forwarding** (if configured)
3. **Try Tailscale instead** - much easier and more secure

### **"Slow or intermittent connection"**
1. **Check internet speed** at both locations
2. **Restart router** at home
3. **Use Tailscale** for more reliable connection
4. **Consider upgrading** internet plan

## 🎤 Recording Problems

### **"Microphone not working"**

#### **Browser Permission Issues:**
1. **Look for microphone icon** in browser address bar
2. **Click and select "Allow"**
3. **Refresh page** after granting permission
4. **Try different browser** if permission denied

#### **Hardware Issues:**
1. **Check microphone is connected** properly
2. **Test microphone** in other applications
3. **Try different USB port** for USB microphones
4. **Check Windows sound settings**

#### **Browser-Specific Issues:**
- **Chrome:** Usually works best
- **Firefox:** May need manual permission
- **Safari:** Works well on Mac
- **Edge:** Generally compatible

### **"Poor audio quality or transcription"**

#### **Audio Quality Issues:**
1. **Move closer to microphone**
2. **Reduce background noise**
3. **Speak more clearly** and slowly
4. **Use external microphone** instead of built-in

#### **Transcription Accuracy:**
1. **Use standard veterinary terms**
2. **Spell out difficult names**
3. **Pause between different topics**
4. **Avoid speaking over others**

### **"Recording cuts out or stops"**
1. **Check browser tab** hasn't lost focus
2. **Disable browser sleep/hibernation**
3. **Keep VetScribe tab active**
4. **Check for browser extensions** that might interfere

## 🤖 AI and SOAP Note Issues

### **"SOAP notes are poor quality"**

#### **Transcript Issues:**
1. **Review transcript first** - fix obvious errors
2. **Re-record if transcript** is very inaccurate
3. **Speak more clearly** in future recordings
4. **Include more detail** when speaking

#### **AI Model Issues:**
1. **Check which model** you're using in Ollama
2. **Try llama3.1:8b** for better quality or **llama3.2:1b** for speed
3. **Adjust temperature** to 0.3 for more consistency
4. **Verify model is fully loaded**

#### **Prompt Issues:**
1. **Use veterinary system prompt** (see setup guide)
2. **Include patient context** when speaking
3. **Follow SOAP structure** in your narration
4. **Be specific about** examination findings

### **"SOAP generation is very slow"**

#### **Model Performance:**
1. **Use smaller model** (Phi-3 Mini) for speed
2. **Close other programs** on home PC
3. **Check CPU usage** during generation
4. **Consider hardware upgrade**

#### **Network Issues:**
1. **Check connection speed** to home PC
2. **Use Tailscale** for optimized routing
3. **Reduce other network** usage during generation

### **"AI gives weird or inappropriate responses"**
1. **Check system prompt** is set correctly
2. **Verify using medical model** not general chat model
3. **Restart LM Studio** and reload model
4. **Try different model** if issues persist

## 💾 Storage and Data Issues

### **"Can't save SOAP notes"**
1. **Check browser storage** isn't full
2. **Clear browser cache** if needed
3. **Try different browser**
4. **Check for browser extensions** blocking storage

### **"Lost my SOAP notes"**
1. **Check History tab** for saved notes
2. **Look in browser downloads** for exported files
3. **Check if auto-delete** is enabled in settings
4. **Use export feature** regularly for backup

### **"Export functions not working"**
1. **Check browser allows downloads**
2. **Disable popup blockers** temporarily
3. **Try different export format**
4. **Check browser download settings**

## 🔒 Security and Privacy Issues

### **"Encryption not working"**
1. **Check browser supports** Web Crypto API
2. **Use HTTPS** instead of HTTP
3. **Try modern browser** (Chrome, Firefox, Safari)
4. **Check browser security settings**

### **"Privacy concerns about data"**
1. **All processing happens** on your home PC
2. **No data sent** to external servers
3. **Use Tailscale** for secure transmission
4. **Enable encryption** in settings

## 📱 Mobile and Browser Issues

### **"VetScribe doesn't work on mobile"**
1. **Use modern mobile browser** (Chrome, Safari)
2. **Grant microphone permission**
3. **Keep screen awake** during recording
4. **Use landscape mode** for better interface

### **"Interface looks broken"**
1. **Try different browser**
2. **Clear browser cache**
3. **Disable browser extensions**
4. **Check screen resolution** and zoom level

### **"Buttons don't respond"**
1. **Check JavaScript is enabled**
2. **Disable ad blockers** temporarily
3. **Try incognito/private mode**
4. **Refresh page completely**

## 🔧 Advanced Troubleshooting

### **"Multiple issues at once"**
1. **Start with fresh browser** session
2. **Clear all browser data** for VetScribe
3. **Restart home PC** and LM Studio
4. **Test each component** individually

### **"Issues after Windows update"**
1. **Check Windows Firewall** settings
2. **Verify microphone permissions** in Windows
3. **Restart LM Studio** after updates
4. **Check for driver updates**

### **"Performance degraded over time"**
1. **Restart Ollama** regularly
2. **Clear browser cache** weekly
3. **Check available disk space**
4. **Monitor system resources**

## 🧪 Diagnostic Tools

### **Built-in Diagnostics:**
```javascript
// Run in browser console (F12)
diagnoseApp()
```

### **Test Individual Components:**
```javascript
// Test security features
testSecurity()

// Check export functionality
testSecureExport()

// Verify connection
checkSecurityStatus()
```

### **Manual Tests:**
1. **Test microphone:** Record in other apps
2. **Test Ollama:** Visit `http://localhost:11434/api/tags`
3. **Test network:** Ping home PC from clinic
4. **Test browser:** Try different browser/device

## 📞 When to Seek Help

### **Contact IT Support If:**
- Network configuration issues
- Router/firewall problems
- Hardware compatibility issues
- Enterprise security restrictions

### **Check Documentation If:**
- Setup questions
- Feature explanations
- Best practices
- Configuration options

### **Try Different Approach If:**
- Multiple failed troubleshooting attempts
- Hardware limitations
- Network restrictions
- Time constraints

## ⚡ Prevention Tips

### **Daily Maintenance:**
1. **Keep home PC running** during clinic hours
2. **Check connection** before first patient
3. **Test recording** with short phrase
4. **Monitor system performance**

### **Weekly Maintenance:**
1. **Restart LM Studio** once per week
2. **Clear browser cache**
3. **Export important notes**
4. **Check for software updates**

### **Monthly Maintenance:**
1. **Update LM Studio** if new version available
2. **Review and clean** saved notes
3. **Check storage usage**
4. **Backup important data**

---

**Remember:** Most issues are simple connection or permission problems. Start with the basics (refresh, restart, reconnect) before trying complex solutions!
