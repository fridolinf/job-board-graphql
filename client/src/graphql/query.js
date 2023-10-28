import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  concat,
  createHttpLink,
  gql,
} from "@apollo/client";
import { getAccessToken } from "../lib/auth";

const httpLink = createHttpLink({ uri: "http://localhost:9000/graphql" });
const authLink = new ApolloLink((operation, forward) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    operation.setContext({
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }
  return forward(operation);
});

const apolloClient = new ApolloClient({
  link: concat(authLink, httpLink), //link is for concat or combine two or more custom http link
  cache: new InMemoryCache(),
  defaultOptions: { query: { fetchPolicy: "cache-first" } },
  // fetchPolicy it's will get the data into the cache first if it's in the cache, if not than requesting from the server
  // if fetchPolicy is network only than always fetch data from server
});

const jobDetailFragment = gql`
  fragment JobDetail on Job {
    id
    date
    title
    company {
      id
      name
    }
    description
  }
`;

const jobByIdQuery = gql`
  query jobById($id: ID!) {
    job(id: $id) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;

export async function createJob({ title, description }) {
  const mutation = gql`
    mutation CreateJob($input: CreateJobInput!) {
      job: createJob(input: $input) {
        ...JobDetail
      }
    }
    ${jobDetailFragment}
  `;

  const { data } = await apolloClient.mutate({
    mutation,
    /* The `variables` field in the `mutate` function is used to pass variables to the mutation
    operation. In this case, the `input` variable is an object that contains the `title` and
    `description` values. These values are used as input parameters for the `createJob` mutation. By
    passing variables in this way, you can dynamically set the values of the variables based on user
    input or other data sources. */
    variables: {
      input: { title, description },
    },
    /* The `update` function is used in Apollo Client to update the cache after a mutation is
    performed. It takes two parameters: `cache` and `data`. */
    update: (cache, { data }) => {
      cache.writeQuery({
        query: jobByIdQuery,
        /* In the `createJob` function, `variables: { id: data.job.id }` is used in the `update`
        function to specify the variables for the `jobByIdQuery` query. */
        variables: { id: data.job.id },
        data, //data from the params
      });
    },
  });
  return data.job;
}

export async function getCompanyById(id) {
  const query = gql`
    query CompanyById($id: ID!) {
      company(id: $id) {
        id
        name
        description
        jobs {
          id
          date
          title
          description
        }
      }
    }
  `;
  const { data } = await apolloClient.query({ query, variables: { id } });
  return data.company;
}

export async function getJobById(id) {
  const { data } = await apolloClient.query({
    query: jobByIdQuery,
    variables: { id },
  });
  return data.job;
}

export async function getJobs(params) {
  // "getAllJobs" it's can be usefull to debug which operationName defined in operation authLink
  const query = gql`
    query getAllJobs {
      jobs {
        id
        date
        title
        company {
          id
          name
        }
      }
    }
  `;
  const { data } = await apolloClient.query({
    query,
  });
  return data.jobs;
}
