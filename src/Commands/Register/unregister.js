const { MessageEmbed } = require("discord.js");
const { UnregisterRoles, Tag, MinStaffRole } = global.Moderation.Defaults;
const { Register } = global.Moderation.Permissions;

exports.run = async (Moderation, message, args) => {
    if (message.member.check(Register.AuthRoles) === false) return;

    const Member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!Member || Member.id === message.member.id) return message.channel.send("Geçerli bir üye belirt.");
    if (Member.roles.highest.position >= message.guild.roles.cache.get(MinStaffRole).position) return message.channel.send("Yetkili olmayan bir üye belirt!");
    Member.setRoles(UnregisterRoles);
    Member.setNickname(`${Tag} İsim | Yaş`);
    message.channel.send(new MessageEmbed().setColor("RANDOM").setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true, size: 2048 })).setDescription(`${Member} adlı üye kayıtsıza atıldı!`));
};

exports.conf = {
    commands: ["kayıtsız", "kayitsiz"],
    enabled: true,
    usage: "kayıtsız [Üye]"
};