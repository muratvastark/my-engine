const { MessageEmbed } = require("discord.js")
const { UnregisterRoles } = global.Moderation.Defaults;
const { Register } = global.Moderation.Permissions;

exports.run = async (Moderation, message, args) => {
    if (message.member.check(Register.AuthRoles) === false) return;

    const Member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!Member || Member.user.bot || Member.id === message.author.id) return message.channel.send("Geçerli bir üye belirt!");
    if (message.member.check() === false && (!Member.manageable || !UnregisterRoles.some((role) => Member.roles.cache.has(role)))) return message.channel.send("Kayıtsız olan bir üye belirt!");
    message.channel.send(new MessageEmbed().setColor("RANDOM").setDescription(`${Member} üyesi başarıyla \`${Member.voice.channel.name}\` ses kanalından çıkarıldı!`));
    if (Member.voice.channelID) Member.voice.kick();
};

exports.conf = {
    commands: ["kes", "bağlantıkes", "siktir"],
    enabled: true,
    usage: "kes [Üye]"
};
