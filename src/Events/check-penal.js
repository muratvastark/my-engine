const { MessageEmbed } = require("discord.js");
const { ChatMute, Jail, VoiceMute } = global.Moderation.Permissions;

exports.execute = () => {
    setInterval(() => {
        checkPenal();
    }, 4000);
};

exports.conf = {
    event: "ready",
    enabled: true
};

function checkPenal() {
    const { PenalModel } = require("../Helpers/models.js");
    const Moderation = global.Moderation;
    const Guild = Moderation.guilds.cache.first();
    PenalModel.find({ Activity: true }, async (err, docs) => {
        if (err || !docs || !docs.length) return;
        docs.filter((Penal) => Penal.Temporary === true && Penal.Complated === false && Date.now() < Penal.Finish).forEach((doc) => {
            const Member = Guild.members.cache.get(doc.User);
            if (!Member) return;
            if (doc.Type === "CHAT_MUTE" && !Member.roles.cache.has(ChatMute.Role)) Member.roles.add(ChatMute.Role);
            if (doc.Type === "TEMP_JAIL" && !Member.roles.cache.has(Jail.Role)) Member.setRoles(Jail.Role);
            if (doc.Type === "VOICE_MUTE" && Member.voice.channelID && !Member.voice.serverMute) Member.voice.setMute(true);
        });

        docs.filter((Penal) => Penal.Temporary === true && Penal.Complated === false && Date.now() > Penal.Finish).forEach(async (Penal) => {
            let Member = await Guild.members.cache.get(Penal.User);
            let Admin = Guild.members.cache.get(Penal.Admin).user;
            if (!Member) Member = await Moderation.getUser(Penal.User);
            if (!Admin)  Admin =await Moderation.getUser(Penal.Admin);
            const Embed = new MessageEmbed().setAuthor(Admin.tag, Admin.avatarURL({ dynamic: true })).setColor("GREEN");
            const Channel = Moderation.channels.cache.get(Penal.Type.replace("CHAT_MUTE", ChatMute.Channel).replace("TEMP_JAIL", Jail.Channel).replace("VOICE_MUTE", VoiceMute.Channel));

            Penal.Complated = true;
            if (Penal.Type === "CHAT_MUTE") {
                if (Member.roles && Member.roles.cache.has(ChatMute.Role)) Member.roles.remove(ChatMute.Role);
                Embed.setDescription(`${Member} (\`${Member.id}\`) üyesinin ${Moderation.timeTR(Penal.Finish - Penal.Date)} sürelik metin kanallarındaki susturulması otomatik olarak kaldırıldı.\n\n**• Chat Mute Atılma:** \`${new Date(Penal.Date).toTurkishFormatDate()}\`\n**• Chat Mute Bitiş:** \`${new Date(Penal.Finish).toTurkishFormatDate()}\`\n**• Chat Mute Sebebi:** \`${Penal.Reason}\``);
            } else if (Penal.Type === "TEMP_JAIL") {
                if (Member.roles && Member.roles.cache.has(Jail.Role)) Member.setRoles(Penal.Jail_Roles);
                Embed.setDescription(`${Member} (\`${Member.id}\`) üyesinin ceza süresi dolduğu için otomatik olarak kaldırıldı.`);
            } else if (Penal.Type === "VOICE_MUTE") {
                if (Member.voice.channelID && Member.voice.serverMute) Member.voice.setMute(false);
                else Penal.Complated = false;
                Embed.setDescription(`${Member} (\`${Member.id}\`) üyesinin ses kanallarında bulunan ${Moderation.timeTR(Penal.Finish - Penal.Date)} sürelik susturulması ${Member.voice.channel ? "kaldırıldı." : "kaldırılamadı. Üye sese bağlanınca kaldırılacak."}\n\n**• Mute Atılma:** \`${new Date(Penal.Date).toTurkishFormatDate()}\` \n**• Mute Bitiş:** \`${new Date(Penal.Finish).toTurkishFormatDate()}\`\n**• Sebep:** \`${Penal.Reason}\``);
            }

            Penal.Activity = false;
            Penal.save();
            Channel.send(Embed);
        });
    });
}
