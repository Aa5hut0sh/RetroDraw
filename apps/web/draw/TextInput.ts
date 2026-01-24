/**
 * Creates a temporary floating textarea to capture user input.
 * @param clientX - The X coordinate relative to the browser viewport
 * @param clientY - The Y coordinate relative to the browser viewport
 * @param onSubmit - Callback function that receives the final text
 */
export function createTextInput(
  clientX: number,
  clientY: number,
  onSubmit: (text: string) => void
) {
  const input = document.createElement("textarea");


  input.style.position = "fixed";
  input.style.left = `${clientX}px`;
  input.style.top = `${clientY - 10}px`; 

  input.style.fontFamily = "var(--font-sans), sans-serif";
  input.style.fontSize = "18px";
  input.style.border = "1px dashed #ccc"; 
  input.style.outline = "none";
  input.style.background = "rgba(255, 255, 255, 0.8)";
  input.style.padding = "0";
  input.style.margin = "0";
  input.style.resize = "both";
  input.style.overflow = "hidden";
  input.style.whiteSpace = "pre";
  input.style.zIndex = "1000";
  input.style.color = "black";

  document.body.appendChild(input);


  setTimeout(() => input.focus(), 0);

  const finish = () => {
    const value = input.value.trim();
    if (input.parentNode) {
      document.body.removeChild(input);
    }
    if (value) {
      onSubmit(value);
    }
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      finish();
    }
    if (e.key === "Escape") {
      if (input.parentNode) document.body.removeChild(input);
    }
  });

  input.addEventListener("blur", finish);
}