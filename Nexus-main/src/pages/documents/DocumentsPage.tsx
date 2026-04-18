import React, { useState, useRef } from 'react';
import {
  FileText, Upload, Download, Trash2, Share2,
  Eye, PenTool, X, Check, AlertCircle, File
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

// ── Types ──────────────────────────────────────────────────────────────────
type DocStatus = 'Draft' | 'In Review' | 'Signed';

interface Document {
  id: number;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  shared: boolean;
  status: DocStatus;
  previewUrl?: string;
}

// ── Seed Data ──────────────────────────────────────────────────────────────
const initialDocuments: Document[] = [
  { id: 1, name: 'Pitch Deck 2024.pdf',        type: 'PDF',         size: '2.4 MB', lastModified: '2024-02-15', shared: true,  status: 'Signed'    },
  { id: 2, name: 'Financial Projections.xlsx',  type: 'Spreadsheet', size: '1.8 MB', lastModified: '2024-02-10', shared: false, status: 'In Review' },
  { id: 3, name: 'Business Plan.docx',          type: 'Document',    size: '3.2 MB', lastModified: '2024-02-05', shared: true,  status: 'Draft'     },
  { id: 4, name: 'Market Research.pdf',         type: 'PDF',         size: '5.1 MB', lastModified: '2024-01-28', shared: false, status: 'Draft'     },
  { id: 5, name: 'Investment Agreement.pdf',    type: 'PDF',         size: '1.1 MB', lastModified: '2024-03-01', shared: true,  status: 'In Review' },
];

// ── Status helpers ─────────────────────────────────────────────────────────
const statusVariant: Record<DocStatus, 'success' | 'warning' | 'gray'> = {
  Signed:    'success',
  'In Review': 'warning',
  Draft:     'gray',
};

const statusIcon: Record<DocStatus, React.ReactNode> = {
  Signed:      <Check size={11} className="mr-1" />,
  'In Review': <AlertCircle size={11} className="mr-1" />,
  Draft:       <File size={11} className="mr-1" />,
};

// ── Signature Pad ──────────────────────────────────────────────────────────
interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onClose: () => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onClose }) => {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const isDrawing  = useRef(false);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    isDrawing.current = true;
    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const { x, y } = getPos(e, canvas);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.stroke();
  };

  const stopDraw = () => { isDrawing.current = false; };

  const clearCanvas = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    onSave(canvas.toDataURL());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <PenTool size={20} className="text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">E-Signature</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <p className="text-sm text-gray-500">Draw your signature in the box below</p>

        <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50">
          <canvas
            ref={canvasRef}
            width={460}
            height={180}
            className="w-full cursor-crosshair touch-none"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
        </div>

        <p className="text-xs text-center text-gray-400">Sign above — use mouse or touch</p>

        <div className="flex justify-between items-center pt-1">
          <Button variant="outline" onClick={clearCanvas}>Clear</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} leftIcon={<Check size={16} />}>Apply Signature</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Preview Modal ──────────────────────────────────────────────────────────
