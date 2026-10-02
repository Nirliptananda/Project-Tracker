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

// Return the stage after this one, or no stage after Completed.
function getNextStatus(status) {
  var statusIndex = STATUSES.indexOf(status);

  if (statusIndex === STATUSES.length - 1) {
    return null;
  }

  return STATUSES[statusIndex + 1];
}

// Show one project's category, name, and notes.
function Card(props) {
  var nextStatus = getNextStatus(props.project.status);

  function handleDeleteClick() {
    props.onDelete(props.project.id);
  }

  function handleMoveClick() {
    props.onMove(props.project.id, nextStatus);
  }

  function handleEditClick() {
    props.onEdit(props.project);
  }

  return (
    <article className="card">
      <span className={getTagClassName(props.project.category)}>{props.project.category}</span>
      <h3 className="card__title">{props.project.project}</h3>
      <p className="card__notes">{props.project.notes || "No notes yet"}</p>
      <div className="card__actions">
        <button className="button button--secondary" type="button" onClick={handleEditClick}>
          Edit
        </button>
        {nextStatus && (
          <button className="button button--secondary" type="button" onClick={handleMoveClick}>
            Move to next stage &rarr;
          </button>
        )}
        <button
          className="button button--danger"
          type="button"
          aria-label={"Delete " + props.project.project}
          onClick={handleDeleteClick}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

// Show the projects that belong in one stage.
function Column(props) {
  return (
    <section className={props.columnClass} aria-labelledby={props.headingId}>
      <header className="column__header">
        <h2 id={props.headingId}>{props.status}</h2>
        <span
          className="column__count"
          aria-live="polite"
          aria-label={props.projects.length + (props.projects.length === 1 ? " project" : " projects")}
        >
          {props.projects.length}
        </span>
      </header>
      <ul className="column__list">
        {props.projects.length === 0 && !props.searchText ? (
          <li className="column__empty">No projects yet</li>
        ) : props.projects.length > 0 ? (
          props.projects.map(function (project) {
            return (
              <li key={project.id}>
                <Card
                  project={project}
                  onDelete={props.onDelete}
                  onEdit={props.onEdit}
                  onMove={props.onMove}
                />
              </li>
            );
          })
        ) : null}
      </ul>
    </section>
  );
}

// Turn the current project list into the four board columns.
function Board(props) {
  var visibleProjects = props.projects.filter(function (project) {
    return project.project.toLowerCase().indexOf(props.searchText.toLowerCase()) !== -1;
  });

  return (
    <main className="board" aria-label="Project board">
      {visibleProjects.length === 0 && props.searchText.trim() && (
        <p className="board__no-matches" role="status">No matches</p>
      )}
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
            searchText={props.searchText}
            onDelete={props.onDelete}
            onEdit={props.onEdit}
            onMove={props.onMove}
            projects={visibleProjects.filter(function (project) {
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
  const [projectName, setProjectName] = React.useState(props.project ? props.project.project : "");
  const [category, setCategory] = React.useState(props.project ? props.project.category : "Web");
  const [status, setStatus] = React.useState(props.project ? props.project.status : "Backlog");
  const [notes, setNotes] = React.useState(props.project ? props.project.notes : "");
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

    props.onSave({
      id: props.project ? props.project.id : Date.now(),
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
      <h2 id="form-title">{props.project ? "Edit project" : "Add a project"}</h2>
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
          <button className="button button--primary" type="submit">
            {props.project ? "Save changes" : "Save project"}
          </button>
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
  const [editingProject, setEditingProject] = React.useState(null);
  const [searchText, setSearchText] = React.useState("");

  function handleSaveProject(project) {
    if (editingProject) {
      setProjects(projects.map(function (currentProject) {
        if (currentProject.id === project.id) {
          return project;
        }
        return currentProject;
      }));
    } else {
      setProjects(projects.concat(project));
    }
    setEditingProject(null);
    setIsFormOpen(false);
  }

  function handleOpenForm() {
    setEditingProject(null);
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setEditingProject(null);
    setIsFormOpen(false);
  }

  function handleEditProject(project) {
    setEditingProject(project);
    setIsFormOpen(true);
  }

  function handleSearchChange(event) {
    setSearchText(event.target.value);
  }

  function handleClearSearch() {
    setSearchText("");
  }

  function handleDeleteProject(projectId) {
    setProjects(projects.filter(function (project) {
      return project.id !== projectId;
    }));
  }

  function handleMoveProject(projectId, newStatus) {
    setProjects(projects.map(function (project) {
      if (project.id === projectId) {
        return { ...project, status: newStatus };
      }
      return project;
    }));
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
        <div className="search-field">
          <label htmlFor="project-search">Search projects</label>
          <div className="search-field__controls">
          <input
            id="project-search"
            type="search"
            value={searchText}
            onChange={handleSearchChange}
            placeholder="Search by project name"
          />
            {searchText && (
              <button
                className="button button--secondary search-field__clear"
                type="button"
                aria-label="Clear search"
                onClick={handleClearSearch}
              >
                &times;
              </button>
            )}
          </div>
        </div>
      </header>
      {isFormOpen && (
        <ProjectForm
          key={editingProject ? editingProject.id : "new-project"}
          project={editingProject}
          onSave={handleSaveProject}
          onCancel={handleCloseForm}
        />
      )}
      <Board
        projects={projects}
        searchText={searchText}
        onDelete={handleDeleteProject}
        onEdit={handleEditProject}
        onMove={handleMoveProject}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);