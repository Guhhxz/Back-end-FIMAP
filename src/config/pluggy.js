const { PluggyClient } = require("pluggy-sdk")

const pluggy = new PluggyClient({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
})

module.exports = pluggy