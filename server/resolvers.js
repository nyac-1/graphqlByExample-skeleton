const db = require('./db.js');

const Query = {
    jobs: () => (db.jobs.list()),
    job: (root, {id})=>(db.jobs.get(id)),
    company: (root, {id})=>(db.companies.get(id))
}

const Job = {
    company: (job) => (db.companies.get(job.companyId))
}

const Company = {
    jobs: (company) => db.jobs.list()
      .filter((job) => job.companyId === company.id)
  };


module.exports = {
    Query,
    Job,
    Company,
};