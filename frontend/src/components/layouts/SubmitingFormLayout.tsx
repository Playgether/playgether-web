import { zInferForm } from "./FormTypeLayout";

export const SubmitingForm = (data : typeof zInferForm, where : (data) => any) => {
    try {
        where(data);
      } catch (error) {
        console.log(error);
      }
}