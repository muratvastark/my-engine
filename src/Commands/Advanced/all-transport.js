const { TransportAuthRoles } = global.Moderation.Defaults;
const { MessageEmbed } = require("discord.js");

exports.run = async (Moderation, message, args) => {
    if (message.member.check(TransportAuthRoles) === false) return;
    if (!message.member.voice.channel || !message.member.voice.channel.members.size > 1) return message.channel.send("Bir kanalda olup ve kanalda en az 1 üyenin bulunması lazım!");
    if (message.guild.ownerID === message.author.id && args[0] === "tüm") {
        message.guild.members.cache.filter((member) => member.voice.channel && !member.user.bot && member.voice.channelID !== message.member.voice.channelID).array().forEach(async(member) => await member.voice.setChannel(message.member.voice.channelID));
        message.channel.send(new MessageEmbed().setColor("RANDOM").setDescription(`Ses kanallarında bulunan herkesi başarıyla  \`${message.member.voice.channel.name}\` ses kanalına taşıyorum!`));
    }
    if (!args[0]) return message.channel.send("Lütfen bir kanal ID'si belirtin!");
    const Channel = message.guild.channels.cache.get(args[0]) || message.guild.channels.cache.find((channel) => channel.name.includes(args.join(" ")));
    if (!Channel || Channel.type !== "voice") return message.channel.send("Geçerli bir **ses** kanalı belirtin!");
    message.channel.send(new MessageEmbed().setColor("RANDOM").setDescription(`\`${message.member.voice.channel.name}\` kanalındaki üyeler \`${Channel.name}\` adlı kanala taşındı.`));
    message.member.voice.channel.members.array().forEach(async(member) => await member.voice.setChannel(args[0]));
};

exports.conf = {
    commands: ["toplu-taşı", "toplutasi", "toplu-tasi", "toplu-tasi", "toplutaşı"],
    usage: "toplu-taşı <Kanal ID/tüm>",
    enabled: true
};