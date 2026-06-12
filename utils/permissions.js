const permissions = {
  getModerators(guild) {
    if (!process.env.MODERATOR_ROLE_IDS) {
      return new Set();
    }

    const moderatorRoleIds = process.env.MODERATOR_ROLE_IDS.split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);

    const moderators = new Set();

    guild.members.cache.forEach(member => {
      member.roles.cache.forEach(role => {
        if (moderatorRoleIds.includes(role.id)) {
          moderators.add(member.id);
        }
      });
    });

    return moderators;
  },

  isModerator(member) {
    if (!process.env.MODERATOR_ROLE_IDS) {
      return member.permissions.has('ModerateMembers');
    }

    const moderatorRoleIds = process.env.MODERATOR_ROLE_IDS.split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);

    return member.roles.cache.some(role => moderatorRoleIds.includes(role.id)) ||
           member.permissions.has('ModerateMembers');
  },

  isBotModerator(interaction) {
    return this.isModerator(interaction.member);
  },

  async canModerateUser(moderator, target) {
    // Bot can't moderate itself
    if (target.id === target.client.user.id) {
      return false;
    }

    // Can't moderate users with higher role
    if (moderator.roles.highest.position <= target.roles.highest.position) {
      return false;
    }

    return true;
  }
};

module.exports = permissions;
