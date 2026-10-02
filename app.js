// Return the CSS class that matches each category label.
function getTagClassName(category) {
  if (category === "Web") {
    return "tag tag--web";
  }
  if (category === "Design") {
    return "tag tag--design";
  }
  if (category === "Research") {
    return "tag tag--research";
  }
  if (category === "Hardware") {
    return "tag tag--hardware";
  }
  return "tag tag--other";
}

// Show one project's category, name, and notes.
function Card(props) {
  return (
    <article className="card">
      <span className={getTagClassName(props.project.category)}>{props.project.category}</span>
      <h3 className="card__title">{props.project.project}</h3>
      <p className="card__notes">{props.project.notes || "No notes yet"}</p>
    </article>
  );
}

// Show the projects that belong in one stage.
function Column(props) {
  return (
    <section className={props.columnClass} aria-labelledby={props.headingId}>
      <header className="column__header">
        <h2 id={props.headingId}>{props.status}</h2>
      </header>
      <ul className="column__list">
        {props.projects.map(function (project) {
          return (
            <li key={project.id}>
              <Card project={project} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// Turn the seed projects into the four board columns.
function Board() {
  return (
    <main className="board" aria-label="Project board">
      {STATUSES.map(function (status) {
        var columnClass = "column ";
        var headingId = "col-";

        if (status === "Backlog") {
          columnClass += "column--backlog";
          headingId += "backlog";
        } else if (status === "In Progress") {
          columnClass += "column--progress";
          headingId += "progress";
        } else if (status === "Review") {
          columnClass += "column--review";
          headingId += "review";
        } else {
          columnClass += "column--completed";
          headingId += "completed";
        }

        return (
          <Column
            key={status}
            status={status}
            columnClass={columnClass}
            headingId={headingId}
            projects={SEED_PROJECTS.filter(function (project) {
              return project.status === status;
            })}
          />
        );
      })}
    </main>
  );
}

// Render the React version inside the page's root element.
function App() {
  return (
    <div>
      <header className="app-header">
        <h1>Project Tracker</h1>
        <p className="tagline">Track every project through every stage</p>
      </header>
      <Board />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);