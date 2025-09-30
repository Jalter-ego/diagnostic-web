import { IconBoxes, IconChatBot, IconDate, IconHospital, IconIA, IconSearch } from "@/assets/icons";
import { fetchCreateTreatment } from "@/services/treatments.services";
import { fetchCreateDiagnoses } from "@/services/diagnoses.services";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useOrganization } from "@/hooks/organizationContex";
import type { DiseaseDetails, ModelResult } from "@/pages/IAModel";

interface DetailInfoProps{
    toggleSpeak: (text:string)=> void
    getFullDetailsText: ()=> string
    diseaseDetails: DiseaseDetails;
    modelResult: ModelResult;
    isSpeaking: Boolean
}

export default function DetailInfo({
    toggleSpeak,getFullDetailsText,diseaseDetails,modelResult,isSpeaking}:DetailInfoProps) {
    const { organization } = useOrganization();
    return (
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
    )
}