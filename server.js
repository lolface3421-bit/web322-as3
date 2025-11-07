/********************************************************************************
 * WEB322 – Assignment 02
 *
 * I declare that this assignment is my own work in accordance with Seneca's
 * Academic Integrity Policy:
 *
 * https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
 *
 * Name: Jimmy Yang Student ID: 117273193 Date: Nov 7, 2025
 *
 ********************************************************************************/
const projectData = require("./modules/projects")
const { getProjectById } = projectData
const express = require("express")
const app = express()
const port = process.env.PORT || 8080

app.set("view engine", "ejs")
app.use(express.static("public"))

// app.get("/", (req, res) => {
//   res.send("Assignment 1: Jimmy Yang - 117273193")
// })

app.get("/", (req, res) => {
  res.render("home")
})

app.get("/about", (req, res) => {
  res.render("about")
})

app.get("/solutions/projects/:id", (req, res) => {
  const projectId = Number(req.params.id)

  getProjectById(projectId)
    .then((project) => {
      res.render("project", { project: project })
    })
    .catch((err) => {
      res.status(404).render("404", { message: err })
    })
})

app.get("/solutions/projects/", (req, res) => {
  if (req.query.sector) {
    projectData.getProjectsBySector(req.query.sector)
      .then((projects) => {
        if (projects.length > 0) {
        res.render("projects", { projects: projects })
        } else {
          res.status(404).render("404", {message: `No projects found for sector: ${req.query.sector}`})
        }
      })
      .catch((err) => {
        res.status(404).render("404", { message: err })
      })
  } else {
    projectData.getAllProjects()
    .then(projects => {
      res.render("projects", {projects:projects})
    })
    .catch(err => {
      res.status(404).render("404", {message: err})
    })
  }
})

// app.get("/solutions/projects", (req, res) => {
//   projectData.getAllProjects()
//     .then(projects => res.json(projects))
//     .catch(err => res.status(500).send(err))
// })

// app.get("/solutions/projects/id-demo", (req, res) => {
//   projectData.getProjectById(5)
//     .then(project => res.json(project))
//     .catch(err => res.status(404).send(err))
// })

// app.get("/solutions/projects/sector-demo", (req, res) => {
//   projectData.getProjectsBySector("ind")
//     .then(found => res.json(found))
//     .catch(err => res.status(404).send(err))
// })

app.use((req, res) => {
  res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for" })
})

projectData
  .Initialize()
  .then(() => {
    app.listen(port, () => {
      console.log("Listening to port", port)
    })
  })
  .catch((err) => {
    console.log("Failed to init", err)
  })
