type TerminalScope = "home" | "about" | "skills" | "work" | "projects" | "contact";

interface Props {
  scope: TerminalScope;
}

const scopeHints: Record<TerminalScope, string> = {
  home: "try: whoami, intro, cd work, open resume",
  about: "try: neofetch, stack, cd timeline",
  skills: "try: tree, grep ai, grep game",
  work: "try: ls, cat dca-ai-assistant, cd contact",
  projects: "try: ls, play market-dash, source schedule-reader",
  contact: "try: email, copy email, open linkedin",
};

export default function InteractiveTerminal({ scope }: Props) {
  const promptPath = `~/${scope === "home" ? "" : scope}`;

  return (
    <div className="interactive-terminal" data-terminal data-scope={scope}>
      <div className="interactive-terminal-log" data-terminal-log aria-live="polite">
        <div className="interactive-terminal-output">
          <p>{`interactive shell mounted - ${scopeHints[scope]}`}</p>
        </div>
      </div>

      <div className="interactive-terminal-form">
        <label className="sr-only" htmlFor={`terminal-${scope}`}>
          Terminal command
        </label>
        <span className="tok-green">abraham@portfolio</span>
        <span className="tok-muted">:</span>
        <span className="tok-blue">{promptPath}</span>
        <span className="tok-green"> $</span>
        <input
          id={`terminal-${scope}`}
          data-terminal-input
          autoComplete="off"
          spellCheck={false}
          inputMode="text"
          placeholder="help"
        />
      </div>
    </div>
  );
}
