import Drop from "./goo-drop";

/**
 * A heading's text with its closing full stop as a drop of the goo. Text without one stays as it is.
 * The drop is an inline block, which a line may break before, so it is held to the last word.
 */
export default function withDrop(text: string) {
  if (!text.endsWith(".")) return text;
  const body = text.slice(0, -1);
  const cut = body.lastIndexOf(" ") + 1;
  return (
    <>
      {body.slice(0, cut)}
      <span className="whitespace-nowrap">
        {body.slice(cut)}
        <Drop />
      </span>
    </>
  );
}
