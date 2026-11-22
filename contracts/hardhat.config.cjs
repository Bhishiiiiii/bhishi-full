require("@nomicfoundation/hardhat-toolbox");
try {
  require("dotenv").config({ path: "../server/.env" });
} catch (e) {
  // Ignore if dotenv is not yet installed
}

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org";
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  analytics: {
    enabled: false
  },
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: RELAYER_PRIVATE_KEY.startsWith("0x") ? [RELAYER_PRIVATE_KEY] : [`0x${RELAYER_PRIVATE_KEY}`],
      chainId: 11155111,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
