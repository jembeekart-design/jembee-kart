export const startVoiceSearch = (onResult: (text: string) => void) => {
  if (typeof window === "undefined") return;

  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Voice search not supported");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-IN";

  recognition.onresult = (event: any) => {
    const text = event.results[0][0].transcript;
    onResult(text);
  };

  recognition.start();
};