const { Client, Guild } = require("discord.js");
const Guard = new Client();
const Settings = require("../global.json").Guard;
const { Status, Developers } = require("../global.json").Defaults;
const PermArray = ["ADMINSTRATOR", "KICK_MEMBERS", "MANAGE_GUILD", "BAN_MEMBERS", "MANAGE_ROLES", "MANAGE_WEBHOOKS", "MANAGE_NICKNAMES", "MANAGE_CHANNELS"];

Guard.once("ready", () => {
  Guard.user.setPresence({ name: Status, type: "WATCHING" });
  console.log(`[GUARD] ${Guard.user.tag} is online!`);
});

Guard.on("channelCreate", async(channel) => {
  if (await channel.guild.checkLog("CHANNEL_CREATE", true) === true) return;
  if (!channel.deleted) channel.delete();
});

Guard.on("channelUpdate", async(oldChannel, newChannel) => {
  if ((await oldChannel.guild.checkLog("CHANNEL_OVERWRITE_UPDATE", true) === true) || (await oldChannel.guild.checkLog("CHANNEL_UPDATE", true) === true)) return;
  newChannel.edit({ ...oldChannel }); 
});

Guard.on("roleCreate", async (role) => {
  if (await role.guild.checkLog("ROLE_CREATE", true) === true) return;
  if (!role.deleted) role.delete();
});

Guard.on("roleUpdate", async(oldRole, newRole) => {
  if (await oldRole.guild.checkLog("ROLE_UPDATE", true) === true) return;
  newRole.edit({ ...oldRole });
});

Guard.on("guildUpdate", async(oldGuild, newGuild) => {
  if (await oldGuild.checkLog("GUILD_UPDATE", true) === true) return;
  await newGuild.edit({ name: oldGuild.name, icon: oldGuild.iconURL({ dynamic: true }), banner: oldGuild.bannerURL() });
});

Guard.on("guildBanAdd", async (guild, user) => {
  if (await oldGuild.checkLog("MEMBER_BAN_ADD", true) === true) return;
  guild.members.unban(user.id).catch(console.error);
});

Guard.on("guildMemberAdd", async(member) => {
  if (!member.user.bot) return;
  member.kick().catch(console.error);
  await member.guild.checkLog("MEMBER_KICK", true);
});

Guard.on("guildMemberUpdate", async(oldMember, newMember) => {
  if (newMember._roles === oldMember._roles) return;
  const Roles = newMember.roles.cache.filter((_role) => !oldMember.roles.cache.has(_role.id) && PermArray.some((_perm) => role.permissions.toArray().includes(_perm)));
  if(Roles.size === 0) return;
  await member.guild.checkLog("MEMBER_ROLE_UPDATE", true);
});

Guard.on("guildMemberRemove", async(member) => await member.guild.checkLog("MEMBER_KICK", true));

Guard.on("webhookUpdate", async(channel) => {
  if (await channel.guild.checkLog("WEBHOOK_CREATE") === true) return;
  await channel.fetchWebhooks().then(_hooks => _hooks.forEach((_hook) => _hook.delete())).catch(console.error);
});

Guard.login(Settings.Token).catch(console.error);

Guild.prototype.checkLog = async function(type, close = false) {
  const Log = await this.fetchAuditLogs({ limit: 1, type }).then((_audit) => _audit.entries.first());
  if (!Log) return true;
  const Id = Log.executor.id;
  if ((Id === Guard.user.id || this.ownerID === Id || Settings.SafePersons.includes(Id) || Developers.includes(Id)) || Date.now() - Log.createdTimestamp > 5000) return true;
  const Member = await this.members.fetch(Id);
  if (Member) Member.kick().catch(console.error);
  if (close === true) {
    this.roles.cache.filter((_role) => _role.managed && _role.position < this.me.roles.highest.position && PermArray.some((_perm) => _role.permissions.toArray().includes(_perm))).forEach(async (_role) => await _role.setPermissions(role.permissions.toArray().filter((_perm) => !PermArray.includes(_perm))).catch(console.error));
  }
  return false;
}
