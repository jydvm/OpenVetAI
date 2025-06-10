# OpenVetAI Deployment Guide

## 🚀 Quick Deployment with GitHub Pages (Recommended)

### Prerequisites
- GitHub account (free at [github.com](https://github.com))
- All OpenVetAI files downloaded/cloned

### Step-by-Step Deployment

#### 1. Create GitHub Repository
1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** button in top right → **"New repository"**
3. Repository name: `openvetai`
4. Description: `OpenVetAI - Voice-to-SOAP Notes for Veterinary Practice`
5. Make it **Public** (required for free GitHub Pages)
6. Check **"Add a README file"**
7. Click **"Create repository"**

#### 2. Upload VetScribe Files
1. In your new repository, click **"uploading an existing file"**
2. Drag and drop ALL VetScribe files:
   ```
   index.html
   styles.css
   app.js
   audio-recorder.js
   transcription.js
   llm-connector.js
   utils.js
   storage.js
   README.md
   ```
3. Scroll down and click **"Commit changes"**

#### 3. Enable GitHub Pages
1. Go to **Settings** tab in your repository
2. Scroll down to **"Pages"** in the left sidebar
3. Under **"Source"**, select **"Deploy from a branch"**
4. Choose **"main"** branch and **"/ (root)"** folder
5. Click **"Save"**

#### 4. Get Your URL
- GitHub will show your URL: `https://yourusername.github.io/vetscribe`
- It may take 5-10 minutes to become active
- Share this URL with veterinarians who want to use VetScribe

### 🎉 That's It!
Your VetScribe app is now live and accessible worldwide at your GitHub Pages URL.

---

## 🔄 Updating Your Deployment

### When You Make Changes:
1. Go to your GitHub repository
2. Click on the file you want to update
3. Click the **pencil icon** (Edit)
4. Make your changes
5. Scroll down and click **"Commit changes"**
6. Changes will be live in 1-2 minutes

### For Multiple Files:
1. Use GitHub Desktop app, or
2. Upload new files (will overwrite existing ones)

---

## 🌐 Alternative Deployment Options

### Option 2: Netlify (Professional)
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub account
3. Click **"New site from Git"**
4. Choose your VetScribe repository
5. Click **"Deploy site"**
6. Get custom URL like `https://vetscribe-abc123.netlify.app`

**Benefits:**
- Faster than GitHub Pages
- Custom domain support
- Automatic deployments
- Better analytics

### Option 3: Vercel (Developer-Friendly)
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub account
3. Click **"New Project"**
4. Import your VetScribe repository
5. Click **"Deploy"**

**Benefits:**
- Extremely fast global CDN
- Automatic HTTPS
- Preview deployments
- Professional URLs

### Option 4: Simple File Sharing
**For Quick Testing:**
1. Zip all VetScribe files
2. Share via email/Dropbox/Google Drive
3. Users download and open `index.html`
4. Works completely offline

---

## 📋 User Instructions

### How Veterinarians Access VetScribe:

#### First Time Setup:
1. **Visit your OpenVetAI URL** (e.g., `https://yourusername.github.io/openvetai`)
2. **Bookmark the page** for easy access
3. **Set up Ollama connection** (one-time):
   - Install Ollama on their computer
   - Download a model (recommended: llama3.2:1b for speed or llama3.1:8b for quality)
   - Start the server: `ollama serve`
   - Click "Test Connection" in OpenVetAI settings
4. **Start using immediately!**

#### Daily Use:
1. **Open bookmarked VetScribe URL**
2. **Click Record button**
3. **Speak consultation notes**
4. **Click Generate SOAP**
5. **Copy notes to practice management system**

---

## 🔧 Technical Requirements for Users

### Veterinarian's Setup:
- **Computer:** Windows, Mac, or Linux
- **Browser:** Chrome, Firefox, Safari, or Edge
- **LM Studio:** Free download from [lmstudio.ai](https://lmstudio.ai)
- **Model:** Any compatible model (Llama, Mistral, etc.)
- **Tailscale:** For secure remote access (optional)

### Network Requirements:
- **Internet:** Only for initial app loading
- **Local Network:** LM Studio and browser on same network
- **Tailscale:** For remote access to home/office LM Studio

---

## 🛡️ Security & Privacy

### Data Privacy:
- **No data sent to servers** - everything stays local
- **No user accounts required**
- **No tracking or analytics**
- **Complete HIPAA compliance** when used with local LM Studio

### Network Security:
- **HTTPS by default** on GitHub Pages
- **Tailscale encryption** for remote connections
- **Local processing only** - no cloud AI services

---

## 📞 Support & Updates

### For Veterinarians Using VetScribe:
- **Documentation:** Available in the app's Help section
- **Issues:** Report via GitHub Issues or your preferred method
- **Updates:** Automatic - just refresh the browser

### For Developers/Deployers:
- **Source Code:** Available in GitHub repository
- **Contributions:** Pull requests welcome
- **Issues:** Use GitHub Issues for bug reports
- **Documentation:** This file and inline code comments

---

## 🎯 Recommended Models for Veterinary Use

### Best Models for SOAP Notes:
1. **Llama 3.1 8B** - Excellent balance of speed and quality
2. **Mistral 7B** - Fast and efficient for clinical notes
3. **Llama 3.1 70B** - Highest quality (requires powerful hardware)
4. **CodeLlama 7B** - Good for structured medical documentation

### Model Selection Tips:
- **8B models:** Good for most practices, moderate hardware requirements
- **7B models:** Faster, lower hardware requirements
- **70B models:** Best quality, requires high-end hardware
- **Medical-specific models:** Use if available and compatible

---

## ✅ Deployment Checklist

### Before Going Live:
- [ ] All files uploaded to repository
- [ ] GitHub Pages enabled and working
- [ ] Test the live URL in different browsers
- [ ] Verify LM Studio connection works
- [ ] Test recording and SOAP generation
- [ ] Create user documentation/instructions
- [ ] Share URL with beta testers

### After Deployment:
- [ ] Monitor for any issues
- [ ] Collect user feedback
- [ ] Plan regular updates
- [ ] Consider custom domain if needed
- [ ] Set up analytics if desired

---

## 🚀 You're Ready to Deploy!

Choose your deployment method and follow the steps above. GitHub Pages is recommended for most users due to its simplicity and reliability.

**Questions?** Check the GitHub repository issues or create a new issue for support.
