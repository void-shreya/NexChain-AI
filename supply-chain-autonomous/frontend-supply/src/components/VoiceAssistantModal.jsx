import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Send, Sparkles, ArrowRight } from 'lucide-react';
import { agentApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

const samplePrompts = [
  'Which orders are currently at risk?',
  'Why is Tata AutoComp considered risky?',
  'What happens if Supplier B is unavailable?',
  'Which shipments are delayed?',
  'What actions has the AI taken?',
];

export const VoiceAssistantModal = ({ isOpen, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for Web Speech API recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onresult = (event) => {
        const text = Array.from(event.results)
          .map((res) => res[0].transcript)
          .join('');
        setTranscript(text);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('');
      setAiResponse(null);
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn(e);
      }
    } else {
      alert('Speech Recognition not supported in this browser. You can type in the prompt box below.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (transcript) {
        handleSubmitQuery(transcript);
      }
    }
  };

  const handleSubmitQuery = async (queryText) => {
    const q = (queryText || transcript).trim();
    if (!q) return;

    setIsProcessing(true);
    try {
      const res = await agentApi.sendCommand(q);
      if (res.data?.success) {
        const data = res.data.data;
        setAiResponse(data);

        // Vocalize response using SpeechSynthesis if available
        if ('speechSynthesis' in window && data.spokenResponse) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(data.spokenResponse);
          utterance.rate = 1.05;
          utterance.pitch = 1.0;
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (err) {
      setAiResponse({
        textResponse: 'Error connecting to SupplyChain Guardian agent core.',
        suggestedAction: null,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActionClick = (action) => {
    onClose();
    if (action === 'NAVIGATE_TO_ORDERS') navigate('/orders');
    else if (action === 'NAVIGATE_TO_SUPPLIERS') navigate('/suppliers');
    else if (action === 'NAVIGATE_TO_SIMULATION') navigate('/simulation');
    else if (action === 'NAVIGATE_TO_TRACKING') navigate('/tracking');
    else if (action === 'NAVIGATE_TO_DECISIONS') navigate('/decisions');
    else navigate('/dashboard');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={18} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Voice AI Operations Copilot</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Ask real-time questions to SupplyChain Guardian
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Microphone Pulse & Listening State */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1rem',
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: 'var(--border-radius-lg)',
            border: isListening ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
            marginBottom: '1.5rem',
            position: 'relative',
          }}
        >
          <button
            onClick={isListening ? stopListening : startListening}
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              backgroundColor: isListening ? '#f43f5e' : 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              boxShadow: isListening ? '0 0 30px rgba(244, 63, 94, 0.6)' : '0 0 25px rgba(6, 182, 212, 0.5)',
              transition: 'all 0.3s ease',
            }}
          >
            {isListening ? <MicOff size={32} color="#ffffff" /> : <Mic size={32} color="#ffffff" />}
          </button>

          {/* Listening Waves */}
          {isListening && (
            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div className="voice-waves">
                <div className="wave-bar" />
                <div className="wave-bar" />
                <div className="wave-bar" />
                <div className="wave-bar" />
                <div className="wave-bar" />
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                Listening... Click to send
              </span>
            </div>
          )}

          {!isListening && !transcript && (
            <span style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Click microphone to speak or pick a prompt below
            </span>
          )}

          {transcript && (
            <div style={{ marginTop: '1rem', textAlign: 'center', maxWidth: '90%' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>You said:</span>
              <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                "{transcript}"
              </p>
            </div>
          )}
        </div>

        {/* AI Answer Card */}
        {isProcessing && (
          <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>
            SupplyChain Guardian is analyzing live telemetry...
          </div>
        )}

        {aiResponse && (
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--border-radius-md)',
              backgroundColor: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Volume2 size={16} color="var(--accent-cyan)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                Guardian Intelligence Response
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {aiResponse.textResponse}
            </p>
            {aiResponse.suggestedAction && (
              <button
                onClick={() => handleActionClick(aiResponse.suggestedAction)}
                className="btn btn-primary"
                style={{ marginTop: '0.85rem', fontSize: '0.78rem', padding: '0.45rem 0.9rem' }}
              >
                <span>Navigate to Target View</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        )}

        {/* Sample Prompt Chips */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Recommended Queries:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {samplePrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setTranscript(prompt);
                  handleSubmitQuery(prompt);
                }}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--border-radius-full)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                  e.currentTarget.style.color = 'var(--accent-cyan)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input Fallback */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Type any supply chain query..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmitQuery(transcript)}
            style={{
              flex: 1,
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--border-radius-md)',
              padding: '0.65rem 1rem',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
          <button
            onClick={() => handleSubmitQuery(transcript)}
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.1rem' }}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
