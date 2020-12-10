const { DatabaseName } = require("./global.json").Defaults;

module.exports = {
    apps: [{
        name: `${DatabaseName}-audit`,
        script: "./src/Audit.js",
        watch: true
    },
    {
        name: `${DatabaseName}-moderation`,
        script: "./src/app.js",
        watch: true
    },
    {
        name: `${DatabaseName}-invite`,
        script: "./src/Invite.js",
        watch: true
    },
    {
        name: `${DatabaseName}-owner-guard`,
        script: "./src/OwnerGuard.js",
        watch: true
    }]
};
