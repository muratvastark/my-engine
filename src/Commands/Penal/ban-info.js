const Penal = require("../../Helpers/penal.js");
const { MessageEmbed } = require("discord.js");

exports.run = async(Moderation, message, args) => {
    const User = await Moderation.getUser(args[0]);
    const embed = new MessageEmbed().setColor("RANDOM").setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }));

    if (!User) return message.channel.send("Geçerli bir ban yemiş kullanıcı ID'si belirtmelisin!");
    if (message.guild.members.cache.get(User.id)) return message.channel.send(embed.setDescription(`\`${User.tag}\` bu sunucuda yasaklı değil!`));
    let data = await Penal.fetchPenals({ Activity: true, User: args[0], Type: "BAN" });
    
    if (data && data.length) {
        data = data.reverse()[0];
        const Admin = await Moderation.getUser(data.Admin);
        data = {
            user: `${Admin.tag} (\`${Admin.id}\`)`,
            reason: data.Reason,
            date: data.Date
        };
    } else {
        await message.guild.fetchBan(args.join(' ')).then(({ user, reason }) => { 
            data = { 
                reason: reason || "Belirtilmemiş!" 
            };
        }).catch(() => data = null);
    }

    if (data) {
        embed.setDescription([
            `:mag_right: ${User.tag} (\`${User.id}\`) adlı kullanıcı:\n`,
            `${data.date ? `${data.user} tarafından "${data.reason}" sebebiyle ${new Date(data.date).toTurkishFormatDate()} tarihinde sunucudan atılmış.`: `"${data.reason}" sebebiyle sunucudan atılmış.`}`
        ]);
    } else embed.setDescription(":no_entry_sign: Belirtilen ID numarasına sahip bir ban bulunamadı!");
    message.channel.send(embed);
};

exports.conf = {
    commands: ["ban-info", "baninfo", "banbilgi", "ban-bilgi"],
    enabled: true,
    usage: "ban-info [ID]"
};