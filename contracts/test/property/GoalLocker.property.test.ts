import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import * as fc from "fast-check";
import { GoalLocker, MockMNEE } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * Property-Based Tests for GoalLocker
 * Feature: autovault
 */
describe("GoalLocker Property Tests", function () {
    let goalLocker: GoalLocker;
    let mnee: MockMNEE;
    let owner: SignerWithAddress;
    let user: SignerWithAddress;

    const MNEE_TOKEN_ID = 0n; // ERC-1155 token ID for MNEE

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();

        const MockMNEE = await ethers.getContractFactory("MockMNEE");
        mnee = await MockMNEE.deploy();

        const GoalLocker = await ethers.getContractFactory("GoalLocker");
        goalLocker = await GoalLocker.deploy(await mnee.getAddress(), MNEE_TOKEN_ID);

        await mnee.mint(user.address, ethers.parseEther("1000000000"));
        await mnee.connect(user).setApprovalForAll(await goalLocker.getAddress(), true);
    });

    /**
     * Feature: autovault, Property 11: Goal Lock Enforcement
     * 
     * For any goal where currentAmount < targetAmount AND block.timestamp < deadline,
     * calling withdrawGoal() SHALL revert.
     * 
     * Validates: Requirements 5.2
     */
    describe("Property 11: Goal Lock Enforcement", function () {
        it("should enforce lock when target not reached and deadline not passed", async function () {
            await fc.assert(
                fc.asyncProperty(
                    fc.bigInt(ethers.parseEther("100"), ethers.parseEther("10000")), // target
                    fc.integer({ min: 1, max: 99 }), // deposit percentage (less than 100%)
                    fc.integer({ min: 86400, max: 86400 * 365 }), // deadline offset in seconds
                    async (targetAmount, depositPercent, deadlineOffset) => {
                        const MockMNEE = await ethers.getContractFactory("MockMNEE");
                        const freshMnee = await MockMNEE.deploy();

                        const GoalLocker = await ethers.getContractFactory("GoalLocker");
                        const freshLocker = await GoalLocker.deploy(await freshMnee.getAddress(), 0n);

                        await freshMnee.mint(user.address, targetAmount);
                        await freshMnee.connect(user).setApprovalForAll(await freshLocker.getAddress(), true);

                        const deadline = (await time.latest()) + deadlineOffset;
                        await freshLocker.connect(user).createGoal("Test", targetAmount, deadline);

                        // Deposit less than target
                        const depositAmount = (targetAmount * BigInt(depositPercent)) / 100n;
                        if (depositAmount > 0n) {
                            await freshLocker.connect(user).depositToGoal(0, depositAmount);
                        }

                        // Should revert because target not reached and deadline not passed
                        await expect(freshLocker.connect(user).withdrawGoal(0))
                            .to.be.revertedWithCustomError(freshLocker, "GoalLocked");
                    }
                ),
                { numRuns: 100 }
            );
        });

        it("should allow withdrawal when target reached regardless of deadline", async function () {
            await fc.assert(
                fc.asyncProperty(
                    fc.bigInt(ethers.parseEther("10"), ethers.parseEther("1000")), // target
                    fc.integer({ min: 86400, max: 86400 * 365 }), // deadline offset
                    async (targetAmount, deadlineOffset) => {
                        const MockMNEE = await ethers.getContractFactory("MockMNEE");
                        const freshMnee = await MockMNEE.deploy();

                        const GoalLocker = await ethers.getContractFactory("GoalLocker");
                        const freshLocker = await GoalLocker.deploy(await freshMnee.getAddress(), 0n);

                        await freshMnee.mint(user.address, targetAmount * 2n);
                        await freshMnee.connect(user).setApprovalForAll(await freshLocker.getAddress(), true);

                        const deadline = (await time.latest()) + deadlineOffset;
                        await freshLocker.connect(user).createGoal("Test", targetAmount, deadline);

                        // Deposit full target amount
                        await freshLocker.connect(user).depositToGoal(0, targetAmount);

                        // Should succeed because target reached
                        await freshLocker.connect(user).withdrawGoal(0);

                        const goal = await freshLocker.getGoal(user.address, 0);
                        expect(goal.isWithdrawn).to.be.true;
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    /**
     * Feature: autovault, Property 12: Goal Deposit Accuracy
     * 
     * For any deposit of amount A to a goal, the goal's currentAmount SHALL 
     * increase by exactly A.
     * 
     * Validates: Requirements 5.4
     */
    describe("Property 12: Goal Deposit Accuracy", function () {
        it("should increase currentAmount by exact deposit amount", async function () {
            await fc.assert(
                fc.asyncProperty(
                    fc.bigInt(ethers.parseEther("100"), ethers.parseEther("10000")), // target
                    fc.array(fc.bigInt(1n, ethers.parseEther("100")), { minLength: 1, maxLength: 10 }), // deposits
                    async (targetAmount, deposits) => {
                        const MockMNEE = await ethers.getContractFactory("MockMNEE");
                        const freshMnee = await MockMNEE.deploy();

                        const GoalLocker = await ethers.getContractFactory("GoalLocker");
                        const freshLocker = await GoalLocker.deploy(await freshMnee.getAddress(), 0n);

                        const totalDeposits = deposits.reduce((a, b) => a + b, 0n);
                        await freshMnee.mint(user.address, totalDeposits);
                        await freshMnee.connect(user).setApprovalForAll(await freshLocker.getAddress(), true);

                        await freshLocker.connect(user).createGoal("Test", targetAmount, 0);

                        let expectedTotal = 0n;
                        for (const deposit of deposits) {
                            const goalBefore = await freshLocker.getGoal(user.address, 0);
                            await freshLocker.connect(user).depositToGoal(0, deposit);
                            const goalAfter = await freshLocker.getGoal(user.address, 0);

                            // Each deposit increases by exact amount
                            expect(goalAfter.currentAmount - goalBefore.currentAmount).to.equal(deposit);
                            expectedTotal += deposit;
                        }

                        // Final total matches sum of all deposits
                        const finalGoal = await freshLocker.getGoal(user.address, 0);
                        expect(finalGoal.currentAmount).to.equal(expectedTotal);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    /**
     * Feature: autovault, Property 13: Milestone Detection
     * 
     * For any goal, the milestone reached SHALL be correctly calculated as:
     * - 25% when currentAmount >= targetAmount * 25 / 100
     * - 50% when currentAmount >= targetAmount * 50 / 100
     * - 75% when currentAmount >= targetAmount * 75 / 100
     * - 100% when currentAmount >= targetAmount
     * 
     * Validates: Requirements 5.5
     */
    describe("Property 13: Milestone Detection", function () {
        it("should correctly detect milestones based on progress", async function () {
            await fc.assert(
                fc.asyncProperty(
                    fc.bigInt(ethers.parseEther("100"), ethers.parseEther("10000")), // target
                    fc.integer({ min: 0, max: 120 }), // progress percentage (can exceed 100%)
                    async (targetAmount, progressPercent) => {
                        const MockMNEE = await ethers.getContractFactory("MockMNEE");
                        const freshMnee = await MockMNEE.deploy();

                        const GoalLocker = await ethers.getContractFactory("GoalLocker");
                        const freshLocker = await GoalLocker.deploy(await freshMnee.getAddress(), 0n);

                        const depositAmount = (targetAmount * BigInt(progressPercent)) / 100n;
                        await freshMnee.mint(user.address, depositAmount > 0n ? depositAmount : 1n);
                        await freshMnee.connect(user).setApprovalForAll(await freshLocker.getAddress(), true);

                        await freshLocker.connect(user).createGoal("Test", targetAmount, 0);

                        if (depositAmount > 0n) {
                            await freshLocker.connect(user).depositToGoal(0, depositAmount);
                        }

                        const milestone = await freshLocker.getCurrentMilestone(user.address, 0);

                        // Calculate actual progress based on deposited amount (accounting for integer division)
                        const actualProgress = targetAmount > 0n
                            ? Number((depositAmount * 100n) / targetAmount)
                            : 0;

                        // Verify milestone matches expected based on actual progress
                        if (actualProgress >= 100) {
                            expect(milestone).to.equal(100);
                        } else if (actualProgress >= 75) {
                            expect(milestone).to.equal(75);
                        } else if (actualProgress >= 50) {
                            expect(milestone).to.equal(50);
                        } else if (actualProgress >= 25) {
                            expect(milestone).to.equal(25);
                        } else {
                            expect(milestone).to.equal(0);
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});
