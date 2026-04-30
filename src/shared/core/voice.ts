export const startVoiceSearch = (onResult: (text: string) => void) => {
  const rec: any = new (window as any).webkitSpeechRecognition();
  rec.onresult = (e: any) => onResult(e.results[0][0].transcript);
  rec.start();
};