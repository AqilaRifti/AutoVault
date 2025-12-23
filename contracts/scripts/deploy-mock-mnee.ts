import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying MockMNEE with account:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");

    // Get current gas price and add 20% buffer
    const feeData = await ethers.provider.getFeeData();
    const gasPrice = feeData.gasPrice ? (feeData.gasPrice * 120n) / 100n : undefined;

    console.log("\nDeploying MockMNEE...");
    const MockMNEE = await ethers.getContractFactory("MockMNEE");
    const mockMnee = await MockMNEE.deploy({ gasPrice });
    console.log("Transaction sent, waiting for confirmation...");
    await mockMnee.waitForDeployment();
    const mneeAddress = await mockMnee.getAddress();

    console.log("\n✅ MockMNEE deployed to:", mneeAddress);
    console.log("\nUpdate your frontend/src/lib/contracts/addresses.ts with this address!");
    console.log("Also update contracts/.env MNEE_ADDRESS if you want to redeploy other contracts.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
