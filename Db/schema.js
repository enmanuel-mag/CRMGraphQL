const { gql } = require('apollo-server')

//Schema
const typeDefs = gql`
  type Usuario {
    id: ID
    nombre: String
    apellido: String
    email: String
    creado: String
  }

  type Producto {
    id: ID
    nombre: String
    existencia: Int
    precio: Float
    creado: String
  }

  type Cliente {
    id: ID
    nombre: String
    apellido: String
    empresa: String
    email: String
    telefono: String
    vendedor: ID
  }

  type Token {
    token: String
  }

  input UsuarioInput {
    nombre: String!
    apellido: String!
    email: String!
    password: String!
  }

  input AutenticarInput {
    email: String!
    password: String!
  }

  input ProductoInput {
    nombre: String!
    existencia: Int!
    precio: Float!
  }

  input ClienteInput {
    nombre: String!
    apellido: String!
    empresa: String!
    email: String!
    telefono: String
  }

  type Query {
    # USUARIOS
    obtenerUsuario(token: String!): Usuario

    # PRODUCTOS
    obtenerProductos: [Producto]
    obtenerProducto(id: ID!): Producto

    # CLIENTES
    obtenerClientes: [Cliente]
    obtenerClientesVendedor: [Cliente]
    obtenerCliente(id: ID!): Cliente
  }

  type Mutation {
    # USUARIOS
    nuevoUsuario(input: UsuarioInput): Usuario
    autenticarUsuario(input: AutenticarInput): Token

    # PRODUCTOS
    nuevoProducto(input: ProductoInput): Producto
    actualizarProducto(id: ID!, input: ProductoInput): Producto
    eliminarProducto(id: ID!): String

    # CLIENTES
    nuevoCliente(input: ClienteInput): Cliente
    actualziarCliente(id: ID!, input: ClienteInput!): Cliente
    eliminarCliente(id: ID!): String
  }
`
module.exports = typeDefs
