const {
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString,
    GraphQLID,
    GraphQLList,
    GraphQLInt
  } = require('graphql');
  
  const Laptop = require('../models/Laptop');
  const User = require('../models/User');
  const Order = require('../models/order');
  
  const LaptopType = new GraphQLObjectType({
    name: 'Laptop',
    fields: () => ({
      id: { type: GraphQLID },
      brand: { type: GraphQLString },
      model: { type: GraphQLString },
      price: { type: GraphQLInt }
    })
  });
  
  const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
      id: { type: GraphQLID },
      name: { type: GraphQLString },
      email: { type: GraphQLString }
    })
  });
  
  const OrderType = new GraphQLObjectType({
    name: 'Order',
    fields: () => ({
      id: { type: GraphQLID },
      user: { type: UserType },
      laptop: { type: LaptopType },
      quantity: { type: GraphQLInt }
    })
  });
  
  const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      laptop: {
        type: LaptopType,
        args: { id: { type: GraphQLID } },
        resolve(parent, args) {
          return Laptop.findById(args.id);
        }
      },
      user: {
        type: UserType,
        args: { id: { type: GraphQLID } },
        resolve(parent, args) {
          return User.findById(args.id);
        }
      },
      order: {
        type: OrderType,
        args: { id: { type: GraphQLID } },
        resolve(parent, args) {
          return Order.findById(args.id);
        }
      },
      laptops: {
        type: new GraphQLList(LaptopType),
        resolve() {
          return Laptop.find();
        }
      }
    }
  });
  
  module.exports = new GraphQLSchema({
    query: RootQuery
  });
  