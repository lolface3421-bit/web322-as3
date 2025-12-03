require('dotenv').config()

require('pg')
const Sequelize = require('sequelize')

const sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    dialect: 'postgres',
    dialectOptions: {
      ssl: { rejectUnauthorized: false }
    }
  }
)

const Sector = sequelize.define('Sector', {
  id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
  sector_name: Sequelize.STRING
}, {createdAt: false, updatedAt: false})

const Project = sequelize.define('Project', {
  id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
  title: Sequelize.STRING,
  feature_img_url: Sequelize.STRING,
  summary_short: Sequelize.TEXT,
  intro_short: Sequelize.TEXT,
  impact: Sequelize.TEXT,
  original_source_url: Sequelize.STRING
}, {createdAt: false, updatedAt: false})

Project.belongsTo(Sector, { foreignKey: 'sector_id' })

function Initialize() {
  return new Promise((resolve, reject) => {
    sequelize.sync()
      .then(() => resolve())
      .catch((err) => reject(err))
  })
}

function getAllProjects() {
    return new Promise((resolve, reject) => {
    Project.findAll({ include: [Sector] })
      .then((projects) => resolve(projects))
      .catch((err) => reject("No projects were found"))
  })
}

function getProjectById(projectId) {
  return new Promise((resolve, reject) => {
    Project.findAll({ 
      include: [Sector],
      where: { id: projectId }
    })
      .then((projects) => {
        if (projects.length > 0) resolve(projects[0])
        else reject(`Unable to find project with id: ${projectId}`)
      })
      .catch((err) => reject(`Unable to find project with id: ${projectId}`))
  })
}

function getProjectsBySector(sector) {
  return new Promise((resolve, reject) => {
    Project.findAll({
      include: [Sector],
      where: {
        '$Sector.sector_name$': {
          [Sequelize.Op.iLike]: `%${sector}%`
        }
      }
    })
      .then((projects) => {
        if (projects.length > 0) resolve(projects)
        else reject(`Unable to find projects in sector: "${sector}"`)
      })
      .catch((err) => reject(`Unable to find projects in sector: "${sector}"`))
  })
}

function addProject(projectData) {
    return new Promise((resolve, reject) => {
        Project.create(projectData)
            .then(() => {
                resolve()
            })
            .catch(err => {
                reject(err.errors[0].message)
            })
    })
}

function getAllSectors() {
  return new Promise((resolve, reject) => {
    Sector.findAll()
      .then(sectors => resolve(sectors))
      .catch(err => reject("Unable to retrieve sectors"))
  })
}

function editProject(id, projectData) {
    return new Promise((resolve, reject) => {
        Project.update(projectData, {
            where: { id: id }
        })
        .then(() => {
            resolve()
        })
        .catch(err => {
            reject(err.errors[0].message)
        })
    })
}

function deleteProject(id) {
    return new Promise((resolve, reject) => {
        Project.destroy({
            where: { id: id }
        })
            .then(() => {
                resolve()
            })
            .catch(err => {
                reject(err.errors[0].message)
            })
    })
}

module.exports = { 
  Initialize, 
  getAllProjects, 
  getProjectById, 
  getProjectsBySector,
  addProject,
  getAllSectors,
  editProject,
  deleteProject
}