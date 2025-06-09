# OpenVetAI Ollama Setup Guide

## Quick Setup for Windows

### Step 1: Install Ollama
1. Download from https://ollama.ai/
2. Install normally

### Step 2: Configure for Network Access
```cmd
# Run as Administrator
setx OLLAMA_HOST "0.0.0.0:11434" /M
setx OLLAMA_ORIGINS "*" /M
```

### Step 3: Restart and Test
```cmd
# Restart command prompt as Administrator
ollama serve

# Should show: Listening on 0.0.0.0:11434
# Should show: OLLAMA_ORIGINS:[*]
```

### Step 4: Download Model
```cmd
ollama pull llama3.2:1b
# or for better quality but slower:
ollama pull llama3.1:8b
```

### Step 5: Test API
```cmd
curl http://localhost:11434/api/tags
```

## Troubleshooting

### CORS Issues
If you still get CORS errors:

1. **Check Environment Variables:**
   ```cmd
   echo %OLLAMA_HOST%
   echo %OLLAMA_ORIGINS%
   ```

2. **Restart Computer** (environment variables need system restart)

3. **Check Firewall:**
   ```cmd
   netsh advfirewall firewall add rule name="Ollama" dir=in action=allow protocol=TCP localport=11434
   ```

### Performance Issues
For slow devices (tablets):
- Use `llama3.2:1b` instead of `llama3.1:8b`
- Consider running Ollama on a more powerful PC and connecting remotely

### Remote Access (Tailscale)
1. Install Tailscale on both devices
2. Use Tailscale IP instead of localhost: `http://100.x.x.x:11434`
3. Ensure OLLAMA_HOST is set to `0.0.0.0:11434` (not localhost)

## Testing OpenVetAI Connection

### In OpenVetAI Settings:
- **Local:** `http://localhost:11434`
- **Remote:** `http://[tailscale-ip]:11434`

### Expected Results:
- ✅ Green checkmark on connection test
- ✅ Model detection working
- ✅ SOAP generation working
