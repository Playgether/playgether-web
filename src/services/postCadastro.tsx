import { api } from "./api";

export interface postCadastroProps {
  first_name: string;
  username: string;
  email: string;
  password: string;
  last_name: string;
  accepted_documents: number[];
}

export type CadastroError = {
  username?: string;
  email?: string;
  general?: string;
  accepted_documents?: string;
};

export type CadastroResult = {
  success: true;
} | {
  success: false;
  errors: CadastroError;
};

/**
 * Extrai mensagens de erro do backend (DRF) para username e email duplicados.
 */
function parseBackendErrors(error: unknown): CadastroError {
  const err = error as { response?: { data?: Record<string, unknown> } };
  const data = err?.response?.data;
  if (!data || typeof data !== "object") return {};

  const errors: CadastroError = {};
  if (Array.isArray(data.username) && data.username.length > 0) {
    errors.username = "Este nome de usuário já está em uso.";
  }
  if (Array.isArray(data.email) && data.email.length > 0) {
    errors.email = "Este email já está cadastrado.";
  }
  const accepted = data.accepted_documents;
  if (Array.isArray(accepted) && accepted.length > 0) {
    errors.accepted_documents = String(accepted[0]);
  }
  return errors;
}

export const post = async (data: postCadastroProps): Promise<CadastroResult> => {
  try {
    const payload = {
      first_name: data.first_name,
      username: data.username,
      email: data.email,
      password: data.password,
      last_name: data.last_name,
      accepted_documents: data.accepted_documents,
    };
    await api.post("/api/v1/users/", payload);
    return { success: true };
  } catch (error) {
    const parsed = parseBackendErrors(error);
    if (Object.keys(parsed).length > 0) {
      return { success: false, errors: parsed };
    }
    return { success: false, errors: { general: "Erro ao cadastrar. Tente novamente." } };
  }
};


