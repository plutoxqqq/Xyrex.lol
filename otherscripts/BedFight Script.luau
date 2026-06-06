--[[
   BedWars BedFight - Complete Script (Fixed & Reliable)
   Pure Roblox GUI, no external dependencies.
   Features: NoKnockBack, AutoWin (pickaxe), Fly, Speed, InfiniteJump, KillAura, ESP, AutoClicker, Teleports.
   Toggle GUI with RightShift (rebindable).
]]

-- Services
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")
local CoreGui = game:GetService("CoreGui")
local VirtualInputManager = game:GetService("VirtualInputManager")
local HttpService = game:GetService("HttpService")

local LocalPlayer = Players.LocalPlayer
local Camera = Workspace.CurrentCamera

-- ==================== Global States ====================
local GuiEnabled = true
local ToggleKey = Enum.KeyCode.RightShift

local NoKB = false
local BodyVelObj = nil

local FlyActive = false
local FlySpeed = 50
local FlyConnections = {}
local FlyKeys = {W=false, A=false, S=false, D=false, Space=false, LeftControl=false}

local SpeedActive = false
local SpeedVal = 30

local InfJumpActive = false

local AutoWinActive = false
local AutoWinDelay = 0.5 -- seconds between bed/kill actions

local KillAuraActive = false
local KillAuraRange = 15

local ESPActive = false
local ESPHighlights = {}

local AutoClickerActive = false
local ClickerCPS = 10

local DamageRemote = nil
local BedRemote = nil

-- ==================== Helper: Find Remotes ====================
local function findRemote(name)
	for _, v in ipairs(ReplicatedStorage:GetDescendants()) do
		if v:IsA("RemoteEvent") and v.Name == name then
			return v
		end
	end
	return nil
end
DamageRemote = findRemote("Damage") or findRemote("DealDamage") or findRemote("SwordDamage")
BedRemote = findRemote("BreakBed") or findRemote("BedBreak") or findRemote("DestroyBed")

-- ==================== Feature Implementations ====================
-- NoKnockBack
local function setNoKB(state)
	NoKB = state
	local char = LocalPlayer.Character
	if not char then return end
	local hrp = char:FindFirstChild("HumanoidRootPart")
	if not hrp then return end
	if state then
		if not hrp:FindFirstChild("NoKBBV") then
			local bv = Instance.new("BodyVelocity")
			bv.Name = "NoKBBV"
			bv.MaxForce = Vector3.new(1,1,1)*1e6
			bv.Velocity = Vector3.zero
			bv.Parent = hrp
			BodyVelObj = bv
		end
	else
		if BodyVelObj then BodyVelObj:Destroy(); BodyVelObj = nil end
	end
end

-- Fly (using heartbeat for smoother control, no input blocking)
local function setFly(state)
	FlyActive = state
	local char = LocalPlayer.Character
	if not char then return end
	local hrp = char:FindFirstChild("HumanoidRootPart")
	local hum = char:FindFirstChild("Humanoid")
	if not hrp or not hum then return end

	if state then
		-- Disconnect old if any
		for _, c in ipairs(FlyConnections) do c:Disconnect() end
		FlyConnections = {}

		local bv = Instance.new("BodyVelocity")
		bv.MaxForce = Vector3.new(400000,400000,400000)
		bv.Velocity = Vector3.zero
		bv.Parent = hrp

		local bg = Instance.new("BodyGyro")
		bg.MaxTorque = Vector3.new(400000,400000,400000)
		bg.CFrame = hrp.CFrame
		bg.Parent = hrp

		hum.PlatformStand = true

		-- Input listeners (non‑blocking)
		local function onInputBegan(input, gameProcessed)
			if not FlyActive then return end
			local key = input.KeyCode.Name
			if FlyKeys[key] ~= nil then
				FlyKeys[key] = true
			end
		end
		local function onInputEnded(input)
			local key = input.KeyCode.Name
			if FlyKeys[key] ~= nil then
				FlyKeys[key] = false
			end
		end
		FlyConnections[1] = UserInputService.InputBegan:Connect(onInputBegan)
		FlyConnections[2] = UserInputService.InputEnded:Connect(onInputEnded)

		-- Flight loop
		FlyConnections[3] = RunService.Heartbeat:Connect(function()
			if not FlyActive or not hrp or not hum or not bv or not bg then return end
			local dir = Vector3.zero
			local camDir = Camera.CFrame.LookVector
			local camRight = Camera.CFrame.RightVector
			if FlyKeys.W then dir += camDir end
			if FlyKeys.S then dir -= camDir end
			if FlyKeys.A then dir -= camRight end
			if FlyKeys.D then dir += camRight end
			if FlyKeys.Space then dir += Vector3.new(0,1,0) end
			if FlyKeys.LeftControl then dir -= Vector3.new(0,1,0) end
			dir = dir.Magnitude > 0 and dir.Unit * FlySpeed or Vector3.zero
			bv.Velocity = dir
			bg.CFrame = CFrame.lookAt(hrp.Position, hrp.Position + camDir)
		end)
	else
		for _, c in ipairs(FlyConnections) do c:Disconnect() end
		FlyConnections = {}
		if hum then hum.PlatformStand = false end
		if hrp then
			local oldBv = hrp:FindFirstChild("BodyVelocity")
			if oldBv then oldBv:Destroy() end
			local oldBg = hrp:FindFirstChild("BodyGyro")
			if oldBg then oldBg:Destroy() end
		end
	end
