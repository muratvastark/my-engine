const { MessageEmbed } = require("discord.js");
const Penal = require("../../Helpers/penal.js")
const { ChatMute } = global.Moderation.Permissions;

exports.run = async (Moderation, message, args) => {
    if (message.member.check(ChatMute.AuthRoles) === false) return;
    
    const Member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || (await Moderation.getUser(args[0]));
    if (!Member) return message.channel.send("Geçerli bir üye belirt!");

    const data = await Penal.fetchPenals({ Activity: true, User: Member.id, Type: "CHAT_MUTE" }, 1);

    if ((Member.roles && !Member.roles.cache.has(ChatMute.Role)) && !data.length) return message.channel.send(":no_entry_sign: Belirttiğin kullanıcının metin kanallarında susturması bulunmamaktadır.");

    if (data.length) await Penal.inactiveUserPenals(Member.id, "CHAT_MUTE", true);
    if (Member.roles && Member.roles.cache.has(ChatMute.Role)) Member.roles.remove(ChatMute.Role).catch(console.error);

    const Channel = Moderation.channels.cache.get(ChatMute.Channel);
    const Embed = new MessageEmbed().setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }));

    if (Channel) Channel.send(Embed.setColor("GREEN").setDescription(`${Member} kişinin metin kanallarındaki susturulması ${message.author} tarafından **kaldırıldı.**`));
    message.channel.send(Embed.setColor("RANDOM").setDescription(`${Member} kullanıcısının susturulması başarı ile kaldırıldı!`));
};

exports.conf = {
    commands: ["unmute", "chatunmute"],
    enabled: true,
    usage: "unmute [Üye]"
};