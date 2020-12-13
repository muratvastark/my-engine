const { StatsModel, UserModel, InviteModel, LevelModel } = require("../../Helpers/models.js");
const { MessageEmbed } = require("discord.js");
const moment = require("moment");
require("moment-duration-format");

exports.run = async(client, message, [ option ]) => {
    if (message.member.roles.highest.positon < message.guild.roles.cache.get(Moderation.Defaults.MinStaffRole).position) return;

    if (!option || !["stats", "invites", "levels", "registers"].some((_option) => option === _option))  return message.channel.send("Geçerli bir argüman girmelisin! (`levels`, `invites`, `registers` veya `stats`)");
    const Embed = new MessageEmbed().setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true })).setColor("RANDOM");

    if (option === "stats") {
        StatsModel.find({}).exec((err, data) => {
            if (!data) return message.channel.send("Üzgünüm istatistik verisi bulamadım.");

            data = data.filter((_data) => message.guild.members.cache.has(_data.Id));
            const GeneralVoice = data.sort((x, y) => y.TotalVoice - x.TotalVoice).slice(0, 5).map((_data, index) => `**\`${index + 1}.\`** <@${_data.Id}> \`${moment.duration(_data.TotalVoice).format("H [saat, ] m [dakika]")}\``).join("\n");
            const GeneralMessage = data.sort((x, y) => y.TotalMessage - x.TotalMessage).slice(0, 5).map((_data, index) => `**\`${index + 1}.\`** <@${_data.Id}> \`${_data.TotalMessage} mesaj\``).join("\n");

            const WeeklyVoice = data.sort((x, y) => {
                let xData = 0, yData = 0;
                y.Voice.forEach((_data) => yData += _data);
                x.Voice.forEach((_data) => xData += _data);
                return yData - xData;
            }).slice(0, 5).map((_data, index) => {
                let Total = 0;
                _data.Voice.forEach(x => Total += x);
                return `**\`${index + 1}.\`** <@${_data.Id}> \`${moment.duration(Total).format("H [saat, ] m [dakika]")}\``;
            }).join("\n");

            const WeeklyMessage = data.sort((x, y) => {
                let xData = 0, yData = 0;
                y.Message.forEach((_data) => yData += _data);
                x.Message.forEach((_data) => xData += _data);
                return yData - xData;
            }).slice(0, 5).map((_data, index) => {
                let Total = 0;
                _data.Message.forEach(x => Total += x);
                return `**\`${index + 1}.\`** <@${_data.Id}> \`${Total} mesaj\``;
            }).join("\n");

            message.channel.send(Embed.setDescription(`**${message.guild.name}** sunucusunun genel, haftalık mesaj ve haftalık ses istatistikleri;`)
                .addField("Genel Ses Sıralama", GeneralVoice)
                .addField("Genel Mesaj Sıralama", GeneralMessage)
                .addField("Haftalık Ses Sıralama", WeeklyVoice)
                .addField("Haftalık Mesaj Sıralama", WeeklyMessage));
        });        
    } else if (option === "invites") {
        const Invites = await InviteModel.find({}).sort({ Total: -1 }).exec();
        const ListItems = Invites.filter((data) => message.guild.members.cache.get(data.Id)).map((data, i) => `**\`${i + 1}.\`** <@${data.Id}> **\`${data.Total}\`** toplam (**\`${data.Regular}\`** gerçek, **\`${data.Fake}\`** sahte, **\`${data.Leave}\`** çıkan)`);
        if (ListItems.length < 1) return message.channel.send("Üzgünüm davet verisi bulamadım.");

        message.channel.send(Embed.setDescription([
            `**${message.guild.name}** adlı sunucunun davet listesini gösteriyorum. Bu arada sen ${Invites.find((item) => item.Id == message.author.id) ? `**${Invites.findIndex((item) => item.Id === message.author.id) + 1}.** sırasında bulunuyorsun!` : "sıralamada **bulunmuyorsun.**"}\n`,
            ListItems.slice(0, 20).join("\n")
        ]));
    } else if (option === "levels") {
        const Levels = await LevelModel.find({}).sort({ Level: -1, CurrentXP: -1 }).exec();
        const ListItems = Levels.filter((data) => message.guild.members.cache.get(data.Id)).map((data, i) => `**\`${i + 1}.\`** <@${data.Id}> • **${data.Level}** • \`${data.CurrentXP} / ${data.RequiredXP}\``);
        if (ListItems.length < 1) return message.channel.send("Üzgünüm seviye verisi bulamadım.");

        message.channel.send(Embed.setDescription([
            `**${message.guild.name}** adlı sunucunun seviye listesini gösteriyorum. Bu arada sen ${Levels.find((item) => item.Id == message.author.id) ? `**${Levels.findIndex((item) => item.Id === message.author.id) + 1}.** sırasında bulunuyorsun!` : "sıralamada **bulunmuyorsun.**"}\n`,
            ListItems.slice(0, 20).join("\n")
        ]));
    } else if (option === "registers") {
        const Members = (await UserModel.find({ Usage: { $exists: true } }).sort({ [`Usage.Man`]: -1, [`Usage.Woman`]: -1 }).exec());
        const ListItems = Members.filter((data) => message.guild.members.cache.get(data.Id)).map((data, i) => `**\`${i + 1}.\`** <@${data.Id}>: **\`${((data.Usage || {}).Man || 0) + ((data.Usage || {}).Woman || 0)}\`** toplam (**\`${(data.Usage || {}).Man || 0}\`** erkek, **\`${(data.Usage || {}).Woman || 0}\`** kadın)`);
        if (ListItems.length < 1) return message.channel.send("Üzgünüm teyitçi verisi bulamadım.");

        message.channel.send(Embed.setDescription([
            `**${message.guild.name}** adlı sunucunun teyitçi listesini gösteriyorum. Bu arada sen ${Members.find((item) => item.Id == message.author.id) ? `**${Members.findIndex((item) => item.Id === message.author.id) + 1}.** sırasında bulunuyorsun!` : "sıralamada **bulunmuyorsun.**"}\n`,
            ListItems.slice(0, 20).join("\n")
        ]));
    }

};

exports.conf = {
    commands: ["top", "t", "sıralama"],
    enabled: true,
    usage: "topstats"
};
