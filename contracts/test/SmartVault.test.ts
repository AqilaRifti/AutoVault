import { expect } from "chai";
import { ethers } from "hardhat";
import { SmartVault, MockMNEE } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("SmartVault", function () {
    let smartVault: SmartVault;
    let mnee: MockMNEE;
    let owner: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;

    const BASIS_POINTS = 10000n;
    const INITIAL_BALANCE = ethers.parseEther("10000");
    const MNEE_TOKEN_ID = 0n; // ERC-1155 token ID for MNEE

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy MockMNEE (ERC-1155)
        const MockMNEE = await ethers.getContractFactory("MockMNEE");
        mnee = await MockMNEE.deploy();

        // Deploy SmartVault with token ID
        const SmartVault = await ethers.getContractFactory("SmartVault");
        smartVault = await SmartVault.deploy(await mnee.getAddress(), MNEE_TOKEN_ID);

        // Mint MNEE to users
        await mnee.mint(user1.address, INITIAL_BALANCE);
        await mnee.mint(user2.address, INITIAL_BALANCE);

        // Approve SmartVault to spend MNEE (ERC-1155 uses setApprovalForAll)
        await mnee.connect(user1).setApprovalForAll(await smartVault.getAddress(), true);
        await mnee.connect(user2).setApprovalForAll(await smartVault.getAddress(), true);
    });

    describe("Default Buckets", function () {
        it("should create default buckets on first deposit", async function () {
            const depositAmount = ethers.parseEther("1000");
            await smartVault.connect(user1).deposit(depositAmount);

            const bucketCount = await smartVault.getBucketCount(user1.address);
            expect(bucketCount).to.equal(4n);

            // Check default bucket percentages
            const savings = await smartVault.getBucket(user1.address, 0);
            const bills = await smartVault.getBucket(user1.address, 1);
            const spending = await smartVault.getBucket(user1.address, 2);
            const investment = await smartVault.getBucket(user1.address, 3);

            expect(savings.targetPercentage).to.equal(4000n); // 40%
            expect(bills.targetPercentage).to.equal(3000n); // 30%
            expect(spending.targetPercentage).to.equal(2000n); // 20%
            expect(investment.targetPercentage).to.equal(1000n); // 10%
        });

        it("should have bucket percentages sum to 100%", async function () {
            await smartVault.connect(user1).deposit(ethers.parseEther("100"));

            const totalPercentage = await smartVault.getTotalPercentage(user1.address);
            expect(totalPercentage).to.equal(BASIS_POINTS);
        });
    });

    describe("Deposit Distribution", function () {
        it("should distribute deposit according to bucket percentages", async function () {
            const depositAmount = ethers.parseEther("1000");
            await smartVault.connect(user1).deposit(depositAmount);

            const savings = await smartVault.getBucket(user1.address, 0);
            const bills = await smartVault.getBucket(user1.address, 1);
            const spending = await smartVault.getBucket(user1.address, 2);
            const investment = await smartVault.getBucket(user1.address, 3);

            // Check distribution (40%, 30%, 20%, 10%)
            expect(savings.balance).to.equal(ethers.parseEther("400"));
            expect(bills.balance).to.equal(ethers.parseEther("300"));
            expect(spending.balance).to.equal(ethers.parseEther("200"));
            expect(investment.balance).to.equal(ethers.parseEther("100"));
        });

        it("should update total balance correctly", async function () {
            const depositAmount = ethers.parseEther("1000");
            await smartVault.connect(user1).deposit(depositAmount);

            const totalBalance = await smartVault.getTotalBalance(user1.address);
            expect(totalBalance).to.equal(depositAmount);
        });

        it("should emit Deposited event", async function () {
            const depositAmount = ethers.parseEther("500");

            await expect(smartVault.connect(user1).deposit(depositAmount))
                .to.emit(smartVault, "Deposited")
                .withArgs(user1.address, depositAmount);
        });

        it("should revert on zero deposit", async function () {
            await expect(smartVault.connect(user1).deposit(0))
                .to.be.revertedWithCustomError(smartVault, "ZeroAmount");
        });
    });

    describe("Withdrawal", function () {
        beforeEach(async function () {
            await smartVault.connect(user1).deposit(ethers.parseEther("1000"));
        });

        it("should withdraw from specific bucket", async function () {
            const withdrawAmount = ethers.parseEther("100");
            const bucketId = 0; // Savings

            const balanceBefore = await mnee.balanceOf(user1.address, MNEE_TOKEN_ID);
            await smartVault.connect(user1).withdrawFromBucket(bucketId, withdrawAmount);
            const balanceAfter = await mnee.balanceOf(user1.address, MNEE_TOKEN_ID);

            expect(balanceAfter - balanceBefore).to.equal(withdrawAmount);
        });

        it("should only affect the specified bucket", async function () {
            const withdrawAmount = ethers.parseEther("100");
            const bucketId = 0; // Savings

            const billsBefore = await smartVault.getBucket(user1.address, 1);
            await smartVault.connect(user1).withdrawFromBucket(bucketId, withdrawAmount);
            const billsAfter = await smartVault.getBucket(user1.address, 1);

            expect(billsAfter.balance).to.equal(billsBefore.balance);
        });

        it("should revert on insufficient balance", async function () {
            const withdrawAmount = ethers.parseEther("500"); // More than savings bucket

            await expect(smartVault.connect(user1).withdrawFromBucket(0, withdrawAmount))
                .to.be.revertedWithCustomError(smartVault, "InsufficientBucketBalance");
        });
    });

    describe("Transfer Between Buckets", function () {
        beforeEach(async function () {
            await smartVault.connect(user1).deposit(ethers.parseEther("1000"));
        });

        it("should transfer exact amount between buckets", async function () {
            const transferAmount = ethers.parseEther("100");
            const fromBucket = 0; // Savings
            const toBucket = 1; // Bills

            const savingsBefore = await smartVault.getBucket(user1.address, fromBucket);
            const billsBefore = await smartVault.getBucket(user1.address, toBucket);

            await smartVault.connect(user1).transferBetweenBuckets(fromBucket, toBucket, transferAmount);

            const savingsAfter = await smartVault.getBucket(user1.address, fromBucket);
            const billsAfter = await smartVault.getBucket(user1.address, toBucket);

            expect(savingsAfter.balance).to.equal(savingsBefore.balance - transferAmount);
            expect(billsAfter.balance).to.equal(billsBefore.balance + transferAmount);
        });

        it("should preserve total balance after transfer", async function () {
            const transferAmount = ethers.parseEther("100");

            const totalBefore = await smartVault.getTotalBalance(user1.address);
            await smartVault.connect(user1).transferBetweenBuckets(0, 1, transferAmount);
            const totalAfter = await smartVault.getTotalBalance(user1.address);

            expect(totalAfter).to.equal(totalBefore);
        });

        it("should revert on same bucket transfer", async function () {
            await expect(smartVault.connect(user1).transferBetweenBuckets(0, 0, ethers.parseEther("100")))
                .to.be.revertedWithCustomError(smartVault, "SameBucket");
        });
    });

    describe("Rebalance", function () {
        beforeEach(async function () {
            await smartVault.connect(user1).deposit(ethers.parseEther("1000"));
            // Transfer some funds to create imbalance
            await smartVault.connect(user1).transferBetweenBuckets(0, 1, ethers.parseEther("200"));
        });

        it("should redistribute funds to match target percentages", async function () {
            await smartVault.connect(user1).rebalanceBuckets();

            const totalBalance = await smartVault.getTotalBalance(user1.address);
            const savings = await smartVault.getBucket(user1.address, 0);
            const bills = await smartVault.getBucket(user1.address, 1);
            const spending = await smartVault.getBucket(user1.address, 2);
            const investment = await smartVault.getBucket(user1.address, 3);

            // Check each bucket matches target percentage
            expect(savings.balance).to.equal((totalBalance * 4000n) / BASIS_POINTS);
            expect(bills.balance).to.equal((totalBalance * 3000n) / BASIS_POINTS);
            expect(spending.balance).to.equal((totalBalance * 2000n) / BASIS_POINTS);
            // Investment gets remainder
            expect(investment.balance).to.equal(
                totalBalance - savings.balance - bills.balance - spending.balance
            );
        });

        it("should preserve total balance after rebalance", async function () {
            const totalBefore = await smartVault.getTotalBalance(user1.address);
            await smartVault.connect(user1).rebalanceBuckets();
            const totalAfter = await smartVault.getTotalBalance(user1.address);

            expect(totalAfter).to.equal(totalBefore);
        });

        it("should emit Rebalanced event", async function () {
            const totalBalance = await smartVault.getTotalBalance(user1.address);

            await expect(smartVault.connect(user1).rebalanceBuckets())
                .to.emit(smartVault, "Rebalanced")
                .withArgs(user1.address, totalBalance);
        });
    });

    describe("Create Custom Bucket", function () {
        it("should allow creating custom bucket", async function () {
            // First deposit to create default buckets
            await smartVault.connect(user1).deposit(ethers.parseEther("100"));

            // Update existing bucket percentages to make room
            await smartVault.connect(user1).updateBucketPercentage(0, 3500n); // Reduce savings

            // Create new bucket with 5%
            await smartVault.connect(user1).createBucket("Emergency", 500n, "#ff0000");

            const bucketCount = await smartVault.getBucketCount(user1.address);
            expect(bucketCount).to.equal(5n);

            const emergency = await smartVault.getBucket(user1.address, 4);
            expect(emergency.name).to.equal("Emergency");
            expect(emergency.targetPercentage).to.equal(500n);
        });

        it("should revert if percentages exceed 100%", async function () {
            await smartVault.connect(user1).deposit(ethers.parseEther("100"));

            await expect(smartVault.connect(user1).createBucket("Extra", 100n, "#000000"))
                .to.be.revertedWithCustomError(smartVault, "PercentageSumInvalid");
        });
    });
});