end

-- Speed
local function setSpeed(val)
	SpeedVal = val
	if SpeedActive and LocalPlayer.Character then
		local hum = LocalPlayer.Character:FindFirstChild("Humanoid")
		if hum then hum.WalkSpeed = val end
	end
end

local function toggleSpeed(state)
	SpeedActive = state
	if LocalPlayer.Character then
		local hum = LocalPlayer.Character:FindFirstChild("Humanoid")
		if hum then hum.WalkSpeed = state and SpeedVal or 16 end
	end
end

-- Infinite Jump (spacebar check, no humanoid state conflict)
local InfJumpConnection = nil
local function toggleInfJump(state)
	InfJumpActive = state
	if InfJumpConnection then InfJumpConnection:Disconnect(); InfJumpConnection = nil end
	if state then
		InfJumpConnection = RunService.Heartbeat:Connect(function()
			if not InfJumpActive then return end
			if UserInputService:IsKeyDown(Enum.KeyCode.Space) then
				local char = LocalPlayer.Character
				local hum = char and char:FindFirstChild("Humanoid")
				if hum and hum:GetState() ~= Enum.HumanoidStateType.Dead then
					hum.Jump = true
				end
			end
		end)
	end
end

-- AutoWin (equip pickaxe, break beds, then kill enemies)
local function autoWinLoop()
	while AutoWinActive do
		local ourTeam = LocalPlayer.Team
		-- Phase 1: break enemy beds
		for _, obj in ipairs(Workspace:GetDescendants()) do
			if not AutoWinActive then break end
			if obj:IsA("BasePart") and obj.Name:lower():find("bed") then
				-- Teleport to bed
				local char = LocalPlayer.Character
				local hrp = char and char:FindFirstChild("HumanoidRootPart")
				if hrp then
					hrp.CFrame = CFrame.new(obj.Position + Vector3.new(0,5,0))
				end
				wait(AutoWinDelay)

				-- Equip pickaxe (if available)
				local pickaxe = nil
				local backpack = LocalPlayer.Backpack
				if char then
					for _, tool in ipairs(char:GetChildren()) do
						if tool:IsA("Tool") and tool.Name:lower():find("pickaxe") then
							pickaxe = tool
							break
						end
					end
				end
				if not pickaxe and backpack then
					for _, tool in ipairs(backpack:GetChildren()) do
						if tool:IsA("Tool") and tool.Name:lower():find("pickaxe") then
							pickaxe = tool
							break
						end
					end
				end

				if pickaxe then
					local oldParent = pickaxe.Parent
					pickaxe.Parent = char
					wait(0.1)
					-- Repeatedly swing pickaxe near bed
					local start = tick()
					while AutoWinActive and (tick() - start) < 5 do
						if obj.Parent == nil or obj.Parent.Parent == nil then break end -- bed destroyed
						pickaxe:Activate()
						wait(0.15)
					end
					-- Return tool to backpack
					pickaxe.Parent = oldParent
				else
					-- Fallback: try remote (might not work)
					if BedRemote then BedRemote:FireServer(obj) end
					wait(0.5)
				end
				wait(0.2)
			end
		end

		-- Phase 2: kill all enemies
		for _, player in ipairs(Players:GetPlayers()) do
			if not AutoWinActive then break end
			if player ~= LocalPlayer and player.Team ~= ourTeam then
				local enemyChar = player.Character
				local enemyHum = enemyChar and enemyChar:FindFirstChild("Humanoid")
				if enemyHum and enemyHum.Health > 0 then
					local myChar = LocalPlayer.Character
					local myHrp = myChar and myChar:FindFirstChild("HumanoidRootPart")
					local enemyHrp = enemyChar:FindFirstChild("HumanoidRootPart")
					if myHrp and enemyHrp then
						myHrp.CFrame = enemyHrp.CFrame * CFrame.new(0,2,0)
					end
					wait(0.1)
					-- Attack with any weapon
					local tool = myChar and myChar:FindFirstChildOfClass("Tool")
					if tool then
						for i = 1, 30 do
							if not AutoWinActive then break end
							if enemyHum.Health <= 0 then break end
							tool:Activate()
							RunService.Heartbeat:Wait()
						end
					elseif DamageRemote then
						for i = 1, 30 do
							if not AutoWinActive then break end
							DamageRemote:FireServer(enemyChar)
							RunService.Heartbeat:Wait()
						end
					end
					wait(0.2)
				end
			end
		end
		wait(AutoWinDelay * 2)
	end
