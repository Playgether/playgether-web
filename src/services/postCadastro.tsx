import { api } from "./api";

export interface postCadastroProps {
  first_name: string;
  username: string;
  email: string;
  password: string;
  last_name: string;
}

export type CadastroError = {
  username?: string;
  email?: string;
  general?: string;
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
  const err = error as { response?: { data?: Record<string, string[]> } };
  const data = err?.response?.data;
  if (!data || typeof data !== "object") return {};

  const errors: CadastroError = {};
  if (Array.isArray(data.username) && data.username.length > 0) {
    errors.username = "Este nome de usuário já está em uso.";
  }
  if (Array.isArray(data.email) && data.email.length > 0) {
    errors.email = "Este email já está cadastrado.";
  }
  return errors;
}

export const post = async (data: postCadastroProps): Promise<CadastroResult> => {
  try {
    await api.post("/api/v1/users/", data);
    return { success: true };
  } catch (error) {
    const parsed = parseBackendErrors(error);
    if (Object.keys(parsed).length > 0) {
      return { success: false, errors: parsed };
    }
    return { success: false, errors: { general: "Erro ao cadastrar. Tente novamente." } };
  }
};


