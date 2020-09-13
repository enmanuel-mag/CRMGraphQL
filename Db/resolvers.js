const Usuario = require('../models/Usuario')
const Producto = require('../models/Producto')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: 'variables.env' })

const validarUsuario = async (email, accion) => {
  const existeUsuario = await Usuario.findOne({ email })
  if (accion) {
    if (existeUsuario) {
      throw new Error('El usuario ya está registrado')
    } else {
      return existeUsuario
    }
  } else {
    if (!existeUsuario) {
      throw new Error('El usuario no existe')
    } else {
      return existeUsuario
    }
  }
}

const crearToken = (usuario, secreta, expiresIn) => {
  const { id, email, nombre, apellido } = usuario
  return jwt.sign({ id, email, nombre, apellido }, secreta, { expiresIn })
}

//Resolver
const resolvers = {
  Query: {
    obtenerUsuario: async (_, { token }) => {
      const usuarioID = await jwt.verify(token, process.env.SECRETA)
      return usuarioID
    },
    obtenerProductos: async () => {
      try {
        const productos = await Producto.find({})
        return productos
      } catch (error) {
        console.log(error)
      }
    },
    obtenerProducto: async (_, { id }) => {
      //Revisar si existe
      const producto = await Producto.findById(id)
      if (!producto) {
        throw new Error('Producto no encontrado')
      }

      return producto
    },
  },
  Mutation: {
    nuevoUsuario: async (_, { input }, ctx) => {
      const { email, password } = input

      //Revisar si esta registrado
      await validarUsuario(email, true)

      //Hashear la password
      const salt = await bcrypt.genSalt(10)
      input.password = await bcrypt.hash(password, salt)

      //GUardar en DB

      try {
        const usuario = new Usuario(input)
        usuario.save()
        return usuario
      } catch (error) {
        console.log(error)
      }
    },
    autenticarUsuario: async (_, { input }) => {
      const { email, password } = input

      //Si el usuario existe
      const usuario = await validarUsuario(email, false)

      //Revisar si el password es correcto
      const passwordCorrecta = await bcrypt.compare(password, usuario.password)
      if (!passwordCorrecta) {
        throw new Error('El password no es correcto')
      }

      //Crear el token
      return {
        token: crearToken(usuario, process.env.SECRETA, '24H'),
      }
    },
    nuevoProducto: async (_, { input }) => {
      try {
        console.log(input)
        const producto = new Producto(input)
        const resultado = await producto.save()
        return resultado
      } catch (error) {
        console.log(error)
      }
    },
    actualizarProducto: async (_, { id, input }) => {
      let producto = await Producto.findById(id)
      if (!producto) {
        throw new Error('Producto no encontrado')
      }

      producto = await Producto.findByIdAndUpdate({ _id: id }, input, {
        new: true,
      })

      return producto
    },
    eliminarProducto: async (_, { id }) => {
      let producto = await Producto.findById(id)
      if (!producto) {
        throw new Error('Producto no encontrado')
      }

      await Producto.findByIdAndDelete({ _id: id })
      return 'Producto eliminado'
    },
  },
}

module.exports = resolvers
