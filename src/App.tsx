import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import TextField from "@mui/material/TextField";
import { gql } from "@apollo/client";
import debounce from "just-debounce-it";

import { Repository, useReposQuery } from "./graphql/generated";

const PAGE_SIZE = 20;
const DEBOUNCE_TIME = 500;
const DEFAULT_QUERY = "re";

const REPOS_QUERY = gql`
  query Repos($after: String, $query: String!) {
    search(after: $after, first: 20, query: $query, type: REPOSITORY) {
      edges {
        cursor
        node {
          ... on Repository {
            id
            name
            forks {
              totalCount
            }
            stargazers {
              totalCount
            }
            url
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      repositoryCount
    }
  }
`;

const columns: GridColDef[] = [
  {
    field: "name",
    headerName: "Name",
    width: 150,
  },
  {
    field: "stars",
    headerName: "🌟 Stars",
    type: "number",
    width: 150,
  },
  {
    field: "forks",
    headerName: "🍴 Forks",
    type: "number",
    width: 110,
  },
];

function App() {
  const [query, setQuery] = React.useState(DEFAULT_QUERY);
  const [currentPage, setCurrentPage] = React.useState(0);
  const { data, loading, fetchMore } = useReposQuery({ variables: { query } });

  const debouncedSearch = React.useCallback(debounce(setQuery, DEBOUNCE_TIME), [
    setQuery,
  ]);

  const loadMore = React.useCallback(
    (page: number) => {
      const cursor =
        page > currentPage
          ? data?.search?.pageInfo?.endCursor
          : data?.search?.pageInfo?.startCursor;

      fetchMore({
        variables: {
          query,
          after: cursor,
        },
      });
      setCurrentPage(page);
    },
    [data?.search?.pageInfo]
  );

  const rows =
    data?.search?.edges?.map((repo) => ({
      name: (repo?.node as Repository).name,
      stars: (repo?.node as Repository).stargazers.totalCount,
      forks: (repo?.node as Repository).forks.totalCount,
      id: (repo?.node as Repository).id,
    })) || [];

  React.useEffect(() => {
    fetchMore({
      variables: { query },
    });
  }, [query]);

  return (
    <div className="p-6 flex flex-col items-center">
      <div className="pb-6">
        <TextField
          label="Find repo by name"
          variant="outlined"
          onChange={(evt) => debouncedSearch(evt.target.value)}
        />
      </div>
      {loading && <div>Processing...</div>}
      {!!data?.search?.edges?.length && (
        <div className="h-[90vh] w-full">
          <DataGrid
            columns={columns}
            rows={rows}
            loading={loading}
            pageSize={PAGE_SIZE}
            rowCount={data?.search?.repositoryCount}
            pagination
            onPageChange={(page) => loadMore(page)}
            rowsPerPageOptions={[PAGE_SIZE]}
          />
        </div>
      )}
    </div>
  );
}

export default App;
