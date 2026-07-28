# Start Hardhat local node in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd blockchain; npx hardhat node"

# Wait a few seconds for the node to initialize before deploying the contract
Start-Sleep -Seconds 3

# Start backend (which will also run the deploy script first as a convenience) in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd blockchain; npx hardhat run scripts/deploy.js --network localhost; cd ../backend; npm run dev"

# Start frontend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "All services are starting up in separate windows!"
Write-Host "Frontend will be available at http://localhost:3000"
Write-Host "Backend will be available at http://localhost:5000"
