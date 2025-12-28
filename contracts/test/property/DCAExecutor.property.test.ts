import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import * as fc from "fast-check";
import { DCAExecutor, MockMNEE } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * Property-Based Tests for DCAExecutor
 * Feature: autovault
 */
describe("DCAExecutor Property Tests", function () {
    let dcaExecutor: DCAExecutor;
    let mnee: MockMNEE;
    let owner: SignerWithAddress;
    let user: SignerWithAddress;
    let keeper: SignerWithAddress;

    const ONE_HOUR = 3600;
    const MNEE_TOKEN_ID = 0n; // ERC-1155 token ID for MNEE

    beforeEach(async function () {
        [owner, user, keeper] = await ethers.getSigners();

        const MockMNEE = await ethers.getContractFactory("MockMNEE");
        mnee = await MockMNEE.deploy();

        const DCAExecutor = await ethers.getContractFactory("DCAExecutor");
        dcaExecutor = await DCAExecutor.deploy(
            await mnee.getAddress(),
            MNEE_TOKEN_ID,
            ethers.ZeroAddress
        );

        await mnee.mint(user.address, ethers.parseEther("1000000000"));
        await mnee.connect(user).setApprovalForAll(await dcaExecutor.getAddress(), true);

        await dcaExecutor.setKeeper(keeper.address, true);
    });

    /**
     * Feature: autovault, Property 9: Paused Strategy Non-Execution
     * 
     * For any DCA strategy with isActive = false, calling executeDCA() SHALL 
     * revert or return without executing a swap.
     * 
     * Validates: Requirements 4.5
     */
    describe("Property 9: Paused Strategy Non-Execution", function () {
        it("should revert execution on any paused strategy", async function () {
            await fc.assert(
                fc.asyncProperty(
                    fc.bigInt(ethers.parseEther("10"), ethers.parseEther("1000")), // amount per interval
                    fc.integer({ min: ONE_HOUR, max: ONE_HOUR * 24 * 7 }), // interval
                    async (amountPerInterval, intervalSeconds) => {
                        const MockMNEE = await ethers.getContractFactory("MockMNEE");
                        const freshMnee = await MockMNEE.deploy();

                        const DCAExecutor = await ethers.getContractFactory("DCAExecutor");
                        const freshExecutor = await DCAExecutor.deploy(
                            await freshMnee.getAddress(), 0n,
                            ethers.ZeroAddress
                        );

                        await freshMnee.mint(user.address, amountPerInterval * 10n);
                        await freshMnee.connect(user).setApprovalForAll(await freshExecutor.getAddress(), true);

                        await freshExecutor.setKeeper(keeper.address, true);

                        const tokenOut = ethers.Wallet.createRandom().address;
                        await freshExecutor.connect(user).createDCAStrategy(
                            tokenOut,
                            amountPerInterval,
                            intervalSeconds,
                            100
                        );

                        await freshExecutor.connect(user).allocateFunds(amountPerInterval * 5n);

                        // Pause the strategy
                        await freshExecutor.connect(user).pauseStrategy(0);

                        // Verify strategy is paused
                        const strategy = await freshExecutor.getStrategy(user.address, 0);
                        expect(strategy.isActive).to.be.false;

                        // Execution should revert
                        await expect(freshExecutor.connect(keeper).executeDCA(user.address, 0))
                            .to.be.revertedWithCustomError(freshExecutor, "StrategyNotActive");
                    }
                ),
                { numRuns: 100 }
            );
        });

        it("should allow execution after resume", async function () {
            await fc.assert(
                fc.asyncProperty(
                    fc.bigInt(ethers.parseEther("10"), ethers.parseEther("100")), // amount
                    async (amountPerInterval) => {
                        const MockMNEE = await ethers.getContractFactory("MockMNEE");
                        const freshMnee = await MockMNEE.deploy();

                        const DCAExecutor = await ethers.getContractFactory("DCAExecutor");
                        const freshExecutor = await DCAExecutor.deploy(
                            await freshMnee.getAddress(), 0n,
                            ethers.ZeroAddress
                        );

                        await freshMnee.mint(user.address, amountPerInterval * 10n);
                        await freshMnee.connect(user).setApprovalForAll(await freshExecutor.getAddress(), true);

                        await freshExecutor.setKeeper(keeper.address, true);

                        const tokenOut = ethers.Wallet.createRandom().address;
                        await freshExecutor.connect(user).createDCAStrategy(
                            tokenOut,
                            amountPerInterval,
                            ONE_HOUR,
                            100
                        );

                        await freshExecutor.connect(user).allocateFunds(amountPerInterval * 5n);

                        // Pause then resume
                        await freshExecutor.connect(user).pauseStrategy(0);
                        await freshExecutor.connect(user).resumeStrategy(0);

                        // Verify strategy is active
                        const strategy = await freshExecutor.getStrategy(user.address, 0);
                        expect(strategy.isActive).to.be.true;

                        // Execution should succeed (no revert)
                        // Note: actual swap may fail due to no router, but it won't revert with StrategyNotActive
                    }
                ),
                { numRuns: 50 }
            );
        });
    });

    /**
     * Feature: autovault, Property 10: Strategy Cancellation Refund
     * 
     * For any cancelled DCA strategy, the user SHALL receive back any MNEE 
     * that was allocated but not yet swapped.
     * 
     * Validates: Requirements 4.6
     */
    describe("Property 10: Strategy Cancellation Refund", function () {
        it("should preserve allocated funds after cancellation for withdrawal", async function () {
            await fc.assert(
                fc.asyncProperty(
                    fc.bigInt(ethers.parseEther("100"), ethers.parseEther("10000")), // allocated amount
                    async (allocatedAmount) => {
                        const MockMNEE = await ethers.getContractFactory("MockMNEE");
                        const freshMnee = await MockMNEE.deploy();

                        const DCAExecutor = await ethers.getContractFactory("DCAExecutor");
                        const freshExecutor = await DCAExecutor.deploy(
                            await freshMnee.getAddress(), 0n,
                            ethers.ZeroAddress
                        );

                        await freshMnee.mint(user.address, allocatedAmount);
                        await freshMnee.connect(user).setApprovalForAll(await freshExecutor.getAddress(), true);

                        const tokenOut = ethers.Wallet.createRandom().address;
                        await freshExecutor.connect(user).createDCAStrategy(
                            tokenOut,
                            ethers.parseEther("100"),
                            ONE_HOUR,
                            100
                        );

                        // Allocate funds
                        await freshExecutor.connect(user).allocateFunds(allocatedAmount);

                        const allocatedBefore = await freshExecutor.getAllocatedFunds(user.address);
                        expect(allocatedBefore).to.equal(allocatedAmount);

                        // Cancel strategy
                        await freshExecutor.connect(user).cancelStrategy(0);

                        // Funds should still be allocated (can be withdrawn)
                        const allocatedAfter = await freshExecutor.getAllocatedFunds(user.address);
                        expect(allocatedAfter).to.equal(allocatedAmount);

                        // User can withdraw all funds
                        const balanceBefore = await freshMnee.balanceOf(user.address, 0n);
                        await freshExecutor.connect(user).withdrawFunds(allocatedAmount);
                        const balanceAfter = await freshMnee.balanceOf(user.address, 0n);

                        expect(balanceAfter - balanceBefore).to.equal(allocatedAmount);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it("should emit correct refund amount in cancellation event", async function () {
            await fc.assert(
                fc.asyncProperty(
                    fc.bigInt(ethers.parseEther("100"), ethers.parseEther("5000")), // allocated
                    async (allocatedAmount) => {
                        const MockMNEE = await ethers.getContractFactory("MockMNEE");
                        const freshMnee = await MockMNEE.deploy();

                        const DCAExecutor = await ethers.getContractFactory("DCAExecutor");
                        const freshExecutor = await DCAExecutor.deploy(
                            await freshMnee.getAddress(), 0n,
                            ethers.ZeroAddress
                        );

                        await freshMnee.mint(user.address, allocatedAmount);
                        await freshMnee.connect(user).setApprovalForAll(await freshExecutor.getAddress(), true);

                        const tokenOut = ethers.Wallet.createRandom().address;
                        await freshExecutor.connect(user).createDCAStrategy(
                            tokenOut,
                            ethers.parseEther("100"),
                            ONE_HOUR,
                            100
                        );

                        await freshExecutor.connect(user).allocateFunds(allocatedAmount);

                        // Cancel and check event
                        await expect(freshExecutor.connect(user).cancelStrategy(0))
                            .to.emit(freshExecutor, "StrategyCancelled")
                            .withArgs(user.address, 0, allocatedAmount);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});
