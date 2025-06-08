# OpenVetAI 🤖

**Open-Source AI-Powered SOAP Note Generator for Veterinary Practices**

Transform your spoken consultations into professional SOAP notes automatically using advanced AI. Built specifically for veterinarians who want to spend more time with patients and less time typing.

## 🎯 Features

- **Voice Recording**: Record conversations directly in the browser
- **Local LLM Integration**: Connect to locally-hosted LLMs via Tailscale for privacy
- **SOAP Note Generation**: Automatically format transcripts into professional SOAP notes
- **Mobile-Friendly**: Responsive design optimized for tablets and mobile devices
- **Data Privacy**: All data stays local - no cloud services required
- **Easy Copy/Paste**: Single-window SOAP notes for easy integration with practice management software

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v16 or higher) - for development tools
2. **Ollama** - for running local LLMs
3. **Tailscale** (optional) - for remote access to home PC

### 🚀 Quick Deployment (Recommended)

**For most users - deploy to GitHub Pages:**

1. **Fork this repository** on GitHub
2. **Enable GitHub Pages** in repository Settings > Pages
3. **Get your URL:** `https://yourusername.github.io/vetscribe`
4. **Share with veterinarians** - they just visit the URL!

📖 **Detailed deployment guide:** See [DEPLOYMENT.md](DEPLOYMENT.md)

### 💻 Local Development

1. Clone the repository:
```bash
git clone https://github.com/your-username/vetscribe.git
cd vetscribe
```

2. Open `index.html` in your browser (no build step required!)
   - Or use a local server: `python -m http.server 8000`

## 🔧 Setup Guide

### 1. Ollama Setup

1. Download and install [Ollama](https://ollama.ai/)
2. Download a recommended model: `ollama pull mistral:7b`
3. Configure for network access: Set `OLLAMA_HOST=0.0.0.0:11434`
4. Start the server: `ollama serve`
5. Note the server URL (typically `http://localhost:11434`)

### 2. Tailscale Setup (Optional - for remote access)

1. Install [Tailscale](https://tailscale.com/) on both devices
2. Sign up and connect both devices to your Tailscale network
3. Note your home PC's Tailscale IP address
4. Use this IP in the OpenVetAI settings instead of localhost

### 3. OpenVetAI Configuration

1. Open OpenVetAI in your browser
2. Go to the Settings tab
3. Enter your Ollama endpoint:
   - Local: `http://localhost:11434/v1`
   - Remote via Tailscale: `http://100.x.x.x:11434/v1`
4. Test the connection

## 📱 Usage

1. **Record**: Click the red record button to start recording your conversation
2. **Generate**: After recording, click "Generate SOAP Notes" to process the transcript
3. **Review**: Review and edit the generated SOAP notes as needed
4. **Copy**: Use "Copy to Clipboard" to paste into your practice management software
5. **Save**: Save notes locally for future reference

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Check code quality
- `npm run format` - Format code with Prettier

### Project Structure

```
vetscribe/
├── index.html              # Main HTML file
├── styles.css              # CSS styles
├── app.js                  # Main application logic
├── utils.js                # Utility functions
├── audio-recorder.js       # Audio recording module
├── transcription.js        # Speech-to-text module
├── llm-connector.js        # LLM communication module
├── soap-generator.js       # SOAP note formatting module
├── storage.js              # Local storage module
├── tests/                  # Unit tests
├── package.json            # Project configuration
└── README.md              # This file
```

### Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## 🔒 Privacy & Security

- **Local Processing**: All voice data and transcripts stay on your devices
- **No Cloud Services**: No data is sent to external servers
- **Encrypted Storage**: Local data is encrypted for security
- **HIPAA Considerations**: Designed with veterinary privacy requirements in mind

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Roadmap

- [ ] Voice recording and transcription
- [ ] LLM integration with multiple providers
- [ ] SOAP note generation and formatting
- [ ] Local data storage and management
- [ ] Advanced editing capabilities
- [ ] Export to multiple formats
- [ ] User preferences and customization
- [ ] Offline functionality
- [ ] Integration with practice management systems

## 🐛 Troubleshooting

### Common Issues

**Recording not working:**
- Check microphone permissions in browser
- Ensure HTTPS or localhost for microphone access

**LLM connection failed:**
- Verify Ollama is running and accessible
- Check firewall settings and OLLAMA_HOST configuration
- Confirm Tailscale connection if using remote access

**Poor transcription quality:**
- Check microphone quality and positioning
- Reduce background noise
- Speak clearly and at moderate pace

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for veterinary professionals who prioritize data privacy
- Inspired by the need for efficient clinical documentation
- Thanks to the open-source LLM community

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**Note**: This is an open-source project designed to empower veterinarians with their own data and AI capabilities. Always ensure compliance with local regulations and practice requirements.
