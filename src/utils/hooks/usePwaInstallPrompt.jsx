import { useCallback, useEffect, useState } from "react";

export function usePWAInstallPrompt() {
    const [installPromptEvent, setInstallPromptEvent] = useState(null);
    const [isPromptVisible, setPromptVisible] = useState(false);
    useEffect(() => {
      const handleBeforeInstallPrompt = (event) => {
        event.preventDefault();
        setInstallPromptEvent(event);
        setPromptVisible(true);
      };
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }, []);
    const promptToInstall = useCallback(async () => {
      if (!installPromptEvent) return;
      installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;
      setInstallPromptEvent(null);
      setPromptVisible(false);
      return outcome; // 'accepted' or 'dismissed'
    }, [installPromptEvent]);
    const hidePrompt = useCallback(() => setPromptVisible(false), []);
    return {
      isPromptVisible,
      promptToInstall,
      hidePrompt,
      canPrompt: !!installPromptEvent,
    };
  }