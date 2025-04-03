export const handleKeyDown = (event, sendMessage) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault(); // Evita quebra de linha (caso seja um textarea)
    sendMessage();
  }
};
