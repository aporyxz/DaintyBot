const validator = {
  isValidUser(user) {
    return user && user.id && !user.bot;
  },

  isValidDuration(durationStr) {
    const match = durationStr.match(/^(\d+)([smhd])$/i);
    return !!match;
  },

  parseDuration(durationStr) {
    const match = durationStr.match(/^(\d+)([smhd])$/i);
    if (!match) return null;

    const amount = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    const multipliers = {
      's': 1000,
      'm': 60 * 1000,
      'h': 60 * 60 * 1000,
      'd': 24 * 60 * 60 * 1000,
    };

    return amount * (multipliers[unit] || 0);
  },

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  },

  validateBulkUserCount(users) {
    if (!Array.isArray(users)) return false;
    return users.length > 0 && users.length <= 20;
  },

  validateReason(reason, maxLength = 512) {
    return reason && reason.length > 0 && reason.length <= maxLength;
  },

  isValidChannelId(channelId) {
    return /^\d{18,19}$/.test(channelId);
  },

  isValidRoleId(roleId) {
    return /^\d{18,19}$/.test(roleId);
  },

  isValidUserId(userId) {
    return /^\d{18,19}$/.test(userId);
  }
};

module.exports = validator;
