import { fetchJSON, renderProjects } from "../global.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
 
const projects = await fetchJSON("../lib/projects.json");
const projectsContainer = document.querySelector(".projects");
const projectsTitle = document.querySelector(".projects-title");
const searchInput = document.querySelector(".searchBar");
 
let query = "";
let selectedYear = null;
 
function searchProjects(list) {
  return list.filter((project) => {
    let values = Object.values(project).join("\n").toLowerCase();
    return values.includes(query.toLowerCase());
  });
}
 
const colors = d3.scaleOrdinal(d3.schemeTableau10);
const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
 
function renderPieChart(projectsGiven) {
  let rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );
  let data = rolledData
    .map(([year, count]) => ({ value: count, label: year }))
    .sort((a, b) => d3.ascending(a.label, b.label));
 
  let sliceGenerator = d3.pie().value((d) => d.value).sort(null);
  let arcData = sliceGenerator(data);
  let arcs = arcData.map((d) => arcGenerator(d));
 
  let svg = d3.select("#projects-pie-plot");
  svg.selectAll("path").remove();
  let legend = d3.select(".legend");
  legend.selectAll("li").remove();
 
  arcs.forEach((arc, i) => {
    let label = data[i].label;
    svg
      .append("path")
      .attr("d", arc)
      .attr("fill", colors(label))
      .attr("class", label === selectedYear ? "selected" : "")
      .on("click", () => selectYear(label));
  });
 
  data.forEach((d) => {
    legend
      .append("li")
      .attr("style", `--color:${colors(d.label)}`)
      .attr("class", d.label === selectedYear ? "legend-item selected" : "legend-item")
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on("click", () => selectYear(d.label));
  });
}
 
function selectYear(year) {
  selectedYear = selectedYear === year ? null : year;
  update();
}
 
function update() {
  let searched = searchProjects(projects);
 
  if (selectedYear && !searched.some((p) => p.year === selectedYear)) {
    selectedYear = null;
  }
 
  let visible = selectedYear
    ? searched.filter((p) => p.year === selectedYear)
    : searched;
 
  renderProjects(visible, projectsContainer, "h2");
  renderPieChart(searched); 
  projectsTitle.textContent = `${visible.length} Projects`;
}
 
searchInput.addEventListener("input", (event) => {
  query = event.target.value;
  update();
});
 
update();
 