const { ApolloError, gql, ApolloServer } = require('apollo-server')
const typeDefs = require('./Db/schema')
const resolvers = require('./Db/resolvers')
const conectarDB = require('./config/db')

//Conectar a la base de datos
conectarDB()

//Servidor
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => {
    const miContext = 'Hola'

    return { miContext }
  },
})

//Arrancar servidior
server.listen().then(({ url }) => {
  console.log(`Servidor listo en la URL ${url}`)
})
