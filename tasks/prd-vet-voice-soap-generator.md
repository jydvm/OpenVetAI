# Product Requirements Document: Veterinary Voice-to-SOAP Note Generator

## 1. Introduction/Overview

This document outlines the requirements for developing a web application that allows veterinarians to transcribe voice recordings into structured SOAP (Subjective, Objective, Assessment, Plan) format notes during appointments. The application will connect to locally-hosted Large Language Models (LLMs) on the veterinarian's personal computer, providing an easy-to-use interface for non-technical users to generate clinical documentation.

## 2. Goals

- Create a mobile-friendly web application accessible via standard browsers
- Enable real-time voice recording and transcription during veterinary appointments
- Connect to locally-hosted LLMs for processing and formatting transcriptions
- Generate properly formatted SOAP notes from voice input
- Provide a simple, intuitive interface suitable for non-technical users
- Ensure appropriate security for handling veterinary medical information
- Allow basic editing of generated notes before finalization

## 3. User Stories

- As a veterinarian, I want to record my observations during an animal examination so that I can focus on the patient rather than typing notes.
- As a veterinarian, I want the system to automatically format my conversation with the owner into the SOAP structure so that my documentation is consistent and complete.
- As a veterinarian, I want to use my own computer's LLM capabilities so that I don't have to rely on external services or share sensitive information.
- As a veterinarian, I want to quickly review and edit the generated notes before finalizing them so that I can ensure accuracy.
- As a veterinarian, I want to export the finalized notes as a text file so that I can save them for my records.

## 4. Functional Requirements

1. The application must provide a browser-based interface accessible on mobile devices.
2. The application must allow users to start, pause, and stop voice recording directly through the interface.
3. The application must transcribe recorded voice to text.
4. The application must connect to locally-hosted LLMs on the user's personal computer.
5. The application must process transcribed text through the LLM to generate properly formatted SOAP notes.
6. The application must display the generated SOAP notes in a structured format.
7. The application must allow basic editing of the generated notes before finalization.
8. The application must provide functionality to export the finalized notes as a text file.
9. The application must save both the raw transcript and the formatted SOAP note locally for later access.
10. The application must include a simple interface to browse and retrieve previously saved transcripts and SOAP notes.
11. The application must implement standard encryption for data security.
12. The application must allow users to delete saved transcripts and notes when no longer needed.

## 5. Non-Goals (Out of Scope)

- Integration with veterinary practice management systems
- Long-term storage or management of patient records
- Training or customization of the LLM with veterinary-specific data
- Support for specific animal specialties or exotic species terminology
- Multi-user collaboration features
- Offline functionality
- Mobile app versions (iOS/Android native apps)

## 6. Design Considerations

- The interface should be clean, modern, and intuitive for non-technical users
- Mobile-first design approach to ensure usability on tablets and smartphones
- Clear visual indicators for recording status (recording, paused, stopped)
- Structured display of SOAP sections with appropriate formatting
- Simple editing interface for quick corrections
- Minimalist design with focus on core functionality

## 7. Technical Considerations

- The application should use standard web technologies (HTML5, CSS, JavaScript)
- Voice recording should utilize the Web Audio API and MediaRecorder API
- The application should implement a method to connect to various locally-hosted LLMs
- The application should use secure WebSocket or similar technology for real-time communication with local LLM
- The application should implement appropriate error handling for LLM connection issues
- The application should work across major browsers (Chrome, Safari, Firefox, Edge)

## 8. Success Metrics

- Veterinarians can successfully record and generate SOAP notes in less than 5 minutes per appointment
- Generated SOAP notes require minimal editing before finalization
- The application works reliably across different mobile devices and browsers
- The application successfully connects to various locally-hosted LLM implementations
- Users report the interface is intuitive and requires minimal training

## 9. Open Questions

- What is the minimum specification for the personal computer running the LLM?
- How will the application handle poor audio quality or background noise in a veterinary setting?
- What specific prompt engineering will be required to optimize LLM output for veterinary SOAP notes?
- How will the application handle connectivity between the browser and the locally-hosted LLM?
- What security measures beyond standard encryption might be needed for veterinary contexts?
