
const express = require("express");
const {
  graphqlExpress,
  graphiqlExpress,
} = require('graphql-server-express');
const bodyParser = require("body-parser");
const cors = require("cors");
const {
  execute,
  subscribe,
} = require('graphql');
const { createServer } = require("http");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const {
  makeExecutableSchema,
  addMockFunctionsToSchema,
} = require("graphql-tools");
require('dotenv-safe').config();
const { glue } = require('schemaglue')

const { schema, resolver } = glue('src/')
const executableSchema = makeExecutableSchema({
	typeDefs: schema,
	resolvers: resolver
})

const PORT = process.env.PORT || 4000;
const server = express();

//Wrap the Express server
const ws = createServer(server);
ws.listen(PORT, () => {
  console.log(`GraphQL Server is now running on http://${process.env.IP}:${PORT}`);
  // Set up the WebSocket for handling GraphQL subscriptions
  new SubscriptionServer({
    execute,
    subscribe,
    schema: executableSchema
  }, {
    server: ws,
    path: '/subscriptions',
  });
});


server.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
  subscriptionsEndpoint: `ws://${process.env.IP}:${PORT}/subscriptions`
}));

server.use(cors());

server.use('/graphql', bodyParser.json(), graphqlExpress({
  schema: executableSchema
}));

// server.use('/graphiql', graphiqlExpress({
//   endpointURL: '/graphql'
// }));

// server.listen(PORT, () =>
//   console.log(`GraphQL Server is now running on http://localhost:${PORT}`)
// );
