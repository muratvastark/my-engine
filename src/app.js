const { Client, Collection } = require("discord.js");
const Moderation = (global.Moderation = new Client());
const Mongoose = require("mongoose");
const Commands = (Moderation.Commands = new Collection());
const Defaults = (Moderation.Defaults = require("../global.json").Defaults);
Moderation.Permissions = require("../global.json").Permissions;
const { CronJob } = require("cron");
const { StatsModel } = require("./Helpers/models.js");
const fs = require("fs");

Mongoose.connect("mongodb+srv://muratvastark:airg@123@cluster0.gl8a4.mongodb.net/<dbname>?retryWrites=true&w=majority".replace("<dbname>", Defaults.DatabaseName), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

Mongoose.connection.once("open", () => {
    require("./Helpers/functions.js")(Moderation);
    require("./Helpers/models.js");
    require("./Helpers/penal");
    fs.readdirSync("./src/Commands", { encoding: "utf-8" }).forEach((dir) => {
        fs.readdirSync(`./src/Commands/${dir}`, { encoding: "utf-8" }).filter((file) => file.endsWith(".js")).forEach((fileName) => {
            const File = require(`./Commands/${dir}/${fileName}`);
            if (!File.run) return console.error(`[SYSTEM-MESSAGE] ${fileName} is not loaded.`);
            if (!File.conf.enabled || File.conf.enabled === false) return;
            if (File.conf.commands && File.conf.commands.length > 0) Commands.set(File.conf.commands[0], File);
            if (File.onLoad !== undefined && typeof File.onLoad == "function") File.onLoad(Moderation);
        });
    });

    fs.readdirSync("./src/Events", { encoding: "utf-8" }).filter((fileName) => fileName.endsWith(".js")).forEach((fileName) => {
        const File = require(`./Events/${fileName}`);
        if (!File.execute || !File.conf || !File.conf.event) return console.error(`[SYSTEM-MESSAGE] ${fileName} is not loaded.`);
        if (!File.conf.enabled || File.conf.enabled === false) return;
        Moderation.on(File.conf.event, File.execute);
    });

    const resetStats = new CronJob('00 00 00 * * 1', async function() {
      const guild = Moderation.guilds.cache.first();
      const newData = new Map();
      await Stats.updateMany({}, { Voice: newData, Message: newData });
    }, null, true, 'Europe/Istanbul');
    resetStats.start();

    Moderation.login(Defaults.Token).then(() => console.log(`[MODERATION] ${Moderation.user.tag} is connected!`)).catch(() => console.error("[MODERATION] Bot is not connected!"));
});
