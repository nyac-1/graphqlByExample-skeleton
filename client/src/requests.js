import { getAccessToken, isLoggedIn } from './auth';
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from 'apollo-boost';
import gql from "graphql-tag";
const endpointURL = "http://localhost:9000/testing-gql";

const authLink = new ApolloLink((operation, forward)=>{
  if (isLoggedIn()) {
    operation.setContext({
      headers : {"authorization": 'Bearer ' + getAccessToken()}
    })
  }
  return forward(operation);
});

const client = new ApolloClient({
  link: ApolloLink.from([
    authLink,
    new HttpLink({uri: endpointURL})
  ]),
  cache: new InMemoryCache()
});

const jobDetailFragment = gql`
  fragment JobDetail on Job{
    id
    title
    description
    company{
      id
      name
    }
  }
`


const AllJobsQuery= gql`query GetAllJobsQuery{
  jobs{
      id
      title
      description
      company{
          id
          name
      }
  }
}`

const JobByIDQuery = gql`
  query JobQuery($id: ID!) {
    job(id: $id) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;

const CompanyByIDQuery = gql`query GetCompanyQuery($id: ID!){
  company(id: $id){
      id
      name
      description
      jobs{
          id
          title
          description
      }
  }
}`

const CreateJobMutation = gql`
  mutation CreateJob($input: CreateJobInput){
    job: createJob(input: $input) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
  `;




export async function loadJobs() {
  const {data:{jobs}} = await client.query({query: AllJobsQuery});
  // const {data:{jobs}} = await client.query({query, fetchPolicy: "no-cache"});
  return jobs;
}


export async function loadJob(id) {
  const variables = {id};  
  const {data:{job}} = await client.query({query: JobByIDQuery, variables});
  return job;
}

export async function loadCompany(id) {
  const variables = {id};
  const {data:{company}} = await client.query({query: CompanyByIDQuery, variables});
  return company;
}


export async function createJob(input) {
    const variables = {input}
    const {data: {job}} = await client.mutate({
      mutation: CreateJobMutation,
      variables,
      update: (cache, {data}) => {
        cache.writeQuery({
          query: JobByIDQuery,
          variables: {id: data.job.id},
          data
        })
      }
    });
    return job;
}