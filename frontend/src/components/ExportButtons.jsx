import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { saveAs } from 'file-saver';
import { toast } from 'react-hot-toast';
import api from '../services/api';

export default function ExportButtons() {
    const [loadingCSV, setLoadingCSV] = useState(false);
    const [loadingExcel, setLoadingExcel] = useState(false);
    const [loadingPDF, setLoadingPDF] = useState(false);

    // Get current date string for filenames (e.g. 20260520)
    const getDateString = () => {
        return new Date().toISOString().substring(0, 10).replace(/-/g, '');
    };

    // Helper to read and toast backend JSON errors wrapped inside Blobs
    const parseBlobError = (blobError, fallbackMessage) => {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = JSON.parse(reader.result);
                toast.error(parsed.message || fallbackMessage, {
                    style: { borderRadius: '12px', background: '#0f172a', color: '#f8fafc', border: '1px solid #1e293b' }
                });
            } catch (e) {
                toast.error(fallbackMessage, {
                    style: { borderRadius: '12px', background: '#0f172a', color: '#f8fafc', border: '1px solid #1e293b' }
                });
            }
        };
        reader.readAsText(blobError);
    };

    const handleExportCSV = async () => {
        setLoadingCSV(true);
        toast.loading("Compiling CSV Ledger...", { id: 'csv-toast' });
        try {
            const response = await api.get('/transactions/export/csv', { responseType: 'blob' });
            
            // Trigger saveAs using file-saver
            saveAs(response.data, `transactions_export_${getDateString()}.csv`);
            toast.success("CSV file downloaded successfully!", { id: 'csv-toast' });
        } catch (error) {
            console.error("CSV Export failed", error);
            if (error.response && error.response.data instanceof Blob) {
                parseBlobError(error.response.data, "Failed to compile CSV export.");
                toast.dismiss('csv-toast');
            } else {
                toast.error("Failed to connect to export server.", { id: 'csv-toast' });
            }
        } finally {
            setLoadingCSV(false);
        }
    };

    const handleExportExcel = async () => {
        setLoadingExcel(true);
        toast.loading("Compiling Excel Sheets...", { id: 'excel-toast' });
        try {
            const response = await api.get('/transactions/export/excel', { responseType: 'blob' });
            
            // Build standard Blob URL and download
            const blob = new Blob([response.data], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `transactions_export_${getDateString()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            
            // Cleanup references
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("Excel Ledger downloaded successfully!", { id: 'excel-toast' });
        } catch (error) {
            console.error("Excel Export failed", error);
            if (error.response && error.response.data instanceof Blob) {
                parseBlobError(error.response.data, "Failed to compile Excel export.");
                toast.dismiss('excel-toast');
            } else {
                toast.error("Failed to connect to export server.", { id: 'excel-toast' });
            }
        } finally {
            setLoadingExcel(false);
        }
    };

    const handleExportPDF = async () => {
        setLoadingPDF(true);
        toast.loading("Compiling PDF Statement...", { id: 'pdf-toast' });
        try {
            const response = await api.get('/transactions/export/pdf', { responseType: 'blob' });
            
            // Build standard Blob URL and download
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `transactions_export_${getDateString()}.pdf`);
            document.body.appendChild(link);
            link.click();

            // Cleanup references
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("PDF Statement downloaded successfully!", { id: 'pdf-toast' });
        } catch (error) {
            console.error("PDF Export failed", error);
            if (error.response && error.response.data instanceof Blob) {
                parseBlobError(error.response.data, "Failed to compile PDF export.");
                toast.dismiss('pdf-toast');
            } else {
                toast.error("Failed to connect to export server.", { id: 'pdf-toast' });
            }
        } finally {
            setLoadingPDF(false);
        }
    };

    return (
        <div className="grid grid-cols-3 gap-3 w-full">
            {/* CSV Export Button */}
            <button
                onClick={handleExportCSV}
                disabled={loadingCSV}
                className="py-4.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-750 text-slate-200 font-bold rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-97 select-none disabled:opacity-50 disabled:cursor-not-allowed group h-24"
            >
                {loadingCSV ? (
                    <Loader2 size={16} className="text-blue-400 animate-spin" />
                ) : (
                    <Download size={16} className="text-blue-400 group-hover:scale-110 transition-transform" />
                )}
                <span className="text-xs uppercase tracking-wide">CSV File</span>
            </button>

            {/* Excel Export Button */}
            <button
                onClick={handleExportExcel}
                disabled={loadingExcel}
                className="py-4.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-750 text-slate-200 font-bold rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-97 select-none disabled:opacity-50 disabled:cursor-not-allowed group h-24"
            >
                {loadingExcel ? (
                    <Loader2 size={16} className="text-emerald-400 animate-spin" />
                ) : (
                    <FileSpreadsheet size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                )}
                <span className="text-xs uppercase tracking-wide">Excel Ledger</span>
            </button>

            {/* PDF Export Button */}
            <button
                onClick={handleExportPDF}
                disabled={loadingPDF}
                className="py-4.5 bg-gradient-to-r from-blue-500 to-indigo-650 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-500/10 active:scale-97 select-none disabled:opacity-50 disabled:cursor-not-allowed group h-24"
            >
                {loadingPDF ? (
                    <Loader2 size={16} className="text-white animate-spin" />
                ) : (
                    <FileText size={16} className="text-white group-hover:scale-110 transition-transform" />
                )}
                <span className="text-xs uppercase tracking-wide">Print PDF</span>
            </button>
        </div>
    );
}
