export const SubmitingForm = (data, where) => {
    try {
        where(data);
      } catch (error) {
        console.log(error);
      }
}