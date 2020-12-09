const { MessageEmbed } = require("discord.js");
const { UserModel } = require("../../Helpers/models.js");
const moment = require("moment");
require("moment-duration-format");
moment.locale("tr")

exports.run = async (Moderation, message, args) => {
    if (message.member.check(Moderation.Permissions.Register.AuthRoles) === false) return;

    const User = message.mentions.users.first() || Moderation.users.cache.get(args[0]) || await Moderation.getUser(args[0]);
    if (!User) return message.channel.send("Geçerli bir üye belirt!");

    const History = (await UserModel.findOne({ Id: User.id }).exec()) || { History: { Names: [] } };
    if (History.History.Names) History.History.Names.reverse();

    message.channel.send(new MessageEmbed().setColor("RANDOM").setAuthor(User.tag, User.avatarURL({ dynamic: true })).setDescription(History.History.Names.length <= 0 ? "Bu üyeye ait hiçbir isim kaydı yok!" : History.History.Names.map((x) => `**${x.Name}** \`|\` **${moment(x.Date).tz("Europe/Istanbul").format("YYYY Do MMMM dddd (hh:mm)")}** \`|\` **${x.Reason}**`)))
};

exports.conf = {
    commands: ["isimler", "nicks", "names", "geçmiş", "isimgeçmişi"],
    enabled: true,
    usage: "isimler [Üye]"
};