const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Desplegando HabiTechDocumentNFT...");

  // Obtener el deployer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Desplegando con la cuenta:", deployer.address);
  console.log("💰 Balance de la cuenta:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Deploy del contrato
  const HabiTechDocumentNFT = await ethers.getContractFactory("HabiTechDocumentNFT");
  const contract = await HabiTechDocumentNFT.deploy();
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✅ HabiTechDocumentNFT desplegado en:", contractAddress);
  console.log("🔗 Ver en explorador:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  
  // Verificar configuración inicial
  console.log("\n📊 Configuración inicial:");
  console.log("   - Owner:", await contract.owner());
  console.log("   - Name:", await contract.name());
  console.log("   - Symbol:", await contract.symbol());
  console.log("   - Total Minted:", await contract.totalMinted());

  console.log("\n💾 Guarda esta dirección en tu .env:");
  console.log(`NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=${contractAddress}`);
  
  console.log("\n🎉 Deploy completado exitosamente!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error en el deploy:", error);
    process.exit(1);
  });