end

local function toggleAutoWin(state)
	AutoWinActive = state
	if state then
		coroutine.wrap(autoWinLoop)()
	end
end

-- KillAura
local function killAuraLoop()
	while KillAuraActive do
		local ourTeam = LocalPlayer.Team
		for _, player in ipairs(Players:GetPlayers()) do
			if not KillAuraActive then break end
			if player ~= LocalPlayer and player.Team ~= ourTeam then
				local enemyChar = player.Character
				local enemyHum = enemyChar and enemyChar:FindFirstChild("Humanoid")
				if enemyHum and enemyHum.Health > 0 then
					local myChar = LocalPlayer.Character
					local myHrp = myChar and myChar:FindFirstChild("HumanoidRootPart")
					local enemyHrp = enemyChar:FindFirstChild("HumanoidRootPart")
					if myHrp and enemyHrp then
						local dist = (myHrp.Position - enemyHrp.Position).Magnitude
						if dist <= KillAuraRange then
							local tool = myChar and myChar:FindFirstChildOfClass("Tool")
							if tool then
								tool:Activate()
							elseif DamageRemote then
								DamageRemote:FireServer(enemyChar)
							end
						end
					end
				end
			end
		end
		RunService.Heartbeat:Wait()
	end
end

local function toggleKillAura(state)
	KillAuraActive = state
	if state then
		coroutine.wrap(killAuraLoop)()
	end
end

-- ESP
local function toggleESP(state)
	ESPActive = state
	if state then
		local function addESP(player)
			if player == LocalPlayer then return end
			if ESPHighlights[player] then return end
			local char = player.Character
			if char and char:FindFirstChild("HumanoidRootPart") then
				local hl = Instance.new("Highlight")
				hl.Name = "ESP_"..player.UserId
				hl.FillTransparency = 0.5
				hl.FillColor = player.TeamColor and player.TeamColor.Color or Color3.new(1,0,0)
				hl.Parent = char
				ESPHighlights[player] = hl
			end
		end
		for _, p in ipairs(Players:GetPlayers()) do addESP(p) end
		Players.PlayerAdded:Connect(addESP)
		Players.PlayerRemoving:Connect(function(p)
			if ESPHighlights[p] then
				ESPHighlights[p]:Destroy()
				ESPHighlights[p] = nil
			end
		end)
	else
		for _, hl in pairs(ESPHighlights) do hl:Destroy() end
		ESPHighlights = {}
	end
end

-- AutoClicker
local function autoClickerLoop()
	while AutoClickerActive do
		local tool = LocalPlayer.Character and LocalPlayer.Character:FindFirstChildOfClass("Tool")
		if tool then tool:Activate() end
		wait(1 / ClickerCPS)
	end
end

local function toggleAutoClicker(state)
	AutoClickerActive = state
	if state then
		coroutine.wrap(autoClickerLoop)()
	end
