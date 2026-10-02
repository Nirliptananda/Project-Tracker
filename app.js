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

// Turn the current project list into the four board columns.
function Board(props) {
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
            projects={props.projects.filter(function (project) {
              return project.status === status;
            })}
          />
        );
      })}
    </main>
  );
}

// Collect the fields for a new project and check its name.
function ProjectForm(props) {
  const [projectName, setProjectName] = React.useState("");
  const [category, setCategory] = React.useState("Web");
  const [status, setStatus] = React.useState("Backlog");
  const [notes, setNotes] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  function handleNameChange(event) {
    setProjectName(event.target.value);
    setErrorMessage("");
  }

  function handleCategoryChange(event) {
    setCategory(event.target.value);
  }

  function handleStatusChange(event) {
    setStatus(event.target.value);
  }

  function handleNotesChange(event) {
    setNotes(event.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();
    var trimmedName = projectName.trim();

    if (!trimmedName) {
      setErrorMessage("Enter a project name.");
      return;
    }

    props.onAdd({
      id: Date.now(),
      project: trimmedName,
      category: category,
      status: status,
      notes: notes.trim()
    });
    setProjectName("");
    setCategory("Web");
    setStatus("Backlog");
    setNotes("");
    setErrorMessage("");
  }

  return (
    <section className="project-form" aria-labelledby="form-title">
      <h2 id="form-title">Add a project</h2>
      <form onSubmit={handleSubmit}>
        <div className="project-form__fields">
          <label className="project-form__field">
            Project name
            <input
              type="text"
              value={projectName}
              onChange={handleNameChange}
              maxLength="60"
              required
            />
          </label>
          <label className="project-form__field">
            Category
            <select value={category} onChange={handleCategoryChange}>
              {CATEGORIES.map(function (optionCategory) {
                return <option key={optionCategory} value={optionCategory}>{optionCategory}</option>;
              })}
            </select>
          </label>
          <label className="project-form__field">
            Status
            <select value={status} onChange={handleStatusChange}>
              {STATUSES.map(function (optionStatus) {
                return <option key={optionStatus} value={optionStatus}>{optionStatus}</option>;
              })}
            </select>
          </label>
          <label className="project-form__field project-form__field--wide">
            Notes
            <textarea
              value={notes}
              onChange={handleNotesChange}
              maxLength="280"
              rows="3"
            />
          </label>
        </div>
        <p className="form-error" aria-live="polite">{errorMessage}</p>
        <div className="project-form__actions">
          <button className="button button--primary" type="submit">Save project</button>
          <button className="button button--secondary" type="button" onClick={props.onCancel}>Cancel</button>
        </div>
      </form>
    </section>
  );
}

// Render the React version inside the page's root element.
function App() {
  const [projects, setProjects] = React.useState(SEED_PROJECTS);
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  function handleAddProject(project) {
    setProjects(projects.concat(project));
    setIsFormOpen(false);
  }

  function handleOpenForm() {
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
  }

  return (
    <div>
      <header className="app-header">
        <h1>Project Tracker</h1>
        <p className="tagline">Track every project through every stage</p>
        <div className="header__actions">
          <button className="button button--primary" type="button" onClick={handleOpenForm}>
            Add project
          </button>
        </div>
      </header>
      {isFormOpen && <ProjectForm onAdd={handleAddProject} onCancel={handleCloseForm} />}
      <Board projects={projects} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);