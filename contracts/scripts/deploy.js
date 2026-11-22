const hre = require("hardhat");

async function main() {
  console.log("Starting BishiTrustLedger deployment to Ethereum Sepolia...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer ? deployer.address : "Default Relayer");

  const relayerAddress = process.env.RELAYER_ADDRESS || (deployer ? deployer.address : "0x0000000000000000000000000000000000000000");

  const BishiTrustLedger = await hre.ethers.getContractFactory("BishiTrustLedger");
  const contract = await BishiTrustLedger.deploy(relayerAddress);

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("====================================================");
  console.log("BishiTrustLedger deployed successfully!");
  console.log("Network: Ethereum Sepolia (Chain ID: 11155111)");
  console.log("Contract Address:", contractAddress);
  console.log("Relayer Address:", relayerAddress);
  console.log("====================================================");
  console.log("\nUpdate your server/.env with:");
  console.log(`LEDGER_CONTRACT_ADDRESS="${contractAddress}"`);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
