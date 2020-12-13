const { MessageEmbed } = require("discord.js");
const Penal = require("../../Helpers/penal.js");
const moment = require("moment");
require("moment-duration-format");

exports.run = async (Moderation, message, args) => {
    if (message.member.check() === false) return;
    const User = message.mentions.users.first() || Moderation.users.cache.get(args[0]);
    if (!User) return message.channel.send("Geçerli bir kullanıcı belirt!");

    const Embed = new MessageEmbed().setColor("RANDOM").setAuthor(User.tag, User.avatarURL({ dynamic: true }));
    const Datas = await Penal.fetchPenals({ Activity: true, User: args[0] }) || [];
    const getData = (data) => data ? [
        `\`>\` **Cezalandırılan Yetkili:** <@${data.Admin}> (\`${data.Admin}\`)`,
        `\`>\` **Cezalandırılan Üye:** <@${data.User}> (\`${data.User}\`)`,
        `\`>\` **Ceza Türü:** ${data.Type.replace("CHAT_MUTE", "CHAT MUTE").replace("VOICE_MUTE", "SES MUTE").replace("TEMP_JAIL", "SURELI JAIL")}`,
        `\`>\` **Ceza Sebebi:** ${data.Reason}`,
        `\`>\` **Ceza Atılma Tarihi:** ${new Date(data.Date).toTurkishFormatDate()}`,
        data.Temporary === true ? `\`>\` **Ceza Bitiş Tarihi:** ${new Date(data.Finish).toTurkishFormatDate()}` : ""
    ] : "Bulunamadı.";

    const JTB = Datas.filter(penal => penal.Type === "JAIL" || penal.Type === "TEMP_JAIL" || penal.Type === "BAN")[0];
    const ChatMute = Datas.filter(penal => penal.Type === "CHAT_MUTE")[0];
    const VoiceMute = Datas.filter(penal => penal.Type === "VOICE_MUTE")[0];
    Embed.addField("Cezalı Bilgisi", getData(JTB));
    Embed.addField("Chat Mute Bilgisi", getData(ChatMute));
    Embed.addField("Ses Mute Bilgisi", getData(VoiceMute));

    message.channel.send(Embed);
};
exports.conf = {
    commands: ["cezalar", "cezalarım", "penalties"],
    enabled: true,
    usage: "cezalar [Üye]"
};
