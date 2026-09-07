import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, CheckCircle2, Database, AlertCircle } from 'lucide-react'
import PageContainer from '../components/layout/PageContainer'
import axios from 'axios'
import API_BASE from '../config/api'

export default function DataIngestion() {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>([])
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files))
    }
  }

  const uploadFile = async () => {
    if (files.length === 0) return
    setStatus('uploading')
    
    const formData = new FormData()
    files.forEach(f => formData.append('files', f))
    
    try {
      const res = await axios.post(`${API_BASE}/api/ingestion/upload`, formData, {
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
        <h1 className="text-3xl font-black text-text-primary tracking-tight flex items-center gap-3">
          Data Ingestion Pipeline
          <Database className="text-brand-primary" size={28} />
        </h1>
        <p className="text-sm font-medium text-text-secondary mt-2 max-w-2xl">
          Upload monthly project reports (CSV format) to update the PAIMANA risk engine. 
          The system will automatically compute new Digital Fingerprints, Momentum Scores, and ML Predictions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div 
            className={`glass-panel border-2 border-dashed p-10 flex flex-col items-center justify-center transition-colors min-h-[300px] ${
              dragActive ? 'border-brand-primary/50 bg-brand-primary/5' : 'border-border-default hover:border-brand-primary/30'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {status === 'success' ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-bold text-text-primary">Pipeline Execution Complete</h3>
                <p className="text-sm text-text-secondary mt-1 max-w-md text-center">{message}</p>
                <button onClick={() => { setStatus('idle'); setFiles([]); setMessage('') }} className="mt-6 px-4 py-2 bg-surface-sunken text-text-secondary rounded-lg text-sm font-bold hover:bg-border-default transition-colors">
                  Upload More Files
                </button>
              </motion.div>
            ) : status === 'error' ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-coral/20 flex items-center justify-center text-coral mb-4">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-lg font-bold text-text-primary">Ingestion Failed</h3>
                <p className="text-sm text-coral mt-1 max-w-md text-center font-medium">{message}</p>
                <button onClick={() => { setStatus('idle'); setFiles([]); setMessage('') }} className="mt-6 px-4 py-2 bg-surface-sunken text-text-secondary rounded-lg text-sm font-bold hover:bg-border-default transition-colors">
                  Try Again
                </button>
              </motion.div>
            ) : status === 'uploading' ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-4" />
                <h3 className="text-lg font-bold text-text-primary">Processing Data...</h3>
                <p className="text-sm text-text-secondary mt-1">Extracting features and running ML pipeline</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted mb-4 shadow-sm">
                  <Upload size={32} />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">Drag & Drop CSV Files Here</h3>
                <p className="text-sm text-text-secondary mb-3 text-center max-w-md">
                  Please upload the required PAIMANA dataset files:
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-md">
                  <span className="px-2.5 py-1 bg-surface-sunken rounded-md text-xs font-mono font-bold text-text-secondary border border-border-default">projects.csv</span>
                  <span className="px-2.5 py-1 bg-surface-sunken rounded-md text-xs font-mono font-bold text-text-secondary border border-border-default">project_snapshots.csv</span>
                  <span className="px-2.5 py-1 bg-surface-sunken rounded-md text-xs font-mono font-bold text-text-secondary border border-border-default">issues.csv</span>
                </div>
                <label className="cursor-pointer">
                  <input 
                    type="file" 
                    accept=".csv" 
                    multiple
                    className="hidden" 
                    onChange={e => e.target.files && setFiles(Array.from(e.target.files))} 
                  />
                  <div className="bg-brand-primary text-surface-card px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-colors">
                    Browse Files
                  </div>
                </label>
                
                {files.length > 0 && (
                  <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-6 flex flex-col gap-3 w-full max-w-md">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-3 bg-surface-card px-4 py-3 rounded-lg border border-border-default shadow-sm w-full">
                        <FileText className="text-text-muted" size={20} />
                        <div className="flex-1 truncate">
                          <p className="text-sm font-bold text-text-primary truncate">{f.name}</p>
                          <p className="text-xs text-text-muted">{(f.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                    ))}
                    <button onClick={uploadFile} className="mt-2 w-full bg-brand-primary/10 text-brand-primary px-3 py-2.5 rounded-lg text-sm font-bold border border-brand-primary/20 hover:bg-brand-primary/20 transition-colors">
                      Process All Files
                    </button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-panel p-5">
            <h3 className="text-sm font-black text-text-primary uppercase tracking-wide mb-4 flex items-center gap-2">
              <AlertCircle size={16} className="text-brand-primary" /> Hackathon Note
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              For the SIH MVP, the PAIMANA platform operates on a pre-computed <strong>synthetic dataset</strong> of 750 infrastructure projects spanning 24 months of history.
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              In a production environment, this module would securely parse CSV reports from contractors, validate the schema, compute the ML feature vectors, and append the new records to the database.
            </p>
          </div>
          
          <div className="glass-panel p-5">
            <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Expected Schema</h3>
            <div className="space-y-2">
              {['internal_project_id', 'reporting_month', 'physical_progress_pct', 'financial_expenditure_cr', 'active_issues_count'].map(col => (
                <div key={col} className="text-xs font-mono text-text-primary bg-surface-sunken px-2 py-1.5 rounded border border-border-default">
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
