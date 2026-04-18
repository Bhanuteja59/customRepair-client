'use client';

import { useState, useRef, useEffect } from 'react';

/* ─── Types ─────────────────────────────────────────────── */

/* ─── Types ─────────────────────────────────────────────── */
type Phase = 'greeting' | 'categories' | 'intake' | 'submitted';

type IntakeStep = 'notes' | 'name' | 'phone' | 'email' | 'address' | 'date' | 'time' | 'review';

interface Message {
  from: 'bot' | 'user';
  text: string;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  date: string;
  time: string;
}

/* ─── Constants ───────────────────────────────────────────── */
const CATEGORIES = [
  { id: 'ac', label: 'AC / Cooling Problem', icon: '❄️', desc: 'Not cooling, strange sounds, leaking' },
  { id: 'heating', label: 'Heating / Furnace Issue', icon: '🔥', desc: 'No heat, pilot light, thermostat' },
  { id: 'water', label: 'Water / Plumbing Issue', icon: '💧', desc: 'Leaks, clogs, water heater, pressure' },
  { id: 'electrical', label: 'Electrical Problem', icon: '⚡', desc: 'Outlets, breakers, wiring, panels' },
  { id: 'thermostat', label: 'Thermostat / Smart Home', icon: '🌡️', desc: 'Nest, Ecobee, Wi-Fi issues' },
  { id: 'other', label: 'Other / Not Sure', icon: '🔧', desc: 'Describe your issue in chat' },
];

const TIME_WINDOWS = [
  '8:00 AM – 10:00 AM',
  '10:00 AM – 12:00 PM',
  '12:00 PM – 2:00 PM',
  '2:00 PM – 4:00 PM',
  '4:00 PM – 6:00 PM',
  '6:00 PM – 8:00 PM',
];

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

