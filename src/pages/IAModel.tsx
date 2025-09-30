import { useState, useRef } from "react";
import { fetchCreateTreatment } from "@/services/treatments.services";
import { fetchCreateDiagnoses } from "@/services/diagnoses.services";
import { useOrganization } from "@/hooks/organizationContex";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchModel } from "@/services/model";
import { fetchModelBenignMalignant } from "@/services/model";
import { getDiseaseDetails } from "@/services/chatbot/chatBot.services";
import { toast } from "sonner";
import {
  IconHospital,
  IconSearch,
  IconBoxes,
  IconIA,
  IconDate,
  IconChatBot
} from "@/assets/icons";

interface ModelResult {
  class: string;
  confidence: number;
}

interface WikiData {
  title: string;
  description: string;
  extract: string;
  thumbnail?: {
    source: string;
  };
}

interface DiseaseDetails {
  symptoms: string;
  causes: string;
  diagnosis: string;
  treatment: string;
  importantDetails: string;
  recommendations: string;
}

const MELANOMA_DETAILS_TEXT = `De acuerdo, aquí tienes información detallada sobre el melanoma:

    **SÍNTOMAS:**

    *   **Principal:**
        *   **Cambio en un lunar existente:** Alteración en el tamaño, forma, color (especialmente si es irregular o desigual), textura o elevación.
        *   **Aparición de un nuevo lunar:**  Un lunar de aspecto diferente a los demás, que crece rápidamente o sangra.
        *   **Lesión que no cicatriza:** Una úlcera o herida que persiste durante semanas o meses sin mostrar signos de curación.
        *   **Prurito, dolor o sangrado en un lunar:** Sensaciones nuevas o inusuales en un lunar.

    *   **Secundario (menos frecuentes):**
        *   **Inflamación alrededor del lunar.**
        *   **Satélites:**  Aparición de pequeños lunares o manchas pigmentadas alrededor del lunar original.
        *   **Engrosamiento o endurecimiento del lunar.**
        *   **Picazón persistente alrededor del lunar.**
        *   **En etapas avanzadas:** Hinchazón de los ganglios linfáticos cercanos, síntomas neurológicos si hay metástasis cerebral, dolor óseo si hay metástasis ósea.

    **CAUSAS FRECUENTES:**

    *   **Exposición a la radiación ultravioleta (UV):** La principal causa, proveniente del sol (incluyendo las camas de bronceado). La exposición acumulativa y las quemaduras solares, especialmente en la infancia, aumentan significativamente el riesgo.
    *   **Genética:**  Historia familiar de melanoma. Tener uno o más familiares de primer grado con melanoma aumenta el riesgo.  Algunos genes, como el CDKN2A, están fuertemente asociados con el melanoma.
    *   **Lunares (Nevos):**
        *   **Número de lunares:** Tener muchos lunares (más de 50) aumenta el riesgo.
        *   **Lunares atípicos (displásicos):** Lunares de forma irregular, bordes mal definidos y coloración variable.
    *   **Piel clara:**  Personas con piel clara, cabello rubio o pelirrojo, ojos azules o verdes son más susceptibles.
    *   **Inmunosupresión:**  Sistema inmunitario debilitado (por ejemplo, debido a un trasplante de órganos o al VIH).
    *   **Edad avanzada:** El riesgo aumenta con la edad, aunque puede ocurrir a cualquier edad.

    **DIAGNÓSTICO:**

    *   **Examen clínico:**  Evaluación visual de la piel por un dermatólogo, utilizando dermatoscopia (un microscopio de superficie de la piel) para examinar los lunares con mayor detalle. Se presta atención a las características ABCDE (Asimetría, Bordes irregulares, Coloración desigual, Diámetro mayor de 6 mm, Evolución o cambio).
    *   **Biopsia:** La extirpación completa o parcial del lunar sospechoso y el examen de la muestra bajo un microscopio por un patólogo.  Es el método definitivo para confirmar el diagnóstico.
        *   **Biopsia escisional:**  Extirpación completa del lunar.  Preferible si es posible.
        *   **Biopsia incisional:**  Extirpación de una parte del lunar, cuando la extirpación completa no es factible.
        *   **Biopsia por afeitado:**  No recomendada para el diagnóstico inicial del melanoma, ya que puede no proporcionar suficiente información para la estadificación.
    *   **Estadificación:** Una vez confirmado el diagnóstico de melanoma, se realiza la estadificación para determinar la extensión de la enfermedad.
        *   **Biopsia del ganglio centinela:**  Identifica y extirpa el primer ganglio linfático al que drenaría el melanoma. Si este ganglio contiene células cancerosas, indica que el cáncer se ha diseminado a los ganglios linfáticos.
        *   **Pruebas de imagen:** Radiografías de tórax, tomografías computarizadas (TC), resonancias magnéticas (RM) o tomografías por emisión de positrones (PET) para detectar la diseminación del cáncer a otros órganos.
        *   **Análisis de sangre:**  Para evaluar la función hepática y otros marcadores que podrían indicar metástasis.

    **TRATAMIENTO RECOMENDADO:**

    *   **Escisión quirúrgica:**  Extirpación del melanoma y un margen de piel sana circundante. El tamaño del margen depende del grosor del melanoma.
    *   **Biopsia del ganglio centinela (SLNB):** Si el melanoma tiene un grosor intermedio o alto, o si hay características de alto riesgo, se realiza para evaluar la diseminación a los ganglios linfáticos.
    *   **Disección de ganglios linfáticos:**  Si el ganglio centinela es positivo, puede requerirse la extirpación de todos los ganglios linfáticos de la región.
    *   **Terapias adyuvantes (después de la cirugía):**
        *   **Inmunoterapia:**  Medicamentos que estimulan el sistema inmunitario para atacar las células cancerosas.  Ejemplos: pembrolizumab, nivolumab, ipilimumab.
        *   **Terapia dirigida:** Medicamentos que atacan específicamente las células cancerosas con mutaciones genéticas específicas (por ejemplo, BRAF, MEK).  Ejemplos: vemurafenib, dabrafenib, trametinib, cobimetinib.
    *   **Radioterapia:**  Se utiliza en algunos casos, especialmente si el melanoma se ha diseminado al cerebro o a los huesos.
    *   **Quimioterapia:**  Menos común que la inmunoterapia o la terapia dirigida, pero a veces se utiliza en casos avanzados.
    *   **Terapias intralesionales:** Inyección directa de medicamentos en el melanoma, como talimogene laherparepvec (T-VEC).

    **DETALLES IMPORTANTES:**

    *   **Factores de riesgo:** Exposición a la radiación UV, historia familiar, piel clara, lunares atípicos, inmunosupresión.
    *   **Prevención:**  Protegerse del sol mediante el uso de protector solar, ropa protectora y evitar las horas pico de sol. Evitar las camas de bronceado.  Autoexamen regular de la piel y exámenes regulares con un dermatólogo, especialmente si se tienen factores de riesgo.
    *   **Complicaciones:**  Metástasis (diseminación del cáncer a otros órganos), recurrencia local, efectos secundarios de los tratamientos (por ejemplo, fatiga, erupciones cutáneas, problemas intestinales con la inmunoterapia).
    *   **Pronóstico:**  El pronóstico depende del estadio del melanoma en el momento del diagnóstico. El melanoma detectado y tratado en las primeras etapas tiene un pronóstico mucho mejor.

    **RECOMENDACIONES:**

    *   **Autoexamen mensual de la piel:** Presta atención a la regla ABCDE.
    *   **Visita anual a un dermatólogo:**  Especialmente si tienes factores de riesgo.
    *   **Protección solar rigurosa:**  Usa protector solar de amplio espectro con un SPF de 30 o superior, aplica generosamente y reaplica cada dos horas, especialmente después de nadar o sudar.  Busca la sombra y usa ropa protectora.
    *   **Informa cualquier cambio a tu médico de inmediato:**  No dudes en buscar atención médica si notas un lunar nuevo, cambiante o preocupante.
    *   **Sigue las recomendaciones de tu médico:**  Cumple con los seguimientos y tratamientos prescritos.

    Espero que esta información sea útil. Recuerda que esta información es general y no sustituye el consejo médico profesional. Consulta siempre con un médico para un diagnóstico y tratamiento adecuados.
`;

