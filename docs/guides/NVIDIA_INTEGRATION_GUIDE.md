# NVIDIA AI Integration Guide

## Overview

The iCHAIN Swarms application uses NVIDIA AI for advanced market analysis and trading signal generation. The system supports two deployment options:

1. **NVIDIA Cloud API** (Default) - Production-ready, hosted by NVIDIA
2. **Local NVIDIA NIM** (Optional) - Self-hosted inference for development/testing

---

## 1. NVIDIA Cloud API Setup (Default)

### Current Configuration

✅ **API Key**: `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`
✅ **Model**: `nvidia/llama-3.3-nemotron-super-49b-v1.5`
✅ **Endpoint**: `https://integrate.api.nvidia.com/v1`

### Features
- No infrastructure required
- High-performance GPU inference
- Scalable and reliable
- Automatic updates and maintenance

### Usage
The cloud API is pre-configured and ready to use. No additional setup required!

---

## 2. Local NVIDIA NIM Setup (Optional)

### Prerequisites
- Docker installed
- NVIDIA GPU with CUDA support
- NVIDIA Container Toolkit
- Minimum 16GB RAM
- 50GB free disk space

### Setup Instructions

#### Step 1: Login to NVIDIA Container Registry

```bash
docker login nvcr.io
```

**Credentials:**
- Username: `crixis31@gmail.com`
- Password: `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`

#### Step 2: Set Environment Variables

```bash
export NGC_API_KEY=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
export LOCAL_NIM_CACHE=~/.cache/nim
mkdir -p "$LOCAL_NIM_CACHE"
```

#### Step 3: Run Local NIM Container

```bash
docker run -it --rm \
    --gpus all \
    --shm-size=16GB \
    -e NGC_API_KEY \
    -v "$LOCAL_NIM_CACHE:/opt/nim/.cache" \
    -u $(id -u) \
    -p 8000:8000 \
    nvcr.io/nim/nvidia/nvidia-nemotron-nano-9b-v2:latest
```

#### Step 4: Test Local NIM

```bash
curl -X 'POST' \
  'http://0.0.0.0:8000/v1/chat/completions' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "nvidia/nvidia-nemotron-nano-9b-v2",
    "messages": [{"role":"user", "content":"Analyze the current cryptocurrency market trends"}],
    "max_tokens": 512
  }'
```

#### Step 5: Configure Application

Add to your `.env` file:

```bash
NVIDIA_NIM_ENDPOINT=http://localhost:8000/v1
```

Or if running in a Docker network:
```bash
NVIDIA_NIM_ENDPOINT=http://host.docker.internal:8000/v1
```

---

## Model Comparison

| Feature | Cloud API | Local NIM |
|---------|-----------|-----------|
| **Model** | Llama 3.3 Nemotron Super 49B | Nemotron Nano 9B |
| **Parameters** | 49 Billion | 9 Billion |
| **Performance** | Superior accuracy | Faster inference |
| **Setup** | Immediate | Requires infrastructure |
| **Cost** | API usage based | One-time setup + GPU |
| **Internet** | Required | Optional (after download) |

---

## Automatic Model Selection

The system automatically selects the appropriate model based on your configuration:

- **Cloud API**: Uses `nvidia/llama-3.3-nemotron-super-49b-v1.5` (more powerful)
- **Local NIM**: Uses `nvidia/nvidia-nemotron-nano-9b-v2` (optimized for local)

---

## Configuration Options

### Environment Variables

```bash
# Required: NVIDIA API Key
NVIDIA_API_KEY=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

# Optional: Local NIM Endpoint (leave empty to use cloud API)
NVIDIA_NIM_ENDPOINT=
```

---

## Troubleshooting

### Cloud API Issues

**Issue**: `NVIDIA API error: Authentication failed`
- **Solution**: Verify API key is correct in `.env` file

**Issue**: `Rate limit exceeded`
- **Solution**: Wait a few minutes or contact NVIDIA for higher limits

### Local NIM Issues

**Issue**: `docker: Error response from daemon: could not select device driver`
- **Solution**: Install NVIDIA Container Toolkit:
  ```bash
  distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
  curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
  curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list
  sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit
  sudo systemctl restart docker
  ```

**Issue**: Container runs but API doesn't respond
- **Solution**: Check logs and ensure port 8000 is not in use:
  ```bash
  docker logs <container_id>
  sudo lsof -i :8000
  ```

---

## Best Practices

### For Production
✅ Use the **Cloud API** for production deployments
✅ Monitor API usage and rate limits
✅ Implement proper error handling and retries
✅ Cache market analysis results when appropriate

### For Development
✅ Use **Local NIM** for development to avoid API costs
✅ Test with smaller models first
✅ Monitor GPU memory usage
✅ Keep the NIM container running during development

---

## API Response Format

Both cloud and local deployments return the same response format:

```json
{
  "choices": [
    {
      "message": {
        "content": "Market analysis JSON response..."
      }
    }
  ]
}
```

The application automatically handles response parsing and JSON extraction.

---

## Security Notes

🔒 **Never commit API keys to version control**
🔒 **Use environment variables for all credentials**
🔒 **Rotate API keys regularly**
🔒 **Monitor API usage for anomalies**

---

## Support

- **NVIDIA API Documentation**: https://docs.api.nvidia.com/
- **NVIDIA NIM Documentation**: https://docs.nvidia.com/nim/
- **Container Registry**: https://catalog.ngc.nvidia.com/

---

## Summary

✅ **Current Setup**: Cloud API with key `nvapi-gkSW...MRsN`
✅ **Model**: Llama 3.3 Nemotron Super 49B (49B parameters)
✅ **Status**: Production ready
✅ **Optional**: Local NIM available for development

The system is now configured and ready for AI-powered trading!
