// import { zInferForm } from "./FormTypeLayout";

// export const SubmitingForm = (data : typeof zInferForm, where : (...props) => Promise<any>) => {
//     try {
//         where(data);
//       } catch (error) {
//         console.log(error);
//       }
// }


export const SubmitingForm = (funcWithArgs: (...args) => Promise<any>) => {
  try {
      funcWithArgs();
  } catch (error) {
      console.log(error);
  }
}