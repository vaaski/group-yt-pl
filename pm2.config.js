module.exports = {
  apps: [
    {
      script: "./lib/index.js",
      name: "group-yt-pl",
      node_args: "-r dotenv/config",
    },
  ],
}
