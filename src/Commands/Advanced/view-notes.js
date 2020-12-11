const { MessageEmbed, Util } = require("discord.js");
const { UserModel } = require("../../Helpers/models.js");

exports.run = async (Moderation, message, [ user, id ]) => {
    if (message.member.check() === false) return;
    const User = message.mentions.users.first() || Moderation.users.cache.get(user) || await Moderation.getUser(user);
    if (!User) return message.channel.send("Geçerli bir kullanıcı belirt!");

    UserModel.findOne({ Id: User.id }, (err, data) => {
        if (err | !data || !data.History.Notes.length) return message.channel.send("Belirtilen kullanıcının notu bulunmamaktadır.");
        
        const Message = [];
        data.History.Notes.forEach((item, i) => Message.push(`**\`${i+1}.\`** <@${item.Executor}>: ${item.Note}`));
        const Embed = new MessageEmbed().setColor("GREEN").setAuthor(User.tag, User.avatarURL({ dynamic: true }));
        const arr = Util.splitMessage(Message, { maxLength: 2000, char: "\n" });
        for (const newText of arr) {
            Embed.setDescription(newText);
            message.channel.send(Embed);
        }
    });
};
exports.conf = {
    commands: ["show-notes", "view-notes", "notlar", "not-göster", "notes"],
    enabled: true,
    usage: "notes [Üye]"
};
