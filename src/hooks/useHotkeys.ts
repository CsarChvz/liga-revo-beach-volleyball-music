import { useEffect } from 'react';

interface HotkeyHandlers {
  onPointIntro: () => void;
  onSuperSpike: () => void;
  onMonsterBlock: () => void;
  onTechnicalTimeout: () => void;
  onPresentationPlay: () => void;
  onPresentationTransition: () => void;
  onEmergencyStop: () => void;
}

export function useHotkeys({
  onPointIntro,
  onSuperSpike,
  onMonsterBlock,
  onTechnicalTimeout,
  onPresentationPlay,
  onPresentationTransition,
  onEmergencyStop,
}: HotkeyHandlers) {
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
          onPointIntro();
          break;
        case 'KeyQ':
          event.preventDefault();
          onSuperSpike();
          break;
        case 'KeyW':
          event.preventDefault();
          onMonsterBlock();
          break;
        case 'KeyE':
          event.preventDefault();
          onTechnicalTimeout();
          break;
        case 'KeyP':
          event.preventDefault();
          onPresentationPlay();
          break;
        case 'KeyT':
          event.preventDefault();
          onPresentationTransition();
          break;
        case 'Escape':
        case 'KeyS':
          event.preventDefault();
          onEmergencyStop();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onPointIntro,
    onSuperSpike,
    onMonsterBlock,
    onTechnicalTimeout,
    onPresentationPlay,
    onPresentationTransition,
    onEmergencyStop,
  ]);
}
