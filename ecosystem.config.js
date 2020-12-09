module.exports = {
    apps: [{
        name: "audit",
        script: "./src/Audit.js",
        watch: true
    },
    {
        name: "moderation",
        script: "./src/app.js",
        watch: true
    },
    {
        name: "invite",
        script: "./src/Invite.js",
        watch: true
    }]
};