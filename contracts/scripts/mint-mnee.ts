import { ethers } from "hardhat";

async function main() {
    const [signer] = await ethers.getSigners();
    const walletAddress = signer.address;

    // MNEE contract address on Sepolia
    const MNEE_ADDRESS = "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF";

    // Amount to mint (10,000 MNEE)
    const amount = ethers.parseEther("10000");

    console.log(`Minting ${ethers.formatEther(amount)} MNEE to ${walletAddress}...`);

    const mnee = await ethers.getContractAt("MockMNEE", MNEE_ADDRESS);
    const tx = await mnee.mint(walletAddress, amount);
    await tx.wait();

    const balance = await mnee.balanceOf(walletAddress);
    console.log(`Done! New balance: ${ethers.formatEther(balance)} MNEE`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
