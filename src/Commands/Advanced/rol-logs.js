const { MessageEmbed } = require("discord.js");
const { UserModel } = require("../../Helpers/models.js")
const moment = require("moment");
require("moment-duration-format");

exports.run = async (Moderation, message, args) => {
    if (message.member.check() === false) return;
    const User = message.mentions.users.first() || Moderation.users.cache.get(args[0]) ;
    if (!User) return message.channel.send(`${message.author}, lütfen bir üye belirt.`);
    const History = (await UserModel.findOne({ Id: User.id }).exec()) || { History: { RoleLogs: [] } };

    if (History.History.RoleLogs.length) {
	    const liste =  History.History.RoleLogs.map((res) => `\`[${moment(res.Date).format("DD/MM hh:mm")}, ${res.Type}]\` <@${res.Executor}>: <@&${res.Role}>`).reverse();
	    let page = 1;
	    const Embed = new MessageEmbed().setAuthor(User.tag, User.avatarURL({ dynamic: true })).setColor("RANDOM");
	    const msg = await message.channel.send(Embed.setDescription(`${liste.slice(page == 1 ? 0 : page * 10 - 10, page * 10).join("\n")}`));

	    if (History.History.RoleLogs.length < 11) return; 
        await msg.react("◀");
        await msg.react("▶");

        const Collector = msg.createReactionCollector((react, user) => ["◀", "▶"].some(e => e == react.emoji.name) && user.id == message.member.id, { time: 200000 });

        Collector.on("collect", async (react) => {
            await react.users.remove(message.author.id).catch(() => undefined);
            if (react.emoji.name == "▶") {
                if (liste.slice((page + 1) * 10 - 10, (page + 1) * 10).length <= 0) return;
                page += 1;
                let newList = liste.slice(page == 1 ? 0 : page * 10 - 10, page * 10).join("\n");
                msg.edit(Embed.setDescription(newList));
            }
            if (react.emoji.name == "◀") {
                if (liste.slice((page - 1) * 10 - 10, (page - 1) * 10).length <= 0) return;
                page -= 1;
                let newList = liste.slice(page == 1 ? 0 : page * 10 - 10, page * 10).join("\n");
                msg.edit(Embed.setDescription(newList));
            }
        });
        Collector.on("end", () => Collector.stop())
    } else message.channel.send("Belirtilen kullanıcının rol log bilgileri bulunamadı.")
};

exports.conf = {
    commands: ["rollogs", "rol-log", "rollog", "rol-logs"],
    enabled: true,
    usage: "rollog [Üye]"
};
