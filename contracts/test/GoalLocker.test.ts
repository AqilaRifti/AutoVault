import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { GoalLocker, MockMNEE } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("GoalLocker", function () {
    let goalLocker: GoalLocker;
    let mnee: MockMNEE;
    let owner: SignerWithAddress;
    let user1: SignerWithAddress;

    const INITIAL_BALANCE = ethers.parseEther("10000");

    beforeEach(async function () {
        [owner, user1] = await ethers.getSigners();

        const MockMNEE = await ethers.getContractFactory("MockMNEE");
        mnee = await MockMNEE.deploy();

        const GoalLocker = await ethers.getContractFactory("GoalLocker");
        goalLocker = await GoalLocker.deploy(await mnee.getAddress());

        await mnee.mint(user1.address, INITIAL_BALANCE);
        await mnee.connect(user1).approve(await goalLocker.getAddress(), ethers.MaxUint256);
    });

    describe("Goal Creation", function () {
        it("should create a goal with target amount", async function () {
            const targetAmount = ethers.parseEther("1000");
            const deadline = 0; // No deadline

            await goalLocker.connect(user1).createGoal("Vacation Fund", targetAmount, deadline);

            const goal = await goalLocker.getGoal(user1.address, 0);
            expect(goal.name).to.equal("Vacation Fund");
            expect(goal.targetAmount).to.equal(targetAmount);
            expect(goal.currentAmount).to.equal(0);
            expect(goal.deadline).to.equal(0);
        });

        it("should create a goal with deadline", async function () {
            const targetAmount = ethers.parseEther("5000");
            const futureTime = (await time.latest()) + 86400 * 30; // 30 days

            await goalLocker.connect(user1).createGoal("Emergency Fund", targetAmount, futureTime);

            const goal = await goalLocker.getGoal(user1.address, 0);
            expect(goal.deadline).to.equal(futureTime);
        });

        it("should emit GoalCreated event", async function () {
            const targetAmount = ethers.parseEther("1000");

            await expect(goalLocker.connect(user1).createGoal("Test Goal", targetAmount, 0))
                .to.emit(goalLocker, "GoalCreated")
                .withArgs(user1.address, 0, "Test Goal", targetAmount, 0);
        });

        it("should revert on zero target amount", async function () {
            await expect(goalLocker.connect(user1).createGoal("Invalid", 0, 0))
                .to.be.revertedWithCustomError(goalLocker, "ZeroTarget");
        });

        it("should revert on past deadline", async function () {
            const pastTime = (await time.latest()) - 1000;

            await expect(goalLocker.connect(user1).createGoal("Invalid", ethers.parseEther("100"), pastTime))
                .to.be.revertedWithCustomError(goalLocker, "InvalidDeadline");
        });
    });

    describe("Goal Deposits", function () {
        beforeEach(async function () {
            await goalLocker.connect(user1).createGoal("Test Goal", ethers.parseEther("1000"), 0);
        });

        it("should deposit to goal", async function () {
            const depositAmount = ethers.parseEther("100");

            await goalLocker.connect(user1).depositToGoal(0, depositAmount);

            const goal = await goalLocker.getGoal(user1.address, 0);
            expect(goal.currentAmount).to.equal(depositAmount);
        });

        it("should emit GoalDeposit event", async function () {
            const depositAmount = ethers.parseEther("100");

            await expect(goalLocker.connect(user1).depositToGoal(0, depositAmount))
                .to.emit(goalLocker, "GoalDeposit")
                .withArgs(user1.address, 0, depositAmount, depositAmount);
        });

        it("should accumulate multiple deposits", async function () {
            await goalLocker.connect(user1).depositToGoal(0, ethers.parseEther("100"));
            await goalLocker.connect(user1).depositToGoal(0, ethers.parseEther("200"));

            const goal = await goalLocker.getGoal(user1.address, 0);
            expect(goal.currentAmount).to.equal(ethers.parseEther("300"));
        });
    });

    describe("Milestones", function () {
        beforeEach(async function () {
            await goalLocker.connect(user1).createGoal("Milestone Test", ethers.parseEther("1000"), 0);
        });

        it("should emit MilestoneReached at 25%", async function () {
            await expect(goalLocker.connect(user1).depositToGoal(0, ethers.parseEther("250")))
                .to.emit(goalLocker, "MilestoneReached")
                .withArgs(user1.address, 0, 25);
        });

        it("should emit MilestoneReached at 50%", async function () {
            await goalLocker.connect(user1).depositToGoal(0, ethers.parseEther("250"));

            await expect(goalLocker.connect(user1).depositToGoal(0, ethers.parseEther("250")))
                .to.emit(goalLocker, "MilestoneReached")
                .withArgs(user1.address, 0, 50);
        });

        it("should emit MilestoneReached at 100%", async function () {
            await goalLocker.connect(user1).depositToGoal(0, ethers.parseEther("750"));

            await expect(goalLocker.connect(user1).depositToGoal(0, ethers.parseEther("250")))
                .to.emit(goalLocker, "MilestoneReached")
                .withArgs(user1.address, 0, 100);
        });

        it("should return correct current milestone", async function () {
            expect(await goalLocker.getCurrentMilestone(user1.address, 0)).to.equal(0);

            await goalLocker.connect(user1).depositToGoal(0, ethers.parseEther("250"));
            expect(await goalLocker.getCurrentMilestone(user1.address, 0)).to.equal(25);

            await goalLocker.connect(user1).depositToGoal(0, ethers.parseEther("500"));
            expect(await goalLocker.getCurrentMilestone(user1.address, 0)).to.equal(75);
        });
    });

    describe("Goal Withdrawal", function () {
        it("should allow withdrawal when target reached", async function () {
            const targetAmount = ethers.parseEther("1000");
            await goalLocker.connect(user1).createGoal("Complete Goal", targetAmount, 0);
            await goalLocker.connect(user1).depositToGoal(0, targetAmount);

            const balanceBefore = await mnee.balanceOf(user1.address);
            await goalLocker.connect(user1).withdrawGoal(0);
            const balanceAfter = await mnee.balanceOf(user1.address);

            expect(balanceAfter - balanceBefore).to.equal(targetAmount);
        });

        it("should allow withdrawal when deadline passed", async function () {
            const targetAmount = ethers.parseEther("1000");
            const deadline = (await time.latest()) + 86400; // 1 day

            await goalLocker.connect(user1).createGoal("Deadline Goal", targetAmount, deadline);
            await goalLocker.connect(user1).depositToGoal(0, ethers.parseEther("500")); // Only 50%

            // Fast forward past deadline
            await time.increase(86400 + 1);

            await goalLocker.connect(user1).withdrawGoal(0);

            const goal = await goalLocker.getGoal(user1.address, 0);
            expect(goal.isWithdrawn).to.be.true;
        });

        it("should revert withdrawal when locked", async function () {
            const targetAmount = ethers.parseEther("1000");
            const deadline = (await time.latest()) + 86400 * 30; // 30 days

            await goalLocker.connect(user1).createGoal("Locked Goal", targetAmount, deadline);
            await goalLocker.connect(user1).depositToGoal(0, ethers.parseEther("500")); // Only 50%

            await expect(goalLocker.connect(user1).withdrawGoal(0))
                .to.be.revertedWithCustomError(goalLocker, "GoalLocked");
        });

        it("should revert double withdrawal", async function () {
            const targetAmount = ethers.parseEther("100");
            await goalLocker.connect(user1).createGoal("Double Withdraw", targetAmount, 0);
            await goalLocker.connect(user1).depositToGoal(0, targetAmount);
            await goalLocker.connect(user1).withdrawGoal(0);

            await expect(goalLocker.connect(user1).withdrawGoal(0))
                .to.be.revertedWithCustomError(goalLocker, "GoalAlreadyWithdrawn");
        });
    });

    describe("Goal Status", function () {
        it("should return correct unlock status and progress", async function () {
            const targetAmount = ethers.parseEther("1000");
            await goalLocker.connect(user1).createGoal("Status Test", targetAmount, 0);

            // 0% progress
            let [isUnlocked, progress] = await goalLocker.connect(user1).checkGoalStatus(0);
            expect(isUnlocked).to.be.false;
            expect(progress).to.equal(0);

            // 50% progress
            await goalLocker.connect(user1).depositToGoal(0, ethers.parseEther("500"));
            [isUnlocked, progress] = await goalLocker.connect(user1).checkGoalStatus(0);
            expect(isUnlocked).to.be.false;
            expect(progress).to.equal(50);

            // 100% progress
            await goalLocker.connect(user1).depositToGoal(0, ethers.parseEther("500"));
            [isUnlocked, progress] = await goalLocker.connect(user1).checkGoalStatus(0);
            expect(isUnlocked).to.be.true;
            expect(progress).to.equal(100);
        });
    });
});
