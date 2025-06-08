# LM Studio Setup Guide for OpenVetAI

## 🎯 Quick Start for Veterinarians

This guide will get you running OpenVetAI with LM Studio in **under 30 minutes**. Perfect for busy veterinarians who want to start using AI-powered SOAP note generation immediately.

## 📋 What You'll Need

### **Hardware Requirements:**
- **Windows PC** (Windows 10/11)
- **8GB RAM minimum** (16GB+ recommended)
- **20GB free disk space** (for AI models)
- **Decent CPU** (Intel i5/AMD Ryzen 5 or better)
- **Optional: NVIDIA GPU** (for faster processing)

### **Network Requirements:**
- **Internet connection** (for downloading models)
- **Home network access** (for clinic-to-home connection)

## 🚀 Step 1: Download and Install LM Studio

### **Download LM Studio:**
1. Go to **https://lmstudio.ai/**
2. Click **"Download for Windows"**
3. Download the installer (about 100MB)

### **Install LM Studio:**
1. **Run the installer** as Administrator
2. **Accept the license** agreement
3. **Choose installation location** (default is fine)
4. **Wait for installation** (2-3 minutes)
5. **Launch LM Studio** when complete

### **First Launch:**
- LM Studio will open with a welcome screen
- **No account required** - it runs completely locally
- You'll see the main interface with model browser

## 🧠 Step 2: Download Veterinary-Optimized AI Models

### **Recommended Models for Veterinary Use:**

#### **🥇 Best Overall: Llama 3.1 8B Instruct (Recommended)**
- **Size:** ~5GB
- **Speed:** Fast on most PCs
- **Quality:** Excellent for SOAP notes
- **Memory:** Works with 8GB+ RAM

#### **🥈 Lightweight Option: Phi-3 Mini (For older PCs)**
- **Size:** ~2GB
- **Speed:** Very fast
- **Quality:** Good for basic SOAP notes
- **Memory:** Works with 4GB+ RAM

#### **🥉 High Quality: Llama 3.1 70B (For powerful PCs)**
- **Size:** ~40GB
- **Speed:** Slower but highest quality
- **Quality:** Exceptional SOAP notes
- **Memory:** Requires 32GB+ RAM

### **How to Download Models:**

#### **Download Llama 3.1 8B (Recommended):**
1. In LM Studio, click **"🔍 Search"** tab
2. Search for: **"llama-3.1-8b-instruct"**
3. Look for: **"Meta-Llama-3.1-8B-Instruct-GGUF"**
4. Click **"Download"** next to the **Q4_K_M** version
5. **Wait for download** (10-20 minutes depending on internet)

#### **Alternative: Download Phi-3 Mini (Lightweight):**
1. Search for: **"phi-3-mini"**
2. Look for: **"Phi-3-mini-4k-instruct-GGUF"**
3. Download the **Q4_K_M** version
4. Much faster download (~5 minutes)

## ⚙️ Step 3: Configure LM Studio for VetScribe

### **Load Your Model:**
1. Click **"💬 Chat"** tab in LM Studio
2. Click **"Select a model to load"**
3. Choose your downloaded model (Llama 3.1 8B recommended)
4. Click **"Load Model"**
5. **Wait for loading** (30-60 seconds)

### **Configure Server Settings:**
1. Click **"🔌 Local Server"** tab
2. **Set Port:** `1234` (default is perfect)
3. **Set Host:** `0.0.0.0` (allows network access)
4. **Enable CORS:** ✅ Check this box
5. **Load Model:** Select your model again
6. Click **"Start Server"**

### **Verify Server is Running:**
- You should see: **"Server running on http://localhost:1234"**
- Status should show: **"✅ Server Online"**
- Model should show as loaded

## 🔧 Step 4: Optimize Settings for Veterinary Use

### **Model Parameters (Click "⚙️ Advanced"):**
```
Temperature: 0.3
(Lower = more consistent, higher = more creative)

Max Tokens: 2048
(Enough for detailed SOAP notes)

Top P: 0.9
(Good balance for medical text)

Repeat Penalty: 1.1
(Prevents repetitive text)
```

### **System Prompt for Veterinary Use:**
In the **"System Prompt"** box, enter:
```
You are a professional veterinary assistant helping to create accurate SOAP notes. Focus on:
- Clear, concise medical language
- Proper veterinary terminology
- Organized SOAP format (Subjective, Objective, Assessment, Plan)
- Professional tone suitable for medical records
- Accurate information based on the provided consultation details
```