/* ─── Main Component ─────────────────────────────────────── */
export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('greeting');
  const [intakeStep, setIntakeStep] = useState<IntakeStep>('notes');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    date: '',
    time: '',
  });

  const [availableSlots, setAvailableSlots] = useState<Record<string, {id: string, time: string}[]>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Auto-scroll */
  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, phase]);

  /* Focus input */
  useEffect(() => {
    if (phase === 'intake' && intakeStep !== 'review' && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [phase, intakeStep]);

  /* ── Intake Flow Logic ── */
  const getIntakePrompt = (step: IntakeStep, categories: string[], currentData?: FormData) => {
    const data = currentData || formData;
    switch (step) {
      case 'notes':
        return `Got it! You're having issues with **${categories.join(', ')}**. Could you describe briefly what's happening?`;
      case 'name':
        return "Thanks for that info. To help you book a technician, I just need a few contact details. What's your **full name**?";
      case 'phone':
        return `Nice to meet you, ${data.name.split(' ')[0] || 'there'}! What's a good **phone number** to reach you at?`;
      case 'email':
        return "And your **email address** for the confirmation?";
      case 'address':
        return "Got it. Where should we send our technician? (Street, City)";
      case 'date':
        return "Almost done! What **date** would you like us to come by?";
      case 'time':
        return "And finally, which **time window** works best for you?";
      case 'review':
        return "Great! I've gathered all the details. Please review your request below and click 'Submit' if everything looks correct.";
      default:
        return "";
    }
  };

  /* ── Toggle multiple categories ── */
  const toggleCategory = (label: string) => {
    setSelectedCategories((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );
  };

  /* ── Confirm categories and start intake ── */
  const handleCategoriesConfirm = () => {
    if (selectedCategories.length === 0) return;
    setPhase('intake');
    setIntakeStep('notes');
    setMessages([
      {
        from: 'bot',
        text: getIntakePrompt('notes', selectedCategories),
      },
    ]);
  };

  /* ── Handle User Input ── */
  const handleUserInput = (text?: string) => {
    const val = text ?? input.trim();
    if (!val && intakeStep !== 'date' && intakeStep !== 'time') return;

    setInput('');
    setMessages((prev) => [...prev, { from: 'user', text: val }]);

    // Update form data based on current step
    const updated = { ...formData };
    let nextStep: IntakeStep = 'review';

    if (intakeStep === 'notes') {
      updated.notes = val;
      nextStep = 'name';
    } else if (intakeStep === 'name') {
      updated.name = val;
      nextStep = 'phone';
    } else if (intakeStep === 'phone') {
      updated.phone = val;
      nextStep = 'email';
    } else if (intakeStep === 'email') {
      updated.email = val;
      nextStep = 'address';
    } else if (intakeStep === 'address') {
      updated.address = val;
      nextStep = 'date';
    } else if (intakeStep === 'date') {
      updated.date = val;
      nextStep = 'time';
    } else if (intakeStep === 'time') {
      // Logic for alternative date selection while in 'time' step
      // A date string looks like YYYY-MM-DD (e.g. 2026-04-20)
      if (val.match(/^\d{4}-\d{2}-\d{2}$/)) {
        updated.date = val;
        updated.time = '';
        nextStep = 'time';
      } else {
        updated.time = val;
        nextStep = 'review';
      }
    }

    setFormData(updated);
    setTyping(true);

    // Bot response logic
    setTimeout(() => {
      setTyping(false);
      setIntakeStep(nextStep);
      setMessages((msgs) => [
        ...msgs,
        {
          from: 'bot',
          text: getIntakePrompt(nextStep, selectedCategories, updated),
        },
      ]);
    }, 800);
  };

  /* ── Dynamic Slots Fetching ── */
  const fetchAvailableSlots = async (service: string) => {
    setLoadingSlots(true);
    try {
      const res = await fetch(`${API}/api/public/available-slots?service=${encodeURIComponent(service)}`);
      if (res.ok) {
        const data = await res.json();
        setAvailableSlots(data);
      }
    } catch (err) {
      console.error("ChatBot slot fetch error:", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (selectedCategories.length > 0) {
      fetchAvailableSlots(selectedCategories.join(', '));
    }
  }, [selectedCategories]);

  /* ── Final Submission ── */
  const [submissionError, setSubmissionError] = useState('');

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmissionError('');
    try {
      // Find matching slot ID
      const daySlots = availableSlots[formData.date] || [];
      const selectedSlot = daySlots.find(s => s.time === formData.time);

      const res = await fetch(`${API}/api/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: selectedCategories.join(', '),
          ...formData,
          slot_id: selectedSlot?.id
        }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setPhase('submitted');
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      setSubmissionError(err.message || 'We could not connect to the database. Please try again or call us at (555) 123-4567.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserInput();
    }
  };

  /* ── Reset ── */
  const resetChat = () => {
    setPhase('greeting');
    setIntakeStep('notes');
    setMessages([]);
    setInput('');
    setSelectedCategories([]);
    setFormData({ name: '', phone: '', email: '', address: '', notes: '', date: '', time: '' });
  };

  return (
    <>
      {/* ── Chat Window ── */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            width: 'calc(100% - 48px)',
            maxWidth: '360px',
            maxHeight: 'min(580px, calc(100% - 120px))',
            background: '#fff',
            borderRadius: '24px',
            boxShadow: '0 32px 80px rgba(0,53,128,0.22)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            animation: 'slideUp 0.25s ease',
          }}
        >
          {/* ── Header ── */}
          <div
            style={{
              background: 'linear-gradient(135deg, #001d4a 0%, #003580 100%)',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '40px', height: '40px', background: '#e31b23',
                  borderRadius: '50%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '18px', flexShrink: 0,
                }}
              >
                🔧
              </div>
              <div>
                <p style={{ color: '#fff', fontWeight: 800, fontSize: '14px', margin: 0 }}>
                  Custom Repair Support
                </p>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ display: 'inline-block', width: '7px', height: '7px', background: '#4ade80', borderRadius: '50%' }} />
                  Online & Ready
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {phase !== 'greeting' && (
                <button
                  onClick={resetChat}
                  title="Start over"
                  style={{
                    background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '8px',
                    color: '#fff', cursor: 'pointer', width: '30px', height: '30px',
                    fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  ↺
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '8px',
                  color: '#fff', cursor: 'pointer', width: '30px', height: '30px',
                  fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* ── Body ── */}
          <div style={{ flex: 1, overflowY: 'auto', background: '#f9fafb' }}>

            {/* GREETING PHASE */}
            {phase === 'greeting' && (
              <div style={{ padding: '20px 18px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', background: '#003580',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0, marginTop: '2px',
                  }}>
                    🤖
                  </div>
                  <div style={{
                    background: '#fff', borderRadius: '16px 16px 16px 4px',
                    padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    fontSize: '13px', fontWeight: 500, lineHeight: 1.6, color: '#1f2937',
                    maxWidth: '85%',
                  }}>
                    <strong>Hi there! 👋 I'm your Custom Repair assistant.</strong>
                    <br /><br />
                    I'll help you troubleshoot your issue and get a technician booked in under 2 minutes.
                    <br /><br />
                    <span style={{ color: '#6b7280' }}>What type of service do you need today?</span>
                  </div>
                </div>

                <button
                  onClick={() => setPhase('categories')}
                  style={{
                    width: '100%', background: '#003580', color: '#fff',
                    border: 'none', borderRadius: '12px', padding: '12px',
                    fontWeight: 800, fontSize: '13px', cursor: 'pointer',
                    letterSpacing: '0.03em', transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#002560')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#003580')}
                >
                  Select My Problem →
                </button>
              </div>
            )}

            {/* CATEGORIES PHASE */}
            {phase === 'categories' && (
              <div style={{ padding: '18px' }}>
                <p style={{
                  fontWeight: 700, fontSize: '12px', color: '#6b7280',
                  letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px',
                }}>
                  What's the problem?
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.label);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => toggleCategory(cat.label)}
                        style={{
                          background: isSelected ? '#e8f0fe' : '#fff',
                          border: isSelected ? '2px solid #003580' : '2px solid #e5e7eb',
                          borderRadius: '14px',
                          padding: '12px 10px', cursor: 'pointer', textAlign: 'left',
                          transition: 'all 0.15s ease', display: 'flex', flexDirection: 'column', gap: '4px',
                          position: 'relative',
                        }}
                      >
                        {isSelected && (
                          <div style={{
                            position: 'absolute', top: '8px', right: '8px',
                            background: '#003580', color: '#fff',
                            width: '18px', height: '18px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '10px', fontWeight: 'bold'
                          }}>✓</div>
                        )}
                        <span style={{ fontSize: '22px' }}>{cat.icon}</span>
                        <span style={{ fontWeight: 800, fontSize: '11px', color: '#1f2937', lineHeight: 1.2 }}>
                          {cat.label}
                        </span>
                        <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 500, lineHeight: 1.3 }}>
                          {cat.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleCategoriesConfirm}
                  disabled={selectedCategories.length === 0}
                  style={{
                    width: '100%', background: '#003580', color: '#fff',
                    border: 'none', borderRadius: '12px', padding: '14px',
                    fontWeight: 800, fontSize: '14px', cursor: 'pointer',
                    opacity: selectedCategories.length > 0 ? 1 : 0.5,
                    transition: 'all 0.2s',
                  }}
                >
                  Confirm Selection ({selectedCategories.length}) →
                </button>
              </div>
            )}

            {/* INTAKE PHASE */}
            {phase === 'intake' && (
              <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {messages.map((m, i) => (
                  <div
                    key={i}
                    style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start', gap: '8px' }}
                  >
                    {m.from === 'bot' && (
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%', background: '#003580',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0, marginTop: '2px',
                      }}>
                        🤖
                      </div>
                    )}
                    <div
                      style={{
                        maxWidth: '78%',
                        padding: '10px 14px',
                        borderRadius: m.from === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: m.from === 'user' ? '#003580' : '#fff',
                        color: m.from === 'user' ? '#fff' : '#1f2937',
                        fontSize: '13px', fontWeight: 500, lineHeight: 1.55,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      <div dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </div>
                  </div>
                ))}

                {typing && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%', background: '#003580',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0,
                    }}>
                      🤖
                    </div>
                    <div style={{
                      background: '#fff', borderRadius: '16px 16px 16px 4px', padding: '10px 16px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', gap: '4px', alignItems: 'center',
                    }}>
                      {[0, 1, 2].map((d) => (
                        <span key={d} style={{ width: '6px', height: '6px', background: '#9ca3af', borderRadius: '50%', animation: 'bounce 1s infinite', animationDelay: `${d * 0.2}s` }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Specific controls for Date / Time */}
                {!typing && intakeStep === 'date' && (
                  <div style={{ paddingLeft: '36px' }}>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => handleUserInput(e.target.value)}
                      style={{
                        padding: '10px 14px', borderRadius: '12px', border: '2px solid #e5e7eb',
                        fontSize: '13px', fontWeight: 600, color: '#1f2937', outline: 'none',
                        cursor: 'pointer', width: '200px'
                      }}
                    />
                  </div>
                )}

                {!typing && intakeStep === 'time' && (
                  <div style={{ paddingLeft: '36px', display: 'grid', gridTemplateColumns: '1fr', gap: '6px' }}>
                    {loadingSlots ? (
                      <div style={{ padding: '10px', color: '#6b7280', fontSize: '12px' }}>Checking technician calendars...</div>
                    ) : (
                      <>
                        {(availableSlots[formData.date] || []).length === 0 ? (
                           <div style={{ padding: '10px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '10px', color: '#b91c1c', fontSize: '11px', fontWeight: 600 }}>
                              Sorry, no technicians are available on this date. Please pick another date.
                              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {Object.keys(availableSlots).sort().slice(0, 3).map(d => (
                                  <button key={d} onClick={() => handleUserInput(d)} style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '4px 8px', borderRadius: '6px', fontSize: '10px' }}>{d}</button>
                                ))}
                              </div>
                           </div>
                        ) : (
                          (availableSlots[formData.date] || []).map((slot) => (
                            <button
                              key={`${slot.id}-${slot.time}`}
                              onClick={() => handleUserInput(slot.time)}
                              style={{
                                padding: '8px 12px', borderRadius: '10px', border: '2px solid #e5e7eb',
                                fontSize: '12px', fontWeight: 700, color: '#4b5563', background: '#fff',
                                textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#003580')}
                              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
                            >
                              🕐 {slot.time}
                            </button>
                          ))
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Review Step */}
                {!typing && intakeStep === 'review' && (
                  <div style={{ padding: '0 10px 10px 40px' }}>
                    <div style={{
                      background: '#eff6ff', borderRadius: '16px', padding: '14px', border: '1px solid #dbeafe',
                      fontSize: '12px', color: '#1e40af', display: 'flex', flexDirection: 'column', gap: '6px'
                    }}>
                      <div style={{ display: 'flex', gap: '8px' }}><strong>Service:</strong> <span style={{ color: '#1f2937' }}>{selectedCategories.join(', ')}</span></div>
                      <div style={{ display: 'flex', gap: '8px' }}><strong>Name:</strong> <span style={{ color: '#1f2937' }}>{formData.name}</span></div>
                      <div style={{ display: 'flex', gap: '8px' }}><strong>Phone:</strong> <span style={{ color: '#1f2937' }}>{formData.phone}</span></div>
                      <div style={{ display: 'flex', gap: '8px' }}><strong>Email:</strong> <span style={{ color: '#1f2937' }}>{formData.email}</span></div>
                      <div style={{ display: 'flex', gap: '8px' }}><strong>Address:</strong> <span style={{ color: '#1f2937' }}>{formData.address}</span></div>
                      <div style={{ display: 'flex', gap: '8px' }}><strong>When:</strong> <span style={{ color: '#1f2937' }}>{formData.date} at {formData.time}</span></div>
                    </div>
                    
                    {submissionError && (
                      <p style={{ color: '#e31b23', fontSize: '11px', fontWeight: 800, marginTop: '12px', textAlign: 'center' }}>
                        ⚠️ {submissionError}
                      </p>
                    )}
                    
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      style={{
                        width: '100%', marginTop: '12px', background: '#e31b23', color: '#fff',
                        border: 'none', borderRadius: '12px', padding: '14px',
                        fontWeight: 900, fontSize: '13px', cursor: 'pointer',
                        textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 4px 12px rgba(227,27,35,0.25)',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                      {submitting ? 'Submitting...' : 'Submit Booking ✓'}
                    </button>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            )}

            {/* SUBMITTED PHASE */}
            {phase === 'submitted' && (
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
                <h3 style={{ fontWeight: 900, fontSize: '20px', color: '#003580', marginBottom: '8px' }}>Booking Confirmed!</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, marginBottom: '24px' }}>
                  We've received your request for <strong>{selectedCategories.join(', ')}</strong>. Our team will call you at <strong>{formData.phone}</strong> shortly.
                </p>
                <button
                  onClick={resetChat}
                  style={{
                    background: '#f3f4f6', border: 'none', borderRadius: '10px',
                    padding: '10px 20px', fontSize: '13px', fontWeight: 800, color: '#374151',
                    cursor: 'pointer'
                  }}
                >
                  Start New Chat
                </button>
              </div>
            )}
          </div>

          {/* ── Chat Input (only in intake phase before review) ── */}
          {phase === 'intake' && intakeStep !== 'review' && (
            <div
              style={{
                padding: '10px 12px 14px', background: '#fff',
                borderTop: '1px solid #f3f4f6', display: 'flex', gap: '8px', alignItems: 'center',
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                readOnly={intakeStep === 'date' || intakeStep === 'time'}
                placeholder={intakeStep === 'date' || intakeStep === 'time' ? "Please select an option above..." : "Type your answer..."}
                style={{
                  flex: 1, border: '1.5px solid #e5e7eb', borderRadius: '24px',
                  padding: '9px 16px', fontSize: '13px', fontWeight: 500,
                  outline: 'none', background: (intakeStep === 'date' || intakeStep === 'time') ? '#f3f4f6' : '#f9fafb', 
                  color: '#1f2937', cursor: (intakeStep === 'date' || intakeStep === 'time') ? 'not-allowed' : 'text',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#003580')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
              />
              <button
                onClick={() => handleUserInput()}
                disabled={!input.trim()}
                style={{
                  width: '38px', height: '38px',
                  background: input.trim() ? '#003580' : '#e5e7eb',
                  border: 'none', borderRadius: '50%',
                  cursor: input.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  transition: 'background 0.2s',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" stroke={input.trim() ? '#fff' : '#9ca3af'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={input.trim() ? '#fff' : '#9ca3af'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Floating Trigger Button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px',
          width: '62px', height: '62px',
          background: open ? '#003580' : '#e31b23',
          border: 'none', borderRadius: '50%', cursor: 'pointer',
          zIndex: 9999, boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.25s, transform 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        aria-label="Chat with us"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
              stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Notification dot when closed */}
      {!open && (
        <div
          style={{
            position: 'fixed', bottom: '74px', right: '24px',
            background: '#4ade80', width: '14px', height: '14px',
            borderRadius: '50%', zIndex: 9999, border: '2px solid #fff',
            animation: 'pulse 2s infinite',
          }}
        />
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }
      `}</style>
    </>
  );
}
