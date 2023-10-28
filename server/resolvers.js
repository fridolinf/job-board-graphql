import { GraphQLError } from "graphql";
import {
  createJob,
  deleteJob,
  getJob,
  getJobs,
  getJobsByCompany,
  updateJob,
} from "./db/jobs.js";
import { getCompany } from "./db/companies.js";
export const resolvers = {
  Query: {
    jobs: async () => await getJobs(), //getting data from DB
    // job: async () => {
    // return {
    //   id: "ALSG",
    //   title: "AHA",
    //   description: "BABH",
    // };
    // return [
    //   {
    //     id: "ALSG",
    //     title: "AHA",
    //     description: "BABH",
    //   },
    // ]; //if the return value is array we need return with [] -> array symbol bracket
    // },
    job: async (_root, { id }) => {
      const job = await await getJob(id);
      if (!job) {
        throw notFoundError(`No job found with id:${id}`);
      }
      return job;
    },
    company: async (_root, { id }) => {
      const company = await getCompany(id);
      if (!company) {
        throw notFoundError(`No company found with id:${id}`);
      }
      return company;
    },
  },
  Job: {
    company: async (job) => await getCompany(job.companyId),
    date: (job) => toIsoDate(job.createdAt), //resolved function to resolve any field or any types, job object it's actually getting from DB or getJobs(), and every Resolver Function always run firstly
  },
  Company: {
    jobs: (company) => getJobsByCompany(company.id),
  },

  Mutation: {
    createJob: (_root, { input: { title, description } }, { user }) => {
      if (!user) {
        throw unauthorizedError(`Missing authentication`);
      }
      return createJob({ companyId: user.companyId, title, description });
    },
    deleteJob: async (_root, { id }, { user }) => {
      if (!user) {
        throw unauthorizedError(`Missing authentication`);
      }
      const job = await deleteJob(id, user.companyId);
      if (!job) {
        throw notFoundError(`Job with ${id} not found`);
      }
      return job;
    },
    updateJob: (_root, { input: { id, title, description } }, { user }) => {
      if (!user) {
        throw unauthorizedError(`Missing authentication`);
      }
      return updateJob({ id, comanyId: user.companyId, title, description });
    },
  },
};

function toIsoDate(dateVal) {
  return dateVal.slice(0, "yyyy-mm-dd".length);
}

function notFoundError(message) {
  return new GraphQLError(message, {
    extensions: { code: "NOT_FOUND" },
  });
}
function unauthorizedError(message) {
  return new GraphQLError(message, {
    extensions: { code: "UNAUTHORIZED" },
  });
}
