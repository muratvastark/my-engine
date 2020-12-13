const { MessageEmbed } = require("discord.js");

exports.run = async (Moderation, message, args) => {
    if (message.member.roles.highest.positon < message.guild.roles.cache.get(Moderation.Defaults.MinStaffRole).position) return;

    const Channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel;
    const Snipes = Moderation.Snipes[Channel.id];

    if (!Snipes) return message.channel.send(`${Channel} kanalında bot açıkken hiç mesaj silinmemiş.`);

    const Embed = new MessageEmbed().setColor("RANDOM").setDescription(`${Channel} kanalında en son silinen 5 mesaj;`);

    Snipes.map((data) => Embed.addField(data.Writer, `${data.Content ? data.Content + " - " : ""}${Moderation.timeTR(Date.now() - data.DeletedAt)}${data.Image ? ` - [Dosya](${data.Image})` : ""}`));

    message.channel.send(Embed);
};

exports.conf = {
    commands: ["snipe", "snipes"],
    enabled: true,
    usage: "snipe [Kanal]"
};
