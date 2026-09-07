import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, CheckCircle2, Database, AlertCircle, Loader2 } from 'lucide-react'
import PageContainer from '../components/layout/PageContainer'
import axios from 'axios'

export default function DataIngestion() {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const uploadFile = async () => {
    if (!file) return
    setStatus('uploading')
    
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/ingestion/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      setMessage(res.data.message)
      setStatus('success')
    } catch (err: any) {
      console.error(err)
      setMessage(err.response?.data?.detail || err.message || 'Upload failed')
      setStatus('error')
    }
  }

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          Data Ingestion Pipeline
          <Database className="text-teal-600" size={28} />
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-2 max-w-2xl">
          Upload monthly project reports (CSV format) to update the PAIMANA risk engine. 
          The system will automatically compute new Digital Fingerprints, Momentum Scores, and ML Predictions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div 
            className={`glass-panel border-2 border-dashed p-10 flex flex-col items-center justify-center transition-colors min-h-[300px] ${
              dragActive ? 'border-teal-400 bg-teal-50/50' : 'border-slate-200 hover:border-teal-200'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {status === 'success' ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Pipeline Execution Complete</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md text-center">{message}</p>
                <button onClick={() => { setStatus('idle'); setFile(null); setMessage('') }} className="mt-6 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">
                  Upload Another File
                </button>
              </motion.div>
            ) : status === 'error' ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Ingestion Failed</h3>
                <p className="text-sm text-red-500 mt-1 max-w-md text-center font-medium">{message}</p>
                <button onClick={() => { setStatus('idle'); setFile(null); setMessage('') }} className="mt-6 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">
                  Try Again
                </button>
              </motion.div>
            ) : status === 'uploading' ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4" />
                <h3 className="text-lg font-bold text-slate-800">Processing Data...</h3>
                <p className="text-sm text-slate-500 mt-1">Extracting features and running ML pipeline</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-sm">
                  <Upload size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">Drag & Drop CSV Files Here</h3>
                <p className="text-sm text-slate-400 mb-6 text-center max-w-md">
                  Files must match the standard OCMS/PAIMANA snapshot schema.
                </p>
                <label className="cursor-pointer">
                  <input 
                    type="file" 
                    accept=".csv" 
                    className="hidden" 
                    onChange={e => e.target.files && setFile(e.target.files[0])} 
                  />
                  <div className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-teal-200 hover:bg-teal-700 transition-colors">
                    Browse Files
                  </div>
                </label>
                
                {file && (
                  <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-6 flex items-center gap-3 bg-white px-4 py-3 rounded-lg border border-slate-200 shadow-sm w-full max-w-md">
                    <FileText className="text-slate-400" size={20} />
                    <div className="flex-1 truncate">
                      <p className="text-sm font-bold text-slate-700 truncate">{file.name}</p>
                      <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button onClick={uploadFile} className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-teal-200 hover:bg-teal-100 transition-colors">
                      Process
                    </button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-panel p-5">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
              <AlertCircle size={16} className="text-teal-600" /> Hackathon Note
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              For the SIH MVP, the PAIMANA platform operates on a pre-computed <strong>synthetic dataset</strong> of 750 infrastructure projects spanning 24 months of history.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              In a production environment, this module would securely parse CSV reports from contractors, validate the schema, compute the ML feature vectors, and append the new records to the database.
            </p>
          </div>
          
          <div className="glass-panel p-5">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Expected Schema</h3>
            <div className="space-y-2">
              {['internal_project_id', 'reporting_month', 'physical_progress_pct', 'financial_expenditure_cr', 'active_issues_count'].map(col => (
                <div key={col} className="text-xs font-mono text-slate-600 bg-slate-50 px-2 py-1.5 rounded border border-slate-100">
                  {col}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
