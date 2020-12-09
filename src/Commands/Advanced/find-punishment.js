const { MessageEmbed } = require("discord.js");
const Penal = require("../../Helpers/penal.js");

exports.run = async (Moderation, message, args) => {
    if (message.member.check() === false) return;

    if (!args[0] || !Number(args[0]) || args[0].length <= 0) return message.channel.send("Geçerli bir ID belirt!");
    const Embed = new MessageEmbed().setColor("RANDOM").setDescription("`Belirtilen ID numarasına sahip bir ceza verisi bulunamadı!`");

    const Data = await Penal.getPenal({ Id: new RegExp(args.join(" "), "g") });

    if (Data) {
        Embed.setTitle(`Ceza #${args[0]}`)
            .setDescription([
                `\`>\` **Cezalandırılan Yetkili:** <@${Data.Admin}> (\`${Data.Admin}\`)`,
                `\`>\` **Cezalandırılan Üye:** <@${Data.User}> (\`${Data.User}\`)`,
                `\`>\` **Ceza Türü:** ${Data.Type.replace("CHAT_MUTE", "CHAT MUTE").replace("VOICE_MUTE", "SES MUTE").replace("TEMP_JAIL", "SURELI JAIL")}`,
                `\`>\` **Ceza Sebebi:** ${Data.Reason}`,
                `\`>\` **Ceza Atılma Tarihi:** ${new Date(Data.Date).toTurkishFormatDate()}`,
                Data.Temporary === true ? `\`>\` **Ceza Bitiş Tarihi:** ${new Date(Data.Finish).toTurkishFormatDate()}` : ""
            ]);
    }

    message.channel.send(Embed);
};
exports.conf = {
    commands: ["cezabilgi", "ceza-bilgi", "cezasorgu", "ceza-sorgu"],
    usage: "cezabilgi [ID]",
    enabled: true
};