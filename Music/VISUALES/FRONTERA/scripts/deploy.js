import hre from "hardhat";

async function main() {
  console.log("🤖 Starting C5-REAL Smart Contract Deployment Suite...");

  // 1. Deploy the ERC-6551 Registry
  const Registry = await hre.ethers.getContractFactory("FronteraERC6551Registry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log(`✅ Deployed: FronteraERC6551Registry -> ${registryAddress}`);

  // 2. Deploy the Account Implementation
  const Account = await hre.ethers.getContractFactory("FronteraERC6551Account");
  const account = await Account.deploy();
  await account.waitForDeployment();
  const accountAddress = await account.getAddress();
  console.log(`✅ Deployed: FronteraERC6551Account (Implementation) -> ${accountAddress}`);

  // 3. Deploy the main Agent NFT contract
  const baseURI = "ipfs://placeholder_cid/";
  const AgentNFT = await hre.ethers.getContractFactory("FronteraAgentNFT");
  const nft = await AgentNFT.deploy(
    "FRONTERA // AGENTIC",
    "FRONTERA",
    baseURI,
    registryAddress,
    accountAddress
  );
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log(`✅ Deployed: FronteraAgentNFT -> ${nftAddress}`);

  console.log("\n========================================================================");
  console.log("🎉 SUCCESS: DEPLOYMENT STAGE COMPLETED");
  console.log(`• Registry:     ${registryAddress}`);
  console.log(`• Account Impl: ${accountAddress}`);
  console.log(`• Agent NFT:    ${nftAddress}`);
  console.log("========================================================================");
  console.log("Next Step: run generation script to create visual traits and metadata.");
  console.log("Run: python3 art_generator/generate.py");
  console.log("========================================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