## 🌐 Step 5: Test Your Setup

### **Test the API Connection:**
1. Open your web browser
2. Go to: **http://localhost:1234/v1/models**
3. You should see JSON data about your loaded model
4. If you see data, your API is working! ✅

### **Test with VetScribe:**
1. Open **VetScribe** in your browser
2. Go to **Settings** tab
3. Enter LLM Endpoint: **`http://localhost:1234/v1`**
4. Click **"Test Connection"**
5. Should show: **"✅ Connection successful"**

## 🏠 Step 6: Home PC Setup for Clinic Access

### **Option A: Same Network (Easiest)**
If your clinic and home are on the same network:
1. Find your PC's IP address:
   - Press **Windows + R**
   - Type: **`cmd`** and press Enter
   - Type: **`ipconfig`** and press Enter
   - Look for **"IPv4 Address"** (e.g., 192.168.1.100)
2. In VetScribe settings, use: **`http://[YOUR-IP]:1234/v1`**
   - Example: **`http://192.168.1.100:1234/v1`**

### **Option B: Remote Access (Recommended)**
For accessing your home PC from anywhere:
1. **Use Tailscale** (see separate Tailscale guide)
2. **Use your Tailscale IP** in VetScribe settings
3. **Much more secure** than opening ports

## 🚨 Troubleshooting Common Issues

### **"Model won't load"**
- **Check RAM:** Model might be too large for your system
- **Try smaller model:** Download Phi-3 Mini instead
- **Restart LM Studio:** Close and reopen the application

### **"Server won't start"**
- **Check port 1234:** Make sure nothing else is using it
- **Run as Administrator:** Right-click LM Studio → "Run as administrator"
- **Check firewall:** Windows might be blocking the connection

### **"VetScribe can't connect"**
- **Verify server is running:** Check LM Studio shows "Server Online"
- **Check URL:** Make sure you're using `http://localhost:1234/v1`
- **Test in browser:** Visit `http://localhost:1234/v1/models` first

### **"Slow responses"**
- **Use smaller model:** Try Phi-3 Mini for faster responses
- **Check CPU usage:** Close other programs while using
- **Consider GPU:** NVIDIA GPU can significantly speed up processing

### **"Connection refused from clinic"**
- **Check network:** Make sure clinic can reach your home PC
- **Use Tailscale:** Much easier than configuring routers
- **Check firewall:** Windows firewall might be blocking connections

## 📱 Mobile/Tablet Access

### **For iPad/Tablet Use:**
1. **Connect to same network** as your PC
2. **Use PC's IP address** in VetScribe
3. **Add to home screen** for app-like experience
4. **Works great** for bedside SOAP note generation

## 🔒 Security Best Practices

### **For Home Setup:**
- **Use Tailscale** for secure remote access
- **Don't open router ports** unless you know what you're doing
- **Keep LM Studio updated** for security patches
- **Use strong passwords** on your PC

### **For Clinic Use:**
- **VetScribe runs locally** - no data sent to external servers
- **All processing happens** on your home PC
- **Patient data stays** within your network
- **HIPAA-friendly** when properly configured

## ⚡ Quick Reference

### **Daily Startup Routine:**
1. **Turn on home PC**
2. **Open LM Studio**
3. **Load your model** (if not auto-loaded)
4. **Start server** (if not auto-started)
5. **Open VetScribe** at clinic
6. **Start recording** SOAP notes!

### **Essential URLs:**
- **LM Studio Server:** `http://localhost:1234`
- **API Endpoint:** `http://localhost:1234/v1`
- **Model Test:** `http://localhost:1234/v1/models`

### **Key Settings:**
- **Port:** 1234
- **Host:** 0.0.0.0
- **CORS:** Enabled
- **Temperature:** 0.3
- **Max Tokens:** 2048

## 🎯 Ready for Tomorrow!

With this setup, you'll be ready to:
- **Record consultations** with VetScribe
- **Generate SOAP notes** automatically
- **Access from clinic** to home PC
- **Keep all data secure** and local

**Next:** Check out the Tailscale setup guide for secure remote access, the veterinary AI models guide for model recommendations, and the VetScribe user manual for tips on getting the best SOAP notes!

---

**Need help?** The troubleshooting section covers 90% of common issues. For advanced setup, see the detailed configuration guides.
