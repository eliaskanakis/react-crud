import React from 'react';
import GraphiQL from 'graphiql';
import fetch from 'isomorphic-fetch';
import "graphiql/graphiql.css"
import "./GraphiQLWrapper.css"

const defaultQuery = `
query ExampleQuery {
  data: allFilms {
    edges {
      node {
        id
        title
        producers
        episodeID
        created
      }
    }
  }
}
`;

function graphQLFetcher(graphQLParams) {
  const serverUrl=process.env.REACT_APP_SERVER_URL;
    return fetch(`${serverUrl}/api/query`, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(graphQLParams),
  }).then(response => response.json());
}

function GraphiQLWrapper(){
    const [value, setValue] = React.useState(null);
    React.useEffect(() => {
      setTimeout(() => {
        setValue("something");
      }, 1000);
    }, []);

    return (
      <div id="wrapper">
        {value ? (
          <GraphiQL
            fetcher={graphQLFetcher}
            defaultQuery={defaultQuery}
            variables={null}
          />
        ) : null}
        ,
      </div>
    );
}

export default GraphiQLWrapper;