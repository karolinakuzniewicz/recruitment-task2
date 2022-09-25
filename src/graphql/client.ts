import { ApolloClient, InMemoryCache } from "@apollo/client";
import { relayStylePagination } from "@apollo/client/utilities";

const GRAPHQL_URI = process.env.REACT_APP_GRAPHQL_URI || "";

export const client = new ApolloClient({
  uri: GRAPHQL_URI,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          search: relayStylePagination(),
        },
      },
    },
  }),
  headers: {
    authorization: `bearer ${process.env.REACT_APP_GITHUB_TOKEN}`,
  },
});
