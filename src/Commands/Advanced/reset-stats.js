const { StatsModel } = require("../../Helpers/models.js");
const { MessageEmbed } = require("discord.js");

exports.run = async (Moderation, message, args) => {
    if (message.guild.ownerID !== message.author.id && !Moderation.Defaults.Developers.includes(message.author.id)) return;
    const Embed = new MessageEmbed().setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true })).setColor("RANDOM");
    
    const newData = new Map();
    await Stats.updateMany({}, { Voice: newData, Message: newData });
    
};

exports.conf = {
    commands: ["reset-stats"],
    enabled: true,
    usage: "reset-stats"
};
