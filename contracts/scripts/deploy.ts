import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");

    // Get current gas price and add 20% buffer for faster confirmation
    const feeData = await ethers.provider.getFeeData();
    const gasPrice = feeData.gasPrice ? (feeData.gasPrice * 120n) / 100n : undefined;
    console.log("Using gas price:", gasPrice ? ethers.formatUnits(gasPrice, "gwei") + " gwei" : "auto");

    // Get MNEE address from env or deploy mock
    let mneeAddress = process.env.MNEE_ADDRESS;

    if (!mneeAddress || mneeAddress === "") {
        console.log("\nDeploying MockMNEE for testing...");
        const MockMNEE = await ethers.getContractFactory("MockMNEE");
        const mockMnee = await MockMNEE.deploy();
        await mockMnee.waitForDeployment();
        mneeAddress = await mockMnee.getAddress();
        console.log("MockMNEE deployed to:", mneeAddress);
    } else {
        console.log("\nUsing existing MNEE at:", mneeAddress);
    }

    // Deploy SmartVault
    console.log("\nDeploying SmartVault...");
    const SmartVault = await ethers.getContractFactory("SmartVault");
    const smartVault = await SmartVault.deploy(mneeAddress, { gasPrice });
    console.log("Transaction sent, waiting for confirmation...");
    await smartVault.waitForDeployment();
    const smartVaultAddress = await smartVault.getAddress();
    console.log("SmartVault deployed to:", smartVaultAddress);

    // Deploy GoalLocker
    console.log("\nDeploying GoalLocker...");
    const GoalLocker = await ethers.getContractFactory("GoalLocker");
    const goalLocker = await GoalLocker.deploy(mneeAddress, { gasPrice });
    console.log("Transaction sent, waiting for confirmation...");
    await goalLocker.waitForDeployment();
    const goalLockerAddress = await goalLocker.getAddress();
    console.log("GoalLocker deployed to:", goalLockerAddress);

    // Deploy DCAExecutor (with zero address for swap router in demo)
    console.log("\nDeploying DCAExecutor...");
    const swapRouter = process.env.UNISWAP_ROUTER || ethers.ZeroAddress;
    const DCAExecutor = await ethers.getContractFactory("DCAExecutor");
    const dcaExecutor = await DCAExecutor.deploy(mneeAddress, swapRouter, { gasPrice });
    console.log("Transaction sent, waiting for confirmation...");
    await dcaExecutor.waitForDeployment();
    const dcaExecutorAddress = await dcaExecutor.getAddress();
    console.log("DCAExecutor deployed to:", dcaExecutorAddress);

    // Save deployment addresses
    const deployments = {
        network: (await ethers.provider.getNetwork()).name,
        chainId: Number((await ethers.provider.getNetwork()).chainId),
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            mnee: mneeAddress,
            smartVault: smartVaultAddress,
            goalLocker: goalLockerAddress,
            dcaExecutor: dcaExecutorAddress,
        },
    };

    const deploymentsPath = path.join(__dirname, "..", "deployments.json");
    fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
    console.log("\nDeployment addresses saved to:", deploymentsPath);

    console.log("\n=== Deployment Summary ===");
    console.log("MNEE Token:", mneeAddress);
    console.log("SmartVault:", smartVaultAddress);
    console.log("GoalLocker:", goalLockerAddress);
    console.log("DCAExecutor:", dcaExecutorAddress);
    console.log("========================\n");

    // Return addresses for verification script
    return deployments;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
