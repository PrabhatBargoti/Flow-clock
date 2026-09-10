export function Topbar({ view, setView }) {
  return (
    <header className="topbar">
      <a className="brand" href="#home" onClick={() => setView("home")}>
        <span>◒</span> flow clock
      </a>
      <nav aria-label="Primary navigation">
        {[
          ["home", "Home"],
          ["activity", "Activity"],
          ["settings", "Settings"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={view === id ? "nav-active" : ""}
            onClick={() => setView(id)}
          >
            {label}
          </button>
        ))}
      </nav>
    </header>
  );
}
