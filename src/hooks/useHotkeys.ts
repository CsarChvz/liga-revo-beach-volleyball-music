import { useEffect, useRef } from 'react';

interface HotkeyHandlers {
  onPointIntro: () => void;
  onSuperSpike: () => void;
  onMonsterBlock: () => void;
  onTechnicalTimeout: () => void;
  onPresentationPlay: () => void;
  onPresentationTransition: () => void;
  onEmergencyStop: () => void;
}

export function useHotkeys(handlers: HotkeyHandlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore key events when typing inside input elements or textareas
      const target = event.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          handlersRef.current.onPointIntro();
          break;
        case 'KeyQ':
          event.preventDefault();
          handlersRef.current.onSuperSpike();
          break;
        case 'KeyW':
          event.preventDefault();
          handlersRef.current.onMonsterBlock();
          break;
        case 'KeyE':
          event.preventDefault();
          handlersRef.current.onTechnicalTimeout();
          break;
        case 'KeyP':
          event.preventDefault();
          handlersRef.current.onPresentationPlay();
          break;
        case 'KeyT':
          event.preventDefault();
          handlersRef.current.onPresentationTransition();
          break;
        case 'Escape':
        case 'KeyS':
          event.preventDefault();
          handlersRef.current.onEmergencyStop();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
