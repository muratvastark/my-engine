const { MinStaffRole, Prefix } = global.Moderation.Defaults;
const { StatsModel, InviteModel } = require("../../Helpers/models.js");
const { MessageEmbed, Util } = require("discord.js");
const moment = require("moment");
require("moment-duration-format");

exports.run = async (Moderation, message, args) => {
    if (message.guild.ownerID !== message.author.id && !Moderation.Defaults.Developers.includes(message.author.id)) return;
    const Embed = new MessageEmbed().setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true })).setColor("RANDOM");
    const Options = message.guild.roles.cache.filter(role => role.members.size > 2 && role.position >= message.guild.roles.cache.get(MinStaffRole).position).map(role => role.name.toLowerCase()).concat("all");
    const Option = args.join(" ").split("--")[1];
    if (!Option || !Options.includes(Option)) return message.channel.send(Embed.setDescription(`Geçerli bir argüman belirt!\n\n${Options.map((opt) => `\`${Prefix}staff-stats --${opt}\``).join("\n")}`));

    let RoleMembers;
    if (Option === "all") RoleMembers = message.guild.members.cache.filter((member) => !member.user.bot && member.roles.highest.position >= message.guild.roles.cache.get(MinStaffRole).position).array();
    else RoleMembers = message.guild.roles.cache.find(_role => _role.name.toLowerCase() === Option).members.filter((member) => !member.user.bot).array();

    const Message = [];

    for (const Member of RoleMembers) {
        let MessageTotal = 0, VoiceTotal = 0;
        const Data = await StatsModel.findOne({ Id: Member.id });
        if (Data) {
            Data.Voice.forEach((value) => VoiceTotal += value);
            Data.Message.forEach((value) => MessageTotal += value);         
        }
        const UserInvite = (await InviteModel.find({ Inviter: Member.id })).filter((_data) => !_data.Fake && message.guild.members.cache.get(_data.Id) && Date.now() - message.guild.members.cache.get(_data.Id).joinedTimestamp < 1000*60*60*24*7);
        Message.push(`\`>\` <@${Member.id}>: \`${moment.duration(VoiceTotal).format("H [saat, ] m [dk.]")}\` **|** \`${MessageTotal} mesaj\` **|** \`${UserInvite.length || 0} invite\``);
    }

    const arr = Util.splitMessage(Message, { maxLength: 2000, char: "\n" });
    Embed.addField("** **", `Yukarıdaki bilgiler **${message.guild.name}** sunucusunun **${Option === "all" ? "genel" : `${message.guild.roles.cache.find(_role => _role.name.toLowerCase() === Option).toString()}  rolünün`}** haftalık mesaj, haftalık ses ve haftalık invite istatistikleridir.`);
    for (const newText of arr) {
        Embed.setDescription(newText);
        message.channel.send(Embed);
    }
    
};

exports.conf = {
    commands: ["staff-stats", "yetkili-stats", "yt-stats"],
    enabled: true,
    usage: "staff-stats [Rol İsim]"
};
