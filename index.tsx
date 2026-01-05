import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  FolderOpen, 
  RefreshCw, 
  FileImage, 
  CheckCircle2, 
  AlertCircle,
  Hash,
  Calendar,
  Type,
  ArrowRight,
  Globe
} from 'lucide-react';

interface ImageFile {
  handle: FileSystemFileHandle;
  file: File;
  currentName: string;
  newName: string;
}

const ImageRenamer = () => {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Configuration de renommage
  const [baseName, setBaseName] = useState('image-produit');
  const [startIndex, setStartIndex] = useState(1);
  const [padding, setPadding] = useState(3);
  const [includeDate, setIncludeDate] = useState(false);
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');

  // Fonction utilitaire pour rendre un texte SEO-friendly (Slugify)
  const slugify = (text: string) => {
    return text
      .toString()
      .normalize('NFD')                   // Sépare les accents des lettres
      .replace(/[\u0300-\u036f]/g, '')    // Supprime les accents
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')               // Remplace les espaces par des tirets
      .replace(/[^\w-]+/g, '')            // Supprime tout ce qui n'est pas mot ou tiret
      .replace(/--+/g, '-');              // Évite les doubles tirets
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  // Calcul du nouveau nom optimisé pour le SEO
  const updatedFiles = useMemo(() => {
    return files.map((f, index) => {
      const ext = f.currentName.split('.').pop()?.toLowerCase() || 'jpg';
      const num = (startIndex + index).toString().padStart(padding, '0');
      const dateStr = includeDate ? `-${formatDate(new Date(f.file.lastModified))}` : '';
      
      const cleanPrefix = prefix ? `${slugify(prefix)}-` : '';
      const cleanBase = slugify(baseName) || 'image';
      const cleanSuffix = suffix ? `-${slugify(suffix)}` : '';
      
      // Utilisation stricte de tirets (-) pour le SEO de Google
      const newName = `${cleanPrefix}${cleanBase}-${num}${dateStr}${cleanSuffix}.${ext}`;
      return { ...f, newName };
    });
  }, [files, baseName, startIndex, padding, includeDate, prefix, suffix]);

  const selectFolder = async () => {
    try {
      // @ts-ignore
      const handle = await window.showDirectoryPicker();
      setDirectoryHandle(handle);
      
      const loadedFiles: ImageFile[] = [];
      for await (const entry of handle.values()) {
        if (entry.kind === 'file') {
          const file = await entry.getFile();
          const name = entry.name.toLowerCase();
          if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png')) {
            loadedFiles.push({
              handle: entry as FileSystemFileHandle,
              file,
              currentName: entry.name,
              newName: entry.name,
            });
          }
        }
      }
      
      loadedFiles.sort((a, b) => a.currentName.localeCompare(b.currentName, undefined, { numeric: true, sensitivity: 'base' }));
      
      setFiles(loadedFiles);
      setStatus({ type: 'info', message: `${loadedFiles.length} images chargées.` });
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setStatus({ type: 'error', message: "Erreur lors de l'accès au dossier." });
        console.error(err);
      }
    }
  };

  const applyRename = async () => {
    if (!directoryHandle || updatedFiles.length === 0) return;
    
    setIsProcessing(true);
    setStatus({ type: 'info', message: 'Renommage SEO en cours...' });

    try {
      let successCount = 0;
      for (const item of updatedFiles) {
        if (item.currentName === item.newName) continue;
        
        // @ts-ignore
        if (typeof item.handle.move === 'function') {
           // @ts-ignore
          await item.handle.move(item.newName);
        } else {
          const newFileHandle = await directoryHandle.getFileHandle(item.newName, { create: true });
          const writable = await newFileHandle.createWritable();
          await writable.write(item.file);
          await writable.close();
          await directoryHandle.removeEntry(item.currentName);
        }
        successCount++;
      }
      
      setStatus({ type: 'success', message: `${successCount} images optimisées pour le SEO !` });
      setFiles([]); 
      setDirectoryHandle(null);
    } catch (err) {
      setStatus({ type: 'error', message: "Erreur pendant le renommage." });
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <header className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-4">
          <Globe className="w-3 h-3" />
          Optimisé pour Google SEO
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2 flex items-center justify-center gap-3">
          <RefreshCw className="text-indigo-600 w-10 h-10" />
          Renommer SEO
        </h1>
        <p className="text-slate-500 max-w-lg mx-auto">
          Transformez vos noms de fichiers en atouts pour votre référencement. Minuscules, tirets et clarté garantis.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <FolderOpen className="text-indigo-500 w-5 h-5" />
              1. Dossier Source
            </h2>
            <button
              onClick={selectFolder}
              className="w-full py-4 px-6 border-2 border-dashed border-indigo-200 rounded-xl text-indigo-600 font-medium hover:bg-indigo-50 hover:border-indigo-400 transition-all flex flex-col items-center gap-2 group"
            >
              <FolderOpen className="w-8 h-8 group-hover:scale-110 transition-transform" />
              {directoryHandle ? `Dossier: ${directoryHandle.name}` : "Sélectionner les images"}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Type className="text-indigo-500 w-5 h-5" />
              2. Modèle SEO
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mots-clés principaux</label>
                <input
                  type="text"
                  value={baseName}
                  onChange={(e) => setBaseName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  placeholder="ex: chaussure-sport-bleue"
                />
                <p className="mt-1 text-[10px] text-slate-400 italic text-right">Sera converti en minuscule avec tirets</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Départ</label>
                  <input
                    type="number"
                    value={startIndex}
                    onChange={(e) => setStartIndex(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Format (00x)</label>
                  <select
                    value={padding}
                    onChange={(e) => setPadding(parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value={1}>1, 2, 3</option>
                    <option value={2}>01, 02</option>
                    <option value={3}>001, 002</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${includeDate ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                    {includeDate && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <input type="checkbox" className="hidden" checked={includeDate} onChange={() => setIncludeDate(!includeDate)} />
                  <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" /> Date ISO (SEO compatible)
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Préfixe</label>
                  <input
                    type="text"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Suffixe</label>
                  <input
                    type="text"
                    value={suffix}
                    onChange={(e) => setSuffix(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={applyRename}
            disabled={isProcessing || updatedFiles.length === 0}
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
              isProcessing || updatedFiles.length === 0 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0'
            }`}
          >
            {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            Lancer l'optimisation
          </button>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[700px]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileImage className="text-indigo-500 w-5 h-5" />
                Aperçu SEO
              </h2>
              {status && (
                <div className={`text-sm font-medium flex items-center gap-2 px-3 py-1 rounded-full ${
                  status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                }`}>
                  {status.message}
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-auto">
              {updatedFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Globe className="w-16 h-16 opacity-10 mb-4" />
                  <p className="font-medium">Prêt pour l'indexation Google</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Actuel</th>
                      <th className="px-2 py-3 text-center"></th>
                      <th className="px-6 py-3 text-xs font-bold text-indigo-500 uppercase">Nouveau (SEO)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {updatedFiles.map((item, idx) => (
                      <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-xs text-slate-400 block truncate max-w-[150px]">{item.currentName}</span>
                        </td>
                        <td className="px-2 py-4 text-center">
                          <ArrowRight className="w-3 h-3 text-slate-300 inline" />
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 block truncate max-w-[250px]">
                            {item.newName}
                          </code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<ImageRenamer />);