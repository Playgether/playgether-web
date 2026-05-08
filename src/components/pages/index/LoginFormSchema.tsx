import { z } from "zod";

export const LoginFormSchema = () => {
  const LoginUserSchema = z.object({
    email: z
      .string()
      .min(1, "O email é obrigatório")
      .email("Informe um email válido")
      .max(254, "O email deve ter no máximo 254 caracteres"),

    password: z
      .string()
      .min(8, "A senha precisa de no mínimo 8 caracteres")
      .max(128, "A senha deve ter no máximo 128 caracteres"),
  });

  return LoginUserSchema;
};