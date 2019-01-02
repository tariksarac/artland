import React from 'react';
import PropTypes from 'prop-types';
import RepoItem from './RepoItem/RepoItem';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import './RepositoriesList.scss';
import Pagination from './Pagination/Pagination';
import ArtlandLoader from "../../Common/ArtlandLoader/ArtlandLoader";
import Info from "../../Common/Info/Info";

const REPOSITORIES_LIST = gql`
    query getUserRepositories($name: String!, $after: String, $before: String) {
        user(login: $name) {
            repositories(first: 5, after: $after, before:$before) {
                totalCount
                pageInfo {
                    startCursor
                    endCursor
                    hasPreviousPage
                    hasNextPage
                }
                nodes {
                    name
                    stargazers {
                        totalCount
                    }
                    watchers {
                        totalCount
                    }
                }
            }
        }
    }
`;


const RepositoriesList = ({selectedUser}) => {
    return (
        <Query
            query={REPOSITORIES_LIST}
            variables={{ name: selectedUser }}
            fetchPolicy={'cache-and-network'}>
            {({ loading, error, data, fetchMore }) => {
                if (loading)
                    return (
                        <ArtlandLoader />
                    );
                if (error) return <Info info={'Ooops something went wrong'} />;

                let {
                    user: {
                        repositories: { nodes, pageInfo },
                    },
                } = data;

                const onPageChange = (after, before) => {
                    fetchMore({
                        variables: {
                            after: after,
                            before: before,
                        },
                        updateQuery: (previousResult, { fetchMoreResult }) => {
                            const newEdges = fetchMoreResult.user.repositories.nodes;
                            const pageInfo = fetchMoreResult.user.repositories.pageInfo;

                            return newEdges.length
                                ? {
                                    user: {
                                        __typename: previousResult.user.__typename,
                                        repositories: {
                                            __typename: previousResult.user.repositories.__typename,
                                            nodes: [...newEdges],
                                            pageInfo,
                                        },
                                    },
                                }
                                : previousResult;
                        },
                    });
                };

                return (
                    <div className={'RepositoriesList'} style={{position:'relative'}}>
                        <div className={'title'}>Users Repositories</div>
                        {nodes.map((item, index) => (
                            <RepoItem repo={item} key={index} selectedUser={selectedUser} />
                        ))}

                        <Pagination
                            onPageChange={onPageChange}
                            endCursor={pageInfo.endCursor}
                            hasNextPage={pageInfo.hasNextPage}
                            hasPreviousPage={pageInfo.hasPreviousPage}
                            startCursor={pageInfo.endCursor}
                        />

                    </div>
                );
            }}
        </Query>
    );
};

RepositoriesList.propTypes = {
    selectedUser: PropTypes.string
};
RepositoriesList.defaultProps = {
    selectedUser: ''
};

export default RepositoriesList;

