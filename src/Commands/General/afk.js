const { Collection, MessageEmbed } = require("discord.js");
const Afk = new Collection();
const Moment = require("moment");
Moment.locale("tr");

exports.onLoad = (Moderation) => {
    Moderation.on("message", (message) => {
        if ((!message.guild && message.channel.type === "dm") || message.author.bot || message.content.toLowerCase().startsWith(`${Moderation.Defaults.ModerationBotPrefix}afk`)) return;

        const Embed = new MessageEmbed().setColor("RANDOM");

        if (message.member.manageable && message.member.displayName.startsWith("[AFK]")) {
            message.member.setNickname(message.member.displayName.replace(/\[AFK\] ?/gi, ""));
        }

        if (Afk.has(message.author.id) && Afk.get(message.author.id)) {
            message.reply("Artık `AFK` değilsin. Tekrardan **hoş geldin!**");
            Afk.delete(message.author.id);
        }

        if (!message.content.startsWith(Moderation.Defaults.ModerationBotPrefix) && message.mentions.users.size > 1 && message.mentions.users.filter((x) => x.id !== message.author.id).some((x) => Afk.has(x.id))) {
            message.reply(Embed.setDescription("Etiketlediğin kullanıcılar şu an `AFK!`"));
            return;
        }

        if (message.mentions.members.filter((x) => x.id !== message.author.id).some((x) => Afk.has(x.id))) {
            const Member = message.mentions.users.first();
            const Data = Afk.get(Member.id) || {};
            if (!Data) return;
            message.channel.send(Embed.setDescription(`Etiketlediğin kullanıcı ${data.Reason ? `**${data.Reason}** sebebiyle AFK!` : "AFK!"} (**${Moment(data.Now).fromNow()}**)`));
        }
    });
}
    
exports.run = async (Moderation, message, args) => {
    const Reason = args.join(" ") || "";
    const InviteRegExp = /(https:\/\/)?(www\.)?(discord\.gg|discord\.me|discordapp\.com\/invite|discord\.com\/invite)\/([a-z0-9-.]+)?/i;
    const LinkRegExp = /(http[s]?:\/\/)(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/gi;

    if (InviteRegExp.test(message.content) && LinkRegExp.test(message.content) || !message.deleted) return message.channel.send("Geçerli bir sebep belirt!");
    Afk.set(message.author.id, {
        Reason: Reason.length > 0 ? Reason : null,
        Now: Date.now()
    });
    message.delete({ timeout: 200 })
    message.reply("artık AFK modundasın. Seni etiketleyenlere AFK olma sebebini bildireceğim.").then((x) => x.delete({ timeout: 5000 }));
    if (message.member.manageable && !message.member.displayName.includes("AFK") && message.member.displayName.length < 30) {
        message.member.setNickname("[AFK] " + message.member.displayName.replace(/\[AFK\] ?/g, ""));
    }
};

exports.conf = {
    commands: ["afk"],
    enabled: true,
    usage: "afk [Sebep]"
};