const { mergeConfig } = require('vite')

/**
 * Strapi runs the admin through Vite in dev. By default Vite rejects unknown
 * Host headers — e.g. 127.0.0.1 vs localhost, LAN IPs, or tunnels — which
 * can leave /admin blank (only favicon) while scripts fail to load.
 * @see https://docs.strapi.io/cms/configurations/admin-panel#trust-additional-hosts-during-development
 */
module.exports = (config) =>
  mergeConfig(config, {
    server: {
      allowedHosts: true,
    },
  })