end

-- ==================== GUI Construction ====================
local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Name = "BedWarsHack"
ScreenGui.Parent = CoreGui
ScreenGui.ResetOnSpawn = false

-- Main frame
local MainFrame = Instance.new("Frame")
MainFrame.Size = UDim2.new(0, 320, 0, 35)
MainFrame.Position = UDim2.new(0.5, -160, 0.1, 0)
MainFrame.BackgroundColor3 = Color3.fromRGB(15,15,15)
MainFrame.BorderSizePixel = 0
MainFrame.Parent = ScreenGui

local Title = Instance.new("TextLabel")
Title.Size = UDim2.new(1, -50, 1, 0)
Title.BackgroundTransparency = 1
Title.Text = "BedFight X"
Title.TextColor3 = Color3.new(1,1,1)
Title.Font = Enum.Font.GothamBold
Title.TextSize = 18
Title.Parent = MainFrame

local CloseBtn = Instance.new("TextButton")
CloseBtn.Size = UDim2.new(0, 30, 0, 30)
CloseBtn.Position = UDim2.new(1, -35, 0, 2)
CloseBtn.BackgroundColor3 = Color3.fromRGB(200,50,50)
CloseBtn.Text = "X"
CloseBtn.TextColor3 = Color3.new(1,1,1)
CloseBtn.Font = Enum.Font.GothamBold
CloseBtn.TextSize = 16
CloseBtn.BorderSizePixel = 0
CloseBtn.Parent = MainFrame
CloseBtn.MouseButton1Click:Connect(function()
	ScreenGui:Destroy()  -- fully destroy on demand
end)

-- Scrolling frame
local ScrollFrame = Instance.new("ScrollingFrame")
ScrollFrame.Size = UDim2.new(0, 320, 0, 340)
ScrollFrame.Position = UDim2.new(0.5, -160, 0.1, 40)
ScrollFrame.BackgroundColor3 = Color3.fromRGB(20,20,20)
ScrollFrame.BorderSizePixel = 0
ScrollFrame.CanvasSize = UDim2.new(0, 0, 0, 0)
ScrollFrame.ScrollBarThickness = 6
ScrollFrame.ScrollingEnabled = true
ScrollFrame.Parent = ScreenGui

local UIListLayout = Instance.new("UIListLayout")
UIListLayout.Padding = UDim.new(0, 3)
UIListLayout.SortOrder = Enum.SortOrder.LayoutOrder
UIListLayout.Parent = ScrollFrame

-- Helper to update canvas size
local function updateCanvasSize()
	local totalHeight = 0
	for _, child in ipairs(ScrollFrame:GetChildren()) do
		if child:IsA("GuiObject") and child.Visible then
			totalHeight = totalHeight + child.Size.Y.Offset + 3
		end
	end
	ScrollFrame.CanvasSize = UDim2.new(0, 0, 0, totalHeight)
end

ScrollFrame.ChildAdded:Connect(updateCanvasSize)
ScrollFrame.ChildRemoved:Connect(function() wait(0.1); updateCanvasSize() end)

-- UI element factories
local function makeCategoryLabel(name)
	local label = Instance.new("TextLabel")
	label.Size = UDim2.new(1, 0, 0, 22)
	label.BackgroundColor3 = Color3.fromRGB(255,255,255)
	label.BackgroundTransparency = 0.95
	label.Text = "   "..name
	label.TextColor3 = Color3.new(1,1,1)
	label.Font = Enum.Font.GothamBold
	label.TextSize = 14
	label.TextXAlignment = Enum.TextXAlignment.Left
	label.Parent = ScrollFrame
	return label
end

