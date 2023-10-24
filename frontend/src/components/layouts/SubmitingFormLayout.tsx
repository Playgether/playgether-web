// import { zInferForm } from "./FormTypeLayout";

// export const SubmitingForm = (data : typeof zInferForm, where : (...props) => Promise<any>) => {
//     try {
//         where(data);
//       } catch (error) {
//         console.log(error);
//       }
// }


export const SubmitingForm = async (funcWithArgs: (...args) => Promise<any>) => {
  try {
      const response = await funcWithArgs();
      return response
  } catch (error) {
      console.log(error);
  }
}