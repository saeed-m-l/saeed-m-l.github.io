const JOBS_KEY = "resume_jobs_v1";

const qs = (s) => document.querySelector(s);
const jobsList = qs("#jobsList");
const form = qs("#jobForm");

const exportBox = qs("#exportBox");
const exportText = qs("#exportText");

qs("#year").textContent = new Date().getFullYear();

// Optional: set your real links here (or leave as #)
qs("#linkedinLink").href = "#";
qs("#githubLink").href = "#";

function loadJobs(){
  try { return JSON.parse(localStorage.getItem(JOBS_KEY) || "[]"); }
  catch { return []; }
}

function saveJobs(jobs){
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
}

function escapeHtml(str=""){
  return str.replace(/[&<>"']/g, (m) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

function render(){
  const jobs = loadJobs();
  jobsList.innerHTML = "";

  if (!jobs.length){
    jobsList.innerHTML = `<div class="muted small">No experience entries yet. Add your first one above.</div>`;
    return;
  }

  jobs.forEach((j, idx) => {
    const highlights = (j.highlights || [])
      .filter(Boolean)
      .map(h => `<li>${escapeHtml(h)}</li>`)
      .join("");

    const el = document.createElement("div");
    el.className = "job";
    el.innerHTML = `
      <h3>${escapeHtml(j.role)} <span class="muted">— ${escapeHtml(j.org)}</span></h3>
      <div class="meta">
        ${escapeHtml(j.dates || "")}${j.location ? " • " + escapeHtml(j.location) : ""}
      </div>
      ${highlights ? `<ul>${highlights}</ul>` : `<div class="muted small">No highlights provided.</div>`}
      <div class="actions">
        <button class="ghost" data-edit="${idx}">Edit</button>
        <button class="ghost" data-del="${idx}">Delete</button>
      </div>
    `;
    jobsList.appendChild(el);
  });

  jobsList.querySelectorAll("[data-del]").forEach(btn => {
    btn.addEventListener("click", () => {
      const jobs = loadJobs();
      jobs.splice(Number(btn.dataset.del), 1);
      saveJobs(jobs);
      render();
    });
  });

  jobsList.querySelectorAll("[data-edit]").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.edit);
      const jobs = loadJobs();
      const j = jobs[idx];

      form.role.value = j.role || "";
      form.org.value = j.org || "";
      form.dates.value = j.dates || "";
      form.location.value = j.location || "";
      form.highlights.value = (j.highlights || []).join("\n");
      form.dataset.editIndex = String(idx);

      form.scrollIntoView({behavior:"smooth", block:"start"});
    });
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(form);

  const job = {
    role: (fd.get("role") || "").toString().trim(),
    org: (fd.get("org") || "").toString().trim(),
    dates: (fd.get("dates") || "").toString().trim(),
    location: (fd.get("location") || "").toString().trim(),
    highlights: (fd.get("highlights") || "")
      .toString()
      .split("\n")
      .map(s => s.replace(/^\s*-\s?/, "").trim())
      .filter(Boolean)
  };

  const jobs = loadJobs();
  const editIndex = form.dataset.editIndex;

  if (editIndex !== undefined && editIndex !== ""){
    jobs[Number(editIndex)] = job;
    delete form.dataset.editIndex;
  } else {
    jobs.unshift(job);
  }

  saveJobs(jobs);
  form.reset();
  render();
});

qs("#clearJobs").addEventListener("click", () => {
  localStorage.removeItem(JOBS_KEY);
  delete form.dataset.editIndex;
  form.reset();
  exportBox.classList.add("hidden");
  render();
});

qs("#exportJobs").addEventListener("click", () => {
  const jobs = loadJobs();
  exportText.value = JSON.stringify(jobs, null, 2);
  exportBox.classList.remove("hidden");
  exportBox.scrollIntoView({behavior:"smooth", block:"start"});
});

qs("#closeExport").addEventListener("click", () => {
  exportBox.classList.add("hidden");
});

render();