local function makeToggle(name, default, callback)
	local frame = Instance.new("Frame")
	frame.Size = UDim2.new(1, 0, 0, 30)
	frame.BackgroundColor3 = Color3.fromRGB(35,35,35)
	frame.BorderSizePixel = 0
	frame.Parent = ScrollFrame

	local textLabel = Instance.new("TextLabel")
	textLabel.Size = UDim2.new(0, 200, 1, 0)
	textLabel.BackgroundTransparency = 1
	textLabel.Text = "   "..name
	textLabel.TextColor3 = Color3.new(1,1,1)
	textLabel.Font = Enum.Font.GothamSemibold
	textLabel.TextSize = 13
	textLabel.TextXAlignment = Enum.TextXAlignment.Left
	textLabel.Parent = frame

	local toggleBtn = Instance.new("TextButton")
	toggleBtn.Size = UDim2.new(0, 44, 0, 22)
	toggleBtn.Position = UDim2.new(1, -50, 0.5, -11)
	toggleBtn.BackgroundColor3 = default and Color3.fromRGB(0,170,0) or Color3.fromRGB(170,0,0)
	toggleBtn.Text = default and "ON" or "OFF"
	toggleBtn.TextColor3 = Color3.new(1,1,1)
	toggleBtn.Font = Enum.Font.GothamBold
	toggleBtn.TextSize = 12
	toggleBtn.BorderSizePixel = 0
	toggleBtn.AutoButtonColor = false
	toggleBtn.Parent = frame

	local state = default
	toggleBtn.MouseButton1Click:Connect(function()
		state = not state
		toggleBtn.BackgroundColor3 = state and Color3.fromRGB(0,170,0) or Color3.fromRGB(170,0,0)
		toggleBtn.Text = state and "ON" or "OFF"
		callback(state)
	end)
end

local function makeSlider(name, min, max, default, increment, callback)
	local frame = Instance.new("Frame")
	frame.Size = UDim2.new(1, 0, 0, 45)
	frame.BackgroundColor3 = Color3.fromRGB(35,35,35)
	frame.BorderSizePixel = 0
	frame.Parent = ScrollFrame

	local label = Instance.new("TextLabel")
	label.Size = UDim2.new(1, 0, 0, 20)
	label.BackgroundTransparency = 1
	label.Text = "   "..name..": "..default
	label.TextColor3 = Color3.new(1,1,1)
	label.Font = Enum.Font.GothamSemibold
	label.TextSize = 12
	label.TextXAlignment = Enum.TextXAlignment.Left
	label.Parent = frame

	local sliderFrame = Instance.new("Frame")
	sliderFrame.Size = UDim2.new(1, -20, 0, 14)
	sliderFrame.Position = UDim2.new(0, 10, 0, 22)
	sliderFrame.BackgroundColor3 = Color3.fromRGB(60,60,60)
	sliderFrame.BorderSizePixel = 0
	sliderFrame.Parent = frame

	local fill = Instance.new("Frame")
	fill.Size = UDim2.new((default-min)/(max-min), 0, 1, 0)
	fill.BackgroundColor3 = Color3.fromRGB(0,170,0)
	fill.BorderSizePixel = 0
	fill.Parent = sliderFrame

	local currentVal = default
	local function updateSlider(xFraction)
		local val = min + (max - min) * xFraction
		val = math.floor(val / increment + 0.5) * increment
		val = math.clamp(val, min, max)
		currentVal = val
		fill.Size = UDim2.new((val-min)/(max-min), 0, 1, 0)
		label.Text = "   "..name..": "..val
		callback(val)
	end

	sliderFrame.InputBegan:Connect(function(input)
		if input.UserInputType == Enum.UserInputType.MouseButton1 then
			local framePos = sliderFrame.AbsolutePosition
			local frameSize = sliderFrame.AbsoluteSize
			local function onMove()
				local mousePos = UserInputService:GetMouseLocation()
				local xFraction = (mousePos.X - framePos.X) / frameSize.X
				xFraction = math.clamp(xFraction, 0, 1)
				updateSlider(xFraction)
			end
			onMove()
			local moveConn
			moveConn = UserInputService.InputChanged:Connect(function(changedInput)
				if changedInput.UserInputType == Enum.UserInputType.MouseMovement then
					onMove()
				end
			end)
			local endConn
			endConn = UserInputService.InputEnded:Connect(function(endedInput)
				if endedInput.UserInputType == Enum.UserInputType.MouseButton1 then
					moveConn:Disconnect()
					endConn:Disconnect()
				end
			end)
		end
	end)
end

