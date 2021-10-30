const { Client, Guild } = require("discord.js");
const settings = require("../global.json").Guard;

const client = new Client();
const permissions = ["ADMINSTRATOR", "KICK_MEMBERS", "MANAGE_GUILD", "BAN_MEMBERS", "MANAGE_ROLES", "MANAGE_WEBHOOKS", "MANAGE_NICKNAMES", "MANAGE_CHANNELS"];
let limits = [];

client.on("roleCreate", async(role) => await role.guild.checkLog());
client.on("roleDelete", async(role) => await role.guild.checkLog());
client.on("roleUpdate", async(oldRole) => await oldRole.guild.checkLog());
client.on("channelCreate", async(channel) => await channel.guild.checkLog());
client.on("channelDelete", async(channel) => await channel.guild.checkLog());
client.on("channelUpdate", async(oldChannel) => await oldChannel.guild.checkLog());
client.on("guildUpdate", async(oldGuild) => await oldGuild.checkLog());
client.on("guildBanAdd", async(guild) => await guild.checkLog());
client.on("guildMemberRemove", async(member) => await member.guild.checkLog());
client.on("guildMemberAdd", async(member) => await member.guild.checkLog());

client.on("guildMemberUpdate", async(oldMember, newMember) => {
    if (oldMember._roles === newMember._roles) return;
    const changedRoles = newMember.roles.cache.filter((role) => !oldMember.roles.cache.has(role.id) && permissions.some((perm) => role.permissions.toArray().includes(perm)));
    if(changedRoles.size !== 0) await oldMember.guild.checkLog();
});

client.on("voiceStateUpdate", (oldState, newState) => {
  if (oldState.channelID && !newState.channelID) await oldMember.guild.checkLog();
});

Guild.prototype.checkLog = async function() {
    const audit = await this.fetchAuditLogs({ limit: 1 }).then((audit) => audit.entries.first());
    const now = Date.now();
    if (!audit || now - audit.createdTimestamp > 5000) return true;

    limits = limits.filter(limit => now - limit.timestamp > 1000 * 60 * 15);
    limits.push({ user: audit.executor.id, timestamp: audit.createdTimestamp, type: audit.actionType });

    const userLimits = limits.filter(limit => now - limit.timestamp < 1000 * 60 * 15 && limit.user === audit.executor.id && limit.type === audit.actionType);
    if (userLimits > 5) this.guild.members.kick(audit.executor.id).catch(() => undefined));
};

client.login(Settings.Token).then(() => console.log(`${client.user.tag} is online!`));