interface PreviewModalProps {
  doc: Document;
  signature: string | null;
  onClose: () => void;
  onSign: () => void;
  onStatusChange: (status: DocStatus) => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ doc, signature, onClose, onSign, onStatusChange }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-lg">
              <FileText size={22} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{doc.name}</h2>
              <p className="text-xs text-gray-500">{doc.type} · {doc.size} · Modified {doc.lastModified}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        {/* Mock document preview */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 min-h-64 space-y-3">
          <div className="h-4 bg-gray-300 rounded w-2/3" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-3/4" />
          <div className="mt-4 h-4 bg-gray-300 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
          <div className="mt-6 border-t border-gray-300 pt-4">
            <p className="text-xs text-gray-500 mb-2 font-medium">Signature Section</p>
            {signature ? (
              <div className="flex flex-col items-start gap-1">
                <img src={signature} alt="Signature" className="h-16 border border-gray-200 rounded-lg bg-white p-1" />
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Check size={11} /> Signed digitally
                </p>
              </div>
            ) : (
              <div className="h-14 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <p className="text-sm text-gray-400">Awaiting signature</p>
              </div>
            )}
          </div>
        </div>

        {/* Status changer */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          {(['Draft', 'In Review', 'Signed'] as DocStatus[]).map(s => (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                doc.status === s
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center pt-2">
          <Button variant="outline" leftIcon={<Download size={16} />}>Download</Button>
          <div className="flex gap-2">
            {doc.status !== 'Signed' && (
              <Button leftIcon={<PenTool size={16} />} onClick={onSign}>
                {signature ? 'Re-sign Document' : 'Sign Document'}
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────
export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments]         = useState<Document[]>(initialDocuments);
  const [activeFilter, setActiveFilter]   = useState<DocStatus | 'All'>('All');
  const [previewDoc, setPreviewDoc]       = useState<Document | null>(null);
  const [showSignPad, setShowSignPad]     = useState(false);
  const [signature, setSignature]         = useState<string | null>(null);
  const fileInputRef                      = useRef<HTMLInputElement>(null);

  const filtered = activeFilter === 'All'
    ? documents
    : documents.filter(d => d.status === activeFilter);

  const counts = {
    All:       documents.length,
    Draft:     documents.filter(d => d.status === 'Draft').length,
    'In Review': documents.filter(d => d.status === 'In Review').length,
    Signed:    documents.filter(d => d.status === 'Signed').length,
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newDoc: Document = {
      id:           Date.now(),
      name:         file.name,
      type:         file.type.includes('pdf') ? 'PDF' : file.type.includes('sheet') ? 'Spreadsheet' : 'Document',
      size:         `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      lastModified: new Date().toISOString().split('T')[0],
      shared:       false,
      status:       'Draft',
    };
    setDocuments(prev => [newDoc, ...prev]);
    e.target.value = '';
  };

  const handleDelete = (id: number) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleStatusChange = (id: number, status: DocStatus) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    if (previewDoc?.id === id) setPreviewDoc(prev => prev ? { ...prev, status } : null);
  };

  const handleSignatureSave = (dataUrl: string) => {
    setSignature(dataUrl);
    setShowSignPad(false);
    if (previewDoc) handleStatusChange(previewDoc.id, 'Signed');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Chamber</h1>
          <p className="text-gray-600">Upload, preview, sign and manage your deal documents</p>
        </div>
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.xlsx" onChange={handleUpload} />
          <Button leftIcon={<Upload size={18} />} onClick={() => fileInputRef.current?.click()}>
            Upload Document
          </Button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['All', 'Draft', 'In Review', 'Signed'] as const).map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              activeFilter === filter
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
            }`}
          >
            {filter}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
              activeFilter === filter ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {counts[filter]}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Storage sidebar */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Storage</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used</span>
                <span className="font-medium text-gray-900">12.5 GB</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-primary-600 rounded-full" style={{ width: '65%' }} />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Available</span>
                <span className="font-medium text-gray-900">7.5 GB</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 space-y-1">
              <h3 className="text-sm font-medium text-gray-900 mb-2">By Status</h3>
              {(['Draft', 'In Review', 'Signed'] as DocStatus[]).map(s => (
                <div key={s} className="flex justify-between items-center px-2 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer" onClick={() => setActiveFilter(s)}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${s === 'Signed' ? 'bg-green-500' : s === 'In Review' ? 'bg-yellow-500' : 'bg-gray-400'}`} />
                    <span className="text-sm text-gray-700">{s}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-500">{counts[s]}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Document list */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                {activeFilter === 'All' ? 'All Documents' : `${activeFilter} Documents`}
              </h2>
              <span className="text-sm text-gray-500">{filtered.length} file{filtered.length !== 1 ? 's' : ''}</span>
            </CardHeader>
            <CardBody>
              {filtered.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <FileText size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No documents found</p>
                  <p className="text-sm text-gray-500 mt-1">Upload a document to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map(doc => (
                    <div
                      key={doc.id}
                      className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200 group"
                    >
                      <div className="p-2 bg-primary-50 rounded-lg mr-4">
                        <FileText size={24} className="text-primary-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{doc.name}</h3>
                          <Badge variant={statusVariant[doc.status]} size="sm">
                            <span className="flex items-center">
                              {statusIcon[doc.status]}{doc.status}
                            </span>
                          </Badge>
                          {doc.shared && <Badge variant="secondary" size="sm">Shared</Badge>}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>{doc.type}</span>
                          <span>{doc.size}</span>
                          <span>Modified {doc.lastModified}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost" size="sm" className="p-2"
                          onClick={() => setPreviewDoc(doc)}
                          aria-label="Preview"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost" size="sm" className="p-2"
                          onClick={() => { setPreviewDoc(doc); setShowSignPad(true); }}
                          aria-label="Sign"
                        >
                          <PenTool size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2" aria-label="Download">
                          <Download size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2" aria-label="Share">
                          <Share2 size={16} />
                        </Button>
                        <Button
                          variant="ghost" size="sm" className="p-2 text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(doc.id)}
                          aria-label="Delete"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Preview Modal */}
      {previewDoc && !showSignPad && (
        <PreviewModal
          doc={previewDoc}
          signature={signature}
          onClose={() => setPreviewDoc(null)}
          onSign={() => setShowSignPad(true)}
          onStatusChange={(status) => handleStatusChange(previewDoc.id, status)}
        />
      )}

      {/* Signature Pad */}
      {showSignPad && (
        <SignaturePad
          onSave={handleSignatureSave}
          onClose={() => setShowSignPad(false)}
        />
      )}
    </div>
  );
};