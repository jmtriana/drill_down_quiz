
// This service is currently deactivated as the application uses a predefined static quiz structure.
// It can be reactivated if dynamic context generation is required in the future.
export const generateQuiz = async (context: string) => {
  throw new Error("Dynamic generation is disabled for this session.");
};
