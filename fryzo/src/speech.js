// Charge les voix du navigateur (elles arrivent parfois de façon asynchrone)
function getVoices() {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length) return resolve(voices);
    window.speechSynthesis.onvoiceschanged = () =>
      resolve(window.speechSynthesis.getVoices());
  });
}

export async function speak(text, langCode) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel(); // coupe ce qui est en cours

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langCode;

  const voices = await getVoices();
  const prefix = langCode.split("-")[0]; // ex. "ar"
  const voice =
    voices.find((v) => v.lang === langCode) ||
    voices.find((v) => v.lang.startsWith(prefix));
  if (voice) utterance.voice = voice;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel();
}