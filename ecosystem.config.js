module.exports = {
  apps: [
    {
      name: "meet",
      script: "./dist/server.js",
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }
  ]
};
