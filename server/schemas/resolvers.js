// import user model
const { User } = require('../models');
// import sign token function from auth
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            return await User.findOne({ _id: context.user._id });
        }
    },
    Mutation: {
        // create a user, sign a token, and send it back (to client/src/components/SignUpForm.js)
        createUser: async (parent, { username, email, password }) => {
            return await User.create({ username, email, password });
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email: email });

            if (!user) {
                throw new AuthenticationError("Can't find this user");
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect password!');
            }

            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (parent, { body }, context) => {
            return await User.findOneAndUpdate(
                { _id: context.user._id },
                { $addToSet: { savedBooks: body } },
                { new: true, runValidators: true }
            );
        },
        deleteBook: async (parent, { bookId }, context) => {
            return await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId: bookId } } },
                { new: true }
            );
        }
    }
}