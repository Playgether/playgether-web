export const SubmitingForm = async (funcWithArgs: (...args) => Promise<any>) => {
  try {
      const response = await funcWithArgs();
      return response
  } catch (error) {
      console.log(error);
  }
}