const projectData = require("../data/projectData")
const sectorData = require("../data/sectorData")

let projects = []

function Initialize() {
  return new Promise((resolve, reject) => {
    try {
      projects = []
      projectData.forEach((proj) => {
        const sectorObj = sectorData.find((sec) => sec.id === proj.sector_id)

        const copy = {
          ...proj,
          sector: sectorObj ? sectorObj.sector_name : null,
        }
        projects.push(copy)
      })
      resolve()
    } catch (error) {
      reject("Failed to init projects")
    }
  })
}

function getAllProjects() {
  return new Promise((resolve, reject) => {
    if (projects.length > 0) {
      resolve(projects)
    } else {
      reject("No projects were found")
    }
  })
}

function getProjectById(projectId) {
  return new Promise((resolve, reject) => {
    const project = projects.find((p) => p.id === projectId)
    if (project) {
      resolve(project)
    } else {
      reject(`Unable to find project with id: ${projectId}`)
    }
  })
}

function getProjectsBySector(sector) {
  return new Promise((resolve, reject) => {
    const search = sector.toLowerCase()
    const found = projects.filter(
      (p) => (p.sector || "").toLowerCase().includes(search)
    )

    if (found.length > 0) {
      resolve(found)
    } else {
      reject(`Unable to find projects in sector: "${sector}"`)
    }
  })
}

module.exports = { 
  Initialize, 
  getAllProjects, 
  getProjectById, 
  getProjectsBySector 
}