local function makeButton(name, callback)
	local btn = Instance.new("TextButton")
	btn.Size = UDim2.new(1, 0, 0, 32)
	btn.BackgroundColor3 = Color3.fromRGB(45,45,45)
	btn.TextColor3 = Color3.new(1,1,1)
	btn.Font = Enum.Font.GothamSemibold
	btn.TextSize = 13
	btn.Text = "   "..name
	btn.TextXAlignment = Enum.TextXAlignment.Left
	btn.BorderSizePixel = 0
	btn.Parent = ScrollFrame
	btn.MouseButton1Click:Connect(callback)
end

-- ==================== Build UI Sections ====================
-- Combat
makeCategoryLabel("⚔ COMBAT")
makeToggle("NoKnockBack", false, setNoKB)
makeToggle("KillAura", false, toggleKillAura)
makeSlider("KillAura Range", 5, 30, 15, 1, function(v) KillAuraRange = v end)

-- Movement
makeCategoryLabel("🏃 MOVEMENT")
makeToggle("Speed", false, toggleSpeed)
makeSlider("Speed Value", 16, 200, 30, 1, setSpeed)
makeToggle("Infinite Jump", false, toggleInfJump)
makeToggle("Fly", false, setFly)
makeSlider("Fly Speed", 20, 200, 50, 5, function(v) FlySpeed = v end)

-- Visuals
makeCategoryLabel("👁 VISUALS")
makeToggle("Player ESP", false, toggleESP)

-- Automation
makeCategoryLabel("🤖 AUTOMATION")
makeToggle("AutoWin", false, toggleAutoWin)
makeSlider("AutoWin Delay", 0.1, 2, 0.5, 0.1, function(v) AutoWinDelay = v end)
makeToggle("AutoClicker", false, toggleAutoClicker)
makeSlider("Clicker CPS", 1, 30, 10, 1, function(v) ClickerCPS = v end)

-- Teleports
makeCategoryLabel("📌 TELEPORTS")
makeButton("TP to nearest Bed", function()
	local char = LocalPlayer.Character
	if not char or not char:FindFirstChild("HumanoidRootPart") then return end
	for _, obj in ipairs(Workspace:GetDescendants()) do
		if obj:IsA("BasePart") and obj.Name:lower():find("bed") then
			char.HumanoidRootPart.CFrame = CFrame.new(obj.Position + Vector3.new(0,5,0))
			return
		end
	end
end)

-- Settings
makeCategoryLabel("⚙ SETTINGS")
makeButton("Change Toggle Key", function()
	-- Simple keybind setter
	local setterGui = Instance.new("ScreenGui")
	setterGui.Parent = CoreGui
	local bg = Instance.new("Frame")
	bg.Size = UDim2.new(0, 250, 0, 80)
	bg.Position = UDim2.new(0.5, -125, 0.5, -40)
	bg.BackgroundColor3 = Color3.fromRGB(30,30,30)
	bg.Parent = setterGui
	local txt = Instance.new("TextLabel")
	txt.Size = UDim2.new(1, 0, 0, 30)
	txt.BackgroundTransparency = 1
	txt.Text = "Press a key..."
	txt.TextColor3 = Color3.new(1,1,1)
	txt.Font = Enum.Font.GothamBold
	txt.Parent = bg
	local conn
	conn = UserInputService.InputBegan:Connect(function(input, processed)
		if input.UserInputType == Enum.UserInputType.Keyboard then
			ToggleKey = input.KeyCode
			txt.Text = "Toggle key set to: "..input.KeyCode.Name
			conn:Disconnect()
			wait(1)
			setterGui:Destroy()
		end
	end)
end)

makeButton("Destroy GUI", function()
	ScreenGui:Destroy()
end)

-- Initial canvas size update
updateCanvasSize()

-- ==================== Toggle key handler ====================
UserInputService.InputBegan:Connect(function(input, processed)
	if processed then return end
	if input.KeyCode == ToggleKey then
		GuiEnabled = not GuiEnabled
		ScreenGui.Enabled = GuiEnabled
	end
end)

-- ==================== Respawn handling ====================
LocalPlayer.CharacterAdded:Connect(function(char)
	wait(0.5)
	if NoKB then setNoKB(false); setNoKB(true) end
	if SpeedActive then toggleSpeed(true) end
	if InfJumpActive then toggleInfJump(false); toggleInfJump(true) end
	if FlyActive then setFly(false); setFly(true) end
end)

print("BedWars BedFight script loaded. Press "..tostring(ToggleKey).." to toggle.")
