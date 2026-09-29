import React from 'react';
import { X, Keyboard, Zap, Flame, Timer, Radio, AlertOctagon, Repeat, Infinity as InfinityIcon } from 'lucide-react';

interface HotkeyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HotkeyGuideModal: React.FC<HotkeyGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const hotkeys = [
    {
      key: 'E',
      icon: <Timer className="w-5 h-5 text-green-400" />,
      title: 'TECHNICAL TIME-OUT (1 Minuto)',
      desc: 'Música de animación (La Macarena). 50s continuo + 10s fade-out automático (0% al min 1).',
      badge: 'Tiempo Fuera',
    },
    {
      key: 'P',
      icon: <Radio className="w-5 h-5 text-sky-400" />,
      title: 'INTRO (Presentación / Calentamiento)',
      desc: 'Inicia música ambiental pre-partido.',
      badge: 'Pre-Partido',
    },
    {
      key: 'Espacio',
      icon: <Flame className="w-5 h-5 text-orange-400" />,
      title: 'BREAKS (Siguiente Entrepunto, 12s)',
      desc: 'Dispara canción festiva. 9s continuo + 3s fade-out automático (0% en segundo 12).',
      badge: 'Frecuente',
    },
    {
      key: '1',
      icon: <Repeat className="w-5 h-5 text-purple-400" />,
      title: 'TIME-OUT (Reproducción Continua)',
      desc: 'Activa/desactiva la reproducción continua de toda la playlist, avanzando sola pista a pista.',
      badge: 'Toggle',
    },
    {
      key: 'A',
      icon: <InfinityIcon className="w-5 h-5 text-emerald-400" />,
      title: 'AWARDS (Bucle Infinito)',
      desc: 'Activa/desactiva el bucle infinito de la pista de premiación activa, con cronómetro de tiempo transcurrido.',
      badge: 'Toggle',
    },
    {
      key: 'T',
      icon: <Radio className="w-5 h-5 text-amber-400" />,
      title: 'Transición a Juego',
      desc: 'Aplica un fade-out de 3s a la música de presentación y detiene el audio.',
      badge: 'Inicio Partido',
    },
    {
      key: 'Q',
      icon: <Zap className="w-5 h-5 text-rose-400" />,
      title: 'Jingle SUPER SPIKE',
      desc: 'Remate espectacular. Atenúa automáticamente la música base y suena instantáneamente.',
      badge: 'Prioridad Alta',
    },
    {
      key: 'W',
      icon: <Zap className="w-5 h-5 text-purple-400" />,
      title: 'Jingle MONSTER BLOCK',
      desc: 'Bloqueo defensivo. Atenúa automáticamente la música base y dispara el efecto.',
      badge: 'Prioridad Alta',
    },
    {
      key: 'R',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      title: 'Jingle ACE',
      desc: 'Saque de ace. Atenúa automáticamente la música base y dispara el efecto.',
      badge: 'Prioridad Alta',
    },
    {
      key: 'Esc / S',
      icon: <AlertOctagon className="w-5 h-5 text-red-500" />,
      title: 'Corte de Emergencia',
      desc: 'Corta inmediatamente (0 ms) todo sonido que se esté reproduciendo.',
      badge: 'Emergencia',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-2">
            <Keyboard className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Guía de Atajos de Teclado (Hotkeys)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* List of hotkeys */}
        <div className="p-6 space-y-3 overflow-y-auto max-h-[70vh]">
          {hotkeys.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 flex items-center space-x-4"
            >
              <div className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-center min-w-[75px]">
                <span className="font-mono font-black text-sm text-amber-400 tracking-wide block">
                  [{item.key}]
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-0.5">
                  {item.icon}
                  <span className="font-bold text-xs text-white">{item.title}</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-medium">
                    {item.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center text-xs text-slate-400">
          <span>💡 Diseñado para operarse sin ratón durante la cancha live</span>
          <button
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl transition-colors"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
