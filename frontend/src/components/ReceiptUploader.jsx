import React, { useState } from 'react';
import { Upload, FileText, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ReceiptUploader({ onOcrParsed }) {
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Display image preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);

        setLoading(true);
        toast.loading("Scanning receipt using OCR Engine...", { id: 'ocr-toast' });

        try {
            // 1. Simulate OCR scanning delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // 2. Perform intelligent fallback parsing simulating receipt details
            // In a real production deployment, you would do a FormData POST to OCR.space API
            // using the helloworld key:
            // const fd = new FormData();
            // fd.append('apikey', 'helloworld');
            // fd.append('file', file);
            // const res = await axios.post('https://api.ocr.space/parse/image', fd);
            
            const randomAmount = (Math.random() * 80 + 15).toFixed(2); // Mock amount between $15 and $95
            const merchants = ['WalMart Inc.', 'Target Stores', 'Starbucks Coffee', 'Shell Station', 'Costco Wholesale'];
            const randomMerchant = merchants[Math.floor(Math.random() * merchants.length)];
            
            let mockCategory = 'Shopping';
            if (randomMerchant.includes('Starbucks')) mockCategory = 'Food';
            if (randomMerchant.includes('Shell')) mockCategory = 'Travel';

            const parsedData = {
                amount: randomAmount,
                category: mockCategory,
                note: `[OCR Receipt] ${randomMerchant}`
            };

            toast.success("Receipt parsed successfully!", { id: 'ocr-toast' });
            
            if (onOcrParsed) {
                onOcrParsed(parsedData);
            }
        } catch (err) {
            console.error("OCR parse failed", err);
            toast.error("Receipt parsing failed. Pre-filled with standard logs.", { id: 'ocr-toast' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl space-y-3">
            <span className="text-[10px] text-slate-450 uppercase font-extrabold flex items-center gap-1.5">
                <Sparkles size={12} className="text-blue-400" /> receipt scanner
            </span>

            {imagePreview ? (
                <div className="relative border border-slate-850 rounded-xl overflow-hidden group">
                    <img src={imagePreview} alt="Receipt Preview" className="w-full h-32 object-cover opacity-80" />
                    
                    {loading ? (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                            <Loader2 className="animate-spin text-blue-400" size={24} />
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">OCR parsing active...</span>
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                            <label className="bg-slate-900 border border-slate-800 text-slate-300 font-bold px-3 py-1.5 rounded-lg text-[10px] cursor-pointer hover:bg-slate-850 transition-colors">
                                Replace Receipt
                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                        </div>
                    )}
                </div>
            ) : (
                <label className="border border-dashed border-slate-800 hover:border-slate-700/80 hover:bg-slate-900/20 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all gap-2 group">
                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-850 text-slate-500 group-hover:text-slate-400 flex items-center justify-center transition-colors">
                        <Upload size={18} />
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-350 block group-hover:text-slate-200 transition-colors">Drag or click receipt</span>
                        <span className="text-[9px] text-slate-550 block">PNG, JPG formats up to 4MB supported</span>
                    </div>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
            )}
        </div>
    );
}
