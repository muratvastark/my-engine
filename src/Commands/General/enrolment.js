const { MessageEmbed } = require("discord.js");
const moment = require("moment");
require("moment-timezone");
const { PenalModel } = require("../../Helpers/models.js");

exports.run = async (Moderation, message, args) => {
    const Member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || (await Moderation.getUser(args[0]));
    if (!Member) return message.channel.send("Geçerli birini belirtmelisin.");

    PenalModel.find({ User: Member.id }, async (err, res) => {
        if (err || !res || !res.length) return message.channel.send("Belirtilen kullanıcının sicil bilgisi bulunmamaktadır.");
        res = res.reverse();
        const Embed = new MessageEmbed().setColor("RANDOM");

        const NewMessage = await message.channel.send(Embed.setDescription([
            res.length > 10 ? `Bu kullanıcının toplam ${res.length} cezası bulunmaktadır. Son 10 ceza şu anda gösterilmekte. Tüm ceza IDlerini görmek istiyorsanız tepkiye basın. Tekil bir cezaya bakmak için \`${Moderation.Defaults.ModerationBotPrefix}ceza id\` yazınız.\n` : `${Member} kullanıcısının sicili;\n`,
            `${res.map((e) => `\`${e.Activity === true && e.Complated === false ? "✅" : "❌"}\` - **[${e.Type.replace("CHAT_MUTE", "CHAT MUTE").replace("VOICE_MUTE", "SES MUTE").replace("TEMP_JAIL", "SURELI JAIL")}]** \`${moment(e.Date).tz("Europe/Istanbul").format("YYYY.MM.DD / HH:mm")}\` tarihinde <@${e.Admin}> tarafından **${e.Reason}** nedeniyle cezalandırıldı. (\`#${e.Id}\`)`).slice(0, 10).join("\n")}`
        ]));
        if (res.length > 10) await NewMessage.react("🚫");

        const Collector = await NewMessage.createReactionCollector((reaction, user) => reaction.emoji.name === "🚫" && user.id === message.author.id, { max: 1, time: 25000 });

        Collector.on("collect", () => {
            NewMessage.reactions.removeAll();
            NewMessage.edit(Embed.setDescription(`Bir cezaya bakmak için \`${Moderation.Defaults.ModerationBotPrefix}ceza id\` yazınız.\n\n${res.map((e) => `\`${e.Id}\``).join(", ")}`));
        });

        Collector.on("end", () => Collector.stop());
    });
};

exports.conf = {
    commands: ["sicil"],
    enabled: true,
    usage: "sicil [Üye]"
};