import { expect } from "chai";
import { ethers } from "hardhat";
import * as fc from "fast-check";
import { SmartVault, MockMNEE } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * Property-Based Tests for SmartVault
 * Feature: autovault
 * 
 * These tests verify universal properties that must hold for all valid inputs.
 */
describe("SmartVault Property Tests", function () {
    let smartVault: SmartVault;
    let mnee: MockMNEE;
    let owner: SignerWithAddress;
    let user: SignerWithAddress;

    const BASIS_POINTS = 10000n;
    const MNEE_TOKEN_ID = 0n; // ERC-1155 token ID for MNEE

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();

        const MockMNEE = await ethers.getContractFactory("MockMNEE");
        mnee = await MockMNEE.deploy();

        const SmartVault = await ethers.getContractFactory("SmartVault");
        smartVault = await SmartVault.deploy(await mnee.getAddress(), MNEE_TOKEN_ID);

        // Mint large amount for testing
        await mnee.mint(user.address, ethers.parseEther("1000000000"));
        await mnee.connect(user).setApprovalForAll(await smartVault.getAddress(), true);
    });

    /**
     * Feature: autovault, Property 1: Deposit Distribution Accuracy
     * 
     * For any deposit amount and any valid bucket configuration (where percentages 
     * sum to 100%), the SmartVault contract SHALL distribute funds such that each 
     * bucket receives exactly (depositAmount * bucketPercentage / 10000).
     * 
     * Validates: Requirements 2.2
     */
    describe("Property 1: Deposit Distribution Accuracy", function () {
        it("should distribute deposits according to bucket percentages for any valid amount", async function () {
            await fc.assert(
                fc.asyncProperty(
                    // Generate deposit amounts between 1 wei and 1 million MNEE
                    fc.bigInt(1n, ethers.parseEther("1000000")),
                    async (depositAmount) => {
                        // Reset state by deploying fresh contracts
                        const MockMNEE = await ethers.getContractFactory("MockMNEE");
                        const freshMnee = await MockMNEE.deploy();

                        const SmartVault = await ethers.getContractFactory("SmartVault");
                        const freshVault = await SmartVault.deploy(await freshMnee.getAddress(), 0n);

                        await freshMnee.mint(user.address, depositAmount * 2n);
                        await freshMnee.connect(user).setApprovalForAll(await freshVault.getAddress(), true);

                        // Deposit
                        await freshVault.connect(user).deposit(depositAmount);

                        // Get all buckets
                        const buckets = await freshVault.getAllBuckets(user.address);

                        // Calculate expected distribution
                        let totalDistributed = 0n;
                        for (let i = 0; i < buckets.length - 1; i++) {
                            const expected = (depositAmount * buckets[i].targetPercentage) / BASIS_POINTS;
                            expect(buckets[i].balance).to.equal(expected);
                            totalDistributed += buckets[i].balance;
                        }

                        // Last bucket gets remainder (handles rounding)
                        const lastBucket = buckets[buckets.length - 1];
                        expect(lastBucket.balance).to.equal(depositAmount - totalDistributed);

                        // Total should equal deposit
                        const total = await freshVault.getTotalBalance(user.address);
                        expect(total).to.equal(depositAmount);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    /**
     * Feature: autovault, Property 2: Bucket Percentage Invariant
     * 
     * For any set of buckets belonging to a user, the sum of all targetPercentage 
     * values SHALL equal exactly 10000 basis points (100%).
     * 
     * Validates: Requirements 2.4
     */
    describe("Property 2: Bucket Percentage Invariant", function () {
        it("should maintain 100% total percentage after any deposit", async function () {
            await fc.assert(
                fc.asyncProperty(
                    fc.bigInt(1n, ethers.parseEther("100000")),
                    async (depositAmount) => {
                        const MockMNEE = await ethers.getContractFactory("MockMNEE");
                        const freshMnee = await MockMNEE.deploy();

                        const SmartVault = await ethers.getContractFactory("SmartVault");
                        const freshVault = await SmartVault.deploy(await freshMnee.getAddress(), 0n);

                        await freshMnee.mint(user.address, depositAmount);
                        await freshMnee.connect(user).setApprovalForAll(await freshVault.getAddress(), true);

                        await freshVault.connect(user).deposit(depositAmount);

                        const totalPercentage = await freshVault.getTotalPercentage(user.address);
                        expect(totalPercentage).to.equal(BASIS_POINTS);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    /**
     * Feature: autovault, Property 3: Rebalance Correctness
     * 
     * For any user's bucket state, after calling rebalanceBuckets(), each bucket's 
     * balance SHALL equal (totalBalance * targetPercentage / 10000), with rounding 
     * handled consistently.
     * 
     * Validates: Requirements 2.6
     */
    describe("Property 3: Rebalance Correctness", function () {
        it("should correctly rebalance buckets to target percentages", async function () {
            await fc.assert(
                fc.asyncProperty(
                    fc.bigInt(ethers.parseEther("100"), ethers.parseEther("100000")),
                    fc.integer({ min: 0, max: 3 }),
                    fc.integer({ min: 0, max: 3 }),
                    fc.bigInt(1n, ethers.parseEther("50")),
                    async (depositAmount, fromBucket, toBucket, transferPercent) => {
                        const MockMNEE = await ethers.getContractFactory("MockMNEE");
                        const freshMnee = await MockMNEE.deploy();

                        const SmartVault = await ethers.getContractFactory("SmartVault");
                        const freshVault = await SmartVault.deploy(await freshMnee.getAddress(), 0n);

                        await freshMnee.mint(user.address, depositAmount);
                        await freshMnee.connect(user).setApprovalForAll(await freshVault.getAddress(), true);

                        await freshVault.connect(user).deposit(depositAmount);

                        if (fromBucket !== toBucket) {
                            const buckets = await freshVault.getAllBuckets(user.address);
                            const fromBalance = buckets[fromBucket].balance;
                            const transferAmount = (fromBalance * transferPercent) / ethers.parseEther("100");

                            if (transferAmount > 0n && transferAmount <= fromBalance) {
                                await freshVault.connect(user).transferBetweenBuckets(fromBucket, toBucket, transferAmount);
                            }
                        }

                        await freshVault.connect(user).rebalanceBuckets();

                        const totalBalance = await freshVault.getTotalBalance(user.address);
                        const bucketsAfter = await freshVault.getAllBuckets(user.address);

                        let sumBalances = 0n;
                        for (let i = 0; i < bucketsAfter.length - 1; i++) {
                            const expected = (totalBalance * bucketsAfter[i].targetPercentage) / BASIS_POINTS;
                            expect(bucketsAfter[i].balance).to.equal(expected);
                            sumBalances += bucketsAfter[i].balance;
                        }

                        const lastBucket = bucketsAfter[bucketsAfter.length - 1];
                        expect(lastBucket.balance).to.equal(totalBalance - sumBalances);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    /**
     * Feature: autovault, Property 4: Withdrawal Isolation
     * 
     * For any withdrawal from bucket B, only bucket B's balance SHALL decrease 
     * by the withdrawal amount; all other bucket balances SHALL remain unchanged.
     * 
     * Validates: Requirements 2.7
     */
    describe("Property 4: Withdrawal Isolation", function () {
        it("should only affect the specified bucket on withdrawal", async function () {
            await fc.assert(
                fc.asyncProperty(
                    fc.integer({ min: 0, max: 3 }), // bucket index
                    fc.bigInt(1n, ethers.parseEther("100")), // withdrawal amount (small to ensure valid)
                    async (bucketIndex, withdrawPercent) => {
                        const MockMNEE = await ethers.getContractFactory("MockMNEE");
                        const freshMnee = await MockMNEE.deploy();

                        const SmartVault = await ethers.getContractFactory("SmartVault");
                        const freshVault = await SmartVault.deploy(await freshMnee.getAddress(), 0n);

                        const depositAmount = ethers.parseEther("10000");
                        await freshMnee.mint(user.address, depositAmount);
                        await freshMnee.connect(user).setApprovalForAll(await freshVault.getAddress(), true);

                        await freshVault.connect(user).deposit(depositAmount);

                        // Get bucket balances before
                        const bucketsBefore = await freshVault.getAllBuckets(user.address);
                        const bucketBalance = bucketsBefore[bucketIndex].balance;

                        // Calculate withdrawal amount (percentage of bucket balance)
                        const withdrawAmount = (bucketBalance * withdrawPercent) / ethers.parseEther("100");

                        if (withdrawAmount > 0n && withdrawAmount <= bucketBalance) {
                            await freshVault.connect(user).withdrawFromBucket(bucketIndex, withdrawAmount);

                            const bucketsAfter = await freshVault.getAllBuckets(user.address);

                            // Check only target bucket changed
                            for (let i = 0; i < bucketsAfter.length; i++) {
                                if (i === bucketIndex) {
                                    expect(bucketsAfter[i].balance).to.equal(bucketsBefore[i].balance - withdrawAmount);
                                } else {
                                    expect(bucketsAfter[i].balance).to.equal(bucketsBefore[i].balance);
                                }
                            }
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    /**
     * Feature: autovault, Property 5: Transfer Conservation
     * 
     * For any transfer of amount A from bucket X to bucket Y:
     * - Bucket X balance decreases by exactly A
     * - Bucket Y balance increases by exactly A
     * - Total balance across all buckets remains unchanged
     * 
     * Validates: Requirements 2.8
     */
    describe("Property 5: Transfer Conservation", function () {
        it("should conserve total balance on any transfer", async function () {
            await fc.assert(
                fc.asyncProperty(
                    fc.integer({ min: 0, max: 3 }), // from bucket
                    fc.integer({ min: 0, max: 3 }), // to bucket
                    fc.bigInt(1n, ethers.parseEther("50")), // transfer percent
                    async (fromBucket, toBucket, transferPercent) => {
                        if (fromBucket === toBucket) return; // Skip same bucket

                        const MockMNEE = await ethers.getContractFactory("MockMNEE");
                        const freshMnee = await MockMNEE.deploy();

                        const SmartVault = await ethers.getContractFactory("SmartVault");
                        const freshVault = await SmartVault.deploy(await freshMnee.getAddress(), 0n);

                        const depositAmount = ethers.parseEther("10000");
                        await freshMnee.mint(user.address, depositAmount);
                        await freshMnee.connect(user).setApprovalForAll(await freshVault.getAddress(), true);

                        await freshVault.connect(user).deposit(depositAmount);

                        const totalBefore = await freshVault.getTotalBalance(user.address);
                        const bucketsBefore = await freshVault.getAllBuckets(user.address);

                        const fromBalance = bucketsBefore[fromBucket].balance;
                        const transferAmount = (fromBalance * transferPercent) / ethers.parseEther("100");

                        if (transferAmount > 0n && transferAmount <= fromBalance) {
                            await freshVault.connect(user).transferBetweenBuckets(fromBucket, toBucket, transferAmount);

                            const totalAfter = await freshVault.getTotalBalance(user.address);
                            const bucketsAfter = await freshVault.getAllBuckets(user.address);

                            // Total unchanged
                            expect(totalAfter).to.equal(totalBefore);

                            // From bucket decreased
                            expect(bucketsAfter[fromBucket].balance).to.equal(
                                bucketsBefore[fromBucket].balance - transferAmount
                            );

                            // To bucket increased
                            expect(bucketsAfter[toBucket].balance).to.equal(
                                bucketsBefore[toBucket].balance + transferAmount
                            );
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});
