import { apilocal } from "./api";

export interface CreatePatient {
  name: string;
  aPaternal: string;
  aMaternal: string;
  sexo: string;
  birthDate: string;
  phone: number;
  email: string;
  ci: number;
  organizationId: string;
  chronicDiseases: string[];
  allergies: string[];
  bloodType: string | null;
}

export interface GetPatient {
  id: string;
  name: string;
  aPaternal: string;
  aMaternal: string;
  sexo: string;
  birthDate: Date;
  phone:number
  email:string
  ci: number;
  organizationId: string
  createAt?: Date;
  updatedAt?: Date;
}

export const fetchPatientsByOrg = async (organizationId:string) => {
  const response = await fetch(`${apilocal}/patients?organizationId=${organizationId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Error fetching patients");
  }

  return await response.json();
}

export type UpdatePatientPayload = Omit<GetPatient, 'createAt' | 'updatedAt'>;

export const fetchUpdatePatient = async (data: UpdatePatientPayload) => {
  const { id, ...body } = data;

  const res = await fetch(`${apilocal}/patients/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error("Error actualizando paciente");
  return await res.json();
};

export const fetchCreatePatient = async (data: CreatePatient) => {
  const res = await fetch(`${apilocal}/patients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Error al crear paciente");
  return await res.json();
};

export const fetchDeletePatient = async (id: string) => {
  const res = await fetch(`${apilocal}/patients/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error("Error al eliminar paciente");
  return await res.json();
};
