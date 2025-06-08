# Ollama Setup Guide for OpenVetAI

## 🎯 Quick Setup for Busy Veterinarians

This guide will get you running OpenVetAI with Ollama in **under 30 minutes**. Perfect for busy veterinarians who want to start using AI-powered SOAP note generation immediately.

## 🚀 **What You'll Accomplish**

By the end of this guide, you'll have:
- ✅ **Ollama installed** and running on your home PC
- ✅ **AI model downloaded** and ready for veterinary use
- ✅ **Server configured** for remote access via Tailscale
- ✅ **Connection tested** and working perfectly
- ✅ **Ready to generate** professional SOAP notes!

## 📋 What You'll Need

### **Hardware Requirements:**
- **Windows PC** (Windows 10/11) or **Mac** (macOS 11+) or **Linux**
- **8GB RAM minimum** (16GB+ recommended)
- **10GB free disk space** (for AI models)
- **Decent CPU** (Intel i5/AMD Ryzen 5 or better)
- **Optional: NVIDIA GPU** (for faster processing)

### **Network Requirements:**
- **Internet connection** (for downloading Ollama and models)
- **Home network** (for local AI processing)
- **Tailscale account** (for secure remote access)

### **Time Required:**
- **Download and install:** 5 minutes
- **Model download:** 10-15 minutes (depending on internet speed)
- **Configuration:** 5-10 minutes
- **Testing:** 5 minutes

## 🔧 **Step 1: Install Ollama**

### **For Windows:**
1. **Go to:** https://ollama.ai/
2. **Click "Download for Windows"**
3. **Run the installer** (OllamaSetup.exe)
4. **Follow installation prompts** (use default settings)
5. **Ollama will start automatically** after installation

### **For Mac:**
1. **Go to:** https://ollama.ai/
2. **Click "Download for macOS"**
3. **Open the .dmg file** and drag Ollama to Applications
4. **Launch Ollama** from Applications folder
5. **Allow permissions** when prompted

### **For Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### **Verify Installation:**
Open **Command Prompt** (Windows) or **Terminal** (Mac/Linux) and run:
```bash
ollama --version
```
Should show version information.

## 🤖 **Step 2: Download AI Model**

### **Download Mistral-7B (Recommended for Veterinary Use):**
```bash
ollama pull mistral:7b
```

**This will download ~4GB** - perfect balance of speed and quality for SOAP notes.

### **Alternative Models:**
```bash
# Faster, smaller model (good for slower PCs)
ollama pull phi3:mini

# Larger, more capable model (if you have powerful hardware)
ollama pull llama3:8b
```

### **Verify Model Download:**
```bash
ollama list
```
Should show your downloaded model(s).

## 🌐 **Step 3: Configure for Network Access**

### **Set Environment Variable for Remote Access:**

#### **Windows:**
1. **Press Windows + R**
2. **Type:** `sysdm.cpl` and press Enter
3. **Advanced tab** → **Environment Variables**
4. **System Variables** → **New**
5. **Variable name:** `OLLAMA_HOST`
6. **Variable value:** `0.0.0.0:11434`
7. **Click OK** to save

#### **Mac/Linux:**
Add to your shell profile (~/.bashrc, ~/.zshrc, etc.):
```bash
export OLLAMA_HOST=0.0.0.0:11434
```

### **Restart Ollama:**
After setting the environment variable:

#### **Windows:**
1. **Open Task Manager** (Ctrl+Shift+Esc)
2. **Find "ollama"** process and end it
3. **Open Command Prompt** and run: `ollama serve`

#### **Mac/Linux:**
```bash
# Stop ollama if running
pkill ollama

# Start ollama server
ollama serve
```

### **Verify Network Configuration:**
You should see:
```
Listening on 0.0.0.0:11434 (version 0.x.x)
```

## 🧪 **Step 4: Test Local Connection**

### **Test Basic API:**
Open browser and go to:
```
http://localhost:11434/api/tags
```

**Should show JSON** with your installed models.

### **Test Chat API:**
In Command Prompt/Terminal:
```bash
ollama run mistral:7b "Hello, can you help with veterinary documentation?"
```

Should respond with AI-generated text.

## 🔒 **Step 5: Configure Firewall (Windows)**

