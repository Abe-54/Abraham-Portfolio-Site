import Drop from "./goo-drop";

/** A heading's text with its closing full stop as a drop of the goo. Text without one stays as it is. */
export default function withDrop(text: string) {
  return text.endsWith(".") ? (
    <>
      {text.slice(0, -1)}
      <Drop />
    </>
  ) : (
    text
  );
}