export default function IAModel() {
  // Simulación para benigno/maligno en prueba manual
  const simulateBenignMalignant = () => ({ class: "benigno", confidence: 0.87 });
  const [benignMalignantResult, setBenignMalignantResult] = useState<{ class: string; confidence: number } | null>(null);
  const [showBenignMalignantModal, setShowBenignMalignantModal] = useState(false);
  const { organization } = useOrganization();
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [modelResult, setModelResult] = useState<ModelResult | null>(null);
  const [wikiData, setWikiData] = useState<WikiData | null>(null);
  const [diseaseDetails, setDiseaseDetails] = useState<DiseaseDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setModelResult(null);
      setWikiData(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setImage(file);
        setPreviewUrl(URL.createObjectURL(file));
        setModelResult(null);
        setWikiData(null);
      } else {
        toast.error("Por favor, selecciona una imagen válida");
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const fetchWikiData = async (disease: string) => {
    try {
      const response = await fetch(
        `https://es.wikipedia.org/api/rest_v1/page/summary/${disease}`,
        { signal: abortControllerRef.current?.signal }
      );
      const data = await response.json();
      setWikiData({
        title: data.title,
        description: data.description,
        extract: data.extract,
        thumbnail: data.thumbnail,
      });
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Consulta a Wikipedia cancelada");
        return;
      }
      console.error("Error fetching Wikipedia data:", error);
    }
  };

  const fetchDiseaseDetails = async (disease: string, esTest: boolean = false) => {
    setLoadingDetails(true);
    try {
      let detailsText: string;
      if (esTest) {
        detailsText = MELANOMA_DETAILS_TEXT;
      } else {
        detailsText = await getDiseaseDetails(disease);
      }

      // Verificar si la respuesta es vacía o no contiene detalles
      if (!detailsText || detailsText.trim() === "" || detailsText.includes("Lo siento, no tengo información")) {
        toast.error("No se encontraron detalles disponibles para esta enfermedad.");
        return;
      }

      // Definir las secciones de enfermedades con base en los encabezados de la respuesta
      const sections: { [key in keyof DiseaseDetails]: string } = {
        symptoms: "SÍNTOMAS",
        causes: "CAUSAS FRECUENTES",
        diagnosis: "DIAGNÓSTICO",
        treatment: "TRATAMIENTO RECOMENDADO",
        importantDetails: "DETALLES IMPORTANTES",
        recommendations: "RECOMENDACIONES"
      };

      // Objeto donde almacenaremos los detalles
      const details: DiseaseDetails = {
        symptoms: "",
        causes: "",
        diagnosis: "",
        treatment: "",
        importantDetails: "",
        recommendations: ""
      };

      // Dividir el texto en partes usando los encabezados como delimitadores
      const sectionsArray = detailsText.split(/(\*\*.*?:\*\*)/).filter(Boolean);

      // Recorrer cada sección para asignar el texto correspondiente a cada propiedad
      let currentSection: keyof DiseaseDetails | null = null;
      sectionsArray.forEach((section) => {
        // Buscar si la sección corresponde a un encabezado
        for (const key of Object.keys(sections) as (keyof typeof sections)[]) {
          if (section.includes(sections[key])) {
            currentSection = key;
            return;
          }
        }

        // Si estamos en una sección, asignar el contenido a esa propiedad
        if (currentSection) {
          const sectionText = section.replace(/\*\*.*?:\*\*/g, "").trim(); // Eliminar los encabezados
          details[currentSection] = sectionText || "Información no disponible";
        }
      });

      // Verificación para depuración
      console.log("Parseado de detalles: ", details);
      setDiseaseDetails(details);
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Consulta de detalles cancelada");
        return;
      }
      console.error("Error fetching disease details:", error);
      toast.error("Error al obtener detalles de la enfermedad");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
      toast.info("Análisis cancelado");
    }
  };

  // Función para obtener los datos de la IA (real)
  const handlePredict = async () => {
    if (!image) {
      toast.error("Por favor selecciona una imagen.");
      return;
    }

    setLoading(true);
    abortControllerRef.current = new AbortController();
    const formData = new FormData();
    formData.append("image", image);

    try {
      const result = await fetchModel(formData); // Petición a la IA
      console.log("Datos obtenidos de la IA:", result); // Ver datos de la IA

      setModelResult(result); // Establecer resultados del modelo

      // Hacemos la consulta a Wikipedia con el nombre de la enfermedad
      await fetchWikiData(result.class);

      // Obtenemos detalles detallados de la enfermedad usando el chatbot
      await fetchDiseaseDetails(result.class,false);

      toast.success("Análisis completado");
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Análisis cancelado");
        return;
      }
      toast.error("Error al conectar con el servidor.");
      console.error(error);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Función para la prueba manual
  const handleTestPrediction = async () => {
    setLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      const testResult: ModelResult = {
        class: "melanoma", // Enfermedad simulada
        confidence: 0.9687, // Nivel de confianza simulado
      };

      setModelResult(testResult); // Establecer resultados simulados

      // Obtener información de Wikipedia para la enfermedad simulada
      await fetchWikiData(testResult.class);

      // Obtenemos detalles detallados de la enfermedad usando el chatbot
      await fetchDiseaseDetails(testResult.class, true);

      // Simular resultado benigno/maligno si es melanoma
      setBenignMalignantResult(simulateBenignMalignant());

      toast.success("Prueba completada");
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Prueba cancelada");
        return;
      }
      toast.error("Error al obtener datos de Wikipedia");
      console.error(error);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  // 🔊 Función para leer los detalles por voz
  // Estado para saber si está hablando
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Función para alternar voz
  const toggleSpeak = (text: string) => {
    const synth = window.speechSynthesis;
    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      synth.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Construir el texto completo de los detalles
  const getFullDetailsText = () => {
    if (!diseaseDetails) return "";
    return `Síntomas: ${diseaseDetails.symptoms}\nCausas frecuentes: ${diseaseDetails.causes}\nDiagnóstico: ${diseaseDetails.diagnosis}\nTratamiento recomendado: ${diseaseDetails.treatment}\nDetalles importantes: ${diseaseDetails.importantDetails}\nRecomendaciones: ${diseaseDetails.recommendations}`;
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        Diagnóstico de Enfermedades de la Piel
      </h1>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <div
              onClick={handleClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`w-full max-w-md h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${previewUrl ? "border-primary" : "border-gray-300 hover:border-primary"
                }`}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Vista previa"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              ) : (
                <>
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm text-gray-500">Haz clic o arrastra una imagen aquí</p>
                  <p className="text-xs text-gray-400">Formatos soportados: JPG, PNG, GIF</p>
                </>
              )}
            </div>
            <div className="flex gap-4 w-full max-w-md">
              <Button
                onClick={handlePredict}
                disabled={!image || loading}
                className="flex-1"
              >
                {loading ? "Analizando..." : "Analizar Imagen"}
              </Button>
              <Button
                onClick={handleTestPrediction}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                {loading ? "Probando..." : "Prueba Manual"}
              </Button>
            </div>
            {loading && (
              <Button
                onClick={handleCancel}
                variant="destructive"
                className="w-full max-w-md"
              >
                Cancelar Análisis
              </Button>
            )}
          </div>
        </div>
      </Card>

      {modelResult && (
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Resultados del Análisis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="font-medium">Enfermedad Detectada:</p>
                  {modelResult?.class === "Melanoma" && image && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={async () => {
                        try {
                          const formData = new FormData();
                          formData.append("image", image);
                          const result = await fetchModelBenignMalignant(formData);
                          setBenignMalignantResult(result);
                          setShowBenignMalignantModal(true);
                        } catch (error) {
                          toast.error("Error al predecir benigno/maligno");
                        }
                      }}
                    >
                      Ver benigno/maligno
                    </Button>
                  )}
                </div>
                <p className="text-lg capitalize">{modelResult.class}</p>
                <p className="font-medium">Nivel de Confianza:</p>
                <p className="text-lg">{(modelResult.confidence * 100).toFixed(2)}%</p>

                {/* Botón para obtener información detallada */}
                {!diseaseDetails && !loadingDetails && (
                  <Button
                    onClick={() => fetchDiseaseDetails(modelResult.class)}
                    className="mt-4"
                    variant="outline"
                  >
                    Obtener Información Detallada
                  </Button>
                )}
              </div>

              {wikiData && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{wikiData.title}</h3>
                  <p className="text-sm text-gray-600">{wikiData.description}</p>
                  <p>{wikiData.extract}</p>
                  {wikiData.thumbnail && (
                    <img
                      src={wikiData.thumbnail.source}
                      alt={wikiData.title}
                      className="max-w-full h-auto rounded-lg"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Información detallada de la enfermedad */}
            {diseaseDetails && (
              <div className="mt-6 space-y-8">
                <h3 className="text-2xl font-bold border-b pb-2 mb-4 text-center">Información Detallada de la Enfermedad</h3>
                <div className="flex justify-center mb-4">
                  <Button
                    onClick={() => toggleSpeak(getFullDetailsText())}
                    variant="outline"
                    className="text-sm"
                  >
                    {isSpeaking ? "🔇 Detener voz" : "🔊 Escuchar detalles"}
                  </Button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Síntomas */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-red-500"><IconSearch /></span>
                      <h4 className="text-lg font-semibold">Síntomas</h4>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg shadow-sm">
                      <ul className="list-disc pl-5 text-sm">
                        {diseaseDetails.symptoms.split(/\n|\*/).filter(item => item.trim()).map((item, idx) => (
                          <li key={idx}>{item.trim()}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {/* Causas */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500"><IconBoxes /></span>
                      <h4 className="text-lg font-semibold">Causas Frecuentes</h4>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg shadow-sm">
                      <ul className="list-disc pl-5 text-sm">
                        {diseaseDetails.causes.split(/\n|\*/).filter(item => item.trim()).map((item, idx) => (
                          <li key={idx}>{item.trim()}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {/* Diagnóstico */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500"><IconHospital /></span>
                      <h4 className="text-lg font-semibold">Diagnóstico</h4>
                       <Button
                    variant="outline"
                    size="sm"
                    className="ml-2"
                    onClick={async () => {
                      if (!organization) {
                        toast.error("No hay organización seleccionada");
                        return;
                      }
                      if (!modelResult?.class) {
                        toast.error("No hay diagnóstico detectado");
                        return;
                      }
                      try {
                        await fetchCreateDiagnoses({
                          name: modelResult.class,
                          description: diseaseDetails?.diagnosis || "Diagnóstico automático IA",
                          organizationId: organization.id
                        });
                        toast.success("Diagnóstico creado correctamente");
                      } catch (error) {
                        toast.error("Error al crear diagnóstico");
                      }
                    }}
                  >
                    Crear diagnóstico
                  </Button>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                      <ul className="list-disc pl-5 text-sm">
                        {diseaseDetails.diagnosis.split(/\n|\*/).filter(item => item.trim()).map((item, idx) => (
                          <li key={idx}>{item.trim()}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {/* Tratamiento */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-green-500"><IconIA /></span>
                      <h4 className="text-lg font-semibold">Tratamiento Recomendado</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={async () => {
                          if (!organization) {
                            toast.error("No hay organización seleccionada");
                            return;
                          }
                          const treatmentText = diseaseDetails?.treatment?.trim();
                          if (!treatmentText) {
                            toast.error("No hay tratamiento detectado");
                            return;
                          }
                          try {
                            await fetchCreateTreatment({
                              description: treatmentText,
                              duration: "4 semanas",
                              instructions: "Tratamiento automático IA",
                              organizationId: organization.id,
                              frequencyValue: 1,
                              frequencyUnit: "daily"
                            });
                            toast.success("Tratamiento creado correctamente");
                          } catch (error) {
                            toast.error("Error al crear tratamiento");
                          }
                        }}
                      >
                        Crear tratamiento
                      </Button>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg shadow-sm">
                      <ul className="list-disc pl-5 text-sm">
                        {diseaseDetails.treatment.split(/\n|\*/).filter(item => item.trim()).map((item, idx) => (
                          <li key={idx}>{item.trim()}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                {/* Detalles importantes */}
                {diseaseDetails.importantDetails && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-500"><IconDate /></span>
                      <h4 className="text-lg font-semibold">Detalles Importantes</h4>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
                      <ul className="list-disc pl-5 text-sm">
                        {diseaseDetails.importantDetails.split(/\n|\*/).filter(item => item.trim()).map((item, idx) => (
                          <li key={idx}>{item.trim()}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {/* Recomendaciones */}
                {diseaseDetails.recommendations && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-teal-500"><IconChatBot /></span>
                      <h4 className="text-lg font-semibold">Recomendaciones</h4>
                    </div>
                    <div className="bg-teal-50 p-4 rounded-lg shadow-sm">
                      <ul className="list-disc pl-5 text-sm">
                        {diseaseDetails.recommendations.split(/\n|\*/).filter(item => item.trim()).map((item, idx) => (
                          <li key={idx}>{item.trim()}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </Card>
      )}
      {/* Modal para mostrar resultado benigno/maligno */}
      {showBenignMalignantModal && benignMalignantResult && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 min-w-[300px] text-center">
            <h3 className="text-xl font-bold mb-4">Resultado Melanoma</h3>
            <p className="text-lg mb-2">Clasificación: <span className="font-semibold">{benignMalignantResult.class}</span></p>
            <p className="mb-4">Confianza: <span className="font-semibold">{(benignMalignantResult.confidence * 100).toFixed(2)}%</span></p>
            <Button onClick={() => setShowBenignMalignantModal(false)} variant="outline">Cerrar</Button>
          </div>
        </div>
      )}
    </div>
  );
}

