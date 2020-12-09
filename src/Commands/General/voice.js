const { MessageEmbed } = require("discord.js");

exports.run = async (Moderation, message, args) => {
    const Member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!Member || !Member.voice.channel || message.member.id === Member.id) return message.channel.send("Seste bulunan geçerli birini etiketlemelisin.");
    message.channel.send(new MessageEmbed().setColor("RANDOM").setDescription(`${Member} üyesi şu anda \`${Member.voice.channel.name}\` ses kanalında bulunuyor.`));
};

module.exports.conf = {
    commands: ["sesli", "voice"],
    enabled: true,
    usage: "sesli"
};
