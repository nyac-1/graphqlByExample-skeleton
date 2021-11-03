const endpointURL = "http://localhost:9000/testing-gql";

async function graphqlRequest(query, variables = {}) {
    const response = await fetch(endpointURL,{
        method: 'POST',
        headers: {'content-type':'application/json'},
        body: JSON.stringify({
            query,
            variables
        })
    });

    const responseBody = await response.json();
    if(responseBody.errors){
        const message = response.errors.map((error)=>error.message).join('\n');
        throw new Error('GraphQL Error\n'+message);
    }
    return responseBody.data;
}


export async function loadJobs() {
    const query=`query GetAllJobsQuery{
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

    const data = await graphqlRequest(query);
    return data.jobs;
}


export async function loadJob(id) {
    const query = `query JobQuery($id: ID!) {
        job(id: $id) {
          id
          title
          company {
            id
            name
          }
          description
        }
      }`
    const variables = {id};

    const data = await graphqlRequest(query, variables);
    return data.job;
}

export async function loadCompany(id) {
    const query = `query GetCompanyQuery($id: ID!){
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
    const variables = {id};

    const data = await graphqlRequest(query, variables);
    return data.company;
}