import { Button } from "@/components/ui/button";
import {
  main,
  startAnamnesis,
  continueAnamnesis,
} from "@/services/chatbot/chatBot.services";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";


type SpeechRecognition = any;

type Message = {
  role: "user" | "bot";
  content: string;
};

export default function ChatBot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnamnesisActive, setIsAnamnesisActive] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 🔊 Función para que el bot hable
const speak = (text: string) => {
  let cleanedText = text
    .replace(/\*{1,2}/g, "") // Elimina asteriscos de negrita/cursiva (*) o (**)
    .replace(/_{1,2}/g, "") // Elimina guiones bajos de cursiva (_) o (__)
    .replace(/^- /gm, "") // Elimina guiones de lista al inicio de línea
    .replace(/\[.*\]\(.*\)/g, "") // Elimina enlaces tipo [texto](url)
    .replace(/`/g, "") // Elimina backticks de código
    .replace(/#/g, "") // Elimina hashes de encabezados
    .trim(); // Limpia espacios extra al inicio/final

  // 2. Ajustar la velocidad y usar el texto limpio
  const utterance = new SpeechSynthesisUtterance(cleanedText);
  utterance.rate = 0.9; // Velocidad ajustada para un habla natural
  utterance.lang = "es-ES"; // Español
  
  speechSynthesis.speak(utterance);
};

  // 🎤 Función para activar el micrófono
  // Referencia al formulario para enviar automáticamente
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Tu navegador no soporta reconocimiento de voz");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = "es-ES";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognition) => {
      const voiceText = event.results[0][0].transcript;
      setInput(voiceText);
      // Enviar automáticamente el mensaje
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.requestSubmit();
        }
      }, 100); // Pequeño delay para asegurar que el input se actualice
    };

    recognition.onerror = (event: any) => {
      console.error("Error de reconocimiento de voz:", event.error);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  // ✉️ Enviar mensaje manual o por voz
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let response = "";

      if (isAnamnesisActive && chatSession) {
        response = await continueAnamnesis(chatSession, input);
      } else {
        response = await main(input);
      }

      const botMessage: Message = { role: "bot", content: response };
      setMessages((prev) => [...prev, botMessage]);

      // 🔊 El bot habla
      speak(response);
    } catch (error) {
      console.error("Error al obtener respuesta de Gemini:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Lo siento, hubo un error. Intenta de nuevo." },
      ]);
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  // 🩺 Iniciar modo anamnesis
  const handleStartAnamnesis = async () => {
    setIsLoading(true);
    try {
      const { chat, response } = await startAnamnesis();
      setChatSession(chat);
      setIsAnamnesisActive(true);
      setMessages((prev) => [...prev, { role: "bot", content: response }]);

      speak(response);
    } catch (error) {
      console.error("Error al iniciar la anamnesis:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "No se pudo iniciar la anamnesis." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="max-w-3xl mx-auto md:mt-6 p-6 backdrop-blur-md rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-center text-primary">
        SkinCare Assistant
      </h2>

      {isAnamnesisActive && (
        <div className="text-center text-sm text-muted-foreground mb-2">
          🩺 <em>Modo Anamnesis activa — responde a cada pregunta</em>
        </div>
      )}

      <div className="p-4 sm:h-[480px] h-[470px] overflow-y-auto space-y-2 rounded-lg">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg ${msg.role === "user" ? "bg-secondary ml-auto" : ""
              } max-w-[80%]`}
          >
            <strong>{msg.role === "user" ? "Tú: " : "Asistente: "}</strong>
            {msg.role === "bot" &&
              messages.length - 1 === idx &&
              isLoading ? (
              <span className="animate-pulse">
                Asistente está escribiendo...
              </span>
            ) : (
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 🎤 Botón para activar voz */}
      <div className="flex justify-center mb-2 space-x-2">
        <Button
          onClick={handleVoiceInput}
          variant="outline"
          className="text-sm"
        >
          {isRecording ? "🎙️ Escuchando..." : "🎤 Hablar"}
        </Button>

        <Button
          onClick={handleStartAnamnesis}
          className="bg-secondary text-black text-sm"
          disabled={isAnamnesisActive || isLoading}
        >
          Iniciar Anamnesis
        </Button>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="mt-2 flex px-2">
        <input
          type="text"
          placeholder="Pregunta sobre el software o dermatología..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow px-4 py-2 border rounded-full
              outline-none shadow-inner max-sm:text-[11px]"
        />
        <Button
          type="submit"
          className="ml-2 bg-primary text-white rounded-full px-4"
          disabled={isLoading}
        >
          Enviar
        </Button>
      </form>
    </div>
  );
}
