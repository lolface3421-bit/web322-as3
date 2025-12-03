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
const clientSessions = require("client-sessions")
require("dotenv").config()
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs")
app.use(express.static("public"))

// app.get("/", (req, res) => {
//   res.send("Assignment 1: Jimmy Yang - 117273193")
// })

app.use(
  clientSessions({
    cookieName: 'session', // this is the object name that will be added to 'req'
    secret: process.env.SESSIONSECRET, // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60, // the session will be extended by this many ms each request (1 minute)
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next()
})

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login")
  }
  next()
}

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

app.get("/solutions/addProject", ensureLogin, (req, res) => {
        projectData.getAllSectors()
        .then(sectors => {
            res.render("addProject", { sectors: sectors })
        })
        .catch(err => {
            res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` })
        })
})

app.post("/solutions/addProject", ensureLogin, (req, res) => {
    projectData.addProject(req.body)
        .then(() => {
            res.redirect("/solutions/projects")
        })
        .catch(err => {
            res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` })
        })
})

app.get("/solutions/editProject/:id", ensureLogin, (req, res) => {
    Promise.all([
        projectData.getProjectById(req.params.id),
        projectData.getAllSectors()
    ])
        .then(([project, sectors]) => {
            res.render("editProject", { project: project, sectors: sectors })
        })
        .catch(err => {
            res.status(404).render("404", { message: err })
        })
})

app.post("/solutions/editProject", ensureLogin, (req, res) => {
    projectData.editProject(req.body.id, req.body)
        .then(() => {
            res.redirect("/solutions/projects")
        })
        .catch(err => {
            res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` })
        })
})

app.get("/solutions/deleteProject/:id", ensureLogin, (req, res) => {
    projectData.deleteProject(req.params.id)
        .then(() => {
            res.redirect("/solutions/projects")
        })
        .catch(err => {
            res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` })
        })
})

app.get("/login", (req, res) => {
  res.render("login", { errorMessage: null, userName: "" })
})

app.post("/login", (req, res) => {
  const { userName, password } = req.body

  if (userName === process.env.ADMINUSER && password === process.env.ADMINPASSWORD) {
    req.session.user = { userName: userName };
    res.redirect("/solutions/projects")
  } else {
    res.render("login", { errorMessage: "Invalid username or password", userName: userName })
  }
})

app.get("/logout", (req, res) => {
  req.session.reset()
  res.redirect("/")
})

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
