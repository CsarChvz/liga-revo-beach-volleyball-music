import React, { useState } from 'react';
import { X, Upload, Trash2, Plus, Music, Check, Layers, FileAudio } from 'lucide-react';
import type { AudioTrack, PlaylistCategory, PlaylistMap } from '../types/audio';

interface PlaylistManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlists: PlaylistMap;
  onAddTrack: (track: AudioTrack, fileObject?: File) => void;
  onRemoveTrack: (category: PlaylistCategory, trackId: string) => void;
}

interface BatchFileItem {
  file: File;
  title: string;
  artist: string;
  category: PlaylistCategory;
}

export const PlaylistManagerModal: React.FC<PlaylistManagerModalProps> = ({
  isOpen,
  onClose,
  playlists,
  onAddTrack,
  onRemoveTrack,
}) => {
  const [activeTab, setActiveTab] = useState<'bulk' | 'single' | 'list'>('bulk');

  // Bulk Upload State
  const [batchCategory, setBatchCategory] = useState<PlaylistCategory>('point_intros');
  const [batchItems, setBatchItems] = useState<BatchFileItem[]>([]);
  
  // Single Track Form State
  const [singleTitle, setSingleTitle] = useState('');
  const [singleArtist, setSingleArtist] = useState('');
  const [singleCategory, setSingleCategory] = useState<PlaylistCategory>('point_intros');
  const [singleFile, setSingleFile] = useState<File | null>(null);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Multi-file selection
  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const newItems: BatchFileItem[] = filesArray.map((f) => {
        // Auto-clean file name: remove extension, replace _ and - with spaces
        const cleanName = f.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .trim();

        return {
          file: f,
          title: cleanName,
          artist: '',
          category: batchCategory,
        };
      });

      setBatchItems((prev) => [...prev, ...newItems]);
    }
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (batchItems.length === 0) return;

    let addedCount = 0;
    batchItems.forEach((item, index) => {
      const objectUrl = URL.createObjectURL(item.file);
      const trackDuration = item.category === 'point_intros' ? 12 : item.category === 'technical_timeouts' ? 60 : 180;

      const newTrack: AudioTrack = {
        id: `bulk-${Date.now()}-${index}`,
        title: item.title || item.file.name,
        artist: item.artist,
        category: item.category,
        sourceType: 'local',
        url: objectUrl,
        duration: trackDuration,
        isBuiltIn: false,
      };

      onAddTrack(newTrack, item.file);
      addedCount++;
    });

    setSuccessMsg(`¡${addedCount} archivos MP3 agregados con éxito!`);
    setTimeout(() => setSuccessMsg(null), 3500);

    setBatchItems([]);
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleFile || !singleTitle) return;

    const objectUrl = URL.createObjectURL(singleFile);
    const newTrack: AudioTrack = {
      id: `local-${Date.now()}`,
      title: singleTitle,
      artist: singleArtist,
      category: singleCategory,
      sourceType: 'local',
      url: objectUrl,
      duration: singleCategory === 'point_intros' ? 12 : singleCategory === 'technical_timeouts' ? 60 : 180,
      isBuiltIn: false,
    };

    onAddTrack(newTrack, singleFile);
    setSuccessMsg(`Pista "${singleTitle}" agregada con éxito`);
    setTimeout(() => setSuccessMsg(null), 3000);

    setSingleTitle('');
    setSingleArtist('');
    setSingleFile(null);
  };

  const removeBatchItem = (idx: number) => {
    setBatchItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateBatchCategoryAll = (cat: PlaylistCategory) => {
    setBatchCategory(cat);
    setBatchItems((prev) => prev.map((item) => ({ ...item, category: cat })));
  };

  const allTracksCount = (Object.keys(playlists) as PlaylistCategory[]).reduce(
    (acc, cat) => acc + playlists[cat].tracks.length,
    0
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500/20 text-amber-400 p-2 rounded-xl border border-amber-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Vincular Archivos MP3 (Bulk & Single)</h2>
              <p className="text-xs text-slate-400">Agrega múltiples canciones a tus playlists en un solo paso</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-5">
          <button
            onClick={() => setActiveTab('bulk')}
            className={`flex items-center space-x-2 py-3.5 px-4 font-bold text-xs border-b-2 transition-colors ${
              activeTab === 'bulk'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Carga Masiva (Bulk Loading MP3)</span>
          </button>
          <button
            onClick={() => setActiveTab('single')}
            className={`flex items-center space-x-2 py-3.5 px-4 font-bold text-xs border-b-2 transition-colors ${
              activeTab === 'single'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Archivo Individual MP3</span>
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center space-x-2 py-3.5 px-4 font-bold text-xs border-b-2 transition-colors ${
              activeTab === 'list'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Playlists Actuales ({allTracksCount})</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {successMsg && (
            <div className="bg-emerald-950/90 border border-emerald-500/50 rounded-2xl p-3.5 text-xs font-bold text-emerald-300 flex items-center gap-2 shadow-lg animate-pulse">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: BULK MP3 LOADING */}
          {activeTab === 'bulk' && (
            <form onSubmit={handleBulkSubmit} className="space-y-5">
              
              {/* Category Selector for entire batch */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  1. Selecciona la Playlist de Destino para el Lote:
                </label>
                <select
                  value={batchCategory}
                  onChange={(e) => updateBatchCategoryAll(e.target.value as PlaylistCategory)}
                  className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 font-bold shadow-inner"
                >
                  <option value="presentation">1. Presentación y Calentamiento (Música Continua)</option>
                  <option value="point_intros">2. Entrepuntos (Intros 12s con 9s Play + 3s Fade Auto)</option>
                  <option value="technical_timeouts">3. Tiempos Técnicos & Fuera (1 Minuto con 50s Play + 10s Fade Auto)</option>
                  <option value="super_spike">4. Jingles Super Spike (12s con 9s Play + 3s Fade Auto)</option>
                  <option value="monster_block">5. Jingles Monster Block (12s con 9s Play + 3s Fade Auto)</option>
                </select>
              </div>

              {/* Multi-file Upload Dropzone */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  2. Selecciona Múltiples Archivos MP3 / WAV a la vez:
                </label>
                <div className="border-2 border-dashed border-slate-700 hover:border-amber-500 bg-slate-950/70 rounded-3xl p-6 text-center cursor-pointer transition-colors relative group">
                  <input
                    type="file"
                    multiple
                    accept="audio/*"
                    onChange={handleBulkFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="bg-amber-500/10 p-3 rounded-2xl text-amber-400 group-hover:scale-110 transition-transform">
                      <FileAudio className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-200">
                        Haz clic o arrastra tus archivos MP3 / WAV aquí
                      </p>
                      <p className="text-xs text-slate-400">
                        Puedes seleccionar 5, 10, 20 o más canciones juntas
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Batch Preview List */}
              {batchItems.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                    <span>Lista de archivos a vincular ({batchItems.length}):</span>
                    <button
                      type="button"
                      onClick={() => setBatchItems([])}
                      className="text-red-400 hover:text-red-300 text-[11px]"
                    >
                      Limpiar lista
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {batchItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <span className="text-xs font-mono font-bold text-slate-500 w-6">#{idx + 1}</span>
                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => {
                                const newTitle = e.target.value;
                                setBatchItems((prev) =>
                                  prev.map((it, i) => (i === idx ? { ...it, title: newTitle } : it))
                                );
                              }}
                              className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-xl px-2.5 py-1 text-xs font-bold focus:border-amber-500"
                              placeholder="Título canción"
                            />
                            <span className="text-[10px] text-slate-500 font-mono block mt-0.5 truncate">
                              Archivo: {item.file.name}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeBatchItem(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-4 px-6 rounded-2xl text-sm shadow-xl flex items-center justify-center space-x-2 transition-all transform active:scale-95"
                  >
                    <Plus className="w-5 h-5 stroke-[3]" />
                    <span>VINCULAR TODOS LOS {batchItems.length} ARCHIVOS MP3 EN BULK</span>
                  </button>
                </div>
              )}

            </form>
          )}

          {/* TAB 2: SINGLE MP3 LOADING */}
          {activeTab === 'single' && (
            <form onSubmit={handleSingleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Seleccionar Archivo de Audio (MP3, WAV, OGG, FLAC)
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const f = e.target.files[0];
                      setSingleFile(f);
                      if (!singleTitle) {
                        setSingleTitle(f.name.replace(/\.[^/.]+$/, ''));
                      }
                    }
                  }}
                  className="w-full bg-slate-950 text-slate-300 border border-slate-800 rounded-xl px-3 py-2 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Título de la Canción</label>
                  <input
                    type="text"
                    value={singleTitle}
                    onChange={(e) => setSingleTitle(e.target.value)}
                    placeholder="Ej. La Chona Intro"
                    className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Artista / Origen</label>
                  <input
                    type="text"
                    value={singleArtist}
                    onChange={(e) => setSingleArtist(e.target.value)}
                    placeholder="Ej. Los Tucanes de Tijuana"
                    className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Playlist de Destino</label>
                <select
                  value={singleCategory}
                  onChange={(e) => setSingleCategory(e.target.value as PlaylistCategory)}
                  className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 font-bold"
                >
                  <option value="presentation">1. Presentación y Calentamiento (Música Continua)</option>
                  <option value="point_intros">2. Entrepuntos (Intros 12s)</option>
                  <option value="technical_timeouts">3. Tiempos Técnicos & Fuera (1 Minuto)</option>
                  <option value="super_spike">4. Jingles Super Spike (Remate)</option>
                  <option value="monster_block">5. Jingles Monster Block (Bloqueo)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>AGREGAR ARCHIVO INDIVIDUAL</span>
              </button>
            </form>
          )}

          {/* TAB 3: CURRENT PLAYLISTS */}
          {activeTab === 'list' && (
            <div className="space-y-6">
              {(Object.keys(playlists) as PlaylistCategory[]).map((catKey) => {
                const pl = playlists[catKey];
                return (
                  <div key={catKey} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                    <h3 className="font-bold text-xs text-amber-400 uppercase tracking-wider mb-3 flex justify-between items-center">
                      <span>{pl.name}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                        {pl.tracks.length} PISTAS
                      </span>
                    </h3>

                    <div className="space-y-2">
                      {pl.tracks.map((t, idx) => (
                        <div
                          key={t.id}
                          className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono font-bold text-slate-500 w-5">#{idx + 1}</span>
                            <div>
                              <div className="font-bold text-xs text-white">{t.title}</div>
                              {t.artist && <div className="text-[11px] text-slate-400">{t.artist}</div>}
                            </div>
                          </div>

                          {!t.isBuiltIn && (
                            <button
                              onClick={() => onRemoveTrack(catKey, t.id)}
                              className="p-1 text-slate-400 hover:text-red-400 rounded transition-colors"
                              title="Eliminar de esta playlist"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
