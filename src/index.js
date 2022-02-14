const { ApolloServer } = require('apollo-server');
const { dbConnection } = require('../database/config');
const User = require('../models/user.js');

// Variables de entorno
require('dotenv').config();

//Conexion base de datos
dbConnection();

const typeDefs = `
    type User {
        _id: ID!
        nombre: String!
        apellidoP: String!
        apellidoM: String!
        direccion: String!
        telefono: Float!
    }

    input UserInfo{
        nombre: String!
        apellidoP: String!
        apellidoM: String!
        direccion: String!
        telefono: Float!
    }

    type Query {
        userCount: Int!
        allUsers: [User]
        findUser(uid: ID!): User
        searchUser(termino: String!): [User]
    }

    type Mutation {
        deleteUser(uid: ID!): String
        createUser(userInfo: UserInfo!): User
        updateUser(uid: ID!, userInfo: UserInfo!): User
    }
`;

const resolvers = {
    Query: {
        userCount: async () => await User.collection.countDocuments(),
        allUsers: async (root, args) => {
            return await User.find()
        },
        findUser: async (root, args) => {
            const { uid } = args
            return await User.findById(uid)
        },
        searchUser: async (root, args) => {
            let { termino } = args;

            const regex = new RegExp(termino, 'i');

            return User.find({
                $or: [
                    { nombre: regex },
                    { apellidoP: regex },
                    { apellidoM: regex },
                ]
            });
        }
    },
    Mutation: {
        createUser: async (root, args) => {

            let user = new User({
                ...args.userInfo
            })

            await user.save()
            console.log(user)
            return user
        },
        updateUser: async (root, args) => {
            console.log(args);
            const { uid, userInfo } = args;
            return await User.findByIdAndUpdate(uid, userInfo, { new: true });
        },
        deleteUser: async (root, args) => {
            console.log(args);
            const { uid } = args;

            let res;

            try {
                const storedUser = await User.findById(uid);
                if (!storedUser) {
                    res = {
                        ok: false,
                        msg: 'Usuario no encontrado'
                    };

                    console.log(JSON.stringify(res));
                    return JSON.stringify(res);
                }

                await User.findByIdAndDelete(uid);

                res = {
                    obj: true,
                    msg: "Usuario eliminado"
                };

                console.log(JSON.stringify(res));
                return JSON.stringify(res);
            }
            catch (error) {
                res = {
                    obj: true,
                    msg: "Error inesperado",
                    error
                }

                console.log(JSON.stringify(res));
                return JSON.stringify(res);
            }
        }
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
})

server
    .listen()
    .then(({ url }) => console.log(`Server corriendo en ${url}`)
    );