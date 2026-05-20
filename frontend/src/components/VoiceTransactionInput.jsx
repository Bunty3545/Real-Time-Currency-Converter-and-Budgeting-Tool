import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function VoiceTransactionInput({ onVoiceParsed }) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [recognition, setRecognition] = useState(null);

    useEffect(() => {
        // Initialize SpeechRecognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const rec = new SpeechRecognition();
            rec.continuous = false;
            rec.lang = 'en-US';
            rec.interimResults = false;

            rec.onstart = () => {
                setIsListening(true);
                setTranscript('Listening closely...');
            };

            rec.onerror = (e) => {
                console.error("Speech recognition error", e);
                toast.error("Voice input error or permission denied.", {
                    style: { borderRadius: '12px', background: '#0f172a', color: '#f8fafc', border: '1px solid #1e293b' }
                });
                setIsListening(false);
            };

            rec.onend = () => {
                setIsListening(false);
            };

            rec.onresult = (event) => {
                const speechToText = event.results[0][0].transcript;
                setTranscript(speechToText);
                
                // Parse commands
                const parsed = parseVoiceCommand(speechToText);
                
                toast.success(`Parsed: "${speechToText}"`, {
                    style: { borderRadius: '12px', background: '#0f172a', color: '#f8fafc', border: '1px solid #1e293b' }
                });

                if (onVoiceParsed) {
                    onVoiceParsed(parsed);
                }
            };

            setRecognition(rec);
        }
    }, [onVoiceParsed]);

    const toggleListening = () => {
        if (!recognition) {
            toast.error("Web Speech API is not supported on this browser. Try Chrome or Safari.", {
                style: { borderRadius: '12px', background: '#0f172a', color: '#f8fafc', border: '1px solid #1e293b' }
            });
            return;
        }

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    };

    const parseVoiceCommand = (text) => {
        const txt = text.toLowerCase();
        let amount = '';
        let category = '';
        let type = 'expense'; // default

        // Extract digits representing amounts (e.g. 50 or 12.50)
        const amountRegex = /(\d+(?:\.\d{1,2})?)/;
        const match = txt.match(amountRegex);
        if (match) {
            amount = match[1];
        }

        // Detect type
        if (txt.includes('salary') || txt.includes('income') || txt.includes('received') || txt.includes('earned') || txt.includes('deposit')) {
            type = 'income';
        }

        // Categorize by analyzing vocabularies
        if (txt.includes('pizza') || txt.includes('food') || txt.includes('lunch') || txt.includes('dinner') || txt.includes('eat') || txt.includes('restaurant') || txt.includes('coffee') || txt.includes('starbucks')) {
            category = 'Food';
        } else if (txt.includes('clothes') || txt.includes('shopping') || txt.includes('mall') || txt.includes('buy') || txt.includes('amazon') || txt.includes('store') || txt.includes('shoes')) {
            category = 'Shopping';
        } else if (txt.includes('uber') || txt.includes('cab') || txt.includes('travel') || txt.includes('gas') || txt.includes('flight') || txt.includes('bus') || txt.includes('train')) {
            category = 'Travel';
        } else if (txt.includes('rent') || txt.includes('wi-fi') || txt.includes('bill') || txt.includes('electricity') || txt.includes('subscription') || txt.includes('netflix') || txt.includes('phone')) {
            category = 'Bills';
        } else if (txt.includes('movie') || txt.includes('party') || txt.includes('cinema') || txt.includes('game') || txt.includes('ticket') || txt.includes('concert') || txt.includes('fun')) {
            category = 'Entertainment';
        } else if (txt.includes('salary') || txt.includes('bonus') || txt.includes('dividend') || txt.includes('allowance')) {
            category = 'Salary';
        } else {
            category = 'Other';
        }

        return { amount, category, type, note: `[Voice Log] ${text}` };
    };

    return (
        <div className="flex flex-col gap-2 bg-slate-950/60 border border-slate-850 p-3.5 rounded-xl">
            <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-450 uppercase font-extrabold flex items-center gap-1.5">
                    <Sparkles size={12} className="text-yellow-400" /> Voice Assistant
                </span>
                
                <button 
                    type="button"
                    onClick={toggleListening}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        isListening 
                        ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/20' 
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                    title="Speak Command"
                >
                    {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                </button>
            </div>
            
            {transcript && (
                <p className="text-[10px] text-slate-400 italic bg-slate-900/60 border border-slate-850 px-2.5 py-1.5 rounded-lg leading-relaxed mt-1">
                    "{transcript}"
                </p>
            )}
            
            <span className="text-[9px] text-slate-550 leading-relaxed">
                Example: "Spent 45 dollars on Italian pizza dinner"
            </span>
        </div>
    );
}
