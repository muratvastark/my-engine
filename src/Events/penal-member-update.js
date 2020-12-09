const { PenalModel } = require("../Helpers/models.js");
const { Jail, ChatMute } = global.Moderation.Permissions;

exports.execute = (oldMember, newMember) => {
    if (!newMember && oldMember.roles.cache.size == newMember.roles.cache.size) return;
    const ChangedRoles = oldMember.roles.cache.filter((e) => !newMember.roles.cache.some((c) => c.id === e.id)).some((e) => e.id === ChatMute.Role || e.id === Jail.Role);
    if (!ChangedRoles) return;

    PenalModel.find({ User: oldMember.id, Activity: true, Complated: false, $or: [{ Type: "CHAT_MUTE" }, { Type: "JAIL" }, { Type: "TEMP_JAIL" }] }, (err, data) => {
        if (!data || !data.length || err) return;
        data.forEach((punish) => {
            if (punish.Type === "CHAT_MUTE" && !newMember.roles.cache.has(ChatMute.Role)) newMember.roles.add(ChatMute.Role);
            else if ((punish.Type === "JAIL" || punish.Type === "TEMP_JAIL") && !newMember.roles.cache.has(Jail.Role)) newMember.setRoles(Jail.Role);
        });
    });
};

exports.conf = {
    event: "guildMemberUpdate",
    enabled: true
};