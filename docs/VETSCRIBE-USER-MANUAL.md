# OpenVetAI User Manual

## 🎯 Quick Start for Busy Veterinarians

OpenVetAI transforms your spoken consultation into professional SOAP notes automatically using advanced AI. This manual gets you from **zero to generating SOAP notes in 5 minutes**.

## 🚀 Daily Workflow Overview

### **The 30-Second Process:**
1. **Click Record** → Start consultation
2. **Speak normally** → OpenVetAI listens and transcribes
3. **Click Stop** → Recording ends
4. **Click Generate** → AI creates SOAP notes
5. **Copy & Paste** → Into your practice management system

### **That's it!** No typing, no formatting, no hassle.

## 📱 Interface Overview

### **Main Tabs:**
- **🎤 Record** - Record consultations and generate transcripts
- **📝 Notes** - Generate and edit SOAP notes from transcripts
- **📚 History** - View and manage saved SOAP notes
- **⚙️ Settings** - Configure LM Studio connection and preferences

### **Key Buttons:**
- **🔴 Record** - Start/stop recording
- **⏸️ Pause** - Pause recording (resume anytime)
- **🔄 Generate** - Create SOAP notes from transcript
- **📋 Copy** - Copy SOAP notes to clipboard
- **💾 Save** - Save SOAP notes for later

## 🎤 Recording Consultations

### **Before You Start:**
1. **Check connection** - Green status indicator in top-right
2. **Test microphone** - Speak and watch for volume bars
3. **Position microphone** - Close enough to hear clearly

### **During Recording:**
1. **Click the red Record button**
2. **Speak normally** - no need to change your consultation style
3. **Include all relevant information:**
   - Patient history from owner
   - Your examination findings
   - Your assessment and diagnosis
   - Treatment plan and recommendations

### **Recording Tips:**
- **Speak clearly** but naturally
- **Include patient details** (species, breed, age, weight)
- **State examination findings** out loud
- **Mention medications** and dosages clearly
- **Don't worry about "ums" and pauses** - AI filters these out

### **What VetScribe Captures:**
- ✅ **Owner concerns** and history
- ✅ **Physical examination** findings
- ✅ **Vital signs** and measurements
- ✅ **Diagnostic results**
- ✅ **Assessment** and diagnosis
- ✅ **Treatment plans** and recommendations
- ✅ **Follow-up instructions**

## 📝 Generating SOAP Notes

### **After Recording:**
1. **Review the transcript** - check for accuracy
2. **Click "Generate SOAP Notes"**
3. **Wait 10-30 seconds** for AI processing
4. **Review generated notes**
5. **Edit if needed**
6. **Copy to clipboard**

### **SOAP Note Quality:**
VetScribe automatically organizes your consultation into:

#### **S (Subjective):**
- Owner's concerns and observations
- Patient history and behavior changes
- Previous treatments and responses

#### **O (Objective):**
- Physical examination findings
- Vital signs and measurements
- Diagnostic test results
- Body condition scores

#### **A (Assessment):**
- Primary and differential diagnoses
- Clinical impressions
- Problem list prioritization

#### **P (Plan):**
- Treatment recommendations
- Medications with dosages
- Follow-up instructions
- Client education points

## ⚙️ Settings Configuration

### **LM Studio Connection:**
1. **LLM Endpoint:** Enter your LM Studio URL
   - Local: `http://localhost:1234/v1`
   - Remote: `http://[YOUR-IP]:1234/v1`
   - Tailscale: `http://[TAILSCALE-IP]:1234/v1`
2. **Test Connection** - Should show green ✅
3. **Save settings** automatically

### **Audio Quality:**
- **High:** Best quality, larger files
- **Medium:** Good balance (recommended)
- **Low:** Faster processing, smaller files

### **Auto-Delete:**
- **Enabled:** Automatically delete old recordings
- **Disabled:** Keep all recordings (uses more storage)

## 📚 Managing Your SOAP Notes

### **History Tab Features:**
- **Search notes** by patient name, date, or content
- **View saved notes** with timestamps
- **Delete old notes** to save space
- **Export notes** for backup or sharing

### **Note Management:**
- **Auto-save** - Notes saved automatically when generated
- **Manual save** - Save edited notes
- **Copy to clipboard** - For pasting into practice software
- **Export options** - JSON, CSV, or encrypted formats

## 🎯 Best Practices for Quality SOAP Notes

### **Speaking Tips:**
1. **Use standard terminology** - VetScribe knows veterinary terms
2. **Include units** - "Temperature 101.5 degrees Fahrenheit"
3. **Spell difficult names** - "Patient name is Fluffy, F-L-U-F-F-Y"
4. **State numbers clearly** - "Weight is eight point five pounds"

