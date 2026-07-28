import hre from "hardhat";

async function main() {
  console.log("Deploying StudentRecord contract...");

  const StudentRecord = await hre.ethers.getContractFactory("StudentRecord");
  const studentRecord = await StudentRecord.deploy();
  await studentRecord.waitForDeployment();
  console.log(`StudentRecord deployed to: ${await studentRecord.getAddress()}`);

  console.log("Deploying AttendanceTracker contract...");
  const AttendanceTracker = await hre.ethers.getContractFactory("AttendanceTracker");
  const attendanceTracker = await AttendanceTracker.deploy();
  await attendanceTracker.waitForDeployment();
  console.log(`AttendanceTracker deployed to: ${await attendanceTracker.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