### **Allow Ollama Through Windows Firewall:**
1. **Windows Security** → **Firewall & network protection**
2. **"Allow an app through firewall"**
3. **"Change settings"** → **"Allow another app"**
4. **Browse to Ollama** (usually in `C:\Users\[username]\AppData\Local\Programs\Ollama\`)
5. **Select ollama.exe**
6. **Check both Private and Public** networks
7. **Click OK**

### **Alternative: Manual Firewall Rule:**
1. **Press Windows + R** → Type `wf.msc`
2. **Inbound Rules** → **New Rule**
3. **Port** → **TCP** → **11434**
4. **Allow the connection**
5. **All profiles** (Domain, Private, Public)
6. **Name:** "Ollama API"

## 🌐 **Step 6: Test Remote Connection (with Tailscale)**

### **Prerequisites:**
- **Tailscale installed** on both home PC and clinic device
- **Both devices connected** to your Tailscale network

### **Get Your Tailscale IP:**
On your **home PC**:
1. **Right-click Tailscale icon** in system tray
2. **Copy IP address** (starts with 100.x.x.x)

### **Test from Remote Device:**
On your **clinic device** browser:
```
http://[tailscale-ip]:11434/api/tags
```

**Should show the same JSON** as the local test.

## ⚙️ **Step 7: Configure OpenVetAI**

### **Open OpenVetAI:**
Go to: `https://jydvm.github.io/OpenVetAI/`

### **Configure Settings:**
1. **Click "Settings" tab**
2. **LLM Endpoint:** `http://[tailscale-ip]:11434/v1`
   - **Local use:** `http://localhost:11434/v1`
   - **Remote use:** `http://100.x.x.x:11434/v1`
3. **Click "Test Connection"**
4. **Should show:** Green checkmark ✅

## 🎤 **Step 8: Test SOAP Note Generation**

### **Record Test Consultation:**
1. **Click "Record" tab**
2. **Click red Record button**
3. **Speak test consultation:**
   ```
   "This is a 3-year-old spayed female Golden Retriever named Bella. 
   The owner reports she's been eating well and has normal energy. 
   On physical examination, temperature is 101.2 degrees, heart rate 88. 
   She's alert and responsive. Heart and lungs sound normal. 
   My assessment is this is a healthy dog for routine wellness. 
   Plan is to continue current diet and return in one year."
   ```
4. **Click Stop**
5. **Click "Generate SOAP Notes"**
6. **Watch AI create professional notes!** 🎉

## 🚨 **Troubleshooting**

### **"Connection Failed" Error:**
- **Check Ollama is running:** `ollama serve`
- **Verify firewall settings** allow port 11434
- **Confirm OLLAMA_HOST** environment variable is set
- **Test local connection** first: `http://localhost:11434/api/tags`

### **"Model Not Found" Error:**
- **List installed models:** `ollama list`
- **Download model if missing:** `ollama pull mistral:7b`
- **Use exact model name** from the list

### **Slow Performance:**
- **Try smaller model:** `ollama pull phi3:mini`
- **Close other applications** to free RAM
- **Check CPU usage** during generation

### **Remote Connection Issues:**
- **Verify Tailscale** is connected on both devices
- **Check Tailscale IP** is correct
- **Test local connection** works first
- **Confirm firewall** allows external connections

## 🎯 **Performance Tips**

### **For Faster SOAP Generation:**
- **Use phi3:mini** for speed (smaller model)
- **Close unnecessary programs** during use
- **Ensure adequate RAM** (16GB+ recommended)

### **For Better Quality:**
- **Use llama3:8b** for more detailed notes
- **Speak clearly** during recording
- **Include specific details** in your narration

## 🔧 **Advanced Configuration**

### **Custom Model Parameters:**
Create a Modelfile for veterinary-specific settings:
```bash
# Create custom model
ollama create vet-mistral -f Modelfile
```

### **Automatic Startup (Windows):**
1. **Press Windows + R** → `shell:startup`
2. **Create shortcut** to `ollama serve`
3. **Ollama will start** with Windows

## ✅ **Success Checklist**

After completing this guide, verify:
- [ ] **Ollama installed** and running
- [ ] **Model downloaded** (mistral:7b or similar)
- [ ] **Environment variable** OLLAMA_HOST set to 0.0.0.0:11434
- [ ] **Firewall configured** to allow port 11434
- [ ] **Local test** works: `http://localhost:11434/api/tags`
- [ ] **Remote test** works: `http://[tailscale-ip]:11434/api/tags`
- [ ] **OpenVetAI connection** shows green checkmark
- [ ] **SOAP generation** works with test recording

## 🎉 **You're Ready!**

**Congratulations!** You now have a professional AI-powered SOAP note generator running on your own hardware. Your veterinary practice data stays completely private while you benefit from cutting-edge AI technology.

### **Daily Workflow:**
1. **Ensure home PC is on** and Ollama is running
2. **Open OpenVetAI** on any device
3. **Record consultations** and generate SOAP notes
4. **Copy notes** into your practice management system

### **Next Steps:**
- **Read the [User Manual](OPENVETAI-USER-MANUAL.md)** for advanced features
- **Check [Troubleshooting Guide](TROUBLESHOOTING-GUIDE.md)** for common issues
- **Explore [AI Models Guide](VETERINARY-AI-MODELS-GUIDE.md)** for other model options

**Welcome to the future of veterinary documentation!** 🚀
