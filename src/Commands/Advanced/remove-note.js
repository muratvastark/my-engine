const { MessageEmbed } = require("discord.js");
const { UserModel } = require("../../Helpers/models.js");

exports.run = async (Moderation, message, [user, id]) => {
    if (message.member.check() === false) return;
    const User = message.mentions.users.first() || Moderation.users.cache.get(user) || await Moderation.getUser(user);
    if (!User) return message.channel.send("Geçerli bir kullanıcı belirt!");

    UserModel.findOne({ Id: User.id }, (err, data) => {
        if (err | !data || !data.History.Notes.length) return message.channel.send("Belirtilen kullanıcının notu bulunmamaktadır.");
        if (id === "all" || id === "tüm") {
            data.History.Notes = [];
            data.save();
            return message.channel.send(new MessageEmbed().setColor("GREEN").setAuthor(User.tag, User.avatarURL({ dynamic: true })).setDescription("Başarıyla kullanıcının notları silindi."));
        }
        if (!id || !Number(id) || Number(id) < 0 || Number(id) > data.length) return message.channel.send("Geçerli bir not idsi belirt.");
        data.History.Notes = arrayDeleteValue(Number(id)-1, data.History.Notes);
        data.save();

        message.channel.send(new MessageEmbed().setColor("GREEN").setAuthor(User.tag, User.avatarURL({ dynamic: true })).setDescription("Başarıyla kullanıcının notlarından silindi."));
    });
};

exports.conf = {
    commands: ["remove-note", "notkaldır", "not-kaldır", "kaldır-not", "kaldırnot", "removenote"],
    enabled: true,
    usage: "remove-note [Üye] [Id/all]"
};

function arrayDeleteValue(index, array) {
    const result = [];
    array.forEach((item, i) => {
        if (index !== i) result.push(item);
    });

    return result;
} 
