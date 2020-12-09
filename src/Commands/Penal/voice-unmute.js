const { MessageEmbed } = require("discord.js");
const Penal = require("../../Helpers/penal.js");
const { VoiceMute } = global.Moderation.Permissions;

exports.run = async (Moderation, message, args) => {
    if (message.member.check(VoiceMute.AuthRoles) === false) return;
    const Member = message.mentions.members.first() || message.guild.member(args[0]) || (await Moderation.getUser(args[0]));
    if (!Member) return message.channel.send("Geçerli bir üye belirt!");

    const data = await Penal.fetchPenals({ Activity: true, User: Member.id, Type: "VOICE_MUTE" }, 1);
    if (Member.voice && Member.voice.channelID && !Member.voice.serverMute && !data) return message.channel.send(":no_entry_sign: Belirttiğin kullanıcının metin kanallarında susturması bulunmamaktadır.");

    if (Member.voice && Member.voice.channelID) {
        if (Member.voice.serverMute) Member.voice.setMute(false).catch(console.error);
        if (data.length > 0) await Penal.inactiveUserPenals(Member.id, "VOICE_MUTE", true);
    } else if (data.length > 0) await Penal.inactiveUserPenals(Member.id, "VOICE_MUTE", false);

    const Channel = Moderation.channels.cache.get(VoiceMute.Channel);
    const Embed = new MessageEmbed().setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }));
    if (Channel) Channel.send(Embed.setColor("GREEN").setDescription(`${Member} kişinin metin kanallarındaki susturulması ${message.author} tarafından **kaldırıldı.**`));
    message.channel.send(Embed.setColor("RANDOM").setDescription(`${Member} kullanıcısının susturulması başarı ile kaldırıldı!`));
};

exports.conf = {
    commands: ["unvoicemute", "unvmute", "unvmute"],
    enabled: true,
    usage: "unvmute [Üye]"
};