const Usuario = require('../models/Usuario')
const Cliente = require('../models/Cliente')
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

const validarCliente = async (email, accion) => {
  const existeCliente = await Cliente.findOne({ email })
  if (accion) {
    if (existeCliente) {
      throw new Error('El cliente ya está registrado')
    } else {
      return existeCliente
    }
  } else {
    if (!existeCliente) {
      throw new Error('El cliente no existe')
    } else {
      return existeCliente
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
    obtenerClientes: async () => {
      try {
        const clientes = await Cliente.find({})
        return clientes
      } catch (error) {
        console.log(error)
      }
    },
    obtenerClientesVendedor: async (_, {}, ctx) => {
      try {
        const clientes = await Cliente.find({
          vendedor: ctx.usuario.id.toString(),
        })
        return clientes
      } catch (error) {
        console.log(error)
      }
    },
    obtenerCliente: async (_, { id }, ctx) => {
      //Revisar si el cleinte existe o no
      const cliente = await Cliente.findById(id)
      if (!cliente) {
        throw new Error('Cliente no encontrado')
      }

      //Quien lo creo puede verlo
      if (cliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error('No tienes las credenciales')
      }

      return cliente
    },
  },
  Mutation: {
    // USUARIOS
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

    // PRODUCTOS
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

    // CLIENTES
    nuevoCliente: async (_, { input }, ctx) => {
      const { email } = input
      console.log(ctx)

      //Verificar que no este registrado
      await validarCliente(email, true)

      const nuevoCliente = new Cliente(input)
      //Asignar vendedor
      nuevoCliente.vendedor = ctx.usuario.id

      //Guardar en la base de datos
      try {
        const resultado = await nuevoCliente.save()
        return resultado
      } catch (error) {
        console.log(error)
      }
    },
    actualziarCliente: async (_, { id, input }, ctx) => {
      //Revisar si el cleinte existe o no
      let cliente = await Cliente.findById(id)
      if (!cliente) {
        throw new Error('Cliente no encontrado')
      }

      //Quien lo creo puede verlo
      if (cliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error('No tienes las credenciales')
      }

      //Guardar en la base de datos
      cliente = await Cliente.findOneAndUpdate({ _id: id }, input, {
        new: true,
      })

      return cliente
    },
    eliminarCliente: async (_, { id }, ctx) => {
      //Revisar si el cleinte existe o no
      let cliente = await Cliente.findById(id)
      if (!cliente) {
        throw new Error('Cliente no encontrado')
      }

      //Quien lo creo puede verlo
      if (cliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error('No tienes las credenciales')
      }

      //Eliminar cliente
      await Cliente.findOneAndDelete({ _id: id })
      return 'Cliente eliminado'
    },
  },
}

module.exports = resolvers
