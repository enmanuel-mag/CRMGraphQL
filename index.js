const { ApolloError, gql, ApolloServer } = require('apollo-server')
require('dotenv').config({ path: 'variables.env' })
const typeDefs = require('./Db/schema')
const resolvers = require('./Db/resolvers')
const jwt = require('jsonwebtoken')
const conectarDB = require('./config/db')

//Conectar a la base de datos
conectarDB()

//Servidor
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers['authorization'] || ''
    if (token) {
      try {
        const usuario = jwt.verify(
          token.replace('Bearer ', ''),
          process.env.SECRETA
        )
        return {
          usuario,
        }
      } catch (error) {
        console.log('Hubo un error')
        console.log(error)
      }
    }
  },
})

//Arrancar servidior
server.listen().then(({ url }) => {
  console.log(`Servidor listo en la URL ${url}`)
})