### **Consultation Structure:**
1. **Start with patient info** - "This is a 3-year-old spayed female Golden Retriever named Bella"
2. **Get owner history** - Let owner speak, VetScribe captures it
3. **Narrate examination** - "Heart rate is 88 beats per minute, regular rhythm"
4. **State your assessment** - "My assessment is this is a healthy dog with mild dental disease"
5. **Explain your plan** - "I recommend dental cleaning within 6 months"

### **Common Phrases That Work Well:**
- "The owner reports that..."
- "On physical examination I find..."
- "Vital signs are as follows..."
- "My assessment is..."
- "The plan is to..."
- "I recommend..."
- "Follow up in..."

## 🚨 Troubleshooting Common Issues

### **"No microphone access"**
- **Grant permission** when browser asks
- **Check microphone** is connected and working
- **Try refreshing** the page
- **Check browser settings** for microphone permissions

### **"Can't connect to LM Studio"**
- **Verify LM Studio is running** and server is started
- **Check the endpoint URL** in settings
- **Test connection** with the test button
- **Ensure firewall** isn't blocking connection

### **"Poor transcription quality"**
- **Speak more clearly** and closer to microphone
- **Reduce background noise** in room
- **Check microphone quality** - consider upgrading
- **Pause recording** during interruptions

### **"SOAP notes are inaccurate"**
- **Review transcript first** - fix transcription errors
- **Be more specific** when speaking
- **Include more detail** in your narration
- **Edit generated notes** as needed

### **"Slow performance"**
- **Check your internet** connection to home PC
- **Verify LM Studio** isn't overloaded
- **Try smaller AI model** for faster processing
- **Close other programs** on home PC

## 📱 Mobile and Tablet Use

### **iPad/Tablet Tips:**
- **Add to home screen** for app-like experience
- **Use external microphone** for better audio quality
- **Landscape mode** works well for larger interface
- **Touch interface** optimized for tablets

### **Phone Use:**
- **Great for house calls** and emergencies
- **Voice recording** works well on phones
- **Copy notes** to text messages or email
- **Sync with main system** when back at clinic

## 🔒 Privacy and Security

### **Data Protection:**
- **All processing** happens on your home PC
- **No data sent** to external servers
- **Patient information** stays in your network
- **Encrypted storage** protects saved notes

### **HIPAA Compliance:**
- **Local processing** meets privacy requirements
- **Secure transmission** via Tailscale
- **Audit logging** tracks all access
- **Data retention** policies automatically enforced

## ⚡ Advanced Features

### **Keyboard Shortcuts:**
- **Spacebar:** Start/stop recording
- **Enter:** Generate SOAP notes
- **Ctrl+C:** Copy notes to clipboard
- **Ctrl+S:** Save current notes

### **Voice Commands:**
- **"Start recording"** - Begins recording
- **"Stop recording"** - Ends recording
- **"Generate notes"** - Creates SOAP notes

### **Batch Processing:**
- **Record multiple** consultations
- **Generate notes** for all at once
- **Export multiple** notes together

## 🎯 Getting the Best Results

### **For Routine Wellness Exams:**
- **Follow standard format** - history, exam, assessment, plan
- **Include all body systems** examined
- **State normal findings** clearly
- **Mention preventive care** recommendations

### **For Sick Visits:**
- **Detailed history** of the problem
- **Focused examination** findings
- **Differential diagnoses** considered
- **Specific treatment** plans

### **For Surgical Cases:**
- **Pre-operative** assessment
- **Surgical procedure** details
- **Post-operative** monitoring plan
- **Discharge instructions**

### **For Emergency Cases:**
- **Triage assessment** and vital signs
- **Immediate interventions** performed
- **Diagnostic workup** completed
- **Stabilization** and treatment plan

## 📊 Quality Metrics

### **Good SOAP Notes Include:**
- ✅ **Complete patient identification**
- ✅ **Thorough history** from owner
- ✅ **Systematic examination** findings
- ✅ **Clear assessment** and diagnosis
- ✅ **Specific treatment** plan
- ✅ **Follow-up** instructions

### **Signs of Quality:**
- **Professional language** and terminology
- **Logical organization** and flow
- **Complete information** for medical records
- **Clear action items** for staff and clients

## 🎉 Success Tips

### **Week 1: Getting Started**
- **Practice with simple cases** first
- **Focus on clear speaking**
- **Don't worry about perfection**
- **Edit notes as needed**

### **Week 2: Building Confidence**
- **Try more complex cases**
- **Develop your speaking rhythm**
- **Learn what works best**
- **Share with colleagues**

### **Week 3: Full Integration**
- **Use for all consultations**
- **Customize to your style**
- **Train staff on system**
- **Optimize your workflow**

---

**Remember:** VetScribe learns from how you speak. The more you use it, the better it gets at understanding your style and generating notes that match your preferences!

---

**Next:** Check out the troubleshooting guide for solutions to common issues, and the setup guides for LM Studio and Tailscale configuration.
