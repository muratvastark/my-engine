const { MessageEmbed } = require("discord.js");
const { UserModel } = require("../../Helpers/models.js");

exports.run = async (Moderation, message, args) => {
    if (message.member.check() === false) return;
    const User = message.mentions.users.first() || Moderation.users.cache.get(args[0]) || await Moderation.getUser(args[0]);
    if (!User) return message.channel.send("Geçerli bir kullanıcı belirt!");
    const Note = args.slice(1).join(" ");
    if (!Note) return message.channel.send("Geçerli bir not belirt!");

    message.channel.send(new MessageEmbed().setColor("GREEN").setAuthor(User.tag, User.avatarURL({ dynamic: true })).setDescription("Başarıyla kullanıcının notlarına eklendi."));
    UserModel.findOneAndUpdate({ Id: User.id }, { $push: { "History.Notes": { Note, Executor: message.author.id } } }, { upsert: true, new: true, setDefaultsOnInsert: true }).exec();
};
exports.conf = {
    commands: ["add-note", "notekle", "not-ekle", "ekle-not", "eklenot", "addnote"],
    enabled: true,
    usage: "add-note [Üye]"
};